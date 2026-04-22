from fastapi import APIRouter, HTTPException
from app.core.supabase import get_supabase
from app.models.schemas import ExceptionResolve
from app.services.matcher import _post_to_erp, _update_invoice_status

router = APIRouter(prefix="/api/exceptions", tags=["exceptions"])


@router.get("")
async def list_exceptions(status: str = "open", page: int = 1, limit: int = 20):
    db = get_supabase()
    offset = (page - 1) * limit
    result = (
        db.table("exceptions")
        .select("*, invoices(invoice_number, total, source, raw_file_url, extracted_data, vendors(name))")
        .eq("status", status)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data


@router.post("/{exception_id}/resolve")
async def resolve_exception(exception_id: str, body: ExceptionResolve):
    db = get_supabase()

    exc_res = db.table("exceptions").select("*, invoices(*)").eq("id", exception_id).single().execute()
    if not exc_res.data:
        raise HTTPException(404, "Exception not found")

    exc = exc_res.data
    invoice = exc["invoices"]
    invoice_id = exc["invoice_id"]

    if body.action == "approve":
        po_res = db.table("purchase_orders").select("*").eq("po_number", invoice.get("po_number", "")).execute()
        po = po_res.data[0] if po_res.data else {}
        extracted = invoice.get("extracted_data", {})
        await _post_to_erp(invoice_id, po, invoice, extracted)
        db.table("exceptions").update({"status": "resolved", "resolution_notes": body.notes}).eq("id", exception_id).execute()
        _update_invoice_status(invoice_id, "posted")

    elif body.action == "reject":
        db.table("exceptions").update({"status": "rejected", "resolution_notes": body.notes}).eq("id", exception_id).execute()
        _update_invoice_status(invoice_id, "rejected")

    elif body.action == "edit":
        if body.edited_data:
            db.table("invoices").update({
                "extracted_data": body.edited_data,
                "invoice_number": body.edited_data.get("invoice_number"),
                "po_number": body.edited_data.get("po_number"),
                "total": body.edited_data.get("total"),
                "status": "extracted",
            }).eq("id", invoice_id).execute()
            db.table("exceptions").update({"status": "resolved", "resolution_notes": body.notes}).eq("id", exception_id).execute()
            from app.services.matcher import run_matching
            await run_matching(invoice_id)
    else:
        raise HTTPException(400, "action must be: approve, reject, or edit")

    _notify_resolution(invoice_id, body.action)
    return {"message": f"Exception {body.action}d successfully"}


def _notify_resolution(invoice_id: str, action: str):
    db = get_supabase()
    users_res = db.table("users").select("id").in_("role", ["admin", "manager"]).execute()
    notifications = [
        {
            "user_id": u["id"],
            "message": f"Invoice exception has been {action}d",
            "type": "resolution",
            "invoice_id": invoice_id,
            "read": False,
        }
        for u in (users_res.data or [])
    ]
    if notifications:
        db.table("notifications").insert(notifications).execute()
