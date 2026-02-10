import { BILLING_PLANS } from "./config";

export const hasAccess = (userPlanId: string | null, featureKey: string): boolean => {
    const planId = userPlanId || 'free';
    const plan = Object.values(BILLING_PLANS).find(p => p.id === planId);
    
    if (!plan) return false;

    // Simple string match for MVP. In real app, use feature flags or enums.
    return plan.features.some(f => f.toLowerCase().includes(featureKey.toLowerCase()));
};

export const MAX_UPLOADS_FREE = 3;

export const canUpload = (userPlanId: string | null, currentUploadCount: number): boolean => {
    const planId = userPlanId || 'free';
    if (planId === 'pro') return true;
    return currentUploadCount < MAX_UPLOADS_FREE;
};
