# Plan: Expanding and Refining the Upload and Analysis Workflow

This document outlines the plan for enhancing the TaxWise application to support a more robust and user-friendly data upload and analysis process. This plan addresses PDF uploads, deferred analysis, handling of multiple accounts, and detection of internal transfers.

## 1. Feature Breakdown

### 1.1. PDF Upload and Parsing
- **Goal:** Allow users to upload PDF bank statements.
- **Implementation:** A multi-layered approach to parsing:
    1.  **Text-Based PDFs:** Use a library like `pdf-parse` to extract text. Develop a set of robust, bank-specific regex patterns to identify transaction tables and data points (Date, Description, Debits, Credits).
    2.  **Scanned/Image-Based PDFs (OCR):** Integrate a third-party OCR service (e.g., Google Cloud Vision, AWS Textract) or a self-hosted solution (Tesseract.js) to extract text from image-based PDFs. The extracted text will then be fed into the same regex-based parsing logic.
    3.  **AI-Powered Fallback:** For PDFs that cannot be parsed by rules, use a multimodal AI model (like GPT-4 with Vision) to "read" the PDF page and extract transactions in a structured JSON format. This is a more expensive fallback and should be used sparingly.
- **Normalization:** All extracted data, regardless of the source (CSV or PDF), will be normalized into a standard internal `Transaction` object format before being saved to the database.

### 1.2. Decoupled Upload and Analysis
- **Goal:** Separate the file upload process from the analysis process.
- **Implementation:**
    - Introduce a new concept called an **"Analysis Session"**.
    - When a user initiates an upload, a new `analysis_sessions` record is created with a `status` of `pending`.
    - Each uploaded file (and its associated data) is linked to this session.
    - The UI will display a list of uploaded files in the current session and provide two clear actions: **"Add More Files"** and **"Run Analysis"**.
    - The analysis engine will only be triggered when the user explicitly clicks "Run Analysis".

### 1.3. Multiple Account & Combined Analysis
- **Goal:** Allow users to upload and analyze statements from multiple bank accounts together.
- **Implementation:**
    - The "Analysis Session" model naturally supports this. Users can upload multiple files (CSV or PDF) from different banks into a single session.
    - A user-definable `account_name` field will be added to each upload, allowing users to label their uploads (e.g., "GTB Savings", "Zenith Current").
    - When "Run Analysis" is triggered, the system will process all transactions from all uploads within that session as a single, combined dataset.
    - The `upload_id` on each transaction will be retained, allowing for traceability back to the source file and account.

### 1.4. Internal Transfer Detection
- **Goal:** Identify and exclude transfers between a user's own accounts to prevent distortion of financial summaries.
- **Implementation:** A rule-based heuristic approach will be used post-analysis:
    1.  **Initial Flagging:** After all transactions for a session are categorized, a dedicated process will scan for potential internal transfers. It will look for pairs of transactions (one debit, one credit) across different user accounts that have:
        - Matching or very similar amounts.
        - Close transaction dates (e.g., within a 24-48 hour window).
        - Transaction descriptions containing keywords like "Transfer", "TRF", or the user's own name.
    2.  **User Confirmation (Optional but Recommended):** The system could present flagged transfers to the user for confirmation to improve accuracy.
    3.  **Exclusion from Analysis:** Transactions confirmed as internal transfers will be marked with an `is_internal_transfer` flag in the database and will be excluded from all financial calculations (total income, expenses, tax deductions).

## 2. Intended User Flow

1.  **Initiate Upload:** The user clicks "Upload Statement" from the dashboard.
2.  **Create Session:** The user is prompted to give the analysis session a name (e.g., "2024 Q1 Analysis," defaults to current date). A new session is created.
3.  **First Upload:** The user selects and uploads their first file (CSV or PDF). They can optionally assign a friendly name to the account (e.g., "My GTB Account").
4.  **File Processing & Validation:** The system processes the file, normalizes the data, and saves the transactions, linking them to the session. A summary of the upload (e.g., "Found 85 transactions in `statement_jan.pdf`") is displayed.
5.  **Review and Add More:** The UI shows the list of uploaded files for the current session. The user is presented with two primary actions:
    - **"Add Another File"**: Repeats the upload process for an additional statement.
    - **"Run Analysis"**: Proceeds to the next step.
6.  **Trigger Analysis:** Once all files are uploaded, the user clicks **"Run Analysis"**. The session status is updated to `analyzing`.
7.  **Combined Processing:** The backend gathers all transactions associated with the session.
8.  **Internal Transfer Detection:** The system runs the internal transfer detection logic on the combined dataset.
9.  **Categorization & Summarization:** The analysis engine categorizes all transactions and computes the final summaries.
10. **View Dashboard:** The user is redirected to the dashboard, which now displays the results of the combined analysis.

## 3. Data Model Implications

The following changes will be made to the Supabase schema:

- **`analysis_sessions` (New Table):**
    - `id` (uuid, pk)
    - `user_id` (uuid, fk to `users.id`)
    - `name` (text, user-defined name for the session)
    - `status` (enum: `pending`, `analyzing`, `completed`, `failed`)
    - `created_at` (timestamp)

- **`uploads` (Existing Table):**
    - Add `session_id` (uuid, fk to `analysis_sessions.id`)
    - Add `account_name` (text, nullable, user-defined)

- **`transactions` (Existing Table):**
    - Add `is_internal_transfer` (boolean, default `false`)

## 4. Edge Cases and Assumptions

- **Duplicate Files:** The system will check for and prevent the upload of the exact same file twice within a single session.
- **Overlapping Dates:** The system will assume that transactions are unique based on their content and will not perform date-based deduplication across files initially. The internal transfer logic will handle the most common case of this.
- **Abandoned Sessions:** Sessions left in a `pending` state for an extended period (e.g., >7 days) may be automatically cleaned up by a scheduled job.
- **Analysis Failures:** If the analysis process fails, the session status will be set to `failed`, and the user will be notified with a clear error message.
- **PDF Quality:** The plan assumes that for non-AI parsing, PDFs are text-based and reasonably well-formatted. Poorly scanned or malformed PDFs will likely fail parsing and will be flagged to the user.

## 5. Risks and Open Questions

- **PDF Parsing Complexity:** PDF parsing is notoriously difficult. The reliability of regexes across different banks and statement formats is a significant risk. The cost and performance of OCR and AI-based solutions also need to be carefully evaluated.
- **Internal Transfer Accuracy:** The heuristic for detecting internal transfers may produce false positives or miss valid transfers. A user confirmation step is highly recommended to mitigate this but adds complexity to the UI.
- **Scalability:** The analysis of very large sessions (many files, hundreds of thousands of transactions) could be slow or memory-intensive. The analysis process should be designed as a background job that can run asynchronously.

## 6. Phased Implementation Steps

1.  **Phase 1: Session Management & UI**
    - Implement the `analysis_sessions` table and update the `uploads` and `transactions` tables.
    - Build the new UI for creating sessions, uploading multiple files, and deferring analysis.
    - Modify the backend to link uploads to sessions.

2.  **Phase 2: Decoupled Analysis**
    - Implement the "Run Analysis" button logic.
    - Convert the analysis engine into an asynchronous background job that operates on a `session_id`.

3.  **Phase 3: Robust PDF Parsing**
    - Implement the text-based PDF parsing with `pdf-parse` and a library of regexes for 2-3 major Nigerian banks.
    - Add robust error handling to flag PDFs that fail to parse.

4.  **Phase 4: Internal Transfer Detection**
    - Implement the backend logic to detect and flag internal transfers within a completed analysis session.
    - Update the dashboard and reporting logic to exclude these transfers from financial calculations.

5.  **Phase 5 (Post-Beta): Advanced Parsing**
    - Evaluate and integrate an OCR/AI solution for handling scanned PDFs and complex formats based on user feedback and business priority.
