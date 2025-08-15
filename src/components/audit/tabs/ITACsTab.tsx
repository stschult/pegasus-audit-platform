// File: src/components/audit/tabs/ITACsTab.tsx
'use client';

import React from 'react';
import { Settings, Download, Zap, Play, Send, Eye } from 'lucide-react';
import { ExcelData, ExtractedITAC } from '../types';
import AuditCard from '../shared/AuditCard';

interface ITACsTabProps {
  currentData: ExcelData | null;
  user: any;
  onITACClick: (itac: ExtractedITAC) => void;
  getSamplingStatusInfo: (itacId: string) => any;
  getRiskLevelColor: (riskLevel: string) => string;
  onSamplingConfigure?: (itacId: string) => void;
  onGenerateSamples?: (itacId: string) => void;
  onSendEvidenceRequest?: (itacId: string) => void;
  onReviewEvidence?: (itacId: string) => void;
}

const ITACsTab: React.FC<ITACsTabProps> = ({
  currentData,
  user,
  onITACClick,
  getSamplingStatusInfo,
  getRiskLevelColor,
  onSamplingConfigure,
  onGenerateSamples,
  onSendEvidenceRequest,
  onReviewEvidence
}) => {
  
  // 🚀 Get next action button for an ITAC based on status
  const getNextActionButton = (itac: ExtractedITAC) => {
    const statusInfo = getSamplingStatusInfo(itac.id);
    
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
        onClick: () => onSamplingConfigure?.(itac.id)
      };
    }
    
    if (technicalStatus === 'Sampling Configured') {
      return {
        text: 'Generate Samples',
        icon: Play,
        onClick: () => onGenerateSamples?.(itac.id)
      };
    }
    
    if (technicalStatus === 'Ready for Evidence Request') {
      return {
        text: 'Send Evidence Request',
        icon: Send,
        onClick: () => onSendEvidenceRequest?.(itac.id)
      };
    }
    
    if (technicalStatus === 'All Evidence Submitted' || technicalStatus === 'Partial Evidence Submitted') {
      return {
        text: 'Review Evidence',
        icon: Eye,
        onClick: () => onReviewEvidence?.(itac.id)
      };
    }
    
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          IT Application Controls ({currentData?.itacs?.length || 0})
        </h2>
        {/* Hide export button for clients */}
        {user?.userType === 'auditor' && (
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export ITACs
          </button>
        )}
      </div>

      {currentData?.itacs && currentData.itacs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentData.itacs.map((itac, index) => {
            const statusInfo = getSamplingStatusInfo(itac.id);
            const nextActionButton = getNextActionButton(itac);
            
            return (
              <AuditCard
                key={itac.id || index}
                id={itac.id}
                title={itac.processName || `ITAC ${index + 1}`}
                subtitle={itac.system || 'Application Control'}
                description={itac.controlDescription || itac.controlType || 'Automated control within application system'}
                theme="purple"
                icon={Settings}
                statusInfo={!nextActionButton && statusInfo.status !== 'No Sampling Required' && statusInfo.status !== 'Complete ✓' ? {
                  status: statusInfo.status,
                  colorClass: statusInfo.colorClass
                } : undefined}
                actionButton={nextActionButton}
                needsAction={statusInfo.needsAction}
                riskLevel={itac.riskLevel || 'medium'}
                bottomLeftText={itac.controlType || 'Automated'}
                onClick={() => onITACClick(itac)}
                getRiskLevelColor={getRiskLevelColor}
              />
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
  );
};

export default ITACsTab;