// components/audit/CreateNewAudit.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface CreateNewAuditProps {
  onBack: () => void;
  onSubmit: (formData: any) => void;
}

export default function CreateNewAudit({ onBack, onSubmit }: CreateNewAuditProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    clientUniqueId: '',
    clientLead: '',
    auditLead: '',
    auditTypes: [],
    auditStartDate: '',
    expectedCompletionDate: ''
  });

  const auditTypeOptions = [
    'Agreed-Upon Procedures (AUP)',
    'Compliance Audit',
    'Construction Audit',
    'Cybersecurity Audit',
    'Due Diligence Audit (e.g. M&A)',
    'Environmental Audit',
    'Financial Statement Audit',
    'Forensic Audit',
    'Human Resources (HR) Audit',
    'Information Systems Audit (IT Audit)',
    'Internal Audit',
    'Operational Audit',
    'Performance Audit',
    'Procurement Audit',
    'Quality Assurance (QA) Audit',
    'Risk Assessment Audit',
    'SOC 1 (System and Organization Controls – Financial Reporting)',
    'SOC 2 (System and Organization Controls – Trust Services Criteria)',
    'SOC 3 (General SOC Report)',
    'Tax Audit'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: string, option: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(option)
        ? prev[field].filter(item => item !== option)
        : [...prev[field], option]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow submission even with empty fields for testing
    const submissionData = {
      ...formData,
      companyName: formData.companyName || 'Test Company',
      clientLead: formData.clientLead || 'Test Client Lead',
      auditLead: formData.auditLead || 'Test Audit Lead',
      clientUniqueId: formData.clientUniqueId || 'TEST-' + Date.now()
    };
    onSubmit(submissionData);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Audit</h2>
            <p className="text-sm text-gray-500 mt-1">Testing Mode - All fields optional</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <input
                type="url"
                value={formData.companyWebsite}
                onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Unique ID
              </label>
              <input
                type="text"
                value={formData.clientUniqueId}
                onChange={(e) => handleInputChange('clientUniqueId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., COMP-2024-001 (auto-generated if empty)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Lead
              </label>
              <input
                type="text"
                value={formData.clientLead}
                onChange={(e) => handleInputChange('clientLead', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter client lead name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Lead
              </label>
              <input
                type="text"
                value={formData.auditLead}
                onChange={(e) => handleInputChange('auditLead', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter audit lead name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Start Date
              </label>
              <input
                type="date"
                value={formData.auditStartDate}
                onChange={(e) => handleInputChange('auditStartDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Completion Date
              </label>
              <input
                type="date"
                value={formData.expectedCompletionDate}
                onChange={(e) => handleInputChange('expectedCompletionDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audit Types
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {auditTypeOptions.map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.auditTypes.includes(type)}
                    onChange={() => handleMultiSelectChange('auditTypes', type)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple (optional)</p>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}