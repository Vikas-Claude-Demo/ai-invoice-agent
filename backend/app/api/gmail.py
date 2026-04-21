from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from app.services.gmail_poller import get_gmail_auth_url, exchange_code_for_token, poll_gmail_for_invoices
from app.core.config import settings
import os

router = APIRouter(prefix="/api/gmail", tags=["gmail"])


@router.get("/connect")
async def gmail_connect():
    auth_url = get_gmail_auth_url()
    return {"auth_url": auth_url}


@router.get("/callback")
async def gmail_callback(code: str, state: str = None):
    exchange_code_for_token(code)
    return RedirectResponse(url=f"{settings.frontend_url}/settings?gmail=connected")


@router.get("/status")
async def gmail_status():
    connected = os.path.exists("gmail_token.json")
    return {"connected": connected}


@router.post("/poll")
async def trigger_poll():
    await poll_gmail_for_invoices()
    return {"message": "Gmail poll triggered"}
