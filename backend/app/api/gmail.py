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
    from app.services.gmail_poller import is_gmail_connected
    return {"connected": is_gmail_connected()}


@router.post("/poll")
async def trigger_poll():
    from fastapi import HTTPException
    from googleapiclient.errors import HttpError
    try:
        await poll_gmail_for_invoices()
        return {"message": "Gmail poll triggered successfully"}
    except HttpError as e:
        import json
        error_details = json.loads(e.content).get('error', {}).get('message', str(e))
        raise HTTPException(status_code=400, detail=f"Google API Error: {error_details}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/disconnect")
async def gmail_disconnect():
    from app.services.gmail_poller import disconnect_gmail
    disconnect_gmail()
    return {"message": "Gmail disconnected successfully"}
