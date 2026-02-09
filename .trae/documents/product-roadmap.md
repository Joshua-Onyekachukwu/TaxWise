# Taxwise — Development Roadmap (MVP + Analysis)

## Phase 1: Foundation & Upload Pipeline (Weeks 1-2)
**Goal**: User can sign up, upload a CSV, and see parsed data.

### 1.1 Project Setup
- [ ] Initialize Next.js 14 (App Router) + Tailwind + Shadcn/UI.
- [ ] Setup Supabase project (Auth + Database + Storage).
- [ ] Implement RLS policies for all tables (including new summaries tables).

### 1.2 Chat UI Skeleton
- [ ] Create `ChatInterface` component.
- [ ] Implement file upload UI within chat.
- [ ] Handle file upload to Supabase Storage.

### 1.3 CSV Parsing Engine
- [ ] Build `CsvAdapter` interface.
- [ ] Implement `GenericAdapter` with fuzzy header matching.
- [ ] Create API route to parse CSV and store in `transactions` table.
- [ ] Handle "Ambiguous Columns" flow (Ask user to map columns).

## Phase 2: Categorization & Intelligence (Weeks 3-4)
**Goal**: Transactions are categorized automatically or via AI.

### 2.1 Rules Engine
- [ ] Implement basic string matching rules.
- [ ] specific "Nigeria Default" categories seed.

### 2.2 AI Integration
- [ ] Setup OpenAI API wrapper (Server-side).
- [ ] Build categorization prompt with Zod schema validation.
- [ ] Implement "Bulk Review" UI for AI suggestions.

### 2.3 Deduction Logic
- [ ] Add logic to flag "likely deductible" items.
- [ ] Implement chat flow for deduction clarification.

## Phase 3: Analysis & Reports (Weeks 5-6)
**Goal**: User sees interactive insights and gets value (Tax Estimate + PDF/CSV Download).

### 3.1 Analysis Engine
- [ ] Build `AnalysisService` to compute stats from transactions.
- [ ] Store results in `upload_summaries`.
- [ ] Build "Analysis Dashboard" UI (Charts, Tables).

### 3.2 Tax Engine (MVP)
- [ ] Implement `TaxEstimator` interface.
- [ ] Create `NigeriaBasicEstimator` (Range-based).
- [ ] Build "Tax Summary" card in chat.

### 3.3 Reporting
- [ ] Generate PDF Report (React-PDF or similar).
- [ ] Generate "Accountant Pack" CSV (Clean ledger).
- [ ] Add download actions to Chat and Exports page.

## Phase 4: Polish & Launch (Week 7)
- [ ] Landing page & Pricing/Billing integration.
- [ ] Mobile responsiveness check.
- [ ] Security audit (RLS, Input validation).
- [ ] Launch!
