// File: app/login/client/page.tsx - CLEAN VERSION
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientLoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to root with client context
    router.push('/?login=client');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Portal</h2>
        <p className="text-gray-600 mb-4">Connecting to your audit...</p>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent mx-auto"></div>
      </div>
    </div>
  );
}