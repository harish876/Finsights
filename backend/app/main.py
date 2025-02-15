from fastapi import FastAPI

from app.core.config import settings
from app.api.main import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
app.include_router(api_router, prefix=settings.api_v1_str)