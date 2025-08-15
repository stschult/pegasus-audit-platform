// File: src/components/audit/tabs/KeyReportsTab.tsx
'use client';

import React from 'react';
import { FileText, Download, Activity, Settings, Play, Send, Eye } from 'lucide-react';
import { ExcelData, ExtractedKeyReport } from '../types';
import AuditCard from '../shared/AuditCard';

interface KeyReportsTabProps {
  currentData: ExcelData | null;
  user: any;
  onKeyReportClick: (keyReport: ExtractedKeyReport) => void;
  getSamplingStatusInfo: (reportId: string) => any;
  getRiskLevelColor: (riskLevel: string) => string;
  onSamplingConfigure?: (reportId: string) => void;
  onGenerateSamples?: (reportId: string) => void;
  onSendEvidenceRequest?: (reportId: string) => void;
  onReviewEvidence?: (reportId: string) => void;
}

const KeyReportsTab: React.FC<KeyReportsTabProps> = ({
  currentData,
  user,
  onKeyReportClick,
  getSamplingStatusInfo,
  getRiskLevelColor,
  onSamplingConfigure,
  onGenerateSamples,
  onSendEvidenceRequest,
  onReviewEvidence
}) => {
  
  // 🚀 Get next action button for a key report based on status
  const getNextActionButton = (report: ExtractedKeyReport) => {
    const statusInfo = getSamplingStatusInfo(report.id);
    
    // Only show buttons if auditor needs to take action
    if (!statusInfo.needsAction || user?.userType !== 'auditor') {
      return null;
    }
    
    const technicalStatus = statusInfo.technicalStatus;
    
    // Map technical status to appropriate action button
    if (technicalStatus === 'Needs Sampling') {
      return {
        text: 'Configure Sampling',
        icon: Settings,
        onClick: () => onSamplingConfigure?.(report.id)
      };
    }
    
    if (technicalStatus === 'Sampling Configured') {
      return {
        text: 'Generate Samples',
        icon: Play,
        onClick: () => onGenerateSamples?.(report.id)
      };
    }
    
    if (technicalStatus === 'Ready for Evidence Request') {
      return {
        text: 'Send Evidence Request',
        icon: Send,
        onClick: () => onSendEvidenceRequest?.(report.id)
      };
    }
    
    if (technicalStatus === 'All Evidence Submitted' || technicalStatus === 'Partial Evidence Submitted') {
      return {
        text: 'Review Evidence',
        icon: Eye,
        onClick: () => onReviewEvidence?.(report.id)
      };
    }
    
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Key Reports ({currentData?.keyReports?.length || 0})
        </h2>
        {/* Hide export button for clients */}
        {user?.userType === 'auditor' && (
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </button>
        )}
      </div>

      {currentData?.keyReports && currentData.keyReports.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentData.keyReports.map((report, index) => {
            const statusInfo = getSamplingStatusInfo(report.id);
            const nextActionButton = getNextActionButton(report);
            
            return (
              <AuditCard
                key={report.id || index}
                id={report.id}
                title={report.name || `Report ${index + 1}`}
                subtitle={report.reportType || 'Standard Report'}
                description={report.description || 'Key report for audit testing and evidence collection'}
                theme="green"
                icon={FileText}
                statusInfo={!nextActionButton && statusInfo.status !== 'No Sampling Required' && statusInfo.status !== 'Complete ✓' ? {
                  status: statusInfo.status,
                  colorClass: statusInfo.colorClass
                } : undefined}
                actionButton={nextActionButton}
                needsAction={statusInfo.needsAction}
                riskLevel={report.criticality || 'medium'}
                bottomLeftText={report.frequency || 'As Needed'}
                onClick={() => onKeyReportClick(report)}
                getRiskLevelColor={getRiskLevelColor}
              />
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
  );
};

export default KeyReportsTab;