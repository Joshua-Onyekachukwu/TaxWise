"use client";

import { Skeleton } from '@/components/Layout/Skeleton';
import React, { useEffect, useState } from "react";
import LoadingLink from "@/components/Layout/LoadingLink";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AccountFilter from "@/components/Dashboard/AccountFilter";
import { StatementUploader } from "./StatementUploader";

// Onboarding form, rendered conditionally
import { z } from "zod";
import { OnboardingSchema } from "@/lib/schemas";

const OnboardingForm = ({ user, onComplete }: { user: any; onComplete: () => void }) => {
  const supabase = createClient();
  const [userType, setUserType] = useState('freelancer');
  const [currency, setCurrency] = useState('NGN');
  const [taxYearStart, setTaxYearStart] = useState('2024-01-01');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = OnboardingSchema.safeParse({ user_type: userType, currency_code: currency, tax_year_start: taxYearStart });

    if (!result.success) {
      setErrors(result.error.flatten());
      return;
    }

    setErrors(null);
    setIsSubmitting(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        user_type: userType,
        currency_code: currency,
        tax_year_start: taxYearStart,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      // You could add a user-facing error message here
    } else {
      onComplete(); // Trigger the parent component to re-render
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-[600px]">
        <h1 className="text-2xl md:text-3xl font-bold !text-white mb-[10px] leading-tight">
            Welcome! Let\'s set up your account.
        </h1>
        <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6">
            A few details are needed to tailor Taxwise for you.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="userType" className="block text-sm font-medium text-white/90">I am a...</label>
                <select id="userType" value={userType} onChange={(e) => setUserType(e.target.value)} className="block w-full px-3 py-2 mt-1 bg-white/10 border border-white/20 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="individual">Individual</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="business">Small Business</option>
                </select>
                {errors?.fieldErrors.user_type && <p className="text-red-400 text-sm mt-1">{errors.fieldErrors.user_type[0]}</p>}
            </div>
            <div>
                <label htmlFor="currency" className="block text-sm font-medium text-white/90">My primary currency is...</label>
                <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="block w-full px-3 py-2 mt-1 bg-white/10 border border-white/20 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="NGN">Nigerian Naira (NGN)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="GBP">British Pound (GBP)</option>
                </select>
                {errors?.fieldErrors.currency_code && <p className="text-red-400 text-sm mt-1">{errors.fieldErrors.currency_code[0]}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 text-indigo-900 bg-white rounded-md font-bold hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </button>
        </form>
    </div>
  );
};


const WelcomeBanner: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const fetchUserAndData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
          setUser(user);

          // Fetch profile to check for onboarding status
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('user_id', user.id)
            .single();
          
          setProfile(profileData);
          
          // Only check for uploads if onboarding is complete
          if (profileData?.user_type) {
            const { count } = await supabase
              .from("uploads")
              .select("*", { count: 'exact', head: true })
              .eq("user_id", user.id);
            setHasData(count !== null && count > 0);
          }
      }
      setLoading(false);
  };

  useEffect(() => {
    fetchUserAndData();
  }, []);

  const needsOnboarding = !profile?.user_type;

  

  if (loading) {
      return (
        <div className="mb-[30px] p-[30px] rounded-2xl bg-gray-800">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      );
  }

// ... (rest of the file)

  // State 1: Onboarding needed
  if (needsOnboarding) {
    return (
        <div
            className="mb-[30px] p-[20px] md:p-[30px] rounded-2xl relative overflow-hidden shadow-sm border border-indigo-100 dark:border-indigo-900"
            style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)" }}
        >
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-[1] flex items-center justify-center">
                <OnboardingForm user={user} onComplete={fetchUserAndData} />
            </div>
        </div>
    );
  }

  // State 2: Onboarding complete, but no data uploaded yet
  if (!hasData) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
      return (
        <div
          className="mb-[30px] p-[20px] md:p-[30px] rounded-2xl relative overflow-hidden shadow-sm border border-indigo-100 dark:border-indigo-900"
          style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)" }}
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-[1] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold !text-white mb-[10px] leading-tight capitalize">
                    Welcome back, <span className="!text-indigo-200">{userName}</span>
                </h1>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    Ready to get your taxes sorted? Let's start by uploading your latest bank statements.
                </p>
            </div>
            <div className="lg:col-span-1">
                <StatementUploader />
            </div>
          </div>
        </div>
      );
  }

  // State 3: Returning user with data
  return (
    <div className="mb-[30px] flex flex-col md:flex-row items-center justify-between gap-[20px]">
        <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
                Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
                Overview of your financial performance and tax liability.
            </p>
        </div>
        <div className="flex gap-[10px] items-center">
            <AccountFilter />
            <LoadingLink
                href="/dashboard/uploads/create"
                className="inline-flex justify-center items-center gap-[8px] bg-primary-600 text-white py-[10px] px-[20px] rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm"
            >
                <i className="material-symbols-outlined !text-[20px]">add</i>
                Upload New
            </LoadingLink>
        </div>
    </div>
  );
};

export default WelcomeBanner;
