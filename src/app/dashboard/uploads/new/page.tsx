"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BankAccountManager } from "@/components/Dashboard/Uploads/BankAccountManager";

interface StagedFile {
    id: string;
    file: File;
    accountId: string | null;
    status: 'pending' | 'ready' | 'mapping_required' | 'error';
    mapping?: any;
    error?: string;
}

const NewUploadPage: React.FC = () => {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Staging State
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null); // Default account for new drops

  // Mapping State (Modal)
  const [mappingFileId, setMappingFileId] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState({ date: "", description: "", amount: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Handlers --

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
      const newFiles: StagedFile[] = files.map(f => ({
          id: Math.random().toString(36).substring(7),
          file: f,
          accountId: selectedAccountId, // Assign default selected account
          status: 'ready' // Assume ready until processed? Or pending?
          // Actually, we don't know if mapping is required until we try to parse.
          // For now, let's mark them as 'pending' and maybe do a quick check?
          // Or just let user click "Run Analysis" and fail if mapping needed?
          // Better UX: Pre-check CSVs.
      }));

      // Filter for CSV/PDF
      const validFiles = newFiles.filter(f => f.file.name.endsWith('.csv') || f.file.name.endsWith('.pdf'));
      if (validFiles.length < newFiles.length) {
          setGlobalError("Some files were skipped. Only .csv and .pdf are supported.");
      } else {
          setGlobalError(null);
      }

      setStagedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (id: string) => {
      setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileAccount = (id: string, accountId: string) => {
      setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, accountId } : f));
  };

  // -- Batch Processing --

  const runBatchAnalysis = async () => {
      // 1. Validation
      const invalid = stagedFiles.find(f => !f.accountId);
      if (invalid) {
          setGlobalError("Please select a bank account for all files.");
          return;
      }

      setIsProcessing(true);
      setGlobalError(null);

      // 2. Upload Loop (Sequential for now to handle mapping interruptions)
      // Actually, if we want a "Mapping Required" flow, we might need to upload one by one.
      // Or we send all, and server returns "Success" or "Need Mapping".

      try {
          const results = [];
          
          for (const staged of stagedFiles) {
              if (staged.status === 'error') continue; // Skip failed ones?

              const formData = new FormData();
              formData.append("file", staged.file);
              formData.append("accountId", staged.accountId!);
              if (staged.mapping) {
                  formData.append("mapping", JSON.stringify(staged.mapping));
              }

              const res = await fetch("/api/upload", {
                  method: "POST",
                  body: formData
              });
              const data = await res.json();

              if (!data.success && data.status === "mapping_required") {
                  // Pause batch, show mapping UI for this file
                  setMappingFileId(staged.id);
                  setCsvHeaders(data.headers);
                  setPreviewRows(data.filePreview);
                  setMapping({ 
                    date: data.detectedMapping?.date || "", 
                    description: data.detectedMapping?.description || "", 
                    amount: data.detectedMapping?.amount || "" 
                  });
                  setIsProcessing(false);
                  return; // Stop loop, wait for user
              }

              if (!res.ok) {
                  // Mark as error
                  setStagedFiles(prev => prev.map(f => f.id === staged.id ? { ...f, status: 'error', error: data.error } : f));
              } else {
                  results.push(data.uploadId);
              }
          }

          // If we got here, all succeeded
          if (results.length > 0) {
              // Redirect to analysis of the LAST upload (or a summary page?)
              // For now, just go to analysis of first or last.
              // Better: Go to dashboard root which shows recent uploads?
              // Or generic analysis page.
              router.push(`/dashboard/analysis?uploadId=${results[0]}`); // Just show one for now
          }

      } catch (err: any) {
          console.error(err);
          setGlobalError(err.message || "Batch processing failed.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleConfirmMapping = () => {
      if (!mappingFileId) return;
      
      // Update the file with mapping and 'ready' status (to be retried)
      setStagedFiles(prev => prev.map(f => f.id === mappingFileId ? { ...f, mapping: mapping } : f));
      
      // Close modal
      setMappingFileId(null);
      setMapping({ date: "", description: "", amount: "" });
      
      // Auto-resume? Or let user click Run again?
      // Let user click Run again for control.
  };

  // -- Render --

  // Mapping Modal Overlay
  if (mappingFileId) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-black dark:text-white mb-[5px]">Map Columns for File</h2>
                <p className="text-gray-500 mb-[25px]">We couldn't automatically identify columns. Please select headers.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] mb-[30px]">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-[8px]">Date</label>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-[8px]">Description</label>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-[8px]">Amount</label>
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

                <div className="flex gap-[15px] justify-end">
                    <button 
                        onClick={() => setMappingFileId(null)}
                        className="bg-gray-100 text-gray-600 py-[10px] px-[25px] rounded-md font-medium hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmMapping}
                        disabled={!mapping.date || !mapping.description || !mapping.amount}
                        className="bg-primary-500 text-white py-[10px] px-[25px] rounded-md font-medium hover:bg-primary-400 disabled:opacity-50"
                    >
                        Save Mapping
                    </button>
                </div>
             </div>
        </div>
      )
  }

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-[25px] flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white">
          Upload Statements
        </h2>
        <Link 
          href="/dashboard/uploads"
          className="text-gray-500 hover:text-primary-500 transition-colors flex items-center gap-[5px]"
        >
          <i className="material-symbols-outlined !text-lg">arrow_back</i>
          Back
        </Link>
      </div>

      {globalError && (
        <div className="mb-[20px] p-[15px] bg-red-50 text-red-600 rounded-md border border-red-100 flex items-center gap-[10px]">
          <i className="material-symbols-outlined">error</i>
          {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Drop Zone */}
          <div className="lg:col-span-2 space-y-6">
              <div 
                className={`border-2 border-dashed rounded-xl h-[250px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                    dragActive 
                    ? "border-primary-500 bg-primary-50 dark:bg-[#15203c]" 
                    : "border-gray-200 dark:border-[#172036] hover:border-primary-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".csv,.pdf"
                    multiple
                />
                <div className="w-[60px] h-[60px] bg-gray-100 dark:bg-[#15203c] rounded-full flex items-center justify-center mb-[15px] text-gray-500">
                    <i className="material-symbols-outlined !text-3xl">upload_file</i>
                </div>
                <h3 className="text-lg font-semibold mb-[5px] text-black dark:text-white">
                    Drop CSVs or PDFs here
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    or click to browse
                </p>
              </div>

              {/* Staged Files List */}
              {stagedFiles.length > 0 && (
                  <div>
                      <h3 className="font-semibold text-black dark:text-white mb-3">Staged Files ({stagedFiles.length})</h3>
                      <div className="space-y-3">
                          {stagedFiles.map(file => (
                              <div key={file.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-[#172036] rounded-lg bg-white dark:bg-[#0f172a]">
                                  <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                      <i className="material-symbols-outlined">
                                          {file.file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'table_view'}
                                      </i>
                                  </div>
                                  <div className="flex-grow min-w-0">
                                      <p className="text-sm font-medium text-black dark:text-white truncate">{file.file.name}</p>
                                      <p className="text-xs text-gray-500">{(file.file.size / 1024).toFixed(1)} KB</p>
                                      {file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
                                  </div>
                                  
                                  {/* Account Selector Per File */}
                                  <div className="w-[200px]">
                                      <BankAccountManager 
                                        selectedAccountId={file.accountId}
                                        onAccountSelect={(id) => updateFileAccount(file.id, id)}
                                      />
                                  </div>

                                  <button 
                                    onClick={() => removeFile(file.id)}
                                    className="text-gray-400 hover:text-red-500 p-2"
                                  >
                                      <i className="material-symbols-outlined">delete</i>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>

          {/* Right: Actions & Instructions */}
          <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-[#15203c] p-5 rounded-lg border border-gray-100 dark:border-[#172036]">
                  <h4 className="font-semibold mb-2 text-black dark:text-white">Action</h4>
                  <p className="text-sm text-gray-500 mb-4">
                      {stagedFiles.length === 0 
                        ? "Upload files to begin analysis." 
                        : `${stagedFiles.length} file(s) ready to process.`}
                  </p>
                  
                  <button
                    onClick={runBatchAnalysis}
                    disabled={stagedFiles.length === 0 || isProcessing}
                    className="w-full bg-primary-500 text-white py-3 rounded-md font-medium hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                      {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                      ) : (
                          <>
                            <i className="material-symbols-outlined">play_arrow</i>
                            Run Analysis
                          </>
                      )}
                  </button>
              </div>

              <div className="p-5 border border-gray-200 dark:border-[#172036] rounded-lg">
                <h4 className="font-semibold mb-[15px] text-black dark:text-white">
                Instructions
                </h4>
                <ul className="list-disc pl-[20px] text-gray-500 dark:text-gray-400 space-y-[8px] text-sm">
                <li>Upload <strong>CSV</strong> or <strong>PDF</strong> statements.</li>
                <li>Assign each file to a specific <strong>Bank Account</strong> to enable deduplication.</li>
                <li>For PDFs, ensure they are digital exports (not scanned images).</li>
                </ul>
              </div>
          </div>
      </div>
    </div>
  );
};

export default NewUploadPage;
