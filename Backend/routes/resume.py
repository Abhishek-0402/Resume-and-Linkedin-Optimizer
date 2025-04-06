import os
import fitz
import pytesseract
from PIL import Image
from docx import Document
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends, Response, Query
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from openai import OpenAI
import asyncio
import re
import uuid

from reportlab.lib.pagesizes import letter
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT

# === Setup ===
load_dotenv()
client = OpenAI()
router = APIRouter()
storage_lock = asyncio.Lock()
resume_storage = {}

# === Session Management ===
async def get_session_id(request: Request, response: Response) -> str:
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            samesite="lax",
            secure=False
        )
    request.state.session_id = session_id
    return session_id

# === File Extraction ===
def extract_text(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1].lower()
    content = file.file.read()
    file.file.seek(0)

    temp_path = f"temp_upload.{ext}"
    with open(temp_path, "wb") as f:
        f.write(content)

    try:
        if ext == "pdf":
            return extract_from_pdf(temp_path)
        elif ext == "docx":
            return extract_from_docx(temp_path)
        elif ext == "txt":
            return extract_from_txt(temp_path)
        elif ext in ["jpg", "jpeg", "png"]:
            return extract_from_image(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def extract_from_pdf(path: str) -> str:
    with fitz.open(path) as pdf:
        return "\n".join(page.get_text() for page in pdf)

def extract_from_docx(path: str) -> str:
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)

def extract_from_txt(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def extract_from_image(path: str) -> str:
    return pytesseract.image_to_string(Image.open(path))

# === OpenAI Prompts ===
def analyze_resume_with_openai(resume_text: str, job_desc: str) -> str:
    prompt = f"""
You are a senior career consultant and ATS optimization expert.

Evaluate the RESUME against the JOB DESCRIPTION and return detailed, honest, and actionable suggestions.

### Format the output in **Markdown** using:
- `###` for section headings
- `-` for bullet points
- Emojis only at section headings (e.g., ✅, 📚, 💡, etc.)

### Include these sections:
1. ✅ **ATS Match Score (0–100)** with justification
2. 🔍 **Missing Keywords / Skills** (categorized if possible)
3. 📚 **Section-by-Section Feedback** (Summary, Experience, Projects, etc.)
4. 💡 **Project Ideas Relevant to the Role**
5. 🎓 **Certifications or Courses to Consider**
6. 🧠 **Top Interview Preparation Resources**
7. ✏️ **Improved Summary Section**
8. 📌 **Final Resume Tips**

---
**RESUME**:
\"\"\"{resume_text}\"\"\"

**JOB DESCRIPTION**:
\"\"\"{job_desc}\"\"\"
"""
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content


def rewrite_resume_with_openai(resume_text: str, job_desc: str, feedback: str) -> str:
    prompt = f"""
You are a professional resume writer.

Rewrite and enhance the existing RESUME using the JOB DESCRIPTION and FEEDBACK.

### Requirements:
- Keep original resume structure and content
- DO NOT remove user's experiences or sections
- Instead, revise/improve existing bullet points
- Add missing skills and keywords where relevant
- Quantify achievements if possible (e.g., "improved accuracy by 20%")
- Use bullet points (`-`) and Markdown formatting
- Use `###` for section headings: Summary, Skills, Experience, Education, Projects, Certifications
- Highlight keywords with **bold** (no emojis)

---
**RESUME**:
\"\"\"{resume_text}\"\"\"

**JOB DESCRIPTION**:
\"\"\"{job_desc}\"\"\"

**FEEDBACK**:
\"\"\"{feedback}\"\"\"
"""
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content


# === PDF Generator ===
def convert_markdown_bold(text):
    return re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)

def create_pdf(text: str, path: str):
    doc = SimpleDocTemplate(path, pagesize=letter)
    styles = getSampleStyleSheet()
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontName="Helvetica", fontSize=11, leading=14, alignment=TA_LEFT)
    heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=13, leading=16, spaceAfter=10)

    story = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 0.15 * inch))
            continue
        if line.startswith("### "):
            story.append(Paragraph(f"<b>{line[4:]}</b>", heading_style))
        elif line.startswith("- "):
            bullet = convert_markdown_bold(line[2:])
            story.append(Paragraph(f"• {bullet}", body_style))
        else:
            parsed = convert_markdown_bold(line)
            story.append(Paragraph(parsed, body_style))
        story.append(Spacer(1, 0.1 * inch))

    doc.build(story)

# === Main Unified Endpoint ===
@router.post("/process-all")  # ✅ Correct
async def process_all_resume(
        request: Request,
        response: Response,
        file: UploadFile = File(...),
        job_description: str = Form(...),
        session_id: str = Depends(get_session_id)
):
    resume_text = extract_text(file)
    feedback = analyze_resume_with_openai(resume_text, job_description)
    updated_resume = rewrite_resume_with_openai(resume_text, job_description, feedback)

    os.makedirs("tmp", exist_ok=True)
    summary_path = f"tmp/{session_id}_summary.pdf"
    updated_path = f"tmp/{session_id}_updated_resume.pdf"
    create_pdf(feedback, summary_path)
    create_pdf(updated_resume, updated_path)

    async with storage_lock:
        resume_storage[session_id] = {
            "resume_text": resume_text,
            "job_description": job_description,
            "feedback": feedback,
            "updated_resume": updated_resume,
            "summary_pdf_path": summary_path,
            "updated_pdf_path": updated_path
        }

    return {
        "session_id": session_id,
        "AI Feedback Summary": feedback,
        "Updated Resume Text": updated_resume
    }

# === Download Routes ===
@router.get("/download-summary/pdf")
async def download_summary(session_id: str = Query(...)):
    session = resume_storage.get(session_id)
    if not session or not os.path.exists(session["summary_pdf_path"]):
        raise HTTPException(status_code=404, detail="Summary PDF not found.")
    return FileResponse(session["summary_pdf_path"], media_type="application/pdf", filename="resume_feedback_summary.pdf")

@router.get("/download-updated-resume/pdf")
async def download_updated_resume(session_id: str = Query(...)):
    session = resume_storage.get(session_id)
    if not session or not os.path.exists(session["updated_pdf_path"]):
        raise HTTPException(status_code=404, detail="Updated resume not found.")
    return FileResponse(session["updated_pdf_path"], media_type="application/pdf", filename="updated_resume.pdf")
