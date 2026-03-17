"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Toaster, toast } from 'react-hot-toast';
import { AccountSelector } from './AccountSelector';

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
    toast.loading('Uploading statements...');

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accountId', selectedAccountId);

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('upload-statement', {
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log('Upload results:', results);
      toast.dismiss();
      toast.success('Statements uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.dismiss();
      toast.error('Upload failed. Please try again.');
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
