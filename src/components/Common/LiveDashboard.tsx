"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// TypeScript interfaces for data structure
interface FeatureItem {
  icon: string;
  alt: string;
  text: string;
}

interface LiveDashboardData {
  tag: string;
  title: string;
  description: string;
  features: FeatureItem[];
  cta: {
    text: string;
    subtext: string;
    href: string;
  };
  image: {
    src: string;
    alt: string;
  };
}

// Dynamic data configuration
const liveDashboardData: LiveDashboardData = {
  tag: "Smart Analysis",
  title: "See Where Your Money Goes",
  description:
    "Upload your statement and get an instant visual breakdown of your income, expenses, and potential tax savings.",
  features: [
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      text: "Category-wise expense breakdown",
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      text: "Monthly cashflow trends",
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      text: "Top merchants and spending habits",
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      text: "Deductible expense tracking",
    },
  ],
  cta: {
    text: "Try It Now -",
    subtext: "Upload a CSV",
    href: "/auth/sign-up",
  },
  image: {
    src: "/images/live-dashboard.jpg",
    alt: "live-dashboard-image",
  },
};

const LiveDashboard: React.FC = () => {
  return (
    <>
      <div className="py-[70px] md:py-[90px] lg:py-[110px] xl:py-[130px] 2xl:py-[160px]">
        <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            {/* Content Section */}
            <div className="md:max-w-[520px]">
              <span className="inline-block bg-[#f3ede6] dark:bg-[#0a0e19] text-purple-600 rounded-[30px] py-[6.5px] px-[18px] mb-[15px]">
                {liveDashboardData.tag}
              </span>

              <h2 className="!font-medium md:-tracking-[1px] !text-xl md:!text-2xl lg:!text-3xl xl:!text-5xl !leading-[1.2] !mb-[13px] md:max-w-[415px]">
                {liveDashboardData.title}
              </h2>

              <p className="md:text-[15px] lg:text-md">
                {liveDashboardData.description}
              </p>

              {/* Features List */}
              <div className="mt-[20px] md:mt-[30px] xl:mt-[40px] mb-[25px] md:mb-[35px] xl:mb-[45px]">
                {liveDashboardData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="mb-[12px] md:mb-[17px] lg:mb-[23px] last:mb-0 flex items-center font-medium text-black dark:text-white text-[14px] md:text-md lg:text-lg gap-[12px] md:gap-[20px]"
                  >
                    <Image
                      src={feature.icon}
                      alt={feature.alt}
                      width={26}
                      height={26}
                    />
                    {feature.text}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href={liveDashboardData.cta.href}
                className="inline-block font-medium md:text-base rounded-[30px] bg-purple-600 text-white py-[11.5px] md:py-[12.5px] lg:py-[13.5px] px-[22px] md:px-[25px] transition-all hover:bg-purple-500 hover:text-white"
              >
                {liveDashboardData.cta.text}{" "}
                <span className="font-normal">
                  {liveDashboardData.cta.subtext}
                </span>
              </Link>
            </div>

            {/* Image Section */}
            <div className="text-center">
              <Image
                src={liveDashboardData.image.src}
                className="inline-block rounded-[15px]"
                alt={liveDashboardData.image.alt}
                width={945}
                height={970}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveDashboard;
