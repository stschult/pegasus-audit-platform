// File: components/audit/sections/AuditHeader.tsx
'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AuditHeaderProps {
  selectedAudit: {
    id: string;
    companyName: string;
    clientId: string;
    website?: string;
    clientLead?: string;
    auditLead?: string;
    auditType: string;
    riskAssessment: string;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
  };
  onBack: () => void;
}

const AuditHeader: React.FC<AuditHeaderProps> = ({
  selectedAudit,
  onBack
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedAudit.companyName}</h1>
              <p className="text-sm text-gray-600">
                {selectedAudit.auditType} • {selectedAudit.clientId} • {new Date(selectedAudit.startDate).getFullYear()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {new Date(selectedAudit.startDate).toLocaleDateString()} - {new Date(selectedAudit.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Audit Period</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedAudit.status === 'active' ? 'bg-green-100 text-green-800' :
              selectedAudit.status === 'planning' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedAudit.status.charAt(0).toUpperCase() + selectedAudit.status.slice(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditHeader;