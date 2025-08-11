// File: components/audit/AuditSetup.tsx - FIXED: Walkthrough Display Issue
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExcelData, ExtractedControl, ExtractedITAC, ExtractedKeyReport, UploadedFile } from '../../src/components/audit/types';
import { useAppState } from '../../hooks/useAppState';

// Import extracted components
import AuditHeader from '../../src/components/audit/sections/AuditHeader';
import AuditNavigation from '../../src/components/audit/sections/AuditNavigation';
import AuditDetails from '../../src/components/audit/sections/AuditDetails';
import TabContentRenderer from '../../src/components/audit/sections/TabContentRenderer';

// Import modals
import ClientSchedulingModal from './modals/ClientSchedulingModal';
import WalkthroughCompletionModal from './modals/WalkthroughCompletionModal';
import ControlDetailModal from './ControlDetailModal';
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

const AuditSetup: React.FC<AuditSetupProps> = ({
  selectedAudit,
  onBack,
  currentModule,
  onModuleChange,
  uploadedFiles,
  extractedData,
  onFileUpload
}) => {
  // Get current React state and handler functions
  const {
    evidenceRequests,
    evidenceSubmissions,
    samplingConfigs,
    generatedSamples,
    user,
    walkthroughApplications,
    walkthroughRequests,
    handleSamplingConfigSave,
    handleApproveSamples,
    handleCreateEvidenceRequest,
    getSamplingDataForControl,
    getSamplingStatusForControl,
    handleSendWalkthroughRequests,
    handleUpdateWalkthroughRequest,
    handleScheduleWalkthrough,
    handleCompleteWalkthrough,
    refreshState
  } = useAppState();

  // 🔧 FIX: Force re-render when walkthrough data loads from localStorage
  useEffect(() => {
    console.log('🚶‍♂️ AuditSetup: Walkthrough data updated', {
      applications: walkthroughApplications?.length || 0,
      requests: walkthroughRequests?.length || 0,
      currentModule
    });
    
    // Additional debug info for troubleshooting
    if (walkthroughApplications && walkthroughApplications.length > 0) {
      console.log('🚶‍♂️ AuditSetup: First few applications:', walkthroughApplications.slice(0, 3));
    }
    if (walkthroughRequests && walkthroughRequests.length > 0) {
      console.log('🚶‍♂️ AuditSetup: First few requests:', walkthroughRequests.slice(0, 3));
    }
  }, [walkthroughApplications, walkthroughRequests, currentModule]);

  // 🔧 FIX: Force re-render when switching to walkthroughs tab
  useEffect(() => {
    if (currentModule === 'walkthroughs') {
      console.log('🚶‍♂️ AuditSetup: Switched to walkthroughs tab, refreshing data...');
      // Small delay to ensure localStorage data is loaded
      setTimeout(() => {
        refreshState();
      }, 50);
    }
  }, [currentModule, refreshState]);

  // Component state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ExtractedControl | null>(null);
  const [selectedITAC, setSelectedITAC] = useState<ExtractedITAC | null>(null);
  const [selectedKeyReport, setSelectedKeyReport] = useState<ExtractedKeyReport | null>(null);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<any | null>(null);
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [isITACModalOpen, setIsITACModalOpen] = useState(false);
  const [isKeyReportModalOpen, setIsKeyReportModalOpen] = useState(false);
  const [isWalkthroughModalOpen, setIsWalkthroughModalOpen] = useState(false);
  
  // Client scheduling modal state
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [schedulingApplication, setSchedulingApplication] = useState<any | null>(null);
  const [schedulingRequestId, setSchedulingRequestId] = useState<string | null>(null);
  
  // Completion modal state
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionApplication, setCompletionApplication] = useState<any | null>(null);
  const [completionRequest, setCompletionRequest] = useState<any>(null);

  // Utility functions
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
      }
    ];

    for (const mapping of keywordMappings) {
      for (const keyword of mapping.keywords) {
        if (description.includes(keyword)) {
          return mapping.result;
        }
      }
    }

    const words = fullDescription.split(' ').slice(0, 3).join(' ');
    return words || 'System Control';
  };

  const getClientFriendlyStatus = (technicalStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      'No Sampling Required': 'Complete ✓',
      'Needs Sampling': 'Being Configured',
      'Sampling Configured': 'Being Prepared',
      'Samples Generated': 'Being Prepared', 
      'Ready for Evidence Request': 'Being Prepared',
      'Evidence Request Sent': 'Action Required - Upload Evidence',
      'Partial Evidence Submitted': 'Partially Complete - More Evidence Needed',
      'All Evidence Submitted': 'Under Auditor Review',
      'Evidence Followup Required': 'Action Required - Follow Up Needed',
      'Evidence Approved': 'Complete ✓'
    };

    return statusMap[technicalStatus] || technicalStatus;
  };

  const getSamplingStatusInfo = (controlId: string) => {
    const technicalStatus = getSamplingStatusForControl(controlId, evidenceRequests, evidenceSubmissions);
    const userType = user?.userType || 'auditor';
    
    const displayStatus = userType === 'client' ? getClientFriendlyStatus(technicalStatus) : technicalStatus;
    
    const statusColors: { [key: string]: string } = {
      'No Sampling Required': 'bg-gray-100 text-gray-600',
      'Needs Sampling': 'bg-yellow-100 text-yellow-700',
      'Sampling Configured': 'bg-yellow-100 text-yellow-700',
      'Samples Generated': 'bg-blue-100 text-blue-700',
      'Ready for Evidence Request': 'bg-blue-100 text-blue-700',
      'Evidence Request Sent': 'bg-purple-100 text-purple-700',
      'Partial Evidence Submitted': 'bg-orange-100 text-orange-700',
      'All Evidence Submitted': 'bg-green-100 text-green-700',
      'Evidence Followup Required': 'bg-red-100 text-red-700',
      'Evidence Approved': 'bg-green-100 text-green-700',
      'Complete ✓': 'bg-green-100 text-green-700',
      'Being Configured': 'bg-blue-100 text-blue-700',
      'Being Prepared': 'bg-blue-100 text-blue-700',
      'Action Required - Upload Evidence': 'bg-red-100 text-red-700',
      'Partially Complete - More Evidence Needed': 'bg-orange-100 text-orange-700',
      'Under Auditor Review': 'bg-blue-100 text-blue-700',
      'Action Required - Follow Up Needed': 'bg-red-100 text-red-700'
    };
    
    const colorClass = statusColors[displayStatus] || 'bg-gray-100 text-gray-600';
    
    let borderClass = 'border-gray-200';
    let needsAction = false;
    
    if (userType === 'auditor') {
      const auditorActionRequired = [
        'Needs Sampling', 
        'Sampling Configured', 
        'Ready for Evidence Request',
        'All Evidence Submitted',
        'Partial Evidence Submitted'
      ];
      needsAction = auditorActionRequired.includes(technicalStatus);
      borderClass = needsAction ? 'border-red-400 border-2' : 'border-gray-200';
    } else {
      const clientActionRequired = [
        'Action Required - Upload Evidence',
        'Action Required - Follow Up Needed',
        'Partially Complete - More Evidence Needed'
      ];
      needsAction = clientActionRequired.includes(displayStatus);
      borderClass = needsAction ? 'border-red-400 border-2' : 'border-gray-200';
    }
    
    return {
      status: displayStatus,
      technicalStatus,
      needsAction,
      colorClass,
      borderClass
    };
  };

  const getControlIcon = (description: string) => {
    if (!description) return require('lucide-react').Shield;
    
    const desc = description.toLowerCase();
    if (desc.includes('access') || desc.includes('user') || desc.includes('authentication')) return require('lucide-react').User;
    if (desc.includes('backup') || desc.includes('recovery')) return require('lucide-react').Database;
    if (desc.includes('security') || desc.includes('firewall')) return require('lucide-react').Lock;
    if (desc.includes('monitoring') || desc.includes('logging')) return require('lucide-react').Monitor;
    if (desc.includes('change') || desc.includes('configuration')) return require('lucide-react').Settings;
    if (desc.includes('physical')) return require('lucide-react').Building2;
    return require('lucide-react').Shield;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Event handlers
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
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

  const handleWalkthroughClick = (application: any) => {
    setSelectedWalkthrough(application);
    setIsWalkthroughModalOpen(true);
  };

  const handleSummaryCardClick = (moduleId: string) => {
    onModuleChange(moduleId);
  };

  const handleUpdateControl = (controlId: string, updates: any) => {
    console.log('Updating control:', controlId, updates);
  };

  const handleEvidenceUpload = (controlId: string, files: File[]) => {
    console.log('Uploading evidence for control:', controlId, files);
  };

  // Walkthrough handlers
  const handleBulkSendWalkthroughRequests = () => {
    const draftRequests = walkthroughRequests.filter(req => 
      req.auditId === selectedAudit?.id && 
      req.status === 'draft'
    );
    
    if (draftRequests.length === 0) {
      alert('No draft walkthrough requests to send.');
      return;
    }
    
    const requestIds = draftRequests.map(req => req.id);
    
    const confirmed = confirm(
      `Send ${draftRequests.length} walkthrough requests to the client?`
    );
    
    if (confirmed) {
      handleSendWalkthroughRequests(requestIds);
      alert(`✅ Successfully sent ${draftRequests.length} walkthrough requests!`);
      setTimeout(() => refreshState(), 100);
    }
  };

  const handleIndividualSendRequest = (requestId: string, applicationName: string) => {
    const confirmed = confirm(
      `Send walkthrough request for "${applicationName}" to the client?`
    );
    
    if (confirmed) {
      handleUpdateWalkthroughRequest(requestId, { 
        status: 'sent',
        sentAt: new Date().toISOString()
      });
      
      alert(`✅ Successfully sent walkthrough request for "${applicationName}"!`);
      setTimeout(() => refreshState(), 100);
    }
  };

  const handleOpenScheduling = (application: any) => {
    const relatedRequest = walkthroughRequests?.find(req => 
      req.applicationName === application.name && 
      req.businessOwner === application.owner &&
      req.status === 'sent'
    );
    
    if (relatedRequest) {
      setSchedulingApplication(application);
      setSchedulingRequestId(relatedRequest.id);
      setIsSchedulingModalOpen(true);
    } else {
      alert('No active walkthrough request found for this application.');
    }
  };

  const handleScheduleSubmission = (schedulingData: any) => {
    if (schedulingRequestId) {
      handleScheduleWalkthrough(schedulingRequestId, schedulingData);
      
      alert(`✅ Walkthrough for "${schedulingApplication?.name}" has been scheduled!`);
      
      setIsSchedulingModalOpen(false);
      setSchedulingApplication(null);
      setSchedulingRequestId(null);
      
      setTimeout(() => refreshState(), 100);
    }
  };

  const handleOpenCompletion = (application: any, request: any) => {
    setCompletionApplication(application);
    setCompletionRequest(request);
    setIsCompletionModalOpen(true);
  };

  const handleCompletionSubmission = (completionData: any) => {
    if (completionRequest) {
      handleCompleteWalkthrough(completionRequest.id, completionData);
      
      alert(`✅ Walkthrough for "${completionApplication?.name}" has been completed!`);
      
      setIsCompletionModalOpen(false);
      setCompletionApplication(null);
      setCompletionRequest(null);
      
      setTimeout(() => refreshState(), 100);
    }
  };

  // Enhanced modal close handlers with state refresh
  const handleControlModalClose = () => {
    refreshState();
    setIsControlModalOpen(false);
    setSelectedControl(null);
    setTimeout(() => refreshState(), 100);
  };

  const handleITACModalClose = () => {
    refreshState();
    setIsITACModalOpen(false);
    setSelectedITAC(null);
    setTimeout(() => refreshState(), 100);
  };

  const handleKeyReportModalClose = () => {
    refreshState();
    setIsKeyReportModalOpen(false);
    setSelectedKeyReport(null);
    setTimeout(() => refreshState(), 100);
  };

  // Get audit period for sampling configuration
  const auditPeriod = {
    startDate: selectedAudit?.startDate ? new Date(selectedAudit.startDate) : new Date('2025-01-01'),
    endDate: selectedAudit?.endDate ? new Date(selectedAudit.endDate) : new Date('2025-12-31')
  };

  // 🔧 FIX: Ensure we have current walkthrough data for rendering
  const currentWalkthroughApplications = walkthroughApplications || [];
  const currentWalkthroughRequests = walkthroughRequests || [];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <AuditHeader 
        selectedAudit={selectedAudit}
        onBack={onBack}
      />

      {/* Navigation Tabs */}
      <AuditNavigation
        currentModule={currentModule}
        onModuleChange={onModuleChange}
        currentData={extractedData}
        walkthroughApplications={currentWalkthroughApplications}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Audit Details Section */}
          <AuditDetails 
            currentModule={currentModule}
            user={user}
          />

          {/* Tab Content */}
          <TabContentRenderer
            currentModule={currentModule}
            currentData={extractedData}
            walkthroughApplications={currentWalkthroughApplications}
            walkthroughRequests={currentWalkthroughRequests}
            user={user}
            uploadedFiles={uploadedFiles}
            isDragOver={isDragOver}
            fileInputRef={fileInputRef}
            onSummaryCardClick={handleSummaryCardClick}
            onFileUpload={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onControlClick={handleControlClick}
            onITACClick={handleITACClick}
            onKeyReportClick={handleKeyReportClick}
            onWalkthroughClick={handleWalkthroughClick}
            onBulkSendWalkthroughRequests={handleBulkSendWalkthroughRequests}
            onIndividualSendRequest={handleIndividualSendRequest}
            onOpenScheduling={handleOpenScheduling}
            onOpenCompletion={handleOpenCompletion}
            formatFileSize={formatFileSize}
            getSamplingStatusInfo={getSamplingStatusInfo}
            getRiskLevelColor={getRiskLevelColor}
            getShortDescriptionForParsing={getShortDescriptionForParsing}
            getControlIcon={getControlIcon}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Modals */}
      <ClientSchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => {
          setIsSchedulingModalOpen(false);
          setSchedulingApplication(null);
          setSchedulingRequestId(null);
        }}
        application={schedulingApplication!}
        onSchedule={handleScheduleSubmission}
      />

      <WalkthroughCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
          setCompletionApplication(null);
          setCompletionRequest(null);
        }}
        application={completionApplication!}
        request={completionRequest!}
        onComplete={handleCompletionSubmission}
      />

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