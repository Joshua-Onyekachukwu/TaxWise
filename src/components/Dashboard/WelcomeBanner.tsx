"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AccountFilter from "@/components/Dashboard/AccountFilter";

const WelcomeBanner: React.FC = () => {
  const [userName, setUserName] = useState<string>("Taxwise User");
  const [hasData, setHasData] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserAndData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          // Extract name
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
          setUserName(name);

          // Check if user has any uploads or transactions
          const { count } = await supabase
            .from("uploads")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id);
          
          setHasData(count !== null && count > 0);
      }
      setLoading(false);
    };
    fetchUserAndData();
  }, []);

  if (loading) return null; // Or skeleton

  // If user has data, we might want a different banner or just skip the "Upload First" CTA
  // Requirement: "Welcome / Upload First Statement" ONLY for brand-new users.
  // Returning users: show actual dashboard data (which is handled by Dashboard page structure),
  // BUT the banner itself should probably be less "onboarding" focused.
  
  if (hasData) {
      // Returning User Banner - Less prominent, focus on insights
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
                <Link
                    href="/dashboard/uploads/create"
                    className="inline-flex justify-center items-center gap-[8px] bg-primary-600 text-white py-[10px] px-[20px] rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm"
                >
                    <i className="material-symbols-outlined !text-[20px]">add</i>
                    Upload New
                </Link>
            </div>
        </div>
      );
  }

  // New User Banner (Original)
  return (
    <div
      className="mb-[30px] p-[20px] md:p-[30px] rounded-2xl relative overflow-hidden shadow-sm border border-indigo-100 dark:border-indigo-900"
      style={{
        background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-[1] flex flex-col md:flex-row items-start md:items-end justify-between gap-[20px]">
        
        {/* Left: Greeting & Context */}
        <div className="max-w-[600px]">
          <span className="inline-block py-[4px] px-[12px] bg-white/10 rounded-full text-white/90 text-xs font-medium mb-[10px] border border-white/10 backdrop-blur-md">
            Get Started
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold !text-white mb-[10px] leading-tight capitalize">
            Welcome to Taxwise, <span className="!text-indigo-200">{userName}</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Upload your first bank statement to unlock powerful tax insights and find deductible expenses automatically.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row gap-[12px] w-full md:w-auto">
          <Link
            href="/dashboard/uploads/new"
            className="inline-flex justify-center items-center gap-[8px] bg-white text-indigo-900 py-[12px] px-[24px] rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all shadow-md active:scale-95 animate-pulse-subtle"
          >
            <i className="material-symbols-outlined !text-[20px]">upload_file</i>
            Upload First Statement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
