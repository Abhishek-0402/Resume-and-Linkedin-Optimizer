import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends, Response, Query
from fastapi.responses import StreamingResponse
from openai import OpenAI
from io import BytesIO
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import inch
import uuid
import asyncio

load_dotenv()
client = OpenAI()
router = APIRouter()

linkedin_feedback_cache = {}
linkedin_storage = {}
linkedin_lock = asyncio.Lock()

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

# === OpenAI Prompt ===
def generate_linkedin_feedback(resume_text: str, job_description: str) -> str:
    prompt = f"""
You are a professional LinkedIn coach and branding consultant.

Analyze the user's resume and job description and return clear, tailored advice on improving their LinkedIn profile.

### Format in Markdown:
- `###` for section titles
- `-` for bullet points
- Emojis ONLY at section titles (e.g., 🔍, 🧠, 📌)

### Sections to include:
1. 🔍 Profile Headline Suggestions (3)
2. ✏️ Summary/About Rewrite
3. 💼 Experience Section Enhancements
4. 🛠 Skills to Add or Emphasize
5. 📚 Certifications or Badges
6. 🧠 Pro Tips for Visibility
7. 📌 Match Score (0–100) and reasoning

RESUME:
\"\"\"{resume_text}\"\"\"

JOB DESCRIPTION:
\"\"\"{job_description}\"\"\"
"""
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# === PDF Generator ===
def create_linkedin_pdf(text: str) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    styles = getSampleStyleSheet()
    style = ParagraphStyle('LinkedInStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=11, leading=14, alignment=TA_LEFT)

    story = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 0.2 * inch))
            continue
        try:
            story.append(Paragraph(line, style=style))
        except:
            clean_line = line.encode("ascii", "ignore").decode("ascii")
            story.append(Paragraph(clean_line or "[Unrenderable line]", style=style))
        story.append(Spacer(1, 0.15 * inch))
    doc.build(story)
    buffer.seek(0)
    return buffer

# === /optimize Endpoint ===
@router.post("/optimize", tags=["LinkedIn Optimization"])
async def optimize_linkedin(
    response: Response,
    request: Request,
    file: UploadFile = File(...),
    job_description: str = Form(...),
    session_id: str = Depends(get_session_id)
):
    try:
        contents = await file.read()
        reader = PdfReader(BytesIO(contents))
        resume_text = "".join(page.extract_text() for page in reader.pages if page.extract_text())

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Uploaded PDF is empty or unreadable.")

        linkedin_feedback = generate_linkedin_feedback(resume_text, job_description)
        pdf_file = create_linkedin_pdf(linkedin_feedback)

        async with linkedin_lock:
            linkedin_storage[session_id] = {
                "linkedin_feedback": linkedin_feedback,
                "pdf": pdf_file
            }

        return {
            "LinkedIn Feedback": linkedin_feedback,
            "Download PDF": f"/linkedin/download-summary/pdf?session_id={session_id}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing Error: {str(e)}")

# === /download-summary/pdf Endpoint ===
@router.get("/download-summary/pdf", tags=["LinkedIn Optimization"])
async def download_linkedin_pdf(session_id: str = Query(...)):
    if session_id not in linkedin_storage:
        raise HTTPException(status_code=404, detail="LinkedIn feedback not found.")
    pdf_file = linkedin_storage[session_id]["pdf"]
    return StreamingResponse(pdf_file, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=linkedin_profile_feedback.pdf"
    })
