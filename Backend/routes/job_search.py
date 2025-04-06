# routers/job_search.py

import os
import requests
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = "jsearch.p.rapidapi.com"

@router.get("/api/jobs")
def get_jobs(query: str, location: str):
    print(f"📡 Received query: {query}, location: {location}")  # Debug
    if not RAPIDAPI_KEY:
        raise HTTPException(status_code=500, detail="API key not set.")

    url = f"https://{RAPIDAPI_HOST}/search"
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    params = {
        "query": f"{query} in {location}",
        "page": "1",
        "num_pages": "5"
    }

    try:
        res = requests.get(url, headers=headers, params=params)
        res.raise_for_status()
        return res.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
