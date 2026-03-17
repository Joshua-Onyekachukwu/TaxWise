import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`bg-gray-700 animate-pulse rounded ${className}`} />;
};
