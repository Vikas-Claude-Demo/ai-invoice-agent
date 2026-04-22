from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import date, datetime
from enum import Enum


class InvoiceStatus(str, Enum):
    received = "received"
    processing = "processing"
    extracted = "extracted"
    matched = "matched"
    exception = "exception"
    approved = "approved"
    posted = "posted"
    rejected = "rejected"


class InvoiceSource(str, Enum):
    email = "email"
    upload = "upload"


class MatchStatus(str, Enum):
    auto_matched = "auto_matched"
    partial = "partial"
    unmatched = "unmatched"
    exception = "exception"


class ExceptionStatus(str, Enum):
    open = "open"
    resolved = "resolved"
    rejected = "rejected"


class LineItemSchema(BaseModel):
    description: str
    qty: float
    rate: float
    amount: float
    tax: Optional[float] = 0


class ExtractedInvoiceData(BaseModel):
    vendor_name: Optional[str] = None
    vendor_email: Optional[str] = None
    vendor_gstin: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    po_number: Optional[str] = None
    line_items: List[LineItemSchema] = []
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    currency: Optional[str] = "INR"
    confidence_score: Optional[float] = None
    low_confidence_fields: List[str] = []


class VendorCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    gstin: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    gstin: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    bank_ifsc: Optional[str] = None


class POLineItem(BaseModel):
    description: str
    qty: float
    rate: float
    amount: float


class PurchaseOrderCreate(BaseModel):
    vendor_id: str
    po_number: str
    po_date: str
    expected_delivery: Optional[str] = None
    line_items: List[POLineItem]
    total_amount: float
    notes: Optional[str] = None


class GRNCreate(BaseModel):
    po_id: str
    grn_number: str
    received_date: str
    items_received: List[dict]
    notes: Optional[str] = None


class ExceptionResolve(BaseModel):
    action: str  # approve | reject | edit
    notes: Optional[str] = None
    edited_data: Optional[dict] = None


class NotificationCreate(BaseModel):
    user_id: str
    message: str
    type: str
    invoice_id: Optional[str] = None
