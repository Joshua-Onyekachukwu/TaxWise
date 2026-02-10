"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarProps {
  toggleActive: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ toggleActive }) => {
  const pathname = usePathname();

  return (
    <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md">
      {/* Logo Section */}
      <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[19px] pb-[15px] absolute z-[2] right-0 top-0 left-0">
        <Link
          href="/dashboard"
          className="transition-none relative flex items-center outline-none"
        >
          <span className="font-bold text-black dark:text-white relative top-px text-xl">
            Taxwise<span className="text-purple-600">.</span>
          </span>
        </Link>

        <button
          type="button"
          className="burger-menu inline-block absolute z-[3] top-[24px] ltr:right-[25px] rtl:left-[25px] transition-all hover:text-purple-500"
          onClick={toggleActive}
        >
          <i className="material-symbols-outlined">close</i>
        </button>
      </div>

      {/* Menu Section */}
      <div className="pt-[89px] px-[22px] pb-[20px] h-screen overflow-y-scroll sidebar-custom-scrollbar">
        <div className="accordion">
          <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs">
            Overview
          </span>

          <ul className="sidebar-sub-menu">
            {/* Dashboard Home */}
            <li className="sidemenu-item mb-[4px] last:mb-0">
              <Link
                href="/dashboard"
                className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-purple-500 hover:bg-purple-50 w-full text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard" ? "active text-purple-600 bg-purple-50 dark:bg-[#15203c]" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px]">
                  dashboard
                </i>
                Dashboard
              </Link>
            </li>

            {/* AI Assistant - DISABLED FOR MVP */}
            {/* 
            <li className="sidemenu-item mb-[4px] last:mb-0">
              <Link
                href="/dashboard/chat"
                className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-purple-500 hover:bg-purple-50 w-full text-left dark:hover:bg-[#15203c] ${
                  pathname?.startsWith("/dashboard/chat") ? "active text-purple-600 bg-purple-50 dark:bg-[#15203c]" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px]">
                  smart_toy
                </i>
                AI Assistant
              </Link>
            </li>
            */}
          </ul>

          <span className="block relative font-medium uppercase text-gray-400 mt-[20px] mb-[8px] text-xs">
            Tax Management
          </span>
          <ul className="sidebar-sub-menu">
            {/* Uploads */}
            <li className="sidemenu-item mb-[4px] last:mb-0">
              <Link
                href="/dashboard/uploads"
                className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-purple-500 hover:bg-purple-50 w-full text-left dark:hover:bg-[#15203c] ${
                  pathname?.startsWith("/dashboard/uploads") ? "active text-purple-600 bg-purple-50 dark:bg-[#15203c]" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px]">
                  upload_file
                </i>
                Uploads
              </Link>
            </li>

            {/* Analysis */}
            <li className="sidemenu-item mb-[4px] last:mb-0">
              <Link
                href="/dashboard/analysis"
                className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-purple-500 hover:bg-purple-50 w-full text-left dark:hover:bg-[#15203c] ${
                  pathname?.startsWith("/dashboard/analysis") ? "active text-purple-600 bg-purple-50 dark:bg-[#15203c]" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px]">
                  analytics
                </i>
                Analysis
              </Link>
            </li>

            {/* Deductibles */}
            <li className="sidemenu-item mb-[4px] last:mb-0">
              <Link
                href="/dashboard/deductibles"
                className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-purple-500 hover:bg-purple-50 w-full text-left dark:hover:bg-[#15203c] ${
                  pathname?.startsWith("/dashboard/deductibles") ? "active text-purple-600 bg-purple-50 dark:bg-[#15203c]" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px]">
                  savings
                </i>
                Deductibles
              </Link>
            </li>

            {/* Tax Report */}
            <li className="sidemenu-item mb-[4px] last:mb-0">
              <Link
                href="/dashboard/reports"
                className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-purple-500 hover:bg-purple-50 w-full text-left dark:hover:bg-[#15203c] ${
                  pathname?.startsWith("/dashboard/reports") ? "active text-purple-600 bg-purple-50 dark:bg-[#15203c]" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px]">
                  summarize
                </i>
                Reports
              </Link>
            </li>
          </ul>

          <span className="block relative font-medium uppercase text-gray-400 mt-[20px] mb-[8px] text-xs">
            Account
          </span>

          <ul className="sidebar-sub-menu">
            <li className="sidemenu-item mb-[4px] last:mb-0">
              <Link
                href="/dashboard/settings"
                className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] hover:text-purple-500 hover:bg-purple-50 w-full text-left dark:hover:bg-[#15203c] ${
                  pathname === "/dashboard/settings" ? "active text-purple-600 bg-purple-50 dark:bg-[#15203c]" : ""
                }`}
              >
                <i className="material-symbols-outlined transition-all ltr:mr-[10px] rtl:ml-[10px] !text-[22px]">
                  settings
                </i>
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
