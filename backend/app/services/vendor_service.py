from app.core.supabase import get_supabase
from typing import Optional

def get_or_create_vendor(name: str, email: Optional[str] = None, gstin: Optional[str] = None) -> str:
    """
    Search for a vendor by name or GSTIN. If not found, create a new vendor.
    Returns the vendor_id.
    """
    if not name:
        return None
        
    db = get_supabase()
    
    # 1. Search by exact name
    res = db.table("vendors").select("id").eq("name", name).execute()
    if res.data:
        return res.data[0]["id"]
        
    # 2. Search by GSTIN if provided
    if gstin:
        res = db.table("vendors").select("id").eq("gstin", gstin).execute()
        if res.data:
            # Update name if it was different? Maybe not, keep original.
            return res.data[0]["id"]
            
    # 3. Create new vendor
    print(f"[VendorService] Creating new vendor: {name}")
    vendor_data = {
        "name": name,
        "email": email,
        "gstin": gstin,
    }
    
    new_vendor = db.table("vendors").insert(vendor_data).execute()
    if new_vendor.data:
        return new_vendor.data[0]["id"]
        
    return None
