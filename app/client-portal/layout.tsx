// app/client-portal/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pegasus Client Portal - Audit Evidence Management',
  description: 'Secure client portal for audit evidence submission and management',
};

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
