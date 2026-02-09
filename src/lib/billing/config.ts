// Billing configuration and Types

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number; // in kobo
  currency: string;
  features: string[];
  paystackPlanCode?: string; // e.g. PLN_xxxx
};

export const BILLING_PLANS: Record<string, SubscriptionPlan> = {
  FREE: {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    currency: 'NGN',
    features: [
      'Upload up to 3 CSVs/month',
      'Basic categorization',
      'Monthly Summary Report',
      'Standard Support'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro Freelancer',
    price: 500000, // 5,000 NGN
    currency: 'NGN',
    features: [
      'Unlimited CSV Uploads',
      'Advanced AI Categorization',
      'Full Tax Report (PDF/Excel)',
      'Deductible Optimization',
      'Priority Support',
      'AI Financial Detective'
    ],
    paystackPlanCode: 'PLN_PRO_TIER_01' 
  }
};

export const BILLING_CONFIG = {
  isEnabled: process.env.NEXT_PUBLIC_BILLING_ENABLED === 'true',
  paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
};
