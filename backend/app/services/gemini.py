import base64
import json
import re
import io
from pathlib import Path

from google import genai
from google.genai import types

from app.core.config import settings
from app.models.schemas import ExtractedInvoiceData

_client: genai.Client | None = None

MODEL = "gemini-2.5-flash"

EXTRACTION_PROMPT = """
You are an expert invoice data extraction system. Analyze the provided invoice image and extract all relevant information.

Return a JSON object with EXACTLY this structure (no markdown, no explanation, just raw JSON):
{
  "vendor_name": "string or null",
  "invoice_number": "string or null",
  "invoice_date": "YYYY-MM-DD format or null",
  "po_number": "string or null",
  "line_items": [
    {
      "description": "string",
      "qty": number,
      "rate": number,
      "amount": number,
      "tax": number
    }
  ],
  "subtotal": number or null,
  "tax": number or null,
  "total": number or null,
  "confidence_score": number between 0 and 1,
  "low_confidence_fields": ["list of field names where you are less than 80% confident"]
}

Rules:
- All monetary values must be plain numbers (no currency symbols, no commas)
- If a field is not found or unclear, use null
- confidence_score reflects overall extraction quality (0.0 = very uncertain, 1.0 = very certain)
- Be precise — extract exact values shown on the invoice
"""


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _pdf_to_images(pdf_bytes: bytes) -> list[bytes]:
    try:
        from pdf2image import convert_from_bytes
        pages = convert_from_bytes(pdf_bytes, dpi=200, fmt="jpeg")
        result = []
        for page in pages:
            buf = io.BytesIO()
            page.save(buf, format="JPEG", quality=85)
            result.append(buf.getvalue())
        return result
    except Exception:
        return []


async def extract_invoice_data(file_bytes: bytes, filename: str) -> ExtractedInvoiceData:
    client = _get_client()
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        images = _pdf_to_images(file_bytes)
        if not images:
            raise ValueError("Could not convert PDF to images. Ensure poppler is installed.")
        image_bytes_list = images[:3]
        mime = "image/jpeg"
    elif suffix in [".jpg", ".jpeg"]:
        image_bytes_list = [file_bytes]
        mime = "image/jpeg"
    elif suffix == ".png":
        image_bytes_list = [file_bytes]
        mime = "image/png"
    else:
        image_bytes_list = [file_bytes]
        mime = "image/jpeg"

    parts: list = [EXTRACTION_PROMPT]
    for img in image_bytes_list:
        parts.append(types.Part.from_bytes(data=img, mime_type=mime))

    response = client.models.generate_content(
        model=MODEL,
        contents=parts,
    )

    raw = response.text.strip()
    raw = re.sub(r"```json\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)

    data = json.loads(raw)
    return ExtractedInvoiceData(**data)
