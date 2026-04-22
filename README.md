# AI Invoice Processing Agent 🤖💸

A production-ready, highly resilient AI-driven accounts payable automation system. It handles the entire invoice lifecycle from ingestion to ERP posting with "Human-in-the-Loop" AI learning.

## 🚀 Key Features & Automation

### 1. Bulletproof Extraction Pipeline
- **Multi-Model Cascade**: Orchestrates 42+ combinations of Gemini models (Pro, Flash, Lite, etc.) across multiple API versions and keys.
- **Local OCR Fallback**: Integrated `pdfplumber` and `pytesseract` as an offline safety net. If AI APIs fail, the system still extracts data with 70%+ accuracy.
- **Multi-Currency Support**: Automatic detection and formatting for INR, USD, GBP, and EUR.

### 2. Intelligent Verification Workbench
- **Side-by-Side UI**: Real-time document preview paired with an editable metadata form for lightning-fast manual verification.
- **Auto-Vendor Onboarding**: Automatically detects new suppliers via Name, Email, and GSTIN/Tax ID. If a vendor doesn't exist, it's created on the fly.
- **3-Way Matching**: Automated reconciliation between Invoice, Purchase Order (PO), and Goods Receipt Note (GRN).

### 3. "AI Learn" Exception Engine
- **Pattern-Based Learning**: When a human corrects an invoice error, the system "learns" the pattern.
- **Self-Healing Pipeline**: Future invoices with similar discrepancies (e.g., specific vendor tax quirks) are automatically corrected using stored AI learnings.

### 4. Enterprise-Grade Ingestion
- **Gmail Integration**: Auto-polls and extracts invoices from email attachments.
- **Bulk Upload**: High-speed processing for manual document uploads.
- **Real-time Notifications**: Instant alerts for processing exceptions or high-value invoice approvals.

## 🛠 Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, TanStack Query, Framer Motion.
- **Backend**: FastAPI, Python 3.10+.
- **Database/Storage**: Supabase (PostgreSQL + S3 Storage).
- **AI/ML**: Google Gemini Pro/Flash, Tesseract OCR.

## 📦 Setup & Deployment

### Environment Variables
Create a `.env` in the root:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Keys
GEMINI_API_KEY=...
GEMINI_API_KEY_BACKUP=... # Optional fallback key
```

### Installation
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 📈 Roadmap
- [x] Resilient AI Pipeline
- [x] Side-by-Side Verification Workbench
- [x] AI Learning from Human Corrections
- [x] Auto-Vendor Onboarding
- [ ] Multi-tenant RLS Policies
- [ ] Advanced Fuzzy Matching for Line Items
