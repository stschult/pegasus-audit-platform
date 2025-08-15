// File: src/components/audit/sections/AuditHeader.tsx - ENHANCED: Clickable Company Name
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
  onCompanyClick?: () => void; // NEW: Handler for company name click
}

const AuditHeader: React.FC<AuditHeaderProps> = ({
  selectedAudit,
  onBack,
  onCompanyClick
}) => {
  console.log('Debug dates:', { 
    startDate: selectedAudit.startDate, 
    endDate: selectedAudit.endDate 
  });

  // ✅ Helper function to format dates nicely
  const formatAuditDate = (dateString: string): string => {
    try {
      // Handle various date formats
      let date: Date;
      
      // If it's already in YYYY-MM-DD format, parse directly
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString);
      }
      // Handle dot notation like "8.30.2025"
      else if (dateString.includes('.')) {
        const parts = dateString.split('.');
        if (parts.length === 3) {
          const month = parseInt(parts[0]) - 1; // Month is 0-indexed in JS
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          date = new Date(year, month, day);
        } else {
          date = new Date(dateString);
        }
      }
      // Handle slash notation like "8/30/2025"
      else if (dateString.includes('/')) {
        date = new Date(dateString);
      }
      // Try to parse as regular date string
      else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return dateString; // Return original if can't parse
      }
      
      // Format as "Month Day, Year"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString; // Return original if error
    }
  };

  return (
    <div className="bg-gray-700 border-b border-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-300" />
            </button>
            <div>
              {/* 🚀 NEW: Clickable company name */}
              {onCompanyClick ? (
                <button
                  onClick={onCompanyClick}
                  className="text-left group"
                >
                  <h1 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors cursor-pointer">
                    {selectedAudit.companyName}
                  </h1>
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                    {selectedAudit.auditType} • {selectedAudit.clientId} • {new Date(selectedAudit.startDate).getFullYear()}
                    <span className="ml-2 text-xs text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click for company details
                    </span>
                  </p>
                </button>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-white">{selectedAudit.companyName}</h1>
                  <p className="text-sm text-gray-300">
                    {selectedAudit.auditType} • {selectedAudit.clientId} • {new Date(selectedAudit.startDate).getFullYear()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {formatAuditDate(selectedAudit.startDate)} - {formatAuditDate(selectedAudit.endDate)}
              </p>
              <p className="text-sm text-gray-300">Audit Period</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedAudit.status === 'active' ? 'bg-green-900 text-green-300' :
              selectedAudit.status === 'planning' ? 'bg-blue-900 text-blue-300' :
              'bg-gray-600 text-gray-200'
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