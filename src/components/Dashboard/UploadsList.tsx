"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Upload {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
}

export const UploadsList: React.FC = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploads = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching uploads:', error);
      } else {
        setUploads(data as Upload[]);
      }
      setLoading(false);
    };

    fetchUploads();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Upload History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-700">File Name</th>
              <th className="py-2 px-4 border-b border-gray-700">Status</th>
              <th className="py-2 px-4 border-b border-gray-700">Uploaded At</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map(upload => (
              <tr key={upload.id}>
                <td className="py-2 px-4 border-b border-gray-700">{upload.file_name}</td>
                <td className="py-2 px-4 border-b border-gray-700">{upload.status}</td>
                <td className="py-2 px-4 border-b border-gray-700">{new Date(upload.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
