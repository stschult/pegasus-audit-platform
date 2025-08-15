// File: src/components/audit/tabs/ITGCsTab.tsx
'use client';

import React from 'react';
import { CheckCircle, Download, Target, Settings, Play, Send, Eye } from 'lucide-react';
import { ExcelData, ExtractedControl } from '../types';
import AuditCard from '../shared/AuditCard';

interface ITGCsTabProps {
  currentData: ExcelData | null;
  user: any;
  onControlClick: (control: ExtractedControl) => void;
  getSamplingStatusInfo: (controlId: string) => any;
  getRiskLevelColor: (riskLevel: string) => string;
  getShortDescriptionForParsing: (description: string) => string;
  getControlIcon: (description: string) => any;
  onSamplingConfigure?: (controlId: string) => void;
  onGenerateSamples?: (controlId: string) => void;
  onSendEvidenceRequest?: (controlId: string) => void;
  onReviewEvidence?: (controlId: string) => void;
}

const ITGCsTab: React.FC<ITGCsTabProps> = ({
  currentData,
  user,
  onControlClick,
  getSamplingStatusInfo,
  getRiskLevelColor,
  getShortDescriptionForParsing,
  getControlIcon,
  onSamplingConfigure,
  onGenerateSamples,
  onSendEvidenceRequest,
  onReviewEvidence
}) => {
  
  // 🚀 Get next action button for a control based on status
  const getNextActionButton = (control: ExtractedControl) => {
    const statusInfo = getSamplingStatusInfo(control.id);
    
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
        onClick: () => onSamplingConfigure?.(control.id)
      };
    }
    
    if (technicalStatus === 'Sampling Configured') {
      return {
        text: 'Generate Samples',
        icon: Play,
        onClick: () => onGenerateSamples?.(control.id)
      };
    }
    
    if (technicalStatus === 'Ready for Evidence Request') {
      return {
        text: 'Send Evidence Request',
        icon: Send,
        onClick: () => onSendEvidenceRequest?.(control.id)
      };
    }
    
    if (technicalStatus === 'All Evidence Submitted' || technicalStatus === 'Partial Evidence Submitted') {
      return {
        text: 'Review Evidence',
        icon: Eye,
        onClick: () => onReviewEvidence?.(control.id)
      };
    }
    
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          IT General Controls ({currentData?.controls?.length || 0})
        </h2>
        {/* Hide export button for clients */}
        {user?.userType === 'auditor' && (
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Controls
          </button>
        )}
      </div>

      {currentData?.controls && currentData.controls.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentData.controls.map((control, index) => {
            const Icon = getControlIcon(control.description);
            const shortDescription = getShortDescriptionForParsing(control.description);
            const statusInfo = getSamplingStatusInfo(control.id);
            const nextActionButton = getNextActionButton(control);
            
            return (
              <AuditCard
                key={control.id || index}
                id={control.id}
                title={shortDescription}
                subtitle={control.category || 'General Control'}
                description={control.description}
                theme="blue"
                icon={Icon}
                statusInfo={!nextActionButton && statusInfo.status !== 'No Sampling Required' && statusInfo.status !== 'Complete ✓' ? {
                  status: statusInfo.status,
                  colorClass: statusInfo.colorClass
                } : undefined}
                actionButton={nextActionButton}
                needsAction={statusInfo.needsAction}
                riskLevel={control.riskLevel || 'medium'}
                bottomLeftText={control.controlObjective || 'Control Objective'}
                onClick={() => onControlClick(control)}
                getRiskLevelColor={getRiskLevelColor}
              />
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
  );
};

export default ITGCsTab;