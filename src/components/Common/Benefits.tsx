"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// TypeScript interface for data structure
interface BenefitItem {
  icon: string;
  alt: string;
  text: string;
}

interface BenefitsData {
  tag: string;
  title: string;
  description: string;
  features: BenefitItem[];
  buttonText: string;
  buttonSubtext: string;
  buttonHref: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}

// Dynamic data configuration
const benefitsData: BenefitsData = {
  tag: "Why Taxwise?",
  title: "Tax Compliance Without the Headache",
  description: "Stop worrying about deadlines and deductions. Taxwise handles the heavy lifting so you can focus on your business.",
  features: [
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      text: "Automatic categorization of bank transactions"
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      text: "Smart detection of deductible expenses"
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      text: "Audit-ready PDF & CSV reports"
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      text: "Localized for Nigerian tax laws (and growing)"
    }
  ],
  buttonText: "Start Free -",
  buttonSubtext: "No card required",
  buttonHref: "/auth/sign-up",
  image: {
    src: "/images/happy-girl.png",
    alt: "happy-girl-image",
    width: 884,
    height: 1100
  }
};

const Benefits: React.FC = () => {
  return (
    <div className="pt-[70px] md:pt-[90px] lg:pt-[110px] xl:pt-[130px] 2xl:pt-[160px]">
      <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
          {/* Image Section */}
          <div className="text-center xl:max-w-[589px]">
            <Image
              src={benefitsData.image.src}
              className="inline-block"
              alt={benefitsData.image.alt}
              width={benefitsData.image.width}
              height={benefitsData.image.height}
            />
          </div>

          {/* Content Section */}
          <div className="ltr:xl:pl-[50px] rtl:xl:pr-[50px]">
            <span className="inline-block bg-[#f3ede6] dark:bg-[#0a0e19] text-purple-600 rounded-[30px] py-[6.5px] px-[18px] mb-[15px]">
              {benefitsData.tag}
            </span>
            
            <h2 className="!font-medium md:-tracking-[1px] !text-xl md:!text-2xl lg:!text-3xl xl:!text-5xl !leading-[1.2] !mb-[13px] md:max-w-[415px]">
              {benefitsData.title}
            </h2>
            
            <p className="md:text-[15px] lg:text-md md:max-w-[520px]">
              {benefitsData.description}
            </p>

            {/* Features List */}
            <div className="mt-[20px] md:mt-[30px] xl:mt-[40px] mb-[25px] md:mb-[35px] xl:mb-[45px]">
              {benefitsData.features.map((feature, index) => (
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
              href={benefitsData.buttonHref}
              className="inline-block font-medium md:text-base rounded-[30px] bg-purple-600 text-white py-[11.5px] md:py-[12.5px] lg:py-[13.5px] px-[22px] md:px-[25px] transition-all hover:bg-purple-500 hover:text-white"
            >
              {benefitsData.buttonText} <span className="font-normal">{benefitsData.buttonSubtext}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Benefits;
