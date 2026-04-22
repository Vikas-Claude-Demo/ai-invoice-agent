"""
AI Learning Module — stores resolution patterns from exception handling.
When an exception is resolved with [AI_LEARN] tag, the resolution pattern
is saved and consulted during future matching to auto-resolve similar cases.
"""

from app.core.supabase import get_supabase


def store_learning(invoice_data: dict, exception_reason: str, resolution: dict):
    """
    Store a resolution pattern for future AI learning.
    Saves the original error, the correction made, and vendor context.
    """
    db = get_supabase()
    extracted = invoice_data.get("extracted_data", {})

    pattern = {
        "vendor_name": extracted.get("vendor_name"),
        "exception_type": _categorize_reason(exception_reason),
        "original_reason": exception_reason,
        "original_po_number": invoice_data.get("po_number"),
        "corrected_po_number": resolution.get("po_number"),
        "original_total": invoice_data.get("total"),
        "corrected_total": resolution.get("total"),
        "resolution_action": resolution.get("action", "edit"),
        "notes": resolution.get("notes", ""),
    }

    try:
        db.table("ai_learnings").insert(pattern).execute()
        print(f"[AI Learn] ✓ Stored learning pattern for vendor: {pattern['vendor_name']}")
    except Exception as e:
        # Table might not exist yet — silently skip
        print(f"[AI Learn] Could not store pattern (table may not exist): {e}")


def check_learnings(vendor_name: str | None, po_number: str | None, reason_type: str) -> dict | None:
    """
    Check if a similar exception was resolved before.
    Returns the resolution pattern if found.
    """
    db = get_supabase()

    try:
        query = db.table("ai_learnings").select("*")

        if vendor_name:
            query = query.eq("vendor_name", vendor_name)

        if po_number:
            query = query.eq("original_po_number", po_number)

        query = query.eq("exception_type", reason_type)
        result = query.order("created_at", desc=True).limit(1).execute()

        if result.data:
            print(f"[AI Learn] Found matching pattern for {reason_type} from vendor {vendor_name}")
            return result.data[0]

    except Exception as e:
        print(f"[AI Learn] Lookup failed: {e}")

    return None


def _categorize_reason(reason: str) -> str:
    """Categorize an exception reason into a type for pattern matching."""
    reason_lower = reason.lower()
    if "po number" in reason_lower and "not found" in reason_lower:
        return "po_not_found"
    if "no po number" in reason_lower:
        return "missing_po"
    if "no grn" in reason_lower:
        return "missing_grn"
    if "amount variance" in reason_lower:
        return "amount_variance"
    if "duplicate" in reason_lower:
        return "duplicate"
    if "processing failed" in reason_lower:
        return "extraction_failed"
    return "other"
