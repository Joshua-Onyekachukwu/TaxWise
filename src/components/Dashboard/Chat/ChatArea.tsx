"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const QUICK_PROMPTS = [
  "Why are my expenses so high?",
  "Check for missing deductions",
  "How can I reduce my tax?",
  "Analyze my top spending categories"
];

// Helper to render content with "Action Chips"
const RenderMessageContent = ({ content }: { content: string }) => {
  // Simple regex to find [Action Button Text] patterns if we want to parse them from AI response
  // But for now, let's just render the text. 
  // In a real implementation, we would have the AI return structured JSON or specific markdown for chips.
  // For this "polish" phase, let's look for specific keywords to inject chips dynamically at the end of AI messages.
  
  const hasDeductions = content.toLowerCase().includes("deduction") || content.toLowerCase().includes("business expense");
  const hasTransactions = content.toLowerCase().includes("transaction") || content.toLowerCase().includes("spending");
  const hasReport = content.toLowerCase().includes("tax report") || content.toLowerCase().includes("export");

  return (
    <div className="space-y-3">
      <div className="whitespace-pre-wrap">{content}</div>
      
      {/* Dynamic Action Chips based on context */}
      <div className="flex flex-wrap gap-2 mt-3">
        {hasDeductions && (
          <Link href="/dashboard/deductions" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-black/20 border border-primary-200 dark:border-primary-800 rounded-full text-xs font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
            <i className="material-symbols-outlined !text-sm">fact_check</i>
            Review Deductions
          </Link>
        )}
        {hasTransactions && (
           <Link href="/dashboard/analysis" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-black/20 border border-primary-200 dark:border-primary-800 rounded-full text-xs font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
             <i className="material-symbols-outlined !text-sm">analytics</i>
             View Analysis
           </Link>
        )}
         {hasReport && (
           <Link href="/dashboard/reports" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-black/20 border border-primary-200 dark:border-primary-800 rounded-full text-xs font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
             <i className="material-symbols-outlined !text-sm">description</i>
             Go to Reports
           </Link>
        )}
      </div>
    </div>
  );
};

const ChatArea: React.FC = () => {
  const { messages, isLoading, append } = useChat({
    api: '/api/chat',
  } as any) as any;
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    append({ role: 'user', content: input });
    setInput("");
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePromptClick = (prompt: string) => {
      append({ role: 'user', content: prompt });
  };

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md h-full flex flex-col shadow-sm border border-gray-100 dark:border-[#172036]">
      {/* Header */}
      <div className="trezo-card-header flex items-center justify-between border-b border-gray-100 dark:border-[#172036] pb-[20px] mb-[20px]">
        <div className="flex items-center">
          <div className="relative ltr:mr-[15px] rtl:ml-[15px]">
            <div className="w-[45px] h-[45px] rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
               <i className="material-symbols-outlined !text-2xl">manage_search</i>
            </div>
            <span className="absolute bg-success-500 w-[10px] h-[10px] rounded-full border-[2px] border-white dark:border-[#0c1427] bottom-[0px] ltr:right-[0px] rtl:left-[0px]"></span>
          </div>
          <div>
            <span className="font-semibold block text-black dark:text-white text-md">
              Financial Detective
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-[2px]">
              AI Tax Investigator
            </span>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto mb-[20px] ltr:pr-[10px] rtl:pl-[10px]">
        <div className="flex flex-col gap-[20px]">
          {/* Welcome Message */}
          {messages.length === 0 && (
             <div className="flex flex-col gap-6">
                 <div className="flex items-start gap-[15px]">
                    <div className="flex-shrink-0 w-[35px] h-[35px] rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                      <i className="material-symbols-outlined !text-lg">smart_toy</i>
                   </div>
                   <div className="max-w-[80%]">
                     <div className="bg-gray-50 dark:bg-[#15203c] p-[15px] rounded-r-xl rounded-bl-xl text-black dark:text-white text-sm leading-relaxed border border-gray-100 dark:border-gray-800">
                       <p className="font-semibold mb-2">Hello! I'm your Financial Detective.</p>
                       <p>I've analyzed your latest financial data. I can help you uncover hidden deductions, explain unusual spending patterns, and optimize your tax position.</p>
                       <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs">Based on Finance Act 2023 & Your Uploaded Data</p>
                     </div>
                     <span className="text-xs text-gray-400 block mt-[5px]">Just Now</span>
                   </div>
                 </div>

                 {/* Quick Prompts */}
                 <div className="pl-[50px] grid grid-cols-1 md:grid-cols-2 gap-3">
                     {QUICK_PROMPTS.map((prompt, idx) => (
                         <button 
                            key={idx}
                            onClick={() => handlePromptClick(prompt)}
                            className="text-left text-sm p-3 rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors flex items-center gap-2 group"
                         >
                             <i className="material-symbols-outlined text-lg opacity-70 group-hover:opacity-100">lightbulb</i>
                             {prompt}
                         </button>
                     ))}
                 </div>
             </div>
          )}

          {messages.map((m: any) => (
            <div key={m.id} className={`flex items-start gap-[15px] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-[35px] h-[35px] rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-gray-200 dark:bg-gray-700 text-gray-600' : 'bg-primary-100 dark:bg-primary-900 text-primary-600'}`}>
                    <i className="material-symbols-outlined !text-lg">{m.role === 'user' ? 'person' : 'smart_toy'}</i>
                </div>
                <div className="max-w-[80%]">
                    <div className={`${m.role === 'user' ? 'bg-primary-500 text-white rounded-l-xl rounded-br-xl' : 'bg-gray-50 dark:bg-[#15203c] text-black dark:text-white rounded-r-xl rounded-bl-xl border border-gray-100 dark:border-gray-800'} p-[15px] text-sm leading-relaxed shadow-sm`}>
                        {m.role === 'user' ? (
                            m.content
                        ) : (
                            <RenderMessageContent content={m.content} />
                        )}
                    </div>
                </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-[15px]">
                <div className="flex-shrink-0 w-[35px] h-[35px] rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                   <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-[#15203c] p-[10px] rounded-md flex items-center gap-[10px] border border-gray-200 dark:border-gray-800">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-1 bg-transparent border-none outline-none text-black dark:text-white placeholder:text-gray-500"
          placeholder="Ask your Financial Detective..."
        />
        
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className={`p-3 rounded-md transition-all flex items-center justify-center ${input.trim() ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        >
          <i className="material-symbols-outlined !text-xl">send</i>
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
