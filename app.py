# app.py (FastAPI example)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
from backend.analyzer.code_analyzer import CodeAnalyzer
from backend.models.promt import AssistantRequest, AssistantResponse
from contextlib import asynccontextmanager
from backend.routers.api_routers import router as api_router

app = FastAPI()
app.include_router(api_router)

