# Taxwise Dashboard Development Plan

## 1. Objective
Create the secure, private dashboard area where users interact with the core features of Taxwise (Chat, Analysis, Reports).

## 2. Architecture
The dashboard will use a **Layout Shell** pattern:
- **Route**: `/dashboard` (and sub-routes like `/dashboard/chat`, `/dashboard/analysis`).
- **Layout Component**: A persistent `Sidebar` and `Header` wrapper.
- **Authentication**: All dashboard routes will be protected via Supabase Middleware.

## 3. Structure & Components

### A. App Shell (`src/components/Layout/DashboardLayout.tsx`)
*   **Sidebar**: Navigation menu.
    *   *Items*: Dashboard (Home), Chat (Tax Assistant), Uploads (History), Settings.
*   **TopHeader**: User profile dropdown, Theme toggle, Mobile menu trigger.
*   **Main Content Area**: Dynamic slot for page content.

### B. Dashboard Home (`src/app/dashboard/page.tsx`)
*   **Welcome Section**: "Good morning, [User]".
*   **Quick Actions**: "Upload New CSV", "Resume Chat".
*   **Recent Activity**: List of recent uploads or analysis sessions.
*   **Summary Cards**: "Total Deductions Found", "Pending Reviews".

### C. Chat Interface (`src/app/dashboard/chat/page.tsx`)
*   **Based on**: Trezo `Apps/Chat` template.
*   **Modifications**:
    *   **Sidebar**: List of "Tax Sessions" (e.g., "Jan 2024 Statement", "Q1 Expenses") instead of Users.
    *   **Message Area**: Chat bubbles for User and AI.
    *   **Input Area**: Text input + **File Upload Button** (Critical for CSVs).
    *   **Context Panel**: (Optional) Side panel showing current analysis stats while chatting.

### D. Analysis View (`src/app/dashboard/analysis/[id]/page.tsx`)
*   **Purpose**: Visual breakdown of a specific uploaded CSV.
*   **Components**:
    *   **Category Breakdown**: Pie/Donut chart (Trezo Charts).
    *   **Transaction Table**: List of parsed transactions with "Deductible" toggle.
    *   **Monthly Trend**: Bar chart of income vs. expenses.

## 4. Implementation Steps (Phased)

**Phase 1: Shell & Home (Immediate)**
1.  Create `src/components/Layout/Sidebar.tsx` (Adapted from Trezo).
2.  Create `src/components/Layout/TopHeader.tsx`.
3.  Create `src/app/dashboard/layout.tsx` to wrap the private routes.
4.  Create `src/app/dashboard/page.tsx` (Empty placeholder with "Welcome").
    *   *Fixes the 404 error immediately.*

**Phase 2: Chat UI**
1.  Port `Apps/Chat` components to `src/components/Dashboard/Chat/`.
2.  Wire up the layout to the Chat page.

**Phase 3: Middleware & Protection**
1.  Ensure `middleware.ts` redirects unauthenticated users to `/auth/sign-in`.

## 5. Timeline
*   **Step 1 (Shell + Home)**: ~1 hour. (Will resolve the 404).
*   **Step 2 (Chat UI)**: ~2 hours.
*   **Step 3 (Middleware)**: ~30 mins.

---
**Approval Needed**: Does this structure align with your expectations?
