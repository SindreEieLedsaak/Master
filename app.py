# app.py (FastAPI example)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
from backend.analyzer.code_analyzer import CodeAnalyzer
from backend.analyzer.project_analyzer import ProjectAnalyzer
from backend.models.promt import AssistantRequest, AssistantResponse
from contextlib import asynccontextmanager
from fastapi import APIRouter, Request, Depends
from starlette.responses import RedirectResponse
from backend.services.auth_service import AuthService
from backend.services.student_service import StudentService
from datetime import timedelta
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware

# Import all your routers directly
from backend.routers.api_routers import router as api_router
from backend.routers.auth_router import router as auth_router
from backend.routers.gitlab_router import router as gitlab_router
from backend.routers.student_router import router as student_router
from backend.routers.ai_router import router as ai_router
from backend.routers.suggestion_router import router as suggestion_router

load_dotenv()

app = FastAPI()

# Add Session Middleware for Authlib
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "a_default_secret_key"))

# Add CORS Middleware
mode = os.getenv("MODE", "dev")
if mode == "dev":
    frontend_url = "http://localhost:3000"
else:
    frontend_url = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers with a single /api prefix
api_v1_router = APIRouter(prefix="/api")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(api_router)
api_v1_router.include_router(gitlab_router)
api_v1_router.include_router(student_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(suggestion_router)

app.include_router(api_v1_router)

