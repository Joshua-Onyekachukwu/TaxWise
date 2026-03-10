'use client';

import Link from 'next/link';
import { useLoading } from './LoadingProvider';

interface LoadingLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode;
}

export default function LoadingLink({ children, ...props }: LoadingLinkProps) {
  const { startLoading } = useLoading();

  return (
    <Link {...props} onClick={startLoading}>
      {children}
    </Link>
  );
}
