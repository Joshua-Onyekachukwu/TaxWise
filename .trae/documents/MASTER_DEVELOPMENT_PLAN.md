# Taxwise Master Development Plan

## 1. Executive Summary
**Current Status**: Alpha Prototype.
- **Completed**: Core backend schema, Auth, CSV parsing, basic Uploads UI.
- **Missing/Mocked**: Main Dashboard (currently fake data), End-to-End Analysis Pipeline (sync timeout risks), Rules Management UI, Report Generation (PDF/CSV), and real-time data wiring.
- **Goal**: Transition from "Static Prototype" to "Functional MVP" suitable for Beta users in Nigeria.

---

## Phase 1: Stabilize Core Functionality & Performance (Critical Priority)

**Goal:** Fix the most severe issues blocking the core user workflow and causing system instability.

### **Task 1.1: Isolate Parsing Logic into a Supabase Edge Function**

*   **Problem:** The current Next.js API route (`/api/upload`) has a fundamental conflict with the `pdf-parse` library, caused by the Next.js bundler (`Turbopack`). This completely blocks PDF uploads.
*   **Solution:** Move all file parsing logic to a dedicated Supabase Edge Function. This provides an isolated Deno environment, resolving the bundler conflict and making the parsing process more robust and scalable.
*   **Implementation Steps:**
    1.  Create a new Supabase Edge Function named `upload-statement`.
    2.  Migrate the complete parsing logic for both CSV and PDF files from the existing Next.js API route to the new Edge Function.
    3.  Adapt the code for the Deno runtime, ensuring all dependencies are Deno-compatible (using URL imports like `esm.sh`).
    4.  Refactor the frontend upload component (`src/app/dashboard/uploads/create/page.tsx`) to call this new Edge Function directly using `supabase.functions.invoke()`. This is more secure and handles authentication seamlessly.
    5.  Delete the old, problematic Next.js API route (`src/app/api/upload/route.ts`) and any related files.

### **Task 1.2: Refactor Dashboard to Use Pre-Computed Summaries**

*   **Problem:** The dashboard calculates all financial statistics on every page load by querying the entire `transactions` table. This is highly inefficient and will cause major performance degradation and timeouts as data volume grows.
*   **Solution:** The dashboard MUST be refactored to fetch its data from the `upload_summaries` table, which is designed to hold pre-computed totals.
*   **Implementation Steps:**
    1.  Modify the `AnalysisEngine` so that upon successful completion of a file analysis, it calculates all necessary summary statistics (total income, expenses, etc.) and populates the `upload_summaries` table.
    2.  Update all dashboard components to source their data exclusively from the `upload_summaries` table, filtered by the relevant `upload_id` or `user_id`.
    3.  Remove any direct, heavy queries from the dashboard components to the raw `transactions` table.

---

## Phase 2: Implement Missing Core Features

**Goal:** Build out the essential, user-facing features that are currently placeholders, completing the core value proposition of the product.

### **Task 2.1: Implement "Forgot Password" Functionality**

*   **Problem:** A standard and critical user account management feature is completely missing.
*   **Solution:** Implement the password reset flow using Supabase's built-in authentication methods.
*   **Implementation Steps:**
    1.  Create a new page at `/forgot-password`.
    2.  Add a form that allows a user to enter their email address.
    3.  Use the `supabase.auth.resetPasswordForEmail()` method to send a password reset link to the user.
    4.  Create a corresponding page at `/update-password` that handles the token from the email link and allows the user to set a new password.

### **Task 2.2: Build Out "Deductibles" and "Reports" Pages**

*   **Problem:** Two of the main product features are currently non-functional placeholder pages.
*   **Solution:** Implement the UI and backend logic for both pages.
*   **Implementation Steps:**
    1.  **Deductibles Page:**
        *   Create a UI to display a list of all transactions where the `deductible` flag is true.
        *   Allow users to filter this list by date range and category.
        *   Provide a summary of the total deductible amount.
    2.  **Reports Page:**
        *   Design a user interface that allows users to configure and generate reports.
        *   Implement the backend logic to generate a comprehensive financial report (in CSV or PDF format) based on the user's transaction data.
        *   Ensure reports include summaries of income, expenses, and deductible amounts.

---

## Phase 3: Enhance Data Integrity & User Experience

**Goal:** Improve the reliability of the data and make the application more intuitive and user-friendly.

### **Task 3.1: Implement Robust Transaction Deduplication**

*   **Problem:** The current system has an incomplete implementation for preventing duplicate transactions, which will lead to inaccurate financial analysis.
*   **Solution:** Finalize and enforce the transaction `fingerprint` logic.
*   **Implementation Steps:**
    1.  Refine the `fingerprint` generation algorithm to ensure it creates a reliable and unique identifier for each transaction (e.g., a hash of date, amount, merchant, and description).
    2.  Within the `upload-statement` Edge Function, before inserting new transactions, perform a query to fetch all existing fingerprints for that user.
    3.  Filter out any incoming transactions whose fingerprints already exist in the database, ensuring only new, unique transactions are inserted.

### **Task 3.2: Improve System-Wide Error Handling**

*   **Problem:** Error messages are generic and unhelpful, leading to a poor user experience.
*   **Solution:** Implement specific, actionable error feedback throughout the application.
*   **Implementation Steps:**
    1.  In the frontend, catch errors from the Edge Function and display user-friendly messages (e.g., "Invalid PDF format, please try a different file" instead of a generic "Upload failed").
    2.  Improve the UI to show clear loading states during analysis and empty states when no data is available.

---

## Phase 4: Prepare for Monetization

**Goal:** Implement the necessary infrastructure to support paid subscriptions.

### **Task 4.1: Implement Full Billing & Subscription Workflow**

*   **Problem:** The entire billing system is a non-functional placeholder.
*   **Solution:** Build out the complete subscription management flow using Paystack.
*   **Implementation Steps:**
    1.  Replace the mock checkout API with a real implementation that uses the Paystack API to create payment links or checkout sessions.
    2.  Implement a secure Paystack webhook (as a Supabase Edge Function) to listen for and handle subscription events (e.g., `subscription.create`, `invoice.payment_failed`).
    3.  Create a `subscriptions` table in the database to track each user's plan, status (active, canceled), and current billing period.
    4.  Implement application-level logic to restrict access to premium features based on the user's subscription status stored in the database.
