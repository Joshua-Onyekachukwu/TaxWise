# Product Status Update: TaxWise

> **Last Updated:** February 10, 2026
> **Version:** 0.5.0 (MVP Pre-Alpha)
> **Status:** Foundation Built, Core Workflow Refinement Required

---

## 1. Product Overview
**TaxWise** is an AI-powered financial analysis platform designed to help users categorize transactions, identify tax deductibles, and generate financial reports.

*   **Core Value Proposition:** Simplify tax preparation by automating transaction analysis.
*   **Target Audience:** Freelancers, small business owners, and individuals needing tax organization.
*   **Primary Workflow:** `Upload Statements` -> `AI Analysis & Categorization` -> `Review Deductibles` -> `Generate Report`.

---

## 2. Current Status (As-Is)
The application infrastructure is deployed and functional, but the user journey is fragmented.

### ✅ Completed / Functional
*   **Infrastructure:** Next.js 14 App Router, Supabase (Auth + DB), Vercel Deployment.
*   **Authentication:** Google OAuth and Email/Password login flows are fully operational.
*   **Dashboard UI:** Modern, responsive dashboard with polished UI components (Tailwind + ShadCN).
*   **Upload Interface:** File drag-and-drop UI exists and uploads files to Supabase Storage.
*   **AI Chat (Beta):** "Financial Detective" persona implemented with RAG foundation (though currently deprioritized as a primary entry point).
*   **Billing Foundation:** Paystack integration structure exists (stubbed) with a dedicated Pricing page.

### ⚠️ Partial / Needs Work
*   **Data Ingestion Pipeline:** Users can upload files, but the *parsing* of those CSVs into the database is not fully connected to the UI feedback loop.
*   **Analysis Logic:** The "Analysis" page currently displays mock data instead of real data derived from the user's uploaded CSVs.
*   **Navigation Flow:** After uploading, the user is redirected to the file list rather than immediately seeing analysis results.

### ❌ Missing / Not Started
*   **Real-time CSV Parsing:** The server-side logic to map arbitrary CSV columns to our schema is basic.
*   **Deductible Rules Engine:** No logic exists yet to automatically flag transactions as "Deductible" based on keywords.
*   **Report Generation:** The "Download Report" buttons are placeholders.

---

## 3. What We Are Working On Next (Immediate Focus)
We are shifting focus from "adding features" to **"fixing the flow."**

1.  **Connecting Upload to Analysis:**
    *   Ensure that when a user uploads a file, it is immediately parsed.
    *   Redirect user directly to a "Review" or "Analysis" view populated with *their* data.
2.  **Data Visualization:**
    *   Replace hardcoded charts in the Dashboard with real aggregations from the `transactions` table.
3.  **Deprioritizing Chat:**
    *   Moving AI Chat to a supportive role (slide-over or dedicated "Ask AI" button) rather than the main focus.

---

## 4. What Is Missing / Needs Improvement

### Critical Gaps (Must Fix for MVP)
*   **Workflow Continuity:** The app feels like separate pages rather than a cohesive process.
*   **Empty States:** If a user logs in for the first time, the Dashboard looks broken (needs clear "Get Started" empty states).
*   **Transaction Editing:** Users cannot currently manually edit a transaction's category if the AI gets it wrong.

### UX Improvements
*   **Feedback Loops:** Better loading states during the "Analyzing..." phase of file upload.
*   **Mobile Responsiveness:** Tables on the "Deductibles" page need optimization for small screens.

---

## 5. Decisions & Assumptions

*   **Assumption:** Users will primarily upload CSV files (PDF bank statements are out of scope for MVP v1).
*   **Decision:** We will use **Supabase Edge Functions** (or Next.js API routes) for the heavy lifting of parsing CSVs to avoid timeout issues.
*   **Decision:** The "Chat" is a secondary tool for querying data *after* it has been processed, not the primary way to input data.
*   **Decision:** We are sticking with **Paystack** for billing, but enabling it only after the core value (Analysis) is proven to the user.

---

## 6. Risks & Open Questions

*   **Risk:** **CSV Variability.** different banks have drastically different CSV formats. We need a robust mapping step (e.g., "Which column is the Date?").
*   **Risk:** **AI Costs.** If we use LLMs for categorizing *every* single transaction row, costs will spike.
    *   *Mitigation:* Use keyword/regex rules for 80% of transactions and LLM only for ambiguous ones.
*   **Question:** Do we need a "Sandbox Mode" with demo data so new users can see the value before uploading their own sensitive financial files?

---

## 7. Next Milestones

| Milestone | Description | Target Status |
| :--- | :--- | :--- |
| **M1: The "Happy Path"** | Upload CSV -> Auto-Parse -> See Data in Table. | ⏳ Pending |
| **M2: The "Value Add"** | Auto-tag "Deductible" expenses + Dashboard Charts update. | 🔮 Planned |
| **M3: The "Deliverable"** | User can export a PDF summary of their deductibles. | 🔮 Planned |
| **M4: Monetization** | Gate the PDF export behind a Paystack payment. | 🔮 Planned |
