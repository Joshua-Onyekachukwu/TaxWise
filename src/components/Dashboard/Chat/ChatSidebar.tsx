"use client";

import React, { useState } from "react";

// Mock data for chat sessions
const mockSessions = [
  {
    id: 1,
    title: "2024 Tax Return Analysis",
    subtitle: "Analysis of 2024 income and expenses",
    time: "Just Now",
    status: "active",
    type: "analysis"
  },
  {
    id: 2,
    title: "Expense Categorization",
    subtitle: "Reviewing uncategorized transactions",
    time: "10:20 AM",
    status: "completed",
    type: "review"
  },
  {
    id: 3,
    title: "Deductible Inquiry",
    subtitle: "Questions about home office deductions",
    time: "Yesterday",
    status: "completed",
    type: "question"
  }
];

const ChatSidebar: React.FC = () => {
  const [activeSession, setActiveSession] = useState(1);

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md h-full">
      <div className="trezo-card-header mb-[20px] flex items-center justify-between">
        <div className="trezo-card-title">
          <h5 className="!mb-0 !text-md !font-medium">Tax Sessions</h5>
        </div>
        <button className="text-primary-500 hover:text-primary-600 transition-colors">
          <i className="material-symbols-outlined !text-xl">add_circle</i>
        </button>
      </div>

      <div className="trezo-card-content">
        <form className="relative mb-[20px]">
          <label className="absolute ltr:left-[13px] rtl:right-[13px] mt-[2px] text-black dark:text-white top-1/2 -translate-y-1/2">
            <i className="material-symbols-outlined !text-lg">search</i>
          </label>
          <input
            type="text"
            className="block w-full rounded-md text-black dark:text-white bg-gray-50 dark:bg-[#15203c] border border-gray-50 dark:border-[#15203c] focus:border-primary-500 h-[40px] outline-0 transition-all text-xs placeholder:text-gray-500 dark:placeholder:text-gray-400 ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[15px] rtl:pl-[15px]"
            placeholder="Search sessions..."
          />
        </form>

        <div className="chat-users-list overflow-y-auto h-[calc(100vh-300px)] ltr:-mr-[10px] rtl:-ml-[10px] ltr:pr-[10px] rtl:pl-[10px]">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`flex items-center justify-between mb-[13.5px] pb-[13.5px] border-b border-gray-100 dark:border-[#172036] last:border-0 last:pb-0 last:mb-0 cursor-pointer p-2 rounded-md transition-colors ${
                activeSession === session.id ? "bg-gray-50 dark:bg-[#15203c]" : "hover:bg-gray-50 dark:hover:bg-[#15203c]"
              }`}
            >
              <div className="flex items-center overflow-hidden">
                <div className="relative ltr:mr-[10px] rtl:ml-[10px] flex-shrink-0">
                  <div className={`w-[35px] h-[35px] rounded-full flex items-center justify-center text-white ${
                    session.type === 'analysis' ? 'bg-primary-500' : 
                    session.type === 'review' ? 'bg-orange-400' : 'bg-purple-500'
                  }`}>
                    <i className="material-symbols-outlined !text-lg">
                      {session.type === 'analysis' ? 'analytics' : 
                       session.type === 'review' ? 'fact_check' : 'help'}
                    </i>
                  </div>
                </div>
                <div className="min-w-0">
                  <span className={`block font-semibold text-black dark:text-white truncate ${activeSession === session.id ? "text-primary-500" : ""}`}>
                    {session.title}
                  </span>
                  <span className="block text-xs mt-[2px] text-gray-500 dark:text-gray-400 truncate">
                    {session.subtitle}
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-400 block whitespace-nowrap ml-2">{session.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
