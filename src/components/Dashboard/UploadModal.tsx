"use client";

import React from 'react';
import { StatementUploader } from './StatementUploader';

export const UploadModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Upload Statements</h2>
          <button onClick={onClose} className="text-white text-2xl">&times;</button>
        </div>
        <StatementUploader />
      </div>
    </div>
  );
};
