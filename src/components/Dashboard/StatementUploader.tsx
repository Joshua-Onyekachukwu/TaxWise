"use client";

import React, { useState } from 'react';

export import { AccountSelector } from './AccountSelector';

export const StatementUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('1');

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      // TODO: Get the actual account ID from a selector
      formData.append('accountId', 'your-account-id');

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/upload-statement', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        }
      });

      return res.json();
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log('Upload results:', results);
      // TODO: Show a success message to the user
    } catch (error) {
      console.error('Upload failed:', error);
      // TODO: Show an error message to the user
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Upload Bank Statements</h2>
      <div 
        className="border-2 border-dashed border-gray-600 rounded-lg p-10 text-center cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        <p className="text-gray-400">Drag and drop your PDF or CSV files here</p>
      </div>
      <div className="mt-4">
        {files.map((file, i) => (
          <div key={i} className="text-white">{file.name}</div>
        ))}
      </div>
      <div className="mt-4">
        <AccountSelector selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId} />
      </div>
      <button 
        onClick={handleUpload}
        disabled={isUploading || files.length === 0}
        className="mt-4 w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-500"
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};
