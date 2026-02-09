"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// TypeScript interfaces for data structure
interface UserType {
  icon: string;
  alt: string;
  title: string;
  description: string;
}

interface UsersData {
  tag: string;
  title: string;
  description: string;
  userTypes: UserType[];
  cta: {
    text: string;
    subtext: string;
    href: string;
  };
  image: {
    src: string;
    alt: string;
    className?: string;
  };
}

// Dynamic data configuration
const usersData: UsersData = {
  tag: "Who is it for?",
  title: "Perfect for the Self-Employed",
  description:
    "Taxwise is designed for anyone with multiple income streams or messy bank statements.",
  userTypes: [
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      title: "Freelancers & Creators",
      description: "Track gig income and separate business expenses.",
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      title: "Small Business Owners",
      description: "Get bookkeeping done without hiring an accountant.",
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      title: "Side Hustlers",
      description: "Keep your side income tax-compliant easily.",
    },
    {
      icon: "/images/icons/check-purple.svg",
      alt: "check",
      title: "Consultants",
      description: "Track billable expenses and maximize write-offs.",
    },
  ],
  cta: {
    text: "Get Started -",
    subtext: "It's Free",
    href: "/auth/sign-up",
  },
  image: {
    src: "/images/users.jpg",
    alt: "users-image",
  },
};

const Users: React.FC = () => {
  return (
    <div className="pb-[70px] md:pb-[90px] lg:pb-[110px] xl:pb-[130px] 2xl:pb-[160px]">
      <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
          {/* Image Section */}
          <div className="text-center">
            <Image
              src={usersData.image.src}
              alt={usersData.image.alt}
              className="inline-block rounded-[15px]"
              width={945} // Set appropriate width
              height={970} // Set appropriate height
            />
          </div>

          {/* Content Section */}
          <div className="max-w-[520px] ltr:xl:ml-auto rtl:xl:ml-auto">
            <span className="inline-block bg-[#f3ede6] dark:bg-[#0a0e19] text-purple-600 rounded-[30px] py-[6.5px] px-[18px] mb-[15px]">
              {usersData.tag}
            </span>
            <h2 className="!font-medium md:-tracking-[1px] !text-xl md:!text-2xl lg:!text-3xl xl:!text-5xl !leading-[1.2] !mb-[13px]">
              {usersData.title}
            </h2>
            <p className="md:text-[15px] lg:text-md">{usersData.description}</p>

            {/* User Types List */}
            <div className="mt-[20px] md:mt-[30px] xl:mt-[40px] mb-[25px] md:mb-[35px] xl:mb-[45px]">
              {usersData.userTypes.map((userType, index) => (
                <div
                  key={index}
                  className="mb-[14px] md:mb-[17px] lg:mb-[20px] last:mb-0 flex items-center gap-[12px] md:gap-[20px]"
                >
                  <Image
                    src={userType.icon}
                    alt={userType.alt}
                    width={26}
                    height={26}
                  />
                  <div>
                    <h3 className="!font-medium !text-md md:!text-lg !mb-[5px]">
                      {userType.title}
                    </h3>
                    <p className="md:text-[15px] lg:text-md">
                      {userType.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href={usersData.cta.href}
              className="inline-block font-medium md:text-base rounded-[30px] bg-purple-600 text-white py-[11.5px] md:py-[12.5px] lg:py-[13.5px] px-[22px] md:px-[25px] transition-all hover:bg-purple-500 hover:text-white"
            >
              {usersData.cta.text}{" "}
              <span className="font-normal">{usersData.cta.subtext}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
