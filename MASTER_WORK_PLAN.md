# TaxWise: Master Work Plan

---

## **A. Current System Status**

### Where We Stand Now

The TaxWise application is at a pre-beta stage with a functional core user journey but several critical gaps that prevent it from being production-ready. The foundational elements, including user authentication (email and Google OAuth), a well-structured Next.js frontend, and a secure Supabase backend with Row Level Security, are in place. However, the system is not yet commercially viable or fully reliable for end-users.

### What Has Been Completed

- **User Authentication:** Sign-up, sign-in, and protected routes are working as expected.
- **Core Frontend:** A maintainable and consistent UI has been established using Next.js and TailwindCSS.
- **Database Foundation:** The Supabase schema is well-designed, and RLS is correctly implemented.
- **CSV Upload:** The system can robustly handle CSV uploads with a user-friendly column mapping feature.
- **Initial Analysis Engine:** A hybrid analysis engine that uses a combination of user-defined rules, system rules, and AI for transaction categorization is operational.

### What is Partially Implemented

- **PDF Parsing:** The current implementation is fragile and only works for a specific PDF format.
- **Dashboard:** While the dashboard page loads, it relies on inefficient data-fetching logic and uses hardcoded data for key components like the `DeductibleStatus`.
- **Deduction Engine:** The system can assign a `is_deductible` flag but lacks a user feedback loop and the ability to handle mixed-use expenses.

### What is Still Missing

- **Billing System:** The application is currently free, with no mechanism for monetization.
- **Core Feature Pages:** The `Deductibles` and `Reports` pages are placeholders with no functionality.
- **User Account Management:** The "Forgot Password" flow is missing.
- **Legal Pages:** The Terms of Service and Privacy Policy pages are empty.

---

## **B. Consolidated Improvements**

### Immediate Fixes

- **PDF Parsing:** Implement a more robust set of regex rules for common Nigerian banks.
- **Dashboard Performance:** Refactor the dashboard to use pre-computed data from the `upload_summaries` table.
- **User Feedback:** Provide more specific and helpful error messages for upload and parsing failures.

### Structural Improvements

- **Decoupled Upload and Analysis:** Introduce the concept of an "Analysis Session" to allow users to upload multiple files before triggering the analysis.
- **Deduction Classification Model:** Replace the `is_deductible` boolean with a more granular status enum (`Business`, `Personal`, `Mixed`, `Needs Review`).
- **Internal Transfer Detection:** Implement a rule-based heuristic to identify and exclude transfers between a user's own accounts.

### Feature Completions

- **`Deductibles` Page:** Build out the UI and functionality for the `Deductibles` page to allow users to review and manage their deductions.
- **`Reports` Page:** Implement the report generation and download functionality.
- **"Forgot Password" Flow:** Create the necessary pages and logic for the password reset flow.

### Business Readiness Items

- **Billing System:** Implement the Paystack checkout flow and webhook handler to manage subscriptions.
- **Legal Pages:** Add content for the Terms of Service and Privacy Policy pages.

### Deployment Readiness Items

- **Secure API Keys:** Ensure all secrets are stored securely in environment variables.
- **RLS Policy Review:** Conduct a final review of all Row Level Security policies.
- **Vercel Configuration:** Ensure the `.vercelignore` and `.gitignore` files are correctly configured.

---

## **C. Prioritized Execution Plan**

### Phase 1: Critical Fixes

- **Fix PDF Parsing (Regex-Based):**
  - Implement robust, text-based PDF parsing for the highest priority Nigerian banks:
    - **P1: GTBank, Access Bank, Zenith Bank.**
    - **P2: UBA, FirstBank, Kuda.**
    - (P3: OPay, Moniepoint to follow in a later phase).
- **Fix Dashboard Performance:** Refactor the dashboard to use pre-computed data from the `upload_summaries` table.
- **Implement "Forgot Password" Flow:** Build the UI and logic for the password reset flow.

### Phase 2: Core System Strengthening

- **Decoupled Upload and Analysis:** Implement the "Analysis Session" concept and the asynchronous analysis background job.
- **Internal Transfer Detection:** Implement the logic to detect and flag internal transfers.
- **Build `Deductibles` Page (MVP Feedback Loop):**
  - Build the UI for the `Deductibles` page.
  - Implement the **must-have** simple user feedback loop:
    - Allow users to toggle transaction status (`Business` / `Mixed` / `Personal`).
    - Allow users to toggle `Deductible: Yes/No`.
    - Ensure summary calculations update immediately after user changes.

### Phase 3: Business & Billing Activation Prep

- **Implement Billing (Paystack Integration):**
  - Build the Paystack checkout flow and webhook handler.
  - Billing will be implemented but kept **disabled** in the UI until the decision is made to charge users. Paystack keys will be managed via environment variables.
- **Build `Reports` Page:** Implement the report generation and download functionality.
- **Complete Legal Pages:** Add content for the Terms of Service and Privacy Policy pages.

### Phase 4: Polish & Scale Readiness

- **Improve User Feedback:** Implement polished loading skeletons and helpful empty-state components.
- **Advanced PDF Parsing (OCR/AI):** Evaluate and integrate an OCR/AI solution for handling scanned PDFs. This will require API keys.
- **Advanced Deductions:** Implement the "nice-to-have" features for the deductions engine, such as a user-facing rule builder.
- **Final Security & Deployment Review:** Conduct a final review of all security configurations and deploy the application.
