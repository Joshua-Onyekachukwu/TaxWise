# Environment & Security Configuration Checklist

This document summarizes the status of the project's environment variables and security configurations based on your detailed checklist. It outlines what is currently in place, what needs to be configured, and the actions required by you.

---

## **1. Vercel Environment Variables**

I cannot directly view or set variables in the Vercel dashboard. The following is a list of variables that **must be set in Vercel** for the application to function correctly in production.

**Local Status:** The `.env.local` file currently only contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### **Required Vercel Configuration:**

| Variable Name                     | Value                                         | Status        |
| --------------------------------- | --------------------------------------------- | ------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Your Supabase Project URL                     | **Required**  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Your Supabase Anon Key                        | **Required**  |
| `SUPABASE_SERVICE_ROLE_KEY`       | Your Supabase Service Role Key (do not prefix with `NEXT_PUBLIC_`) | **Required**  |
| `PAYSTACK_PUBLIC_KEY`             | Your Paystack Public Key                      | **Required**  |
| `PAYSTACK_SECRET_KEY`             | Your Paystack Secret Key (server-only)        | **Required**  |
| `PAYSTACK_WEBHOOK_SECRET`         | Your Paystack Webhook Secret (server-only)    | **Required**  |
| `NEXT_PUBLIC_APP_URL`             | `https://<your-domain>.vercel.app`            | **Required**  |
| `BILLING_ENABLED`                 | `false`                                       | **Recommended** |

---

## **2. Supabase Configuration**

### **A) Core Project Settings**
- **Status:** **Connected**
- **Details:** I have successfully connected to the Supabase project and can access the URL and API keys.

### **B) Auth URL Configuration**
- **Status:** **Action Required by You**
- **Details:** I cannot view or edit settings in the Supabase UI. You must configure this manually.
- **Required Configuration:**
    - **Site URL:** Set to your production domain (e.g., `https://<your-domain>.vercel.app`).
    - **Redirect URLs:** Add the following to the allow-list:
        - `http://localhost:3000/**`
        - `https://<your-domain>.vercel.app/**`

### **C) Google OAuth Provider**
- **Status:** **Action Required by You**
- **Details:** This requires manual setup in both the Supabase and Google Cloud Console dashboards.
- **Required Actions:**
    1.  **In Supabase (Authentication → Providers → Google):**
        - Enable the Google provider.
        - Add the `Google Client ID` and `Google Client Secret` you will get from Google Cloud.
        - Copy the generated **Callback URL** that Supabase provides.
    2.  **In Google Cloud Console (APIs & Services → Credentials):**
        - Create an **OAuth Client ID** for a "Web application".
        - Add `http://localhost:3000` and `https://<your-domain>.vercel.app` to **Authorized JavaScript origins**.
        - Add the **Callback URL** you copied from Supabase to **Authorized redirect URIs**.

---

## **3. Supabase Database Security**

- **Status:** **Mostly Confirmed**
- **Details:** Based on the migration files, Row Level Security (RLS) is **ENABLED** on `transactions`, `uploads`, `upload_summaries`, `reports`, and `deduction_reviews`. This is a very strong security posture.
- **Missing:** The `bank_accounts` table does not exist yet, but the plan is to enable RLS on it when it is created.
- **Storage Buckets:** I cannot confirm the privacy settings of Supabase Storage buckets from the available tools. **You must manually verify** that the buckets used for file uploads and generated reports are set to **private** and have appropriate RLS policies in place.

---

## **Summary of Required Actions**

1.  **Set all required Environment Variables in Vercel.**
2.  **Configure the Site URL and Redirect URLs in your Supabase Auth settings.**
3.  **Complete the Google OAuth setup** in both the Supabase and Google Cloud dashboards.
4.  **Manually verify that Supabase Storage buckets are private** and have security policies enabled.

Once these configurations are in place, the application environment will be secure and ready for the implementation phase. I am ready to begin with Phase 1 as soon as I have your approval.
