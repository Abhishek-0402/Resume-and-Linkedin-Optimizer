from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.resume import router as resume_router
from routes.linkedin import router as linkedin_router
from routes import job_search  # ✅ Fix this line

app = FastAPI(
    title="Resume & LinkedIn Optimizer API",
    description="API for analyzing and optimizing resumes and LinkedIn profiles.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resume endpoints
app.include_router(resume_router, prefix="/resume", tags=["Resume Optimization"])

# LinkedIn endpoints
app.include_router(linkedin_router, prefix="/linkedin", tags=["LinkedIn Optimization"])

# ✅ Job search endpoints
app.include_router(job_search.router, tags=["Job Search"])  # ✅ Add job search

# Root route
@app.get("/")
async def root():
    return {"message": "Welcome to the Resume & LinkedIn Optimizer API!"}
