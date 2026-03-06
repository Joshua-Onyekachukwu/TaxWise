# TaxWise: Product Readiness Roadmap

This document outlines the full plan to get the TaxWise application from its current state to a production-ready, beta-launchable product. It consolidates findings from the initial readiness report and integrates the requested workflow enhancements into a single, phased roadmap.

---

## **Phase 1: Core Workflow & Data Model Rearchitecture**

**Goal:** Rebuild the data ingestion and analysis flow to be more robust, scalable, and user-friendly. This phase implements the core of the `UPLOAD_REFINEMENT_PLAN`.

### **1.1. Data Model Changes (Supabase)**
- **Create `analysis_sessions` Table:**
  - `id`, `user_id`, `name`, `status` (`pending`, `analyzing`, `completed`, `failed`)
  - This table will group multiple uploads into a single, user-initiated analysis run.
- **Update `uploads` Table:**
  - Add `session_id` to link each upload to an `analysis_sessions`.
  - Add `account_name` for users to label their uploads (e.g., "GTB Savings").
- **Update `transactions` Table:**
  - Add `is_internal_transfer` (boolean) to flag and exclude internal account movements.

### **1.2. New Upload & Analysis Workflow (UI & Backend)**
- **Decouple Upload from Analysis:**
  - The UI will be changed to allow users to upload multiple files (PDFs/CSVs).
  - After each upload, the user sees a summary and can either "Add Another File" or "Run Analysis".
- **Implement Analysis as a Background Job:**
  - When a user clicks "Run Analysis", it will trigger a server-side background job.
  - This prevents UI lock-ups and timeouts for large analyses. The UI will poll for the job's completion status.

### **1.3. Fix PDF Parsing (Short-Term)**
- **Implement Robust Regex-Based Parsing:**
  - Instead of the current fragile regex, develop a library of specific, tested regex patterns for the top 3-5 Nigerian banks (e.g., GTB, Zenith, Access).
  - This will be a rule-based system that extracts text from text-based (non-scanned) PDFs.
  - Implement clear error messaging for PDFs that fail to parse.

### **1.4. Implement Transaction Deduplication & Internal Transfer Detection**
- **File-Level Deduplication:** Prevent the same file from being uploaded twice in the same session.
- **Internal Transfer Detection:**
  - After analysis, run a heuristic to find matching debit/credit transactions across a user's accounts within the same session.
  - Key indicators: similar amounts, close timestamps, and keywords like "Transfer".
  - Flag these transactions with `is_internal_transfer = true`.

---

## **Phase 2: Performance, Core Features & User Value**

**Goal:** Address the critical performance bottlenecks and build out the core feature pages that deliver the product's main value proposition.

### **2.1. Fix Dashboard Performance**
- **Utilize Pre-Computed Summaries:**
  - The main dashboard **must** be refactored to source its data from the `upload_summaries` table.
  - The current approach of calculating all stats on every page load is not scalable and will be a major point of failure.
  - The analysis background job (from Phase 1) will be responsible for populating this summary table upon completion.

### **2.2. Build `Deductibles` Page**
- **Functionality:**
  - This page will display a detailed list of all transactions that have been categorized as potentially tax-deductible.
  - Users should be able to filter by category, date range, and account.
  - Provide an option for users to manually override or re-categorize a transaction.

### **2.3. Build `Reports` Page**
- **Functionality:**
  - Allow users to generate and download financial reports.
  - **Initial Report:** A comprehensive tax report in CSV/Excel format containing all deductible expenses, categorized and summarized.
  - The UI will provide options to select the analysis session and date range for the report.

---

## **Phase 3: Monetization & User Management**

**Goal:** Implement the necessary features to support a commercial product and manage user accounts effectively.

### **3.1. Implement Billing (Paystack Integration)**
- **Paystack Checkout Flow:**
  - Build the frontend UI for selecting a plan and redirecting to the Paystack checkout page.
  - Create the backend API endpoint (`/api/checkout`) that generates the Paystack session.
- **Paystack Webhook Handler:**
  - Implement the webhook logic to securely handle subscription events from Paystack.
  - This webhook will be responsible for updating the user's `plan` and `subscription_status` in the Supabase `users` table.

### **3.2. Implement "Forgot Password" Flow**
- **Functionality:**
  - Create the `/auth/forgot-password` page and form.
  - Implement the Supabase logic to send a password reset email to the user.
  - Build the corresponding reset page where the user can enter and confirm their new password.

---

## **Phase 4: Polish, Security & Pre-Launch Readiness**

**Goal:** Address high-priority user experience issues, complete legal requirements, and perform final security checks before launch.

### **4.1. Improve Error Handling & User Feedback**
- **Actionable Messages:** Review and improve all error messages, especially for upload failures (CSV/PDF) and analysis errors. Messages should tell the user *what* went wrong and *how* to fix it.
- **Loading & Empty States:** Implement polished loading skeletons and helpful empty-state components across the dashboard, deductibles, and reports pages.

### **4.2. Complete Legal Pages**
- Create placeholder pages for **Terms of Service** and **Privacy Policy**. The content can be filled in later, but the pages and links must be functional.

### **4.3. Final Security & Deployment Review**
- **Environment Variables:** Double-check that all secrets (`SUPABASE_KEY`, `OPENAI_API_KEY`, `PAYSTACK_SECRET_KEY`, etc.) are managed via environment variables and are not exposed in the client-side code.
- **RLS Policy Review:** Conduct a final review of all Row Level Security policies to ensure no data can leak between tenants.
- **Vercel Configuration:** Ensure the `.vercelignore` file is correctly configured to prevent sensitive files from being included in the deployment.

---

This roadmap provides a clear, step-by-step path to making TaxWise a reliable, feature-complete, and commercially viable product.

**Please review this comprehensive plan. I will await your approval before beginning implementation with Phase 1.**
