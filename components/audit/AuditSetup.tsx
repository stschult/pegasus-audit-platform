// components/audit/AuditSetup.tsx - FIXED WITH TEXT OVERFLOW PROTECTION
'use client';

import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  Settings, 
  Building2, 
  AlertTriangle, 
  Home, 
  X, 
  Download, 
  Eye, 
  User, 
  Calendar, 
  Shield, 
  Database, 
  Lock, 
  Monitor, 
  FileCheck, 
  AlertCircle, 
  Clock, 
  Target, 
  Activity, 
  Zap, 
  BookOpen, 
  Users, 
  CheckSquare, 
  XCircle,
  Send
} from 'lucide-react';
import { ExcelData, ExtractedControl, ExtractedITAC, ExtractedKeyReport, UploadedFile } from '../../types';
import { useAppState } from '../../hooks/useAppState';
import ControlDetailModal from './ControlDetailModal';
import WalkthroughTab from './WalkthroughTab';
import WalkthroughDetailModal from './WalkthroughDetailModal';

interface AuditSetupProps {
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
  currentModule: string;
  onModuleChange: (moduleId: string) => void;
  uploadedFiles: UploadedFile[];
  extractedData: ExcelData | null;
  onFileUpload: (files: FileList) => void;
}

// Add type for walkthrough applications
interface Application {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

const AUDIT_MODULES = [
  { id: 'overview', name: 'Overview', icon: Home },
  { id: 'itgcs', name: 'ITGCs', icon: CheckCircle },
  { id: 'key-reports', name: 'Key Reports', icon: FileText },
  { id: 'itacs', name: 'ITACs', icon: Settings },
  { id: 'walkthroughs', name: 'Walkthroughs', icon: Eye },
  { id: 'key-systems', name: 'Key Systems', icon: Building2 },
  { id: 'findings-log', name: 'Findings Log', icon: AlertTriangle }
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getShortDescriptionForParsing = (fullDescription: string): string => {
  if (!fullDescription || typeof fullDescription !== 'string') {
    return 'Unknown Control';
  }

  const description = fullDescription.toLowerCase().trim();
  
  // Comprehensive mapping with multiple keywords
  const keywordMappings = [
    {
      keywords: ['backup', 'restore', 'recovery', 'disaster recovery', 'data backup'],
      result: 'System Backups'
    },
    {
      keywords: ['access', 'user access', 'authorization', 'authentication', 'login', 'password', 'account'],
      result: 'Access Review'
    },
    {
      keywords: ['physical', 'facility', 'security', 'badge', 'premises', 'building'],
      result: 'Physical Security'
    },
    {
      keywords: ['change management', 'change control', 'system changes', 'configuration'],
      result: 'Change Management'
    },
    {
      keywords: ['segregation', 'separation', 'duties', 'roles', 'responsibilities'],
      result: 'Segregation of Duties'
    },
    {
      keywords: ['monitoring', 'logging', 'audit trail', 'system monitoring', 'log review'],
      result: 'System Monitoring'
    },
    {
      keywords: ['network', 'firewall', 'intrusion', 'network security', 'perimeter'],
      result: 'Network Security'
    },
    {
      keywords: ['patch', 'update', 'vulnerability', 'security patch', 'system update'],
      result: 'Patch Management'
    },
    {
      keywords: ['incident', 'response', 'incident management', 'security incident'],
      result: 'Incident Response'
    },
    {
      keywords: ['data retention', 'data disposal', 'data destruction', 'retention policy'],
      result: 'Data Retention'
    },
    {
      keywords: ['encryption', 'cryptography', 'data encryption', 'secure transmission'],
      result: 'Data Encryption'
    },
    {
      keywords: ['business continuity', 'continuity planning', 'disaster planning'],
      result: 'Business Continuity'
    },
    {
      keywords: ['antivirus', 'malware', 'virus protection', 'endpoint protection'],
      result: 'Malware Protection'
    },
    {
      keywords: ['capacity', 'performance', 'system capacity', 'resource management'],
      result: 'Capacity Management'
    },
    {
      keywords: ['job scheduling', 'batch processing', 'automated jobs', 'job control'],
      result: 'Job Scheduling'
    }
  ];

  // Find the best match
  for (const mapping of keywordMappings) {
    for (const keyword of mapping.keywords) {
      if (description.includes(keyword)) {
        return mapping.result;
      }
    }
  }

  // Fallback: use first few words if no match found
  const words = fullDescription.split(' ').slice(0, 3).join(' ');
  return words || 'System Control';
};

const AuditSetup: React.FC<AuditSetupProps> = ({
  selectedAudit,
  onBack,
  currentModule,
  onModuleChange,
  uploadedFiles,
  extractedData,
  onFileUpload
}) => {
  // ✅ FIXED: Get current React state AND refresh function for real-time status updates
  const {
    // GET CURRENT STATE FOR REAL-TIME UPDATES
    evidenceRequests,
    evidenceSubmissions,
    samplingConfigs,
    generatedSamples,
    // Sampling functionality
    handleSamplingConfigSave,
    handleApproveSamples,
    handleCreateEvidenceRequest,
    getSamplingDataForControl,
    getSamplingStatusForControl,
    // ✅ ADD STATE REFRESH FUNCTION
    refreshState
  } = useAppState();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ExtractedControl | null>(null);
  const [selectedITAC, setSelectedITAC] = useState<ExtractedITAC | null>(null);
  const [selectedKeyReport, setSelectedKeyReport] = useState<ExtractedKeyReport | null>(null);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<Application | null>(null);
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [isITACModalOpen, setIsITACModalOpen] = useState(false);
  const [isKeyReportModalOpen, setIsKeyReportModalOpen] = useState(false);
  const [isWalkthroughModalOpen, setIsWalkthroughModalOpen] = useState(false);

  const currentData = extractedData;

  const handleFileUpload = (files: FileList) => {
    onFileUpload(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleControlClick = (control: ExtractedControl) => {
    setSelectedControl(control);
    setIsControlModalOpen(true);
  };

  const handleITACClick = (itac: ExtractedITAC) => {
    setSelectedITAC(itac);
    setIsITACModalOpen(true);
  };

  const handleKeyReportClick = (keyReport: ExtractedKeyReport) => {
    setSelectedKeyReport(keyReport);
    setIsKeyReportModalOpen(true);
  };

  const handleWalkthroughClick = (application: Application) => {
    setSelectedWalkthrough(application);
    setIsWalkthroughModalOpen(true);
  };

  const handleSummaryCardClick = (moduleId: string) => {
    onModuleChange(moduleId);
  };

  const handleUpdateControl = (controlId: string, updates: any) => {
    console.log('Updating control:', controlId, updates);
    // Your existing control update logic here
  };

  const handleEvidenceUpload = (controlId: string, files: File[]) => {
    console.log('Uploading evidence for control:', controlId, files);
    // Your existing evidence upload logic here
  };

  // ✅ FIXED: Modal close handlers with state refresh
  const handleControlModalClose = () => {
    console.log('🔄 Refreshing state before closing control modal');
    refreshState(); // Force fresh state fetch
    setIsControlModalOpen(false);
    setSelectedControl(null);
  };

  const handleITACModalClose = () => {
    console.log('🔄 Refreshing state before closing ITAC modal');
    refreshState(); // Force fresh state fetch
    setIsITACModalOpen(false);
    setSelectedITAC(null);
  };

  const handleKeyReportModalClose = () => {
    console.log('🔄 Refreshing state before closing key report modal');
    refreshState(); // Force fresh state fetch
    setIsKeyReportModalOpen(false);
    setSelectedKeyReport(null);
  };

  const getControlIcon = (description: string) => {
    if (!description) return Shield;
    
    const desc = description.toLowerCase();
    if (desc.includes('access') || desc.includes('user') || desc.includes('authentication')) return User;
    if (desc.includes('backup') || desc.includes('recovery')) return Database;
    if (desc.includes('security') || desc.includes('firewall')) return Lock;
    if (desc.includes('monitoring') || desc.includes('logging')) return Monitor;
    if (desc.includes('change') || desc.includes('configuration')) return Settings;
    if (desc.includes('physical')) return Building2;
    return Shield;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // ✅ FIXED: Get sampling status using current React state for real-time updates
  const getSamplingStatusInfo = (controlId: string) => {
    // PASS CURRENT REACT STATE TO AVOID LOCALSTORAGE FALLBACK
    const status = getSamplingStatusForControl(controlId, evidenceRequests, evidenceSubmissions);
    
    // ✅ ALL CARDS START WITH RED BORDERS - AUDITOR ACTION REQUIRED BY DEFAULT
    // Only turn green when evidence is fully approved
    const evidenceFullyApproved = status === 'Evidence Approved';
    
    // Status color mapping
    const statusColors = {
      'No Sampling Required': 'bg-gray-100 text-gray-600',
      'Sampling Configured': 'bg-yellow-100 text-yellow-700',
      'Samples Generated': 'bg-blue-100 text-blue-700',
      'Evidence Request Sent': 'bg-purple-100 text-purple-700',
      'Partial Evidence Submitted': 'bg-orange-100 text-orange-700',
      'All Evidence Submitted': 'bg-green-100 text-green-700',
      'Evidence Followup Required': 'bg-red-100 text-red-700',
      'Evidence Approved': 'bg-green-100 text-green-700'
    };
    
    const statusIcons = {
      'No Sampling Required': null,
      'Sampling Configured': Clock,
      'Samples Generated': Eye,
      'Evidence Request Sent': Send,
      'Partial Evidence Submitted': AlertCircle,
      'All Evidence Submitted': CheckCircle,
      'Evidence Followup Required': AlertTriangle,
      'Evidence Approved': CheckCircle
    };

    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600';
    const IconComponent = statusIcons[status as keyof typeof statusIcons];
    
    return {
      status,
      needsAction: !evidenceFullyApproved, // Always true except when evidence approved
      colorClass,
      icon: IconComponent,
      // ✅ RED BORDER BY DEFAULT - Only green when evidence fully approved
      borderClass: evidenceFullyApproved ? 'border-green-400 border-2' : 'border-red-400 border-2'
    };
  };

  const getModuleIcon = (moduleId: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'overview': Home,
      'itgcs': CheckCircle,
      'key-reports': FileText,
      'itacs': Settings,
      'walkthroughs': Eye,
      'key-systems': Building2,
      'findings-log': AlertTriangle
    };
    return iconMap[moduleId] || CheckCircle;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Get audit period for sampling configuration
  const auditPeriod = {
    startDate: selectedAudit?.startDate ? new Date(selectedAudit.startDate) : new Date('2025-01-01'),
    endDate: selectedAudit?.endDate ? new Date(selectedAudit.endDate) : new Date('2025-12-31')
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {AUDIT_MODULES.map((module) => {
              const isActive = currentModule === module.id;
              const Icon = getModuleIcon(module.id);
              
              let itemCount = 0;
              if (module.id === 'itgcs') itemCount = currentData?.controls?.length || 0;
              else if (module.id === 'itacs') itemCount = currentData?.itacs?.length || 0;
              else if (module.id === 'key-reports') itemCount = currentData?.keyReports?.length || 0;
              else if (module.id === 'walkthroughs') itemCount = currentData?.applications?.length || 0;
              
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{module.name}</span>
                  {itemCount > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* ✅ FIXED: File Upload Section - Only show on Overview tab */}
          {currentModule === 'overview' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload ITGC Master List</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-600">Processed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overview/Summary Cards - Only show on Overview tab */}
          {currentModule === 'overview' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Audit Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                  onClick={() => handleSummaryCardClick('itgcs')}
                  className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{currentData?.controls?.length || 0}</p>
                      <p className="text-sm text-gray-500">Controls</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700">IT General Controls</h3>
                  <p className="text-gray-600 text-sm">System-level controls that support the IT environment</p>
                </button>

                <button
                  onClick={() => handleSummaryCardClick('key-reports')}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:border-green-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">{currentData?.keyReports?.length || 0}</p>
                      <p className="text-sm text-gray-500">Reports</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-700">Key Reports</h3>
                  <p className="text-gray-600 text-sm">Critical reports for audit evidence and testing</p>
                </button>

                <button
                  onClick={() => handleSummaryCardClick('itacs')}
                  className="bg-white border-2 border-purple-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Settings className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">{currentData?.itacs?.length || 0}</p>
                      <p className="text-sm text-gray-500">Controls</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-700">IT Application Controls</h3>
                  <p className="text-gray-600 text-sm">Automated controls within applications and systems</p>
                </button>

                <button
                  onClick={() => handleSummaryCardClick('walkthroughs')}
                  className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:border-orange-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Eye className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-orange-600">{currentData?.applications?.length || 0}</p>
                      <p className="text-sm text-gray-500">Applications</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-700">Walkthroughs</h3>
                  <p className="text-gray-600 text-sm">Process documentation and business system walkthroughs</p>
                </button>
              </div>
            </div>
          )}

          {/* ITGCs Tab - ✅ FIXED: Added overflow protection */}
          {currentModule === 'itgcs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">IT General Controls ({currentData?.controls?.length || 0})</h2>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export Controls
                </button>
              </div>

              {currentData?.controls && currentData.controls.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentData.controls.map((control, index) => {
                    const Icon = getControlIcon(control.description);
                    const shortDescription = getShortDescriptionForParsing(control.description);
                    const statusInfo = getSamplingStatusInfo(control.id);
                    
                    return (
                      <div
                        key={control.id || index}
                        onClick={() => handleControlClick(control)}
                        className={`bg-white border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all group overflow-hidden ${statusInfo.borderClass}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                                {shortDescription}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">{control.category || 'General Control'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getRiskLevelColor(control.riskLevel || 'medium')}`}>
                              {(control.riskLevel || 'MEDIUM').toUpperCase()}
                            </span>
                            {/* ✅ REAL-TIME STATUS BADGE WITH OVERFLOW PROTECTION */}
                            {statusInfo.status !== 'No Sampling Required' && (
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.colorClass}`}>
                                {statusInfo.icon && <statusInfo.icon size={12} />}
                                <span className="truncate max-w-24">{statusInfo.status}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {control.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Target className="h-4 w-4" />
                            <span className="truncate">{control.controlObjective || 'Control Objective'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 flex-shrink-0">
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No IT General Controls Found</h3>
                  <p className="text-gray-600">Upload an Excel file to load ITGC data</p>
                </div>
              )}
            </div>
          )}

          {/* Key Reports Tab - ✅ FIXED: Added overflow protection */}
          {currentModule === 'key-reports' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Key Reports ({currentData?.keyReports?.length || 0})</h2>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export Reports
                </button>
              </div>

              {currentData?.keyReports && currentData.keyReports.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentData.keyReports.map((report, index) => {
                    return (
                      <div
                        key={report.id || index}
                        onClick={() => handleKeyReportClick(report)}
                        className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-green-300 hover:shadow-lg transition-all group overflow-hidden"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors flex-shrink-0">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">
                                {report.name || `Report ${index + 1}`}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">{report.reportType || 'Standard Report'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0 ${getRiskLevelColor(report.criticality || 'medium')}`}>
                            {(report.criticality || 'MEDIUM').toUpperCase()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {report.description || 'Key report for audit testing and evidence collection'}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-gray-500 flex-1 min-w-0">
                            <Activity className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{report.frequency || 'As Needed'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-green-600 group-hover:text-green-700 flex-shrink-0">
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Key Reports Found</h3>
                  <p className="text-gray-600">Upload an Excel file to load key reports data</p>
                </div>
              )}
            </div>
          )}

          {/* ITACs Tab - ✅ FIXED: Added overflow protection */}
          {currentModule === 'itacs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">IT Application Controls ({currentData?.itacs?.length || 0})</h2>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export ITACs
                </button>
              </div>

              {currentData?.itacs && currentData.itacs.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentData.itacs.map((itac, index) => {
                    const statusInfo = getSamplingStatusInfo(itac.id);
                    
                    return (
                      <div
                        key={itac.id || index}
                        onClick={() => handleITACClick(itac)}
                        className={`bg-white border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all group overflow-hidden ${statusInfo.borderClass}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors flex-shrink-0">
                              <Settings className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                                {itac.processName || `ITAC ${index + 1}`}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">{itac.system || 'Application Control'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getRiskLevelColor(itac.riskLevel || 'medium')}`}>
                              {(itac.riskLevel || 'MEDIUM').toUpperCase()}
                            </span>
                            {/* ✅ REAL-TIME STATUS BADGE FOR ITACS WITH OVERFLOW PROTECTION */}
                            {statusInfo.status !== 'No Sampling Required' && (
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.colorClass}`}>
                                {statusInfo.icon && <statusInfo.icon size={12} />}
                                <span className="truncate max-w-24">{statusInfo.status}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {itac.controlDescription || itac.controlType || 'Automated control within application system'}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-gray-500 flex-1 min-w-0">
                            <Zap className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{itac.controlType || 'Automated'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-purple-600 group-hover:text-purple-700 flex-shrink-0">
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No IT Application Controls Found</h3>
                  <p className="text-gray-600">Upload an Excel file to load ITAC data</p>
                </div>
              )}
            </div>
          )}

          {/* Walkthroughs Tab */}
          {currentModule === 'walkthroughs' && (
            <WalkthroughTab
              applications={currentData?.applications || []}
              onWalkthroughClick={handleWalkthroughClick}
            />
          )}

          {/* Other module placeholders */}
          {currentModule === 'key-systems' && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Key Systems</h3>
              <p className="text-gray-600">
                System inventory and technology stack documentation
              </p>
            </div>
          )}

          {currentModule === 'findings-log' && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Findings Log</h3>
              <p className="text-gray-600">
                Track audit findings, deficiencies, and remediation status
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ FIXED: Control Detail Modal with state refresh on close */}
      {selectedControl && (
        <ControlDetailModal
          control={selectedControl}
          isOpen={isControlModalOpen}
          onClose={handleControlModalClose}
          onUpdateControl={handleUpdateControl}
          onEvidenceUpload={handleEvidenceUpload}
          auditPeriod={auditPeriod}
        />
      )}

      {/* ✅ FIXED: Enhanced ITAC Detail Modal with state refresh on close */}
      {selectedITAC && (
        <ControlDetailModal
          control={{
            id: selectedITAC.id,
            description: selectedITAC.controlDescription || selectedITAC.controlType || 'ITAC Control',
            controlObjective: selectedITAC.controlObjective || 'Application Control Objective',
            riskLevel: selectedITAC.riskLevel || 'medium',
            category: selectedITAC.system || 'Application Control',
            testingProcedure: selectedITAC.testingProcedure || 'To be defined during walkthrough',
            frequency: selectedITAC.frequency || 'Automated',
            owner: selectedITAC.owner || selectedITAC.system || 'Application Team',
            lastTested: selectedITAC.lastTested,
            status: selectedITAC.status || 'pending',
            name: selectedITAC.processName || selectedITAC.controlType || 'ITAC Control'
          }}
          isOpen={isITACModalOpen}
          onClose={handleITACModalClose}
          onUpdateControl={handleUpdateControl}
          onEvidenceUpload={handleEvidenceUpload}
          auditPeriod={auditPeriod}
        />
      )}

      {/* ✅ FIXED: Enhanced Key Report Detail Modal with state refresh on close */}
      {selectedKeyReport && (
        <ControlDetailModal
          control={{
            id: selectedKeyReport.id,
            name: selectedKeyReport.name || 'Key Report',
            description: selectedKeyReport.description || `${selectedKeyReport.name} - Key audit report`,
            controlObjective: selectedKeyReport.controlObjective || 'Provide audit evidence and support testing procedures',
            riskLevel: selectedKeyReport.criticality || 'medium',
            category: selectedKeyReport.reportType || 'Key Report',
            testingProcedure: selectedKeyReport.testingProcedure || 'Review report for completeness and accuracy',
            frequency: selectedKeyReport.frequency || 'As needed for audit',
            owner: selectedKeyReport.owner || selectedKeyReport.dataSource || 'IT Team',
            lastTested: selectedKeyReport.lastReviewed,
            status: selectedKeyReport.status || 'pending'
          }}
          isOpen={isKeyReportModalOpen}
          onClose={handleKeyReportModalClose}
          onUpdateControl={handleUpdateControl}
          onEvidenceUpload={handleEvidenceUpload}
          auditPeriod={auditPeriod}
        />
      )}

      {/* Walkthrough Detail Modal - No sampling integration needed */}
      {selectedWalkthrough && (
        <WalkthroughDetailModal
          application={selectedWalkthrough}
          isOpen={isWalkthroughModalOpen}
          onClose={() => {
            setIsWalkthroughModalOpen(false);
            setSelectedWalkthrough(null);
          }}
        />
      )}
    </div>
  );
};

export default AuditSetup;