"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroBanner: React.FC = () => {
  return (
    <>
      <div className="bg-[#f3ede6] dark:bg-[#0a0e19] pt-[140px] md:pt-[180px] lg:pt-[200px] relative z-[1]">
        <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
          <div className="text-center mx-auto lg:max-w-[880px]">
            <h1 className="!font-medium !text-3xl md:!text-[45px] lg:!text-[55px] xl:!text-[60px] !leading-[1.2] !mb-[12px] md:!mb-[15px] lg:!mb-[20px]">
              Stop Guessing Your{" "}
              <div className="inline-block">
                <Image
                  src="/images/users/user4.jpg"
                  className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-[2px] md:border-[3px] border-white -mx-[7px] inline-block rounded-full ltr:last:mr-0 rtl:last:ml-0 ltr:first:ml-0 rtl:first:mr-0"
                  alt="user-image"
                  width={40}
                  height={40}
                />
                <Image
                  src="/images/users/user5.jpg"
                  className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-[2px] md:border-[3px] border-white -mx-[7px] inline-block rounded-full ltr:last:mr-0 rtl:last:ml-0 ltr:first:ml-0 rtl:first:mr-0"
                  alt="user-image"
                  width={40}
                  height={40}
                />
                <Image
                  src="/images/users/user6.jpg"
                  className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-[2px] md:border-[3px] border-white -mx-[7px] inline-block rounded-full ltr:last:mr-0 rtl:last:ml-0 ltr:first:ml-0 rtl:first:mr-0"
                  alt="user-image"
                  width={40}
                  height={40}
                />
              </div>{" "}
              Taxes. Start Chatting.
            </h1>

            <p className="md:text-[15px] lg:text-md xl:text-lg mx-auto md:max-w-[630px]">
              Taxwise turns your messy bank statements into audit-ready tax reports. 
              Just upload your CSV and chat with our AI assistant to categorize expenses and maximize deductions.
            </p>

            <Link
              href="/auth/sign-up"
              className="inline-block font-medium md:text-base rounded-[30px] bg-purple-600 text-white py-[11.5px] md:py-[12.5px] lg:py-[13.5px] px-[22px] md:px-[25px] transition-all hover:bg-purple-500 hover:text-white mt-[5px] md:mt-[15px] lg:mt-[25px]"
            >
              Start Chatting - <span className="font-normal">It’s Free</span>
            </Link>
          </div>

          <div className="mt-[25px] md:mt-[50px] lg:mt-[75px] xl:mt-[100px] text-center rounded-[15px]">
            <Image
              src="/images/banner.jpg"
              className="inline-block rounded-[15px]"
              alt="banner-image"
              width={1284}
              height={643}
            />
          </div>
        </div>

        <div className="absolute left-0 right-0 text-center top-0 -z-[1] dark:opacity-10">
          <Image
            src="/images/shapes/shape4.png"
            className="inline-block mx-auto"
            alt="shape4"
            width={1914}
            height={1217}
          />
        </div>
      </div>
    </>
  );
};

export default HeroBanner;
