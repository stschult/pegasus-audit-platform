// components/audit/AuditSetup.tsx
'use client';

import React from 'react';
import { 
  ArrowLeft, Upload, FileText, CheckCircle, Clock, XCircle, 
  Settings, Eye, Building2, AlertTriangle 
} from 'lucide-react';
import { 
  Audit, UploadedFile, ExtractedControl, ExtractedITAC, ExtractedKeyReport 
} from '../../types';
import { AUDIT_MODULES } from '../../lib/constants';
import { formatFileSize, getRiskRatingColor } from '../../lib/utils';

interface AuditSetupProps {
  selectedAudit: Audit;
  currentModule: string;
  onModuleChange: (moduleId: string) => void;
  onBack: () => void;
  uploadedFiles: UploadedFile[];
  extractedData: {
    controls: ExtractedControl[];
    itacs: ExtractedITAC[];
    keyReports: ExtractedKeyReport[];
  };
  onFileUpload: (files: FileList) => void;
}

export default function AuditSetup({
  selectedAudit,
  currentModule,
  onModuleChange,
  onBack,
  uploadedFiles,
  extractedData,
  onFileUpload
}: AuditSetupProps) {
  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case 'control-mapping': return <CheckCircle className="h-5 w-5" />;
      case 'key-reports': return <FileText className="h-5 w-5" />;
      case 'itacs': return <Settings className="h-5 w-5" />;
      case 'walkthroughs': return <Eye className="h-5 w-5" />;
      case 'key-systems': return <Building2 className="h-5 w-5" />;
      case 'findings-log': return <AlertTriangle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedAudit.clientName} - Audit Setup</h1>
          <p className="text-gray-600 mt-2">Configure audit modules and upload supporting documents</p>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {AUDIT_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentModule === module.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getModuleIcon(module.id)}
                {module.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Module Content */}
        <div className="p-6">
          {currentModule === 'control-mapping' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Control Mapping & Documentation</h3>
              <p className="text-gray-600 mb-6">Upload Excel files containing control mappings, test procedures, and supporting documentation.</p>
              
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Control Files</h4>
                <p className="text-gray-600 mb-4">Drag and drop Excel files here, or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept=".xlsx,.xls"
                  onChange={(e) => e.target.files && onFileUpload(e.target.files)}
                  className="hidden"
                  id="control-file-upload"
                />
                <label
                  htmlFor="control-file-upload"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                >
                  Choose Files
                </label>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.status === 'processing' && <Clock className="h-4 w-4 text-yellow-500" />}
                          {file.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {file.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                          <span className="text-sm text-gray-500 capitalize">{file.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Controls Preview */}
              {extractedData.controls.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Extracted Controls ({extractedData.controls.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractedData.controls.slice(0, 4).map((control) => (
                      <div key={control.id} className="p-4 border border-gray-200 rounded-lg">
                        <h5 className="font-medium mb-2">{control.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{control.description}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskRatingColor(control.riskRating)}`}>
                            {control.riskRating}
                          </span>
                          <span className="text-xs text-gray-500">{control.controlFamily}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {extractedData.controls.length > 4 && (
                    <p className="text-sm text-gray-500 mt-3">
                      And {extractedData.controls.length - 4} more controls...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {currentModule === 'key-reports' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Reports & Financial Statements</h3>
              <p className="text-gray-600 mb-6">Review and analyze key financial reports and statements.</p>
              
              {extractedData.keyReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extractedData.keyReports.map((report) => (
                    <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <h5 className="font-medium">{report.name}</h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{report.period}</span>
                        <span className="text-xs text-gray-500">{report.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No key reports extracted yet. Upload Excel files in Control Mapping to see data here.</p>
                </div>
              )}
            </div>
          )}

          {currentModule === 'itacs' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">ITACs (IT Application Controls)</h3>
              <p className="text-gray-600 mb-6">Information Technology Application Controls and system configurations.</p>
              
              {extractedData.itacs.length > 0 ? (
                <div className="space-y-4">
                  {extractedData.itacs.map((itac) => (
                    <div key={itac.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{itac.systemName}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          itac.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                          itac.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {itac.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{itac.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Control Type:</span>
                          <span className="ml-2 font-medium">{itac.controlType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Owner:</span>
                          <span className="ml-2 font-medium">{itac.owner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No ITACs extracted yet. Upload Excel files in Control Mapping to see data here.</p>
                </div>
              )}
            </div>
          )}

          {currentModule === 'walkthroughs' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Process Walkthroughs</h3>
              <p className="text-gray-600 mb-6">Document process walkthroughs and control observations.</p>
              
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Walkthrough documentation will be available in future updates.</p>
              </div>
            </div>
          )}

          {currentModule === 'key-systems' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Systems & Applications</h3>
              <p className="text-gray-600 mb-6">Inventory and assessment of key business systems.</p>
              
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Key systems inventory will be available in future updates.</p>
              </div>
            </div>
          )}

          {currentModule === 'findings-log' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Findings & Issues Log</h3>
              <p className="text-gray-600 mb-6">Track audit findings, deficiencies, and remediation status.</p>
              
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Findings log will be available in future updates.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}