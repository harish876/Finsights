from fastapi import APIRouter

from app.api.routes import conversation

api_router = APIRouter()
api_router.include_router(conversation.router)