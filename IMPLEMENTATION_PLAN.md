# Implementation Plan: Advanced Upload Workflow & Multi-Account Support

This document outlines the technical plan to upgrade Taxwise from a single-CSV upload system to a robust multi-file, multi-format financial data processor.

## 1. User Flow & UI/UX Changes

### Current Flow (To Be Replaced)
1. Select **one** CSV file.
2. Auto-upload & Auto-parse.
3. Auto-redirect to Analysis Dashboard.

### New "Staged" Workflow
1. **Upload Landing:** User sees a "Drop Zone" that accepts multiple files (CSV, PDF).
2. **Staging Area:**
   - Uploaded files appear in a "Staged Files" list.
   - Status indicators: *Parsing...*, *Ready*, *Needs Mapping*, *Error*.
   - User can remove files or add more.
3. **Account Selection (New):**
   - For each file, user selects the **Source Account** (e.g., "GTBank Main", "UBA Savings").
   - Option to "Create New Account" on the fly.
4. **Trigger Action:**
   - Primary Button: **"Run Analysis"** (becomes active only when all files are *Ready*).
   - Clicking it triggers the AI classification and deduplication process.

---

## 2. Technical Architecture

### A. PDF Parsing Service (`src/lib/parsing/pdf-parser.ts`)
We will introduce a dual-layer PDF parsing strategy:
1.  **Layer 1: Text Extraction (Low Cost)**
    -   Use `pdf-parse` to extract raw text.
    -   Use Regex patterns to identify standard bank statement layouts (Date, Description, Debit, Credit, Balance).
2.  **Layer 2: AI Extraction (Fallback)**
    -   If Regex fails (unstructured layout), send the first 5 pages of text to `gpt-4o-mini` to extract structured JSON.
    -   *Constraint:* Limit to text-based PDFs. Scanned images (OCR) will be out of scope for MVP unless requested (requires Tesseract/Vision API).

### B. Database Schema Updates
We need to group uploads by "Bank Account" to handle internal transfers and deduplication correctly.

```sql
-- 1. Bank Accounts Table
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id),
    institution_name TEXT NOT NULL, -- e.g. "GTBank"
    account_name TEXT NOT NULL,     -- e.g. "Corporate Savings"
    currency TEXT DEFAULT 'NGN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update Uploads Table
ALTER TABLE uploads 
ADD COLUMN account_id UUID REFERENCES bank_accounts(id),
ADD COLUMN file_type TEXT CHECK (file_type IN ('csv', 'pdf', 'excel'));

-- 3. Update Transactions for Deduplication & Transfers
ALTER TABLE transactions
ADD COLUMN fingerprint TEXT, -- Hash of (date + amount + description)
ADD COLUMN is_transfer BOOLEAN DEFAULT FALSE,
ADD COLUMN transfer_match_id UUID REFERENCES transactions(id); -- Link to the paired transaction
```

### C. Deduplication & Transfer Logic
1.  **Duplicate Detection (Per Account):**
    -   Before inserting a transaction, generate a `fingerprint` (e.g., `SHA256(date_iso + amount_abs + description_normalized)`).
    -   Check if this fingerprint exists **within the same `account_id`**.
    -   If exists: Skip or mark as `duplicate`.
2.  **Internal Transfer Detection (Cross Account):**
    -   *After* insertion, run a "Transfer Matching" job.
    -   Look for pairs:
        -   Transaction A (Account X): Debit ₦50,000, Date: T
        -   Transaction B (Account Y): Credit ₦50,000, Date: T +/- 1 day
    -   If found: Mark both as `is_transfer = true`.
    -   *Impact:* Transfers are excluded from "Income" and "Expense" totals to avoid double-counting.

---

## 3. Implementation Steps

### Phase 1: Database & Backend Foundation
- [ ] Create migration for `bank_accounts` and new columns.
- [ ] Implement `PdfParserService` with `pdf-parse`.
- [ ] Update `AnalysisEngine` to handle multiple `upload_id`s in one batch.
- [ ] Implement `DeduplicationService`.

### Phase 2: Frontend "Upload Staging"
- [ ] Create `BankAccountsManager` component (Add/Select accounts).
- [ ] Refactor `uploads/new/page.tsx` to support:
    -   Multi-file selection.
    -   State management for "Staged" files.
    -   "Map Columns" modal that works per-file.
- [ ] Connect `Run Analysis` button to a new API endpoint `/api/analysis/trigger-batch`.

### Phase 3: Visualization & Verification
- [ ] Update Dashboard to filter by Account (optional but good).
- [ ] Verify PDF parsing accuracy with sample Nigerian bank statements.
- [ ] Verify Internal Transfer logic (simulated transfer between two accounts).

---

## 4. Questions for Approval
1.  **OCR Support:** Do you need support for **scanned/image** PDFs (requires higher cost/complexity) or just digital PDFs (exported from bank apps)? *Recommendation: Start with Digital PDFs.*
2.  **Account Creation:** Should we auto-create accounts based on filenames (e.g., "GTBank_Statement.pdf" -> "GTBank") or force user manual creation? *Recommendation: Manual first for accuracy.*
