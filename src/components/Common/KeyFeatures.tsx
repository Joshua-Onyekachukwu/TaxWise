"use client";

import React from "react";
import Image from "next/image";

// TypeScript interfaces for data structure
interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: {
    src: string;
    alt: string;
  };
  backgroundImage: {
    src: string;
    alt: string;
  };
  offset?: boolean; // For cards that need vertical offset
  gradient: string;
}

interface KeyFeaturesData {
  sectionTitle: {
    tag: string;
    title: string;
    description: string;
  };
  features: FeatureCard[];
}

// Dynamic data configuration
const keyFeaturesData: KeyFeaturesData = {
  sectionTitle: {
    tag: "Key Features",
    title: "Everything You Need for Tax Season",
    description:
      "Taxwise combines automated analysis with expert tax logic to make compliance simple, fast, and accurate.",
  },
  features: [
    {
      id: 1,
      title: "Upload & Analyze",
      description:
        "Simply upload your bank statement CSV. We handle the messy formatting and cleaning automatically.",
      icon: {
        src: "/images/icons/card.svg",
        alt: "upload",
      },
      backgroundImage: {
        src: "/images/icons/cash-back.png",
        alt: "upload-bg",
      },
      offset: true,
      gradient: "linear-gradient(180deg, #BF85FB 0%, #9135E8 100%)",
    },
    {
      id: 2,
      title: "Smart Categorization",
      description:
        "Our system automatically categorizes transactions into income and expenses based on Nigerian tax contexts.",
      icon: {
        src: "/images/icons/travel-agency.svg",
        alt: "analysis",
      },
      backgroundImage: {
        src: "/images/icons/plane.png",
        alt: "analysis-bg",
      },
      gradient: "linear-gradient(180deg, #BF85FB 0%, #9135E8 100%)",
    },
    {
      id: 3,
      title: "Maximize Deductions",
      description:
        "Automatically flag potential tax-deductible expenses like internet, transport, and utilities to save you money.",
      icon: {
        src: "/images/icons/expensive.svg",
        alt: "deductibles",
      },
      backgroundImage: {
        src: "/images/icons/salary.png",
        alt: "deductibles-bg",
      },
      offset: true,
      gradient: "linear-gradient(180deg, #BF85FB 0%, #9135E8 100%)",
    },
    {
      id: 4,
      title: "Audit-Ready Reports",
      description:
        "Generate professional PDF and CSV reports summarizing your financial year for tax filing.",
      icon: {
        src: "/images/icons/fraud-alert.svg",
        alt: "reports",
      },
      backgroundImage: {
        src: "/images/icons/danger.png",
        alt: "reports-bg",
      },
      gradient: "linear-gradient(180deg, #BF85FB 0%, #9135E8 100%)",
    },
  ],
};

const KeyFeatures: React.FC = () => {
  return (
    <>
      <div className="bg-[#f3ede6] dark:bg-[#0a0e19] py-[70px] md:py-[90px] lg:py-[110px] xl:py-[130px] 2xl:py-[160px]">
        <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
          {/* Section Header */}
          <div className="mb-[30px] md:mb-[40px] lg:mb-[50px] xl:mb-[60px] 2xl:mb-[70px] text-center mx-auto md:max-w-[475px]">
            <span className="inline-block bg-white dark:bg-dark text-purple-600 rounded-[30px] py-[6.5px] px-[18px] mb-[15px]">
              {keyFeaturesData.sectionTitle.tag}
            </span>
            <h2 className="!font-medium md:-tracking-[1px] !text-xl md:!text-2xl lg:!text-3xl xl:!text-5xl !leading-[1.2] !mb-[13px]">
              {keyFeaturesData.sectionTitle.title}
            </h2>
            <p className="md:text-[15px] lg:text-md">
              {keyFeaturesData.sectionTitle.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[25px]">
            {keyFeaturesData.features.map((feature) => (
              <div
                key={feature.id}
                className={feature.offset ? "lg:mt-[50px]" : ""}
              >
                <div className="bg-white dark:bg-dark relative z-[1] rounded-[15px] px-[20px] py-[25px] md:px-[30px] md:py-[35px] xl:px-[40px] xl:py-[45px]">
                  {/* Background Image */}
                  <div className="absolute top-0 ltr:right-0 rtl:left-0 -z-[1] rtl:-scale-x-110 dark:opacity-20">
                    <Image
                      src={feature.backgroundImage.src}
                      alt={feature.backgroundImage.alt}
                      width={196}
                      height={202}
                      style={{
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>

                  {/* Icon with Gradient Background */}
                  <div
                    className="rounded-[4px] w-[64px] h-[64px] flex items-center justify-center mb-[25px] md:mb-[40px] lg:mb-[110px]"
                    style={{
                      background: feature.gradient,
                    }}
                  >
                    <Image
                      src={feature.icon.src}
                      alt={feature.icon.alt}
                      width={40}
                      height={40}
                    />
                  </div>

                  {/* Feature Content */}
                  <h3 className="!font-medium !text-lg md:!text-[20px] lg:!text-[22px] xl:!text-xl !mb-[12px] md:!mb-[18px]">
                    {feature.title}
                  </h3>
                  <p className="md:text-[15px] lg:text-md">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyFeatures;
