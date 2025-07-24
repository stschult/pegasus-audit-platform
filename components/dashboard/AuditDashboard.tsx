// components/dashboard/AuditDashboard.tsx
'use client';

import React from 'react';
import { Building2, Plus, ChevronRight } from 'lucide-react';
import { User as UserType, Audit } from '../../types';

interface AuditDashboardProps {
  user: UserType;
  audits: Audit[];
  onAuditSelect: (audit: Audit) => void;
  onCreateAudit: () => void;
}

export default function AuditDashboard({ 
  user, 
  audits, 
  onAuditSelect, 
  onCreateAudit 
}: AuditDashboardProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your audit engagements</p>
        </div>
        {!user.isClient && (
          <button
            onClick={onCreateAudit}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Audit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audits.map((audit) => (
          <div
            key={audit.id}
            onClick={() => onAuditSelect(audit)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{audit.clientName}</h3>
                  <p className="text-sm text-gray-500">{audit.website}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Relationship Owner:</span>
                <span className="font-medium">{audit.relationshipOwner}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Audit Owner:</span>
                <span className="font-medium">{audit.auditOwner}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Client ID:</span>
                <span className="font-medium text-blue-600">{audit.clientId}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{audit.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${audit.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}