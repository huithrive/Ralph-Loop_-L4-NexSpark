"""
FastAPI Bridge Service for Landing Page Generation
Port 3002 - Bridge between Node.js and Python pipeline
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal, Dict, Any, List
import asyncio
import uuid
from datetime import datetime

from bridge_service import LandingPageGenerator

app = FastAPI(title="Landing Page Bridge", version="1.0.0")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory task storage (replace with Redis/DB for production)
tasks: Dict[str, Dict[str, Any]] = {}

generator = LandingPageGenerator()


class GenerateRequest(BaseModel):
    projectId: str
    brief: str
    brandName: str
    industry: str
    targetMarket: str
    changeType: Literal["structural", "content", "micro"] = "content"


class EditRequest(BaseModel):
    projectId: str
    brief: str
    changeType: Literal["micro"] = "micro"


class GenerateResponse(BaseModel):
    artifactId: str
    title: str
    previewUrl: Optional[str] = None
    sandboxId: Optional[str] = None
    error: Optional[str] = None
    code: Optional[str] = None


class StatusResponse(BaseModel):
    status: Literal["pending", "running", "complete", "failed"]
    progress: List[str]
    result: Optional[Dict[str, Any]] = None


@app.get("/")
async def root():
    return {
        "service": "Landing Page Bridge",
        "version": "1.0.0",
        "status": "running",
        "endpoints": ["/api/landing/generate", "/api/landing/edit", "/api/landing/status/{taskId}"]
    }


@app.post("/api/landing/generate", response_model=GenerateResponse)
async def generate_landing_page(req: GenerateRequest):
    """
    Generate a new landing page from brand info and brief
    """
    try:
        artifact_id = f"landing-{req.projectId}-{uuid.uuid4().hex[:8]}"
        
        # Generate the landing page
        result = await generator.generate(
            brand_name=req.brandName,
            industry=req.industry,
            target_market=req.targetMarket,
            brief=req.brief,
            change_type=req.changeType
        )
        
        return GenerateResponse(
            artifactId=artifact_id,
            title=f"{req.brandName} Landing Page",
            previewUrl=None,  # E2B integration later
            sandboxId=None,
            error=None,
            code=result.get("code")
        )
        
    except Exception as e:
        return GenerateResponse(
            artifactId="",
            title="",
            error=str(e)
        )


@app.post("/api/landing/edit", response_model=GenerateResponse)
async def edit_landing_page(req: EditRequest):
    """
    Edit an existing landing page (micro changes only)
    """
    try:
        artifact_id = f"landing-{req.projectId}-edit-{uuid.uuid4().hex[:8]}"
        
        # For now, treat edit similar to generate but with micro change type
        # In future, this would load existing artifact and apply changes
        result = await generator.generate(
            brand_name="",  # Would load from existing artifact
            industry="",
            target_market="",
            brief=req.brief,
            change_type=req.changeType
        )
        
        return GenerateResponse(
            artifactId=artifact_id,
            title="Edited Landing Page",
            previewUrl=None,
            sandboxId=None,
            error=None,
            code=result.get("code")
        )
        
    except Exception as e:
        return GenerateResponse(
            artifactId="",
            title="",
            error=str(e)
        )


@app.get("/api/landing/status/{task_id}", response_model=StatusResponse)
async def get_task_status(task_id: str):
    """
    Get status of an async task (for future async operations)
    """
    task = tasks.get(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return StatusResponse(
        status=task.get("status", "pending"),
        progress=task.get("progress", []),
        result=task.get("result")
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002, reload=True)
