### **Executive Summary**

This document outlines a strategic approach to monetize the TaxWise application. The strategy is designed to be implemented in phases, starting with a free model to encourage user adoption and gather feedback, and gradually transitioning to a paid model. This phased approach allows for flexibility and minimizes risk while maximizing the potential for revenue generation.

The proposed solution includes a hybrid pricing model tailored for the Nigerian market, clear feature tiers, and a detailed technical implementation plan for the required database, backend, and frontend changes. It also addresses key business and compliance considerations, such as payment gateway integration and dispute handling.

---

### **1. Phased Monetization Strategy**

The transition from a free to a paid service will be managed through a three-phase plan:

#### **Phase 1: Open/Free Testing (Current State)**

- **Objective:** Maximize user adoption, gather feedback, and identify power users.
- **Strategy:** The application will be free to use with all features unlocked. A "free pass" system will be implemented in the backend to grant users a default free plan. This can be easily deactivated later.
- **Implementation:**
    - A `current_plan` field will be added to the `users` table, defaulting to a "free" plan.
    - All feature gates will be disabled, allowing unrestricted access.

#### **Phase 2: Soft Monetization**

- **Objective:** Introduce paid plans and test pricing models with a small subset of users.
- **Strategy:** Introduce "Pro" and "Business" plans with premium features. The free plan will have limitations on features like the number of reports and uploads.
- **Implementation:**
    - Activate the feature gates.
    - Introduce a billing page where users can upgrade their plans.
    - Use feature flags to roll out paid plans to a select group of users.

#### **Phase 3: Full Monetization**

- **Objective:** Roll out the paid plans to all users and optimize for revenue.
- **Strategy:** The "free pass" system is deactivated for new users. All users will be required to choose a plan upon registration.
- **Implementation:**
    - The default "free" plan will have stricter limitations.
    - Marketing campaigns will be launched to encourage users to upgrade to paid plans.

---

### **2. Pricing and Value Structure**

The following pricing model is proposed for the Nigerian market:

| Feature/Limit          | Free Plan                    | Pro Plan (₦5,000/month)      | Business Plan (₦15,000/month) |
| ---------------------- | ---------------------------- | ---------------------------- | ----------------------------- |
| **Tax Reports**        | 3 per month                  | Unlimited                    | Unlimited                     |
| **Document Uploads**   | 10 per month                 | Unlimited                    | Unlimited                     |
| **Team Members**       | 1                            | 5                            | Unlimited                     |
| **Support**            | Community                    | Email                        | Priority Phone & Email        |
| **"Free Pass" System** | Active during Phase 1 & 2    | N/A                          | N/A                           |

---

### **3. Required Codebase Changes**

#### **Database**

The following tables will be added to the database to manage plans and subscriptions.

**`plans` table:**

```sql
CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly INT,
  price_yearly INT,
  features JSONB
);
```

**`subscriptions` table:**

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  plan_id uuid REFERENCES plans(id),
  status TEXT, -- e.g., 'active', 'cancelled', 'past_due'
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  paystack_subscription_id TEXT
);
```

**`users` table modification:**

The `users` table should be updated to include a `current_plan_id`.

```sql
ALTER TABLE users
ADD COLUMN current_plan_id uuid REFERENCES plans(id);
```

#### **Backend**

- **BillingService:** A new service will be created to handle all billing-related logic, including creating and managing subscriptions, handling webhooks from Paystack, and applying plan limits.
- **Feature Gating:** A middleware will be implemented to check a user's plan and restrict access to features based on their subscription status.
- **Webhooks:** The backend will need to handle webhooks from Paystack for events like `subscription.create`, `invoice.payment_failed`, and `charge.success`.

#### **Frontend**

- **Billing Page:** A new page will be created at `/dashboard/billing` to allow users to manage their subscription. This page will display the user's current plan, available plans, and a button to upgrade or cancel.
- **Upgrade Prompts:** UI components will be added throughout the application to prompt users to upgrade when they hit a feature limit.
- **Gated Feature States:** The UI will be updated to show a "locked" state for features that are not included in the user's current plan.

#### **Environment Configuration**

The following environment variables will be required:

```
PAYSTACK_SECRET_KEY=...
PAYSTACK_PUBLIC_KEY=...
PAYSTACK_WEBHOOK_SECRET=...
```

---

### **5. Business and Compliance**

- **Paystack Upgrade:** To process recurring payments, the Paystack account must be upgraded to a "Registered Business" account, which requires CAC (Corporate Affairs Commission) registration documents.
- **Refunds and Disputes:** A clear policy for handling refunds and disputes must be established. Paystack provides a resolution console for managing disputes.
- **Revenue Tracking:** The backend should log all successful payments. This data can be used to generate revenue reports and track key business metrics.

---

### **5. Recommended Implementation Timeline**

- **Phase 1 (1-2 months):** Implement the "free pass" system and gather user feedback.
- **Phase 2 (2-3 months):** Develop the billing system and soft-launch the paid plans to a small group of users.
- **Phase 3 (Ongoing):** Roll out the paid plans to all users and continuously optimize the pricing and features based on user feedback and market response.