"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [active, setActive] = useState(false);

  const toggleActive = () => {
    setActive(!active);
  };

  return (
    <div className={`main-content-wrapper transition-all ${active ? "active" : ""}`}>
      <Sidebar toggleActive={toggleActive} />
      
      <div className="main-content d-flex flex-column">
        <Header toggleActive={toggleActive} />

        <div className="main-content-container p-[20px] md:p-[30px] lg:p-[40px]">
           {/* Spacer for fixed header */}
           <div className="h-[70px]"></div>
           {children}
        </div>

        {/* Footer could go here */}
      </div>
    </div>
  );
};

export default DashboardLayout;
