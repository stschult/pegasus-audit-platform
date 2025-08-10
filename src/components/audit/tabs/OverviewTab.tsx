// components/audit/tabs/OverviewTab.tsx
'use client';

import React from 'react';
import { 
  CheckCircle, 
  FileText, 
  Settings, 
  Eye, 
  AlertTriangle,
  Upload
} from 'lucide-react';
import { ExcelData, UploadedFile } from '../../../../types';

// Type definitions
interface User {
  userType: 'auditor' | 'client';
}

interface WalkthroughApplication {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

interface OverviewTabProps {
  currentData: ExcelData | null;
  walkthroughApplications: WalkthroughApplication[];
  user: User | null;
  uploadedFiles: UploadedFile[];
  isDragOver: boolean;
  onSummaryCardClick: (moduleId: string) => void;
  onFileUpload: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  formatFileSize: (bytes: number) => string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  currentData,
  walkthroughApplications,
  user,
  uploadedFiles,
  isDragOver,
  onSummaryCardClick,
  onFileUpload,
  onDrop,
  onDragOver,
  onDragLeave,
  formatFileSize
}) => {
  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upload Files</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-blue-400 bg-blue-900/30' : 'border-gray-600 hover:border-gray-500'
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Upload ITGC Master List</h3>
          <p className="text-gray-300 mb-4">
            Drag and drop your Excel file here, or click to browse
          </p>
          <button
            onClick={onFileUpload}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </button>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-white mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-green-400">Processed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Client Information Section */}
      {user?.userType === 'client' && (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Finance Lead Email
              </label>
              <input
                type="email"
                placeholder="finance.lead@company.com"
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Primary contact for financial questions</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                IT Lead Email
              </label>
              <input
                type="email"
                placeholder="it.lead@company.com"
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Primary contact for technical questions</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audit Point of Contact
              </label>
              <input
                type="email"
                placeholder="audit.contact@company.com"
                className="w-full p-3 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1">Main coordinator for audit activities</p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All fields are optional during development
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Save Contact Information
            </button>
          </div>
        </div>
      )}

      {/* Audit Overview Cards */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Audit Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => onSummaryCardClick('itgcs')}
            className="bg-gray-800 border-2 border-blue-600 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-900 rounded-lg group-hover:bg-blue-800 transition-colors">
                <CheckCircle className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-400">{currentData?.controls?.length || 0}</p>
                <p className="text-sm text-gray-400">Controls</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300">IT General Controls</h3>
            <p className="text-gray-300 text-sm">
              {user?.userType === 'client' 
                ? 'View evidence requests and upload supporting documentation' 
                : 'System-level controls that support the IT environment'
              }
            </p>
          </button>

          <button
            onClick={() => onSummaryCardClick('key-reports')}
            className="bg-gray-800 border-2 border-green-600 rounded-lg p-6 hover:border-green-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-900 rounded-lg group-hover:bg-green-800 transition-colors">
                <FileText className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">{currentData?.keyReports?.length || 0}</p>
                <p className="text-sm text-gray-400">Reports</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-300">Key Reports</h3>
            <p className="text-gray-300 text-sm">
              {user?.userType === 'client' 
                ? 'Access and provide key reports requested for audit testing' 
                : 'Critical reports for audit evidence and testing'
              }
            </p>
          </button>

          <button
            onClick={() => onSummaryCardClick('itacs')}
            className="bg-gray-800 border-2 border-purple-600 rounded-lg p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-900 rounded-lg group-hover:bg-purple-800 transition-colors">
                <Settings className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-400">{currentData?.itacs?.length || 0}</p>
                <p className="text-sm text-gray-400">Controls</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300">IT Application Controls</h3>
            <p className="text-gray-300 text-sm">
              {user?.userType === 'client' 
                ? 'Provide evidence for automated controls within your systems' 
                : 'Automated controls within applications and systems'
              }
            </p>
          </button>

          {/* Walkthrough Overview Card */}
          <button
            onClick={() => onSummaryCardClick('walkthroughs')}
            className="bg-gray-800 border-2 border-orange-600 rounded-lg p-6 hover:border-orange-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-900 rounded-lg group-hover:bg-orange-800 transition-colors">
                <Eye className="h-8 w-8 text-orange-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-400">{walkthroughApplications?.length || 0}</p>
                <p className="text-sm text-gray-400">Walkthroughs</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-300">Walkthroughs</h3>
            <p className="text-gray-300 text-sm">
              {user?.userType === 'client' 
                ? 'Schedule and participate in business process walkthroughs' 
                : 'Process documentation and business system walkthroughs'
              }
            </p>
            {/* Timeline alert for first week deadline */}
            {walkthroughApplications && walkthroughApplications.length > 0 && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-red-900/30 border border-red-700 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-300">
                  Action Required: Schedule {walkthroughApplications.length} walkthroughs by end of first week
                </p>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;