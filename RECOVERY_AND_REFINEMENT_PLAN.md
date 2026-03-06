# Phase 2: Recovery & Refinement Plan

## 1. Scope Summary

This plan focuses on stabilizing the core user workflow and addressing critical bugs to make the system reliable and functional. The primary goal is to ensure a user can sign in, upload a bank statement (CSV or PDF), run an analysis, and see the results.

**Core Workflow:**
`Sign In -> Dashboard -> Upload Statements (CSV/PDF) -> Run Analysis -> View Analysis/Deductions/Report`

This phase will prioritize bug fixes and essential features over new, complex functionality.

---

## 2. Tasks & Implementation Steps

### Task 2.1: Fix Critical PDF Parsing Error (High Priority)

**Problem:** The PDF import is failing with a `__TURBOPACK__...default is not a function` error. This is a blocker for a core feature.

**Analysis:**
*   **Root Cause:** The error stems from a module resolution conflict between Next.js's Turbopack bundler and the `pdf-parse` library. The library is likely a CommonJS module, and Turbopack is struggling to handle the `import` statement correctly in the Node.js runtime for API routes.
*   **Proposed Fix:** The most robust solution is to move the entire file upload and parsing logic out of the Next.js API route and into a Supabase Edge Function. Edge Functions run in a Deno environment, which has better support for diverse module types and is the recommended Supabase pattern for this kind of task. This also solves the authentication token expiration issue that was causing the `Unexpected token '<'` JSON error.

**Implementation Steps:**
1.  **Create Supabase Edge Function:**
    *   Create a new Edge Function named `upload-statement`.
    *   Move the file reading, parsing (both CSV and PDF), and database insertion logic from the old `/api/upload` route into this function.
    *   Ensure the function uses the `supabase-admin` client for all database operations to bypass RLS safely on the server.
    *   Add robust error handling and logging.
    *   Implement CORS headers to allow invocation from the browser.
2.  **Update Frontend to Use Edge Function:**
    *   Modify the upload component (`src/app/dashboard/uploads/create/page.tsx`) to call the `upload-statement` Edge Function using `supabase.functions.invoke()`.
    *   Remove the old `fetch` call to `/api/upload`.
3.  **Deploy and Verify:**
    *   Install the Supabase CLI.
    *   Deploy the `upload-statement` Edge Function.
    *   Create a test script to invoke the function directly and verify its functionality before integrating with the UI.

**Fallback Behavior:** If parsing fails within the Edge Function, it will return a specific error message (e.g., `{ error: 'Failed to parse PDF.' }`) which the frontend will display to the user. The original file will still be stored in Supabase Storage for manual inspection.

---

### Task 2.2: Implement Bank Accounts Feature

**Problem:** Uploads are not associated with a specific bank account, which is a mandatory requirement for organizing user data.

**Implementation Steps:**
1.  **Database Schema:**
    *   Create a new table `bank_accounts` with the following columns:
        *   `id` (uuid, primary key)
        *   `user_id` (uuid, foreign key to `auth.users`)
        *   `bank_name` (text, not null)
        *   `account_name` (text, not null, e.g., "Personal Savings")
        *   `account_number` (text)
        *   `created_at`, `updated_at`
    *   Enable RLS on this table, allowing users to only access their own accounts.
    *   Add a `bank_account_id` column to the `uploads` table.
2.  **UI on Upload Page:**
    *   In `src/app/dashboard/uploads/create/page.tsx`, add UI elements:
        *   A dropdown (`<select>`) to choose from existing bank accounts.
        *   A button to "Add New Bank Account," which opens a modal.
    *   The modal form will collect `Bank Name` and `Account Name`.
3.  **Frontend Logic:**
    *   Fetch the user's bank accounts to populate the dropdown.
    *   When a new bank account is created, insert it into the `bank_accounts` table and refresh the dropdown.
    *   When the "Run Analysis" button is clicked, the `bank_account_id` must be passed to the Edge Function along with the file.

---

### Task 2.3: Redesign and Functionalize Upload Page

**Problem:** The current upload page is basic and does not support the full, intended workflow.

**Implementation Steps:**
1.  **UI/UX Redesign:**
    *   Improve the layout for better visual appeal and clarity.
    *   Ensure the "Bank Accounts" feature is integrated seamlessly.
    *   The file upload area should clearly show a list of files staged for analysis. Users should be able to add/remove files from this list.
    *   The "Run Analysis" button should be the primary call-to-action.
2.  **Workflow Logic:**
    *   The page should not automatically trigger analysis on file selection.
    *   The "Run Analysis" button will trigger the `supabase.functions.invoke('upload-statement', ...)` call for each staged file.
    *   After the analysis is successfully completed, the user should be redirected to the main Dashboard, where they will see the updated analysis summary. The workflow of navigating to specific Analysis/Deductions/Report pages will be handled from the Dashboard itself.

---

### Task 2.4: Improve CSV Import Robustness

**Problem:** The current CSV parsing is likely brittle and will fail on different bank statement formats.

**Implementation Steps:**
1.  **Refactor CSV Parser:**
    *   Inside the new `upload-statement` Edge Function, enhance the CSV parsing logic.
    *   Instead of a fixed column order, implement a header-detection mechanism to find columns like "Date", "Description", "Debit", "Credit".
    *   Add more flexible date parsing to handle various formats (e.g., `dd/mm/yyyy`, `mm-dd-yy`).
2.  **Deduplication:**
    *   Before inserting transactions into the `transactions` table, generate a unique hash for each row (e.g., a combination of date, description, amount, and `bank_account_id`).
    *   Check if a transaction with that hash already exists for the user. If so, skip it.
    *   This will be handled within the `upload-statement` Edge Function.

---

## 3. Exclusions (What We Will NOT Do)

*   We will **not** build a separate, dedicated "Transactions" page in this phase.
*   We will **not** implement receipt attachments.
*   We will **not** expand the Rules Engine or AI Categorization beyond what is needed for basic parsing.
*   We will **not** add multi-currency support beyond the user's default currency.

---

## 4. Risks and Open Questions

*   **Risk:** The Supabase CLI might have installation or configuration issues in the development environment.
    *   **Mitigation:** Follow the official installation guide carefully and test the CLI with simple commands (`supabase login`, `supabase status`) before attempting to deploy functions.
*   **Risk:** Different PDF statement layouts will be complex to parse.
    *   **Mitigation:** For this phase, we will focus on a generic text-extraction approach. We will log parsing failures and the raw text to a separate table for future analysis and parser improvements.

---

## 5. Testing Checklist

-   [ ] **PDF Upload:** User can upload a PDF, and transactions are created successfully.
-   [ ] **CSV Upload:** User can upload a CSV, and transactions are created successfully.
-   [ ] **Bank Account Creation:** User can create a new bank account via the modal.
-   [ ] **Bank Account Selection:** Upload is correctly associated with the selected bank account.
-   [ ] **Error Handling:** A failed parse (for either PDF or CSV) displays a clear error message to the user.
-   [ ] **Deduplication:** Uploading the same file twice does not create duplicate transactions.
-   [ ] **Workflow:** After analysis, the user is redirected to the Dashboard and can see updated data.
-   [ ] **RLS:** A logged-in user cannot see or create bank accounts for another user.
