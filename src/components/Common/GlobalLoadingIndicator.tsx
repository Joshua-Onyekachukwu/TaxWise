'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalLoadingIndicator() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // We can't use next/router events here, so we'll just simulate a delay
    // A more robust solution might involve a global state management library
    handleStart();
    const timer = setTimeout(() => {
        handleComplete();
    }, 500); // Simulate a 500ms loading time

    return () => clearTimeout(timer);

  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div className="h-full bg-primary-500 animate-pulse"></div>
    </div>
  );
}
