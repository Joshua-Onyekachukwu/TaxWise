"use client";

import React from "react";
import Image from "next/image";
import LoadingLink from "@/components/Layout/LoadingLink";

const Navbar: React.FC = () => {
  return (
    <div id="navbar" className="navbar-area credit-card-navbar bg-[#f3ede6] dark:bg-[#0a0e19] py-[20px] fixed top-0 left-0 right-0 z-[50] transition-all">
      <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <LoadingLink href="/" className="inline-block">
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={120}
              height={28}
              className="hidden lg:block"
            />
            <Image
              src="/images/logo-icon.svg"
              alt="logo"
              width={28}
              height={28}
              className="block lg:hidden"
            />
          </LoadingLink>

          {/* Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-[30px]">
            <LoadingLink href="#features" className="text-black dark:text-white hover:text-purple-600 font-medium">
              Features
            </LoadingLink>
            <LoadingLink href="#how-it-works" className="text-black dark:text-white hover:text-purple-600 font-medium">
                How it Works
              </LoadingLink>
              <LoadingLink href="#pricing" className="text-black dark:text-white hover:text-purple-600 font-medium">
                Pricing
              </LoadingLink>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-[15px]">
            <LoadingLink
              href="/auth/sign-in"
              className="hidden md:inline-block font-medium text-black dark:text-white hover:text-purple-600"
            >
              Sign In
            </LoadingLink>
            
            <LoadingLink
              href="/auth/sign-up"
              className="inline-block font-medium text-sm md:text-base rounded-[30px] bg-black text-white dark:bg-white dark:text-black py-[10px] px-[20px] transition-all hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white"
            >
              Get Started
            </LoadingLink>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Navbar;
