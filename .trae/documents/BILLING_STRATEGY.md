# Billing Strategy

This document outlines the monetization and billing strategy for Taxwise.

## 1. Pricing Model
Taxwise will operate on a freemium model with the following tiers:

- **Free Tier**: Allows users to upload a limited number of files and view a summary of their financial data. Reports and exports will be disabled.
- **Pro Tier**: Offers unlimited file uploads, full access to analysis and reporting features, and the ability to download tax reports.

## 2. Payment Gateway
We will use Paystack as our primary payment gateway to handle subscriptions and one-time payments.

## 3. Implementation
- A `subscriptions` table will be added to the database to track user plans and billing cycles.
- A Paystack webhook will be implemented as a Supabase Edge Function to handle subscription events (e.g., creation, renewal, cancellation).
- The application will feature-gate access to Pro features based on the user's subscription status.
