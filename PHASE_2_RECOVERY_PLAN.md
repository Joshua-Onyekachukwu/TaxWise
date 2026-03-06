# Phase 2: Core Workflow Recovery & Refinement Plan

## 1. Scope Summary

This phase resets and focuses our efforts on stabilizing the core user workflow. The primary objective is to make the journey from bank statement upload to tax report generation robust, reliable, and user-friendly. We will fix critical bugs, implement a crucial "Bank Accounts" feature, and redesign the upload process.

**Core Workflow:** `Sign In -> Dashboard -> Upload Statements (CSV/PDF) -> Run Analysis -> View Analysis/Deductions/Report`

---

## 2. Tasks & Implementation Steps

### **Step 1: Critical Bug Fix - PDF Parsing**

**Goal:** Resolve the `__TURBOPACK__...default is not a function` error and enable reliable PDF bank statement parsing, focusing on Nigerian bank formats.

*   **Task 1.1: Analyze and Fix the Root Cause**
    *   **Problem Analysis:** The error indicates a module resolution issue between Next.js's Turbopack bundler and the `pdf-parse` library. `pdf-parse` is likely a CommonJS module, and Turbopack's ESM-first approach is failing to correctly identify the main export function. The `(pdf as any).default(buffer)` syntax I attempted was a workaround for this, but it is not stable.
    *   **Proposed Fix:** Instead of fighting the bundler, we will force this specific part of the code to run in a pure Node.js environment where module resolution is more predictable. We will ensure the `upload/route.ts` API route is explicitly configured for the Node.js runtime.
    *   **Acceptance Criteria:**
        *   The `__TURBOPACK__` error is completely eliminated.
        *   PDF files can be uploaded and their text content is successfully extracted on the server without errors.

*   **Task 1.2: Implement Safe, Nigeria-First PDF Parsing**
    *   **Implementation:** The `PdfParserService` will be enhanced. After extracting text, it will use a series of pattern-matching tests to identify the specific Nigerian bank format (e.g., GTBank, Access Bank, etc.). A dedicated parser for the identified bank will then be used to extract transactions with high accuracy.
    *   **Fallback Behavior:** If a bank format is not recognized, the system will use a "generic" regex-based parser that attempts to find transactions based on common date and amount patterns.
    *   **User Feedback:** If the generic parser also fails or extracts zero transactions, the user will be shown a clear error message: "Could not extract any transactions from this PDF. Please ensure it is a text-based digital statement, not a scanned image."
    *   **Acceptance Criteria:**
        *   The system correctly identifies and parses at least two major Nigerian bank PDF statement formats.
        *   Unrecognized PDFs are handled gracefully by the generic parser.
        *   Users receive clear feedback when a PDF is un-parseable.

### **Step 2: Database Schema - Bank Accounts**

**Goal:** Create the necessary database structure to associate uploads with specific user-created bank accounts.

*   **Task 2.1: Create `bank_accounts` Table**
    *   **Implementation:** A new migration file will be created to define the `bank_accounts` table.
    *   **Schema:**
        *   `id` (UUID, Primary Key)
        *   `user_id` (UUID, Foreign Key to `auth.users`)
        *   `bank_name` (TEXT)
        *   `account_name` (TEXT, User-defined label, e.g., "My Business Account")
        *   `account_number` (TEXT, optional)
        *   `created_at`, `updated_at` (TIMESTAMPTZ)
    *   **RLS Policy:** A strict RLS policy will be added to ensure users can only access their own bank accounts.
    *   **Acceptance Criteria:**
        *   The migration is created and applied successfully.
        *   RLS policy is active and verified.

*   **Task 2.2: Update `uploads` Table**
    *   **Implementation:** A new migration will add a foreign key column `account_id` to the `uploads` table, linking it to the `bank_accounts` table.
    *   **Acceptance Criteria:**
        *   The `uploads` table is successfully altered to include the `account_id`.

### **Step 3: UI/UX - Upload Page Redesign & Functionality**

**Goal:** Create a functional, intuitive, multi-file upload experience that incorporates the new Bank Accounts feature.

*   **Task 3.1: Redesign Upload Page UI**
    *   **Implementation:** The current upload page will be replaced with a new design. It will feature a clean, step-by-step process.
    *   **Step 1: Select Bank Account:** A dropdown will allow the user to select an existing bank account. An "Add New Account" button will open a modal to create one.
    *   **Step 2: Upload Files:** A file dropzone will allow the user to drag-and-drop or select multiple CSV and PDF files.
    *   **Step 3: Run Analysis:** A prominent "Run Analysis" button will be the final action to start the backend processing. This button will be disabled until at least one file is added.
    *   **Acceptance Criteria:**
        *   The new UI is implemented and replaces the old upload page.
        *   The flow is logical and guides the user through the process.

*   **Task 3.2: Implement Bank Account Management**
    *   **Implementation:** I will build the "Add New Account" modal and the logic to fetch and display the user's existing accounts in the dropdown.
    *   **Acceptance Criteria:**
        *   Users can successfully create a new bank account from the upload page.
        *   New accounts are immediately available for selection without a page refresh.

*   **Task 3.3: Implement Multi-File Upload Logic**
    *   **Implementation:** The frontend will be updated to handle an array of files. The backend `upload` API route will be modified to accept and process multiple files in a single request, associating all of them with the selected `account_id` and a single analysis session.
    *   **Acceptance Criteria:**
        *   A user can upload 3 files (e.g., 2 PDFs, 1 CSV) in one go.
        *   All uploaded files are linked to the same analysis run.

### **Step 4: CSV Import Robustness**

**Goal:** Improve the reliability of CSV parsing to handle various bank formats and prevent duplicate data.

*   **Task 4.1: Enhance Column Mapping and Validation**
    *   **Implementation:** After a CSV is uploaded, instead of immediate processing, the system will display a preview of the data and a more robust column mapping interface. The user will be required to confirm the mapping for `Date`, `Description`, `Amount` (or `Debit`/`Credit`).
    *   **Acceptance Criteria:**
        *   The CSV import process includes a mandatory mapping/preview step.
        *   The system prevents import if required columns are not mapped.

*   **Task 4.2: Implement Deduplication**
    *   **Implementation:** A deterministic fingerprint (a hash of `date`, `amount`, and a cleaned `description`) will be generated for each transaction *before* insertion. The system will query for existing fingerprints and skip any duplicates found.
    *   **Acceptance Criteria:**
        *   Uploading the same CSV file twice does not create duplicate transaction entries in the database.

---

### **Step 5: Analysis & Data Integrity**

**Goal:** Ensure the analysis process is accurate and provides clear feedback to the user.

*   **Task 5.1: Implement Internal Transfer Detection**
    *   **Implementation:** After transactions are parsed, a heuristic-based process will run to identify potential transfers between a user's own accounts. It will look for pairs of transactions (debit and credit) with matching amounts and close transaction dates.
    *   **User Feedback:** Flagged transfers will be marked with an `is_internal_transfer` flag and will be excluded from all financial summaries (income, expenses) to avoid inflating totals.
    *   **Acceptance Criteria:**
        *   A transfer between two of the user's uploaded accounts is correctly identified and flagged.
        *   Flagged transfers do not appear in the main dashboard financial summaries.

*   **Task 5.2: Verify `upload_summaries` Population**
    *   **Implementation:** I will review the `AnalysisEngine` to ensure that upon successful completion, it correctly populates the `upload_summaries` table with the aggregated data (total income, expenses, etc.). This pre-computed data is essential for a performant dashboard.
    *   **Acceptance Criteria:**
        *   After a successful analysis run, a corresponding record exists in the `upload_summaries` table.

*   **Task 5.3: Improve Error Handling & User Feedback**
    *   **Implementation:** Review and improve all error messages related to the upload and analysis workflow. Messages must be actionable (e.g., "This CSV format is not recognized. Please ensure the columns are named 'Date', 'Description', and 'Amount'.")
    *   **Acceptance Criteria:**
        *   At least 5 distinct error scenarios (e.g., invalid file type, un-parseable PDF, failed CSV mapping) are handled with clear, user-friendly error messages.

---

## 4. Exclusions (What We Will NOT Do)

*   **No Transactions Page:** We will not build or expand a dedicated, editable "Transactions" page in this phase. The focus is on the aggregate analysis, not on individual transaction management.
*   **No Receipt Attachments:** The ability to upload and link receipts to transactions is deferred.
*   **No Advanced AI Rules:** The AI categorization will remain as-is. We will not build a user-facing rules engine in this phase.
*   **No Billing Integration:** All work related to monetization is out of scope.

---

## 4. Risks & Open Questions

*   **Risk: PDF Format Complexity:** Nigerian bank PDF statements are inconsistent. Some may be image-based (scanned), which will fail our text-extraction method.
    *   **Mitigation:** The user-facing error message is our primary mitigation. We will focus on the most common digital formats first.
*   **Risk: CSV Encoding Issues:** CSV files may come in different character encodings.
    *   **Mitigation:** We will default to `UTF-8` and add robust error handling to inform the user if the file cannot be read.
*   **Open Question:** How should we handle multi-currency transactions within a single statement?
    *   **Proposal for MVP:** For this phase, we will assume all transactions in a statement are in the bank account's primary currency (defaulting to NGN). Multi-currency support will be deferred.

---

## 5. Testing & Acceptance Checklist

*   **End-to-End Workflow:**
    *   [ ] A new user can sign up and is correctly guided through the onboarding banner.
    *   [ ] User creates a new Bank Account.
    *   [ ] User uploads one PDF and one CSV for that account in a single batch.
    *   [ ] User clicks "Run Analysis".
    *   [ ] The analysis completes successfully in the background.
    *   [ ] The Dashboard correctly reflects the summarized data from the uploads.
    *   [ ] The Deductions page correctly lists potential deductibles.
    *   [ ] The Reports page can generate a report for the analyzed period.
*   **PDF Parsing:**
    *   [ ] The `__TURBOPACK__` error is gone.
    *   [ ] Uploading a known-good GTBank PDF succeeds.
    *   [ ] Uploading a scanned (image-based) PDF fails with a clear error message.
*   **CSV Import:**
    *   [ ] Uploading a CSV prompts the user with a column-mapping UI.
    *   [ ] Uploading the same CSV twice does not create duplicate transactions.
*   **Security:**
    *   [ ] A user cannot see or select bank accounts belonging to another user.
