"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

interface HeaderProps {
  toggleActive: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleActive }) => {
  const [isProfileActive, setIsProfileActive] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard/uploads")) return "Data Sources";
    if (path.startsWith("/dashboard/analysis")) return "Cash Flow Analysis";
    if (path.startsWith("/dashboard/deductibles")) return "Tax Deductions";
    if (path.startsWith("/dashboard/reports")) return "Tax Report 2024";
    if (path.startsWith("/dashboard/chat")) return "Tax Strategy Copilot";
    if (path.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard Overview";
  };

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileActive && !(event.target as Element).closest(".profile-menu")) {
        setIsProfileActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileActive]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  };

  return (
    <div
      id="header"
      className="header-area bg-white dark:bg-[#0c1427] py-[13px] px-[20px] md:px-[25px] fixed top-0 z-[6] rounded-b-md transition-all shadow-sm"
    >
      <div className="flex items-center justify-between">
        {/* Left Side: Toggle Button */}
        <div className="flex items-center">
          <button
            type="button"
            className="hide-sidebar-toggle transition-all inline-block hover:text-purple-500 ltr:mr-[15px] rtl:ml-[15px]"
            onClick={toggleActive}
          >
            <i className="material-symbols-outlined !text-[24px]">menu</i>
          </button>
          
          <h2 className="text-lg font-medium hidden md:block">{getPageTitle(pathname)}</h2>
        </div>

        {/* Right Side: Profile Menu */}
        <div className="flex items-center">
          <div className="relative profile-menu">
            <button
              className="flex items-center gap-[10px]"
              onClick={() => setIsProfileActive(!isProfileActive)}
            >
              <div className="w-[35px] h-[35px] rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                T
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-sm font-medium text-black dark:text-white">
                  User
                </span>
                <span className="block text-xs text-gray-500">
                  Taxwise Free
                </span>
              </div>
            </button>

            {/* Dropdown */}
            <div
              className={`absolute ltr:right-0 rtl:left-0 top-full mt-[15px] w-[200px] bg-white dark:bg-[#0c1427] rounded-md shadow-lg border border-gray-100 dark:border-[#172036] transition-all ${
                isProfileActive
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible translate-y-[-10px]"
              }`}
            >
              <ul className="py-[10px]">
                <li>
                  <Link
                    href="/dashboard/settings"
                    className="block py-[8px] px-[20px] text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-[#15203c]"
                  >
                    <i className="material-symbols-outlined !text-[18px] align-middle ltr:mr-[8px] rtl:ml-[8px]">
                      settings
                    </i>
                    Settings
                  </Link>
                </li>
                <li className="border-t border-gray-100 dark:border-[#172036] my-[5px]"></li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-[8px] px-[20px] text-sm text-red-500 hover:bg-red-50 dark:hover:bg-[#15203c]"
                  >
                    <i className="material-symbols-outlined !text-[18px] align-middle ltr:mr-[8px] rtl:ml-[8px]">
                      logout
                    </i>
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
