import React from "react";
import ChatSidebar from "@/components/Dashboard/Chat/ChatSidebar";
import ChatArea from "@/components/Dashboard/Chat/ChatArea";

export default function ChatPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-[25px] h-[calc(100vh-140px)] min-h-[600px]">
      <div className="w-full lg:w-[350px] shrink-0 h-full">
        <ChatSidebar />
      </div>
      <div className="flex-1 h-full min-w-0">
        <ChatArea />
      </div>
    </div>
  );
}
