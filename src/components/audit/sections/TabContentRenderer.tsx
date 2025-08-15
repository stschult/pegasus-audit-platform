// File: src/components/audit/sections/TabContentRenderer.tsx - FINAL CLEAN VERSION
'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ExcelData, ExtractedControl, ExtractedITAC, ExtractedKeyReport, UploadedFile } from '../types';
import { extractKeySystemsFromData } from '../utils/keySystemsExtractor';
import { 
  extractWalkthroughApplicationsFromKeyReports,
  generateWalkthroughRequestsFromApplications 
} from '../../../utils/audit/walkthroughHandlers';

// 🚀 Import all the extracted tab components
import OverviewTab from '../tabs/OverviewTab';
import KeySystemsTab from '../tabs/KeySystemsTab';
import ITGCsTab from '../tabs/ITGCsTab';
import KeyReportsTab from '../tabs/KeyReportsTab';
import ITACsTab from '../tabs/ITACsTab';
import WalkthroughsTab from '../tabs/WalkthroughsTab';

interface TabContentRendererProps {
  currentModule: string;
  currentData: ExcelData | null;
  walkthroughApplications: any[];
  walkthroughRequests: any[];
  user: any;
  uploadedFiles: UploadedFile[];
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onSummaryCardClick: (moduleId: string) => void;
  onFileUpload: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onControlClick: (control: ExtractedControl) => void;
  onITACClick: (itac: ExtractedITAC) => void;
  onKeyReportClick: (keyReport: ExtractedKeyReport) => void;
  onWalkthroughClick: (application: any) => void;
  onBulkSendWalkthroughRequests: () => void;
  onIndividualSendRequest: (requestId: string, applicationName: string) => void;
  onOpenScheduling: (application: any) => void;
  onOpenCompletion: (application: any, request: any) => void;
  formatFileSize: (bytes: number) => string;
  getSamplingStatusInfo: (controlId: string) => any;
  getRiskLevelColor: (riskLevel: string) => string;
  getShortDescriptionForParsing: (description: string) => string;
  getControlIcon: (description: string) => any;
  onSamplingConfigure?: (controlId: string) => void;
  onGenerateSamples?: (controlId: string) => void;
  onSendEvidenceRequest?: (controlId: string) => void;
  onReviewEvidence?: (controlId: string) => void;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  currentModule,
  currentData,
  walkthroughApplications,
  walkthroughRequests,
  user,
  uploadedFiles,
  isDragOver,
  fileInputRef,
  onSummaryCardClick,
  onFileUpload,
  onDrop,
  onDragOver,
  onDragLeave,
  onControlClick,
  onITACClick,
  onKeyReportClick,
  onWalkthroughClick,
  onBulkSendWalkthroughRequests,
  onIndividualSendRequest,
  onOpenScheduling,
  onOpenCompletion,
  formatFileSize,
  getSamplingStatusInfo,
  getRiskLevelColor,
  getShortDescriptionForParsing,
  getControlIcon,
  onSamplingConfigure,
  onGenerateSamples,
  onSendEvidenceRequest,
  onReviewEvidence
}) => {

  console.log('🔧 TabContentRenderer PROPS DEBUG:', {
    currentModule: currentModule,
    currentModuleType: typeof currentModule,
    walkthroughAppsLength: walkthroughApplications?.length,
    walkthroughReqsLength: walkthroughRequests?.length,
    moduleEqualsWalkthroughs: currentModule === 'walkthroughs'
  });

  // 🚀 PRESERVED: Walkthrough data processing logic (this was working!)
  useEffect(() => {
    console.log('🔍 useEffect triggered - currentData?.keyReports length:', currentData?.keyReports?.length);
    console.log('🔍 user?.id:', user?.id);
    
    const existingApplications = localStorage.getItem('audit_walkthrough_applications');
    const existingRequests = localStorage.getItem('audit_walkthrough_requests');
    if (existingApplications || existingRequests) {
      console.log('✅ Walkthrough data already exists, skipping generation');
      return;
    }
    
    if (currentData?.keyReports && currentData.keyReports.length > 0) {
      try {
        console.log(`🔧 Extracting walkthrough applications from ${currentData.keyReports.length} key reports`);
        
        const applications = extractWalkthroughApplicationsFromKeyReports(
          currentData.keyReports, 
          'audit-' + Date.now(),
          user?.id || 'user-' + Date.now()
        );
        
        const requests = generateWalkthroughRequestsFromApplications(
          applications, 
          'audit-' + Date.now(),
          user?.id || 'user-' + Date.now()
        );
        
        localStorage.setItem('audit_walkthrough_applications', JSON.stringify(applications));
        localStorage.setItem('audit_walkthrough_requests', JSON.stringify(requests));
        
        console.log(`💾 Saved ${applications.length} applications and ${requests.length} requests`);
        
      } catch (error) {
        console.error('❌ Error processing walkthrough data:', error);
      }
    }
  }, [currentData?.keyReports, user?.id]);

  // 🚀 CLEAN ROUTING: No more bloated inline code!
  
  if (currentModule === 'overview') {
    return (
      <OverviewTab
        currentData={currentData}
        walkthroughApplications={walkthroughApplications || []}
        walkthroughRequests={walkthroughRequests}  
        user={user}
        uploadedFiles={uploadedFiles}
        isDragOver={isDragOver}
        onSummaryCardClick={onSummaryCardClick}
        onFileUpload={onFileUpload}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        formatFileSize={formatFileSize}
        getSamplingStatusInfo={getSamplingStatusInfo}
        getShortDescriptionForParsing={getShortDescriptionForParsing}
        getRiskLevelColor={getRiskLevelColor}
        onControlClick={onControlClick}
        onITACClick={onITACClick}
        onKeyReportClick={onKeyReportClick}
        onWalkthroughClick={onWalkthroughClick}
        onSamplingConfigure={onSamplingConfigure}
        onGenerateSamples={onGenerateSamples}
        onSendEvidenceRequest={onSendEvidenceRequest}
        onReviewEvidence={onReviewEvidence}
        onIndividualSendRequest={onIndividualSendRequest}
        onOpenScheduling={onOpenScheduling}
      />
    );
  }

  if (currentModule === 'walkthroughs') {
    return (
      <WalkthroughsTab
        walkthroughApplications={walkthroughApplications}
        walkthroughRequests={walkthroughRequests}
        user={user}
        onBulkSendWalkthroughRequests={onBulkSendWalkthroughRequests}
        onIndividualSendRequest={onIndividualSendRequest}
        onOpenScheduling={onOpenScheduling}
        onWalkthroughClick={onWalkthroughClick}
        onOpenCompletion={onOpenCompletion}
        getRiskLevelColor={getRiskLevelColor}
      />
    );
  }

  if (currentModule === 'key-systems') {
    return (
      <KeySystemsTab
        user={user}
        extractedSystems={currentData?.keyReports ? extractKeySystemsFromData(currentData.keyReports) : []}
      />
    );
  }

  if (currentModule === 'itgcs') {
    return (
      <ITGCsTab
        currentData={currentData}
        user={user}
        onControlClick={onControlClick}
        getSamplingStatusInfo={getSamplingStatusInfo}
        getRiskLevelColor={getRiskLevelColor}
        getShortDescriptionForParsing={getShortDescriptionForParsing}
        getControlIcon={getControlIcon}
        onSamplingConfigure={onSamplingConfigure}
        onGenerateSamples={onGenerateSamples}
        onSendEvidenceRequest={onSendEvidenceRequest}
        onReviewEvidence={onReviewEvidence}
      />
    );
  }

  if (currentModule === 'key-reports') {
    return (
      <KeyReportsTab
        currentData={currentData}
        user={user}
        onKeyReportClick={onKeyReportClick}
        getSamplingStatusInfo={getSamplingStatusInfo}
        getRiskLevelColor={getRiskLevelColor}
        onSamplingConfigure={onSamplingConfigure}
        onGenerateSamples={onGenerateSamples}
        onSendEvidenceRequest={onSendEvidenceRequest}
        onReviewEvidence={onReviewEvidence}
      />
    );
  }

  if (currentModule === 'itacs') {
    return (
      <ITACsTab
        currentData={currentData}
        user={user}
        onITACClick={onITACClick}
        getSamplingStatusInfo={getSamplingStatusInfo}
        getRiskLevelColor={getRiskLevelColor}
        onSamplingConfigure={onSamplingConfigure}
        onGenerateSamples={onGenerateSamples}
        onSendEvidenceRequest={onSendEvidenceRequest}
        onReviewEvidence={onReviewEvidence}
      />
    );
  }

  if (currentModule === 'findings-log') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Findings Log</h3>
        <p className="text-gray-600">
          Track audit findings, deficiencies, and remediation status
        </p>
      </div>
    );
  }

  return null;
};

export default TabContentRenderer;