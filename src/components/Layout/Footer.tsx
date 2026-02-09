"use client";

import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-[#f3ede6] dark:bg-[#0a0e19] pt-[60px] md:pt-[80px] pb-[30px]">
      <div className="container sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1308px] mx-auto px-[12px]">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px] mb-[50px]">
          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block mb-[20px]">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                Taxwise<span className="text-purple-600">.</span>
              </h2>
            </Link>
            <p className="mb-[20px] max-w-[280px]">
              Making tax compliance simple, fast, and stress-free for Nigerian freelancers and businesses.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-[20px]">Product</h3>
            <ul className="space-y-[12px]">
              <li>
                <Link href="#" className="hover:text-purple-600 transition-colors">Features</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-purple-600 transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-purple-600 transition-colors">Security</Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-[20px]">Company</h3>
            <ul className="space-y-[12px]">
              <li>
                <Link href="#" className="hover:text-purple-600 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-purple-600 transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-purple-600 transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-[20px]">Contact</h3>
            <ul className="space-y-[12px]">
              <li>
                hello@taxwise.ng
              </li>
              <li>
                Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-[30px] text-center">
          <p className="mb-0">
            &copy; {currentYear} Taxwise. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Footer;
