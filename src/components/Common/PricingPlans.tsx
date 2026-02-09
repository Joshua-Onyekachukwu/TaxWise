"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// TypeScript interface for pricing plan
interface PricingPlan {
  id: number;
  tag: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  popular?: boolean; // To highlight a popular plan
}

interface PricingData {
  sectionTitle: {
    tag: string;
    title: string;
    description: string;
  };
  plans: PricingPlan[];
}

// Dynamic data configuration
const pricingData: PricingData = {
  sectionTitle: {
    tag: "Simple Pricing",
    title: "Choose the Plan That Fits You",
    description:
      "Whether you file once a year or track expenses monthly, we have a plan for you.",
  },
  plans: [
    {
      id: 1,
      tag: "Free",
      price: "₦0",
      period: "/forever",
      description: "Perfect for testing the waters.",
      features: [
        "1 CSV Upload per month",
        "Basic Income/Expense Summary",
        "In-app Analysis Dashboard",
        "No Downloads",
      ],
      buttonText: "Start for Free",
      buttonHref: "/auth/sign-up",
    },
    {
      id: 2,
      tag: "Pay-Per-Report",
      price: "₦5,000",
      period: "/report",
      description: "Ideal for yearly filers.",
      features: [
        "Everything in Free",
        "Unlimited Transactions for one upload",
        "AI Categorization & Deductibles",
        "Download PDF Tax Report",
        "Download Accountant CSV",
      ],
      buttonText: "Buy One Report",
      buttonHref: "/auth/sign-up",
      popular: true,
    },
    {
      id: 3,
      tag: "Pro Monthly",
      price: "₦3,500",
      period: "/month",
      description: "For continuous tracking.",
      features: [
        "Unlimited Uploads & Reports",
        "Priority AI Processing",
        "Monthly Tax Estimates",
        "Email Reminders",
        "Year-round Support",
      ],
      buttonText: "Go Pro",
      buttonHref: "/auth/sign-up",
    },
  ],
};

const PricingPlans: React.FC = () => {
  return (
    <>
      <div className="py-[70px] md:py-[90px] lg:py-[110px] xl:py-[130px] 2xl:py-[160px]">
        <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
          {/* Section Header */}
          <div className="mb-[30px] md:mb-[40px] lg:mb-[50px] xl:mb-[60px] 2xl:mb-[70px] text-center mx-auto md:max-w-[475px]">
            <span className="inline-block bg-[#f3ede6] dark:bg-[#0a0e19] text-purple-600 rounded-[30px] py-[6.5px] px-[18px] mb-[15px]">
              {pricingData.sectionTitle.tag}
            </span>
            <h2 className="!font-medium md:-tracking-[1px] !text-xl md:!text-2xl lg:!text-3xl xl:!text-5xl !leading-[1.2] !mb-[13px]">
              {pricingData.sectionTitle.title}
            </h2>
            <p className="md:text-[15px] lg:text-md">
              {pricingData.sectionTitle.description}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[25px]">
            {pricingData.plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-[15px] px-[20px] py-[30px] md:px-[30px] md:py-[40px] border border-gray-100 dark:border-[#172036] ${
                  plan.popular ? "bg-[#f3ede6] dark:bg-[#0a0e19]" : "bg-white dark:bg-dark"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`block font-medium md:text-md ${plan.popular ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    {plan.tag}
                  </span>
                  {plan.popular && (
                    <span className="inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="mt-[15px] md:mt-[20px] mb-[15px] md:mb-[25px]">
                  <h3 className="!font-medium !text-3xl md:!text-[32px] lg:!text-[36px] xl:!text-[40px] !mb-[0] !leading-[1]">
                    {plan.price}
                    <span className="text-lg md:text-xl text-gray-500 font-normal">
                      {plan.period}
                    </span>
                  </h3>
                </div>

                <p className="md:text-[15px] lg:text-md mb-[25px] md:mb-[35px]">
                  {plan.description}
                </p>

                <div className="mb-[25px] md:mb-[35px]">
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-[10px] mb-[12px] last:mb-0 md:text-[15px] lg:text-md text-black dark:text-white"
                    >
                      <div className="text-purple-500">
                        <i className="ri-check-line text-xl"></i>
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.buttonHref}
                  className={`block w-full text-center font-medium md:text-base rounded-[30px] py-[11.5px] md:py-[12.5px] lg:py-[13.5px] px-[22px] md:px-[25px] transition-all ${
                    plan.popular
                      ? "bg-purple-600 text-white hover:bg-purple-500"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-[#172036] dark:text-white dark:hover:bg-[#202b46]"
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPlans;
