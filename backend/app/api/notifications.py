from fastapi import APIRouter, HTTPException
from app.core.supabase import get_supabase

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/{user_id}")
async def get_notifications(user_id: str, unread_only: bool = False):
    db = get_supabase()
    query = db.table("notifications").select("*").eq("user_id", user_id)
    if unread_only:
        query = query.eq("read", False)
    result = query.order("created_at", desc=True).limit(50).execute()
    return result.data


@router.patch("/{notification_id}/read")
async def mark_read(notification_id: str):
    db = get_supabase()
    db.table("notifications").update({"read": True}).eq("id", notification_id).execute()
    return {"message": "Marked as read"}


@router.patch("/user/{user_id}/read-all")
async def mark_all_read(user_id: str):
    db = get_supabase()
    db.table("notifications").update({"read": True}).eq("user_id", user_id).eq("read", False).execute()
    return {"message": "All notifications marked as read"}
