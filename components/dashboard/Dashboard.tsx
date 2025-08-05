// components/dashboard/Dashboard.tsx
'use client';

import React from 'react';
import { Audit } from '../../types';

interface DashboardProps {
  user: { name: string; email: string } | null;
  selectedAudit: Audit | null;
  onCreateNewAudit: () => void;
  onContinueAudit: () => void;
  onLogout: () => void;
}

export default function Dashboard({
  user,
  selectedAudit,
  onCreateNewAudit,
  onContinueAudit,
  onLogout
}: DashboardProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with logout */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Audit Platform</h1>
          <p className="text-xl text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-12">Professional audit management for SOC 2, ITGC, and financial audits</p>
        
        <button
          onClick={onCreateNewAudit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
        >
          Create New Audit
        </button>

        {/* Show recent audits if any */}
        {selectedAudit && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Audits</h2>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900">{selectedAudit.clientName}</h3>
              <p className="text-gray-600 mb-4">Progress: {selectedAudit.progress}%</p>
              <button
                onClick={onContinueAudit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Continue Audit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}