// File: app/login/auditor/page.tsx - CLEAN VERSION
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditorLoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to root with auditor context
    router.push('/?login=auditor');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Auditor Portal</h2>
        <p className="text-gray-600 mb-4">Redirecting to login...</p>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
      </div>
    </div>
  );
}