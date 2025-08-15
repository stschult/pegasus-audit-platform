// File: components/audit/AuditSetup.tsx - COMPLETE: Action Items, Company Modal, Enhanced Overview
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExcelData, ExtractedControl, ExtractedITAC, ExtractedKeyReport, UploadedFile, WalkthroughApplication, WalkthroughRequest } from '../../src/components/audit/types';
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
import CompanyDetailsModal from './modals/CompanyDetailsModal';

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
  walkthroughApplications: WalkthroughApplication[];
  walkthroughRequests: WalkthroughRequest[];
}

const AuditSetup: React.FC<AuditSetupProps> = ({
  selectedAudit,
  onBack,
  currentModule,
  onModuleChange,
  uploadedFiles,
  extractedData,
  onFileUpload,
  walkthroughApplications,
  walkthroughRequests
}) => {
  // 🔧 Local state management for walkthrough requests to bypass localStorage issues
  const [localWalkthroughRequests, setLocalWalkthroughRequests] = useState<WalkthroughRequest[]>(walkthroughRequests);

  // Update local state when props change (initial load or external updates)
  useEffect(() => {
    setLocalWalkthroughRequests(walkthroughRequests);
  }, [walkthroughRequests]);

  // Get current React state and handler functions
  const {
    evidenceRequests,
    evidenceSubmissions,
    samplingConfigs,
    generatedSamples,
    user,
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

  // 🔧 Force re-render when walkthrough data loads from props
  useEffect(() => {
    console.log('🚶‍♂️ AuditSetup: Walkthrough data updated', {
      applications: walkthroughApplications?.length || 0,
      requests: walkthroughRequests?.length || 0,
      localRequests: localWalkthroughRequests?.length || 0,
      currentModule
    });
    
    // Additional debug info for troubleshooting
    if (walkthroughApplications && walkthroughApplications.length > 0) {
      console.log('🚶‍♂️ AuditSetup: First few applications:', walkthroughApplications.slice(0, 3));
    }
    if (localWalkthroughRequests && localWalkthroughRequests.length > 0) {
      console.log('🚶‍♂️ AuditSetup: First few local requests:', localWalkthroughRequests.slice(0, 3));
    }
  }, [walkthroughApplications, walkthroughRequests, localWalkthroughRequests, currentModule]);

  
  // 🔧 Remove infinite loop by removing refreshState from dependencies
  useEffect(() => {
    if (currentModule === 'walkthroughs') {
      console.log('🚶‍♂️ AuditSetup: Switched to walkthroughs tab, data already available via props');
      // Data is already passed via props, no need to refresh state
      // The parent component handles data loading and passes it down
    }
  }, [currentModule]); // FIXED: Removed refreshState from dependencies

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
  
  // 🚀 NEW: Modal tab state for direct navigation
  const [modalActiveTab, setModalActiveTab] = useState<'details' | 'evidence' | 'sampling' | 'notes'>('details');
  
  // 🚀 NEW: Company details modal state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  
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

  // 🚀 UPDATED: Enhanced client-friendly status mapping for ITGC evidence flow
  const getClientFriendlyStatus = (technicalStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      'No Sampling Required': 'Complete ✓',
      'Needs Sampling': 'Awaiting Sample Dates',
      'Sampling Configured': 'Awaiting Sample Dates', 
      'Samples Generated': 'Sample Dates Received',
      'Ready for Evidence Request': 'Sample Dates Received',
      'Evidence Request Sent': 'Sample Dates Received',
      'Partial Evidence Submitted': 'Under Auditor Review',
      'All Evidence Submitted': 'Under Auditor Review',
      'Evidence Followup Required': 'Sample Dates Received',
      'Evidence Approved': 'Complete ✓'
    };

    return statusMap[technicalStatus] || technicalStatus;
  };

  // 🚀 UPDATED: Enhanced sampling status with sample dates info for clients
  const getSamplingStatusInfo = (controlId: string) => {
    const technicalStatus = getSamplingStatusForControl(controlId);
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
      'Awaiting Sample Dates': 'bg-blue-100 text-blue-700',
      'Sample Dates Received': 'bg-red-100 text-red-700',
      'Under Auditor Review': 'bg-blue-100 text-blue-700'
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
        'Sample Dates Received'
      ];
      needsAction = clientActionRequired.includes(displayStatus);
      borderClass = needsAction ? 'border-red-400 border-2' : 'border-gray-200';
    }

    // 🚀 Get sample dates for clients
    let sampleDates: string[] = [];
    if (userType === 'client' && displayStatus === 'Sample Dates Received') {
      const samplingConfig = samplingConfigs.find(config => config.controlId === controlId);
      if (samplingConfig) {
        const controlSamples = generatedSamples.filter(sample => sample.samplingConfigId === samplingConfig.id);
        sampleDates = controlSamples.map(sample => sample.sampleDate).sort();
      }
    }
    
    return {
      status: displayStatus,
      technicalStatus,
      needsAction,
      colorClass,
      borderClass,
      sampleDates // 🚀 Include sample dates for client display
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

  // 🚀 NEW: Check if Overview tab should pulse (has action items)
  const hasActionItems = () => {
    // Check ITGCs
    if (extractedData?.controls) {
      const controlsWithActions = extractedData.controls.filter(control => {
        const statusInfo = getSamplingStatusInfo(control.id);
        return statusInfo.needsAction;
      });
      if (controlsWithActions.length > 0) return true;
    }

    // Check Key Reports
    if (extractedData?.keyReports) {
      const reportsWithActions = extractedData.keyReports.filter(report => {
        const statusInfo = getSamplingStatusInfo(report.id);
        return statusInfo.needsAction;
      });
      if (reportsWithActions.length > 0) return true;
    }

    // Check ITACs
    if (extractedData?.itacs) {
      const itacsWithActions = extractedData.itacs.filter(itac => {
        const statusInfo = getSamplingStatusInfo(itac.id);
        return statusInfo.needsAction;
      });
      if (itacsWithActions.length > 0) return true;
    }

    // Check Walkthroughs
    if (walkthroughApplications) {
      const walkthroughsWithActions = walkthroughApplications.filter(walkthrough => {
        const businessOwner = walkthrough.attendees?.find(a => a.role === 'application_owner')?.name || 
                             walkthrough.owner || 
                             'Unknown Owner';
        
        const relatedRequest = localWalkthroughRequests?.find(req => 
          req.application === walkthrough.name && 
          req.owner === businessOwner
        );

        if (relatedRequest) {
          const auditorActionRequired = ['not_scheduled', 'draft'];
          const clientActionRequired = ['sent'];
          
          if (user?.userType === 'auditor' && auditorActionRequired.includes(relatedRequest.status)) {
            return true;
          } else if (user?.userType === 'client' && clientActionRequired.includes(relatedRequest.status)) {
            return true;
          }
        } else if (user?.userType === 'auditor') {
          return true; // No request exists, auditor needs to create one
        }
        return false;
      });
      if (walkthroughsWithActions.length > 0) return true;
    }

    return false;
  };

  // 🚀 NEW: Next Action Handlers
  const handleSamplingConfigure = (controlId: string) => {
    console.log('🔧 Configure Sampling for control:', controlId);
    
    // Find the control from extracted data
    const control = extractedData?.controls?.find(c => c.id === controlId) ||
                   extractedData?.keyReports?.find(r => r.id === controlId) ||
                   extractedData?.itacs?.find(i => i.id === controlId);
    
    if (control) {
      setSelectedControl(control as ExtractedControl);
      setModalActiveTab('sampling'); // Open directly to sampling tab
      setIsControlModalOpen(true);
    } else {
      alert('Control not found. Please try again.');
    }
  };

  const handleGenerateSamples = async (controlId: string) => {
    console.log('🔧 Generate Samples for control:', controlId);
    
    try {
      // Get the sampling configuration for this control
      const samplingConfig = samplingConfigs.find(config => config.controlId === controlId);
      
      if (!samplingConfig) {
        alert('No sampling configuration found. Please configure sampling first.');
        return;
      }
      
      // Get audit period
      const auditPeriod = {
        startDate: selectedAudit?.startDate ? new Date(selectedAudit.startDate) : new Date('2025-01-01'),
        endDate: selectedAudit?.endDate ? new Date(selectedAudit.endDate) : new Date('2025-12-31')
      };
      
      // Call the approve samples handler (which generates the samples)
      await handleApproveSamples(samplingConfig.id);
      
      // Refresh state to show updated status
      refreshState();
      
      alert('✅ Samples generated successfully!');
      
    } catch (error) {
      console.error('Error generating samples:', error);
      alert('❌ Failed to generate samples. Please try again.');
    }
  };

  const handleSendEvidenceRequest = async (controlId: string) => {
    console.log('🔧 Send Evidence Request for control:', controlId);
    
    try {
      // Get the sampling configuration for this control
      const samplingConfig = samplingConfigs.find(config => config.controlId === controlId);
      
      if (!samplingConfig) {
        alert('No sampling configuration found. Please configure sampling first.');
        return;
      }
      
      // Call the create evidence request handler
      // First get the evidence request object, then call the function
const evidenceRequest = evidenceRequests.find(req => req.samplingConfigId === samplingConfig.id);
if (evidenceRequest) {
  await handleCreateEvidenceRequest(evidenceRequest);
} else {
  alert('No evidence request found for this control.');
  return;
}
      
      // Refresh state to show updated status
      refreshState();
      
      alert('✅ Evidence request sent to client!');
      
    } catch (error) {
      console.error('Error sending evidence request:', error);
      alert('❌ Failed to send evidence request. Please try again.');
    }
  };

  const handleReviewEvidence = (controlId: string) => {
    console.log('🔧 Review Evidence for control:', controlId);
    
    // Find the control from extracted data
    const control = extractedData?.controls?.find(c => c.id === controlId) ||
                   extractedData?.keyReports?.find(r => r.id === controlId) ||
                   extractedData?.itacs?.find(i => i.id === controlId);
    
    if (control) {
      setSelectedControl(control as ExtractedControl);
      setModalActiveTab('evidence'); // Open directly to evidence tab
      setIsControlModalOpen(true);
    } else {
      alert('Control not found. Please try again.');
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
    setModalActiveTab('details'); // Reset to details tab for normal clicks
    setIsControlModalOpen(true);
  };

  const handleITACClick = (itac: ExtractedITAC) => {
    setSelectedITAC(itac);
    setModalActiveTab('details'); // Reset to details tab for normal clicks
    setIsITACModalOpen(true);
  };

  const handleKeyReportClick = (keyReport: ExtractedKeyReport) => {
    setSelectedKeyReport(keyReport);
    setModalActiveTab('details'); // Reset to details tab for normal clicks
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

  // 🚀 NEW: Company click handler
  const handleCompanyClick = () => {
    setIsCompanyModalOpen(true);
  };

  // Walkthrough handlers
  const handleBulkSendWalkthroughRequests = () => {
    const draftRequests = localWalkthroughRequests.filter(req => 
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
      // Update local state immediately
      const updatedRequests = localWalkthroughRequests.map(req => {
        if (requestIds.includes(req.id)) {
          return {
            ...req,
            status: 'sent' as const,
            sentAt: new Date().toISOString()
          };
        }
        return req;
      });
      setLocalWalkthroughRequests(updatedRequests);
      
      // Also call the original handler for localStorage update (but local state takes precedence)
      handleSendWalkthroughRequests(requestIds);
      alert(`✅ Successfully sent ${draftRequests.length} walkthrough requests!`);
    }
  };

  // Enhanced individual send request with direct local state update
  const handleIndividualSendRequest = (requestId: string, applicationName: string) => {
    console.log('🚨 AuditSetup handleIndividualSendRequest CALLED with:', requestId, applicationName);
    
    const confirmed = confirm(
      `Send walkthrough request for "${applicationName}" to the client?`
    );
    
    if (confirmed) {
      console.log('🔧 Updating INDIVIDUAL request status locally:', { requestId, applicationName });
      
      // 🚀 IMMEDIATE LOCAL STATE UPDATE - This bypasses localStorage persistence issues
      const updatedRequests = localWalkthroughRequests.map(req => {
        if (req.id === requestId) {
          console.log('🔧 Found individual request to update:', req);
          return {
            ...req,
            status: 'sent' as const,
            sentAt: new Date().toISOString()
          };
        }
        return req;
      });
      
      console.log('🔧 Setting updated local requests for individual send:', updatedRequests.find(r => r.id === requestId));
      setLocalWalkthroughRequests(updatedRequests);
      
      // Call individual update handler, NOT bulk send handler
      handleUpdateWalkthroughRequest(requestId, { 
        status: 'sent',
        sentAt: new Date().toISOString()
      });
      
      alert(`✅ Successfully sent walkthrough request for "${applicationName}"!`);
    }
  };

  const handleOpenScheduling = (application: any) => {
    const relatedRequest = localWalkthroughRequests?.find(req => 
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
      // Update local state immediately
      const updatedRequests = localWalkthroughRequests.map(req => {
        if (req.id === schedulingRequestId) {
          return {
            ...req,
            status: 'scheduled' as const,
            scheduledDate: schedulingData.date,
            scheduledTime: schedulingData.time,
            meetingLink: schedulingData.meetingLink,
            notes: schedulingData.notes
          };
        }
        return req;
      });
      setLocalWalkthroughRequests(updatedRequests);
      
      // Also call the original handler
      handleScheduleWalkthrough(schedulingRequestId, schedulingData);
      
      alert(`✅ Walkthrough for "${schedulingApplication?.name}" has been scheduled!`);
      
      setIsSchedulingModalOpen(false);
      setSchedulingApplication(null);
      setSchedulingRequestId(null);
    }
  };

  const handleOpenCompletion = (application: any, request: any) => {
    setCompletionApplication(application);
    setCompletionRequest(request);
    setIsCompletionModalOpen(true);
  };

  const handleCompletionSubmission = (completionData: any) => {
    if (completionRequest) {
      // Update local state immediately
      const updatedRequests = localWalkthroughRequests.map(req => {
        if (req.id === completionRequest.id) {
          return {
            ...req,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
            findings: completionData.findings,
            recommendations: completionData.recommendations
          };
        }
        return req;
      });
      setLocalWalkthroughRequests(updatedRequests);
      
      // Also call the original handler
      handleCompleteWalkthrough(completionRequest.id, completionData);
      
      alert(`✅ Walkthrough for "${completionApplication?.name}" has been completed!`);
      
      setIsCompletionModalOpen(false);
      setCompletionApplication(null);
      setCompletionRequest(null);
    }
  };

  // Enhanced modal close handlers with state refresh
  const handleControlModalClose = () => {
    refreshState();
    setIsControlModalOpen(false);
    setSelectedControl(null);
    setModalActiveTab('details'); // Reset tab state
    setTimeout(() => refreshState(), 100);
  };

  const handleITACModalClose = () => {
    refreshState();
    setIsITACModalOpen(false);
    setSelectedITAC(null);
    setModalActiveTab('details'); // Reset tab state
    setTimeout(() => refreshState(), 100);
  };

  const handleKeyReportModalClose = () => {
    refreshState();
    setIsKeyReportModalOpen(false);
    setSelectedKeyReport(null);
    setModalActiveTab('details'); // Reset tab state
    setTimeout(() => refreshState(), 100);
  };

  // Get audit period for sampling configuration
  const auditPeriod = {
    startDate: selectedAudit?.startDate ? new Date(selectedAudit.startDate) : new Date('2025-01-01'),
    endDate: selectedAudit?.endDate ? new Date(selectedAudit.endDate) : new Date('2025-12-31')
  };

  // Use props directly (already validated)
  const currentWalkthroughApplications = walkthroughApplications || [];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 🚀 NEW: Dynamic CSS for pulsing Overview tab */}
      <style jsx>{`
        @keyframes pulse-red {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .tab-pulse-red {
          animation: pulse-red 2s infinite;
          color: #ef4444 !important;
        }
      `}</style>

      {/* Header */}
      <AuditHeader 
        selectedAudit={selectedAudit}
        onBack={onBack}
        onCompanyClick={handleCompanyClick}
      />

      {/* Navigation Tabs */}
      <AuditNavigation
        currentModule={currentModule}
        onModuleChange={onModuleChange}
        currentData={extractedData}
        walkthroughApplications={currentWalkthroughApplications}
        hasActionItems={hasActionItems()} // 🚀 NEW: Pass action items status
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Audit Details Section */}
          <AuditDetails 
            selectedAudit={selectedAudit}
            currentModule={currentModule}
            user={user}
          />

          {/* Tab Content - 🚀 ENHANCED: Pass all necessary props */}
          <TabContentRenderer
            currentModule={currentModule}
            currentData={extractedData}
            walkthroughApplications={currentWalkthroughApplications}
            walkthroughRequests={localWalkthroughRequests}
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
            // 🚀 NEW: Action handlers for next action buttons
            onSamplingConfigure={handleSamplingConfigure}
            onGenerateSamples={handleGenerateSamples}
            onSendEvidenceRequest={handleSendEvidenceRequest}
            onReviewEvidence={handleReviewEvidence}
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

      {/* 🚀 NEW: Company Details Modal */}
      <CompanyDetailsModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        audit={selectedAudit}
        user={user}
      />

      {/* Existing Modals */}
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

      {/* 🚀 ENHANCED: Control Modal with active tab support */}
      {selectedControl && (
        <ControlDetailModal
          control={selectedControl}
          isOpen={isControlModalOpen}
          onClose={handleControlModalClose}
          onUpdateControl={handleUpdateControl}
          onEvidenceUpload={handleEvidenceUpload}
          auditPeriod={auditPeriod}
          getSamplingStatusInfo={getSamplingStatusInfo}
          initialActiveTab={modalActiveTab}
        />
      )}

      {/* 🚀 ENHANCED: ITAC Modal with active tab support */}
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
          getSamplingStatusInfo={getSamplingStatusInfo}
          initialActiveTab={modalActiveTab}
        />
      )}

      {/* 🚀 ENHANCED: Key Report Modal with active tab support */}
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
          getSamplingStatusInfo={getSamplingStatusInfo}
          initialActiveTab={modalActiveTab}
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