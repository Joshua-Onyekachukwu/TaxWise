"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NewUploadPage: React.FC = () => {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mapping State
  const [showMapping, setShowMapping] = useState(false);
  const [fileToMap, setFileToMap] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState({ date: "", description: "", amount: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }
    
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    // If we have mapping confirmed, append it
    if (showMapping) {
        formData.append("mapping", JSON.stringify(mapping));
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success && data.status === "mapping_required") {
        // Need manual mapping
        setFileToMap(file);
        setCsvHeaders(data.headers);
        setPreviewRows(data.filePreview);
        setMapping({ 
            date: data.detectedMapping?.date || "", 
            description: data.detectedMapping?.description || "", 
            amount: data.detectedMapping?.amount || "" 
        });
        setShowMapping(true);
        setIsUploading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Success
      router.push(`/dashboard/analysis?uploadId=${data.uploadId}`);
      
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Clear previous error
      setError(null);
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Clear previous error
      setError(null);
      uploadFile(e.target.files[0]);
    }
  };

  const handleConfirmMapping = () => {
    if (fileToMap) {
        uploadFile(fileToMap);
    }
  };

  if (showMapping) {
    return (
        <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)]">
            <h2 className="text-xl font-bold text-black dark:text-white mb-[5px]">Map Your Columns</h2>
            <p className="text-gray-500 mb-[25px]">We couldn't automatically identify all columns. Please select the correct headers.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] mb-[30px]">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-[8px]">Date Column</label>
                    <select 
                      className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-[#15203c]"
                      value={mapping.date}
                      onChange={(e) => setMapping({...mapping, date: e.target.value})}
                    >
                        <option value="">Select Column</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-[8px]">Description Column</label>
                    <select 
                      className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-[#15203c]"
                      value={mapping.description}
                      onChange={(e) => setMapping({...mapping, description: e.target.value})}
                    >
                        <option value="">Select Column</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-[8px]">Amount Column</label>
                    <select 
                      className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-[#15203c]"
                      value={mapping.amount}
                      onChange={(e) => setMapping({...mapping, amount: e.target.value})}
                    >
                        <option value="">Select Column</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-[30px] border border-gray-100 dark:border-[#172036] rounded-md overflow-hidden">
                <h3 className="bg-gray-50 dark:bg-[#15203c] px-[15px] py-[10px] text-sm font-semibold border-b border-gray-100 dark:border-[#172036]">File Preview</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-[#172036]">
                                {csvHeaders.map(h => <th key={h} className="p-[10px] font-medium text-gray-500">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {previewRows.map((row, i) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-[#172036] last:border-0">
                                    {csvHeaders.map(h => <td key={h} className="p-[10px] text-gray-700 dark:text-gray-300">{row[h]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex gap-[15px]">
                <button 
                  onClick={handleConfirmMapping}
                  disabled={!mapping.date || !mapping.description || !mapping.amount}
                  className="bg-primary-500 text-white py-[10px] px-[25px] rounded-md font-medium hover:bg-primary-400 transition-all disabled:opacity-50"
                >
                    Confirm & Upload
                </button>
                <button 
                  onClick={() => setShowMapping(false)}
                  className="bg-gray-100 text-gray-600 py-[10px] px-[25px] rounded-md font-medium hover:bg-gray-200 transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
  }

  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)]">
      <div className="mb-[25px] flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white">
          Upload New Statement
        </h2>
        <Link 
          href="/dashboard/uploads"
          className="text-gray-500 hover:text-primary-500 transition-colors flex items-center gap-[5px]"
        >
          <i className="material-symbols-outlined !text-lg">arrow_back</i>
          Back
        </Link>
      </div>

      {error && (
        <div className="mb-[20px] p-[15px] bg-red-50 text-red-600 rounded-md border border-red-100 flex items-center gap-[10px]">
          <i className="material-symbols-outlined">error</i>
          {error}
        </div>
      )}

      {isUploading ? (
         <div className="border-2 border-dashed border-gray-200 dark:border-[#172036] rounded-xl h-[400px] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <h3 className="text-lg font-semibold text-black dark:text-white">Processing your file...</h3>
            <p className="text-gray-500">This may take a moment.</p>
         </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-xl h-[400px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            dragActive 
              ? "border-primary-500 bg-primary-50 dark:bg-[#15203c]" 
              : "border-gray-200 dark:border-[#172036] hover:border-primary-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onBrowseClick}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".csv"
          />
          
          <div className="w-[80px] h-[80px] bg-gray-100 dark:bg-[#15203c] rounded-full flex items-center justify-center mb-[20px] text-gray-500">
            <i className="material-symbols-outlined !text-4xl">upload_file</i>
          </div>
          
          <h3 className="text-lg font-semibold mb-[10px] text-black dark:text-white">
            Drag & Drop your CSV file here
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 mb-[25px]">
            or click to browse from your computer
          </p>

          <button 
            type="button"
            className="bg-primary-500 text-white py-[10px] px-[30px] rounded-md font-medium hover:bg-primary-400 transition-all shadow-md pointer-events-none"
          >
            Browse Files
          </button>

          <p className="mt-[20px] text-xs text-gray-400">
            Supported formats: CSV • Max size: 10MB
          </p>
        </div>
      )}

      <div className="mt-[30px]">
        <h4 className="font-semibold mb-[15px] text-black dark:text-white">
          Instructions
        </h4>
        <ul className="list-disc pl-[20px] text-gray-500 dark:text-gray-400 space-y-[8px]">
          <li>Ensure your CSV has columns for <strong>Date</strong>, <strong>Description</strong>, and <strong>Amount</strong>.</li>
          <li>Remove any password protection from the file before uploading.</li>
          <li>Check that the currency is consistent throughout the file.</li>
        </ul>
      </div>
    </div>
  );
};

export default NewUploadPage;
