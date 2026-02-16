"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Upload {
  id: string;
  filename: string;
  status: string;
  created_at: string;
}

const UploadsPage: React.FC = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUploads = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUploads(data);
      }
      setLoading(false);
    };

    fetchUploads();
  }, [supabase]);

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)] flex flex-col items-center">
      <div className="text-center max-w-[600px] w-full">
        <div className="mb-[20px] bg-primary-50 dark:bg-[#15203c] w-[80px] h-[80px] rounded-full flex items-center justify-center mx-auto text-primary-500">
          <i className="material-symbols-outlined !text-4xl">cloud_upload</i>
        </div>
        
        <h2 className="text-2xl font-bold mb-[10px] text-black dark:text-white">
          Upload Your Financial Data
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-[30px]">
          Upload your bank statements or transaction history (CSV) to get started. 
          We'll analyze your income, expenses, and tax deductibles automatically.
        </p>

        <div className="flex justify-center gap-[15px] mb-[40px]">
          <Link 
            href="/dashboard/uploads/create" 
            className="inline-block bg-primary-500 text-white py-[12px] px-[25px] rounded-md font-medium hover:bg-primary-400 transition-all shadow-md"
          >
            Upload New File
          </Link>
          <Link 
            href="/dashboard" 
            className="inline-block bg-gray-100 dark:bg-[#15203c] text-black dark:text-white py-[12px] px-[25px] rounded-md font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[800px] border-t border-gray-100 dark:border-[#172036] pt-[30px]">
        <h3 className="text-lg font-semibold mb-[20px] text-left text-black dark:text-white">Recent Uploads</h3>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-[#15203c] rounded-md border border-dashed border-gray-200 dark:border-[#172036]">
            <p className="text-gray-500 text-sm">No files uploaded yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0c1427] border border-gray-100 dark:border-[#172036] rounded-md overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#15203c] text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-[#172036]">
                  <th className="p-[15px]">Filename</th>
                  <th className="p-[15px]">Date</th>
                  <th className="p-[15px]">Status</th>
                  <th className="p-[15px] text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((upload) => (
                  <tr key={upload.id} className="border-b border-gray-100 dark:border-[#172036] last:border-0 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors">
                    <td className="p-[15px] font-medium text-black dark:text-white">
                      <div className="flex items-center gap-[10px]">
                        <i className="material-symbols-outlined text-gray-400">description</i>
                        {upload.filename}
                      </div>
                    </td>
                    <td className="p-[15px] text-gray-500 text-sm">
                      {new Date(upload.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-[15px]">
                      <span className={`inline-block px-[10px] py-[2px] rounded-full text-xs font-medium ${
                        upload.status === 'completed' ? 'bg-green-100 text-green-700' :
                        upload.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-[15px] text-right">
                       <Link 
                         href={`/dashboard/uploads/${upload.id}`}
                         className="text-primary-500 hover:text-primary-600 font-medium text-sm"
                       >
                         View Details
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadsPage;
