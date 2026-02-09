"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface CtaData {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  image: {
    src: string;
    alt: string;
  };
}

const ctaData: CtaData = {
  title: "Ready to Tame Your Taxes?",
  description:
    "Join thousands of Nigerian freelancers and business owners who have switched to stress-free tax filing.",
  buttonText: "Get Started Now",
  buttonHref: "/auth/sign-up",
  image: {
    src: "/images/cta-shape.png",
    alt: "cta-shape",
  },
};

const Cta: React.FC = () => {
  return (
    <div className="pb-[70px] md:pb-[90px] lg:pb-[110px] xl:pb-[130px] 2xl:pb-[160px]">
      <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
        <div className="bg-purple-600 rounded-[15px] relative z-[1] px-[20px] md:px-[50px] lg:px-[80px] py-[40px] md:py-[60px] lg:py-[80px] overflow-hidden text-center">
          
          {/* Background Shape */}
          <div className="absolute top-0 right-0 -z-[1]">
            <Image
              src={ctaData.image.src}
              alt={ctaData.image.alt}
              width={262}
              height={276}
            />
          </div>

          {/* Content */}
          <div className="max-w-[630px] mx-auto">
            <h2 className="!font-medium !text-white md:-tracking-[1px] !text-2xl md:!text-3xl lg:!text-4xl xl:!text-5xl !leading-[1.2] !mb-[15px]">
              {ctaData.title}
            </h2>
            
            <p className="text-white/80 md:text-[15px] lg:text-lg mb-[25px] md:mb-[35px]">
              {ctaData.description}
            </p>

            <Link
              href={ctaData.buttonHref}
              className="inline-block font-medium md:text-base rounded-[30px] bg-white text-purple-600 py-[12px] md:py-[14px] px-[25px] md:px-[35px] transition-all hover:bg-gray-100 shadow-lg"
            >
              {ctaData.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cta;
