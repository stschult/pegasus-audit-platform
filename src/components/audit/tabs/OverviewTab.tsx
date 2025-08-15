// File: src/components/audit/tabs/OverviewTab.tsx - ENHANCED: Action Items Dashboard
'use client';

import React from 'react';
import { 
  CheckCircle, 
  FileText, 
  Settings, 
  Eye, 
  AlertTriangle,
  Upload,
  Shield,
  Database,
  Lock,
  Monitor,
  Building2,
  User,
  Target,
  Activity,
  Zap,
  Play,
  Send
} from 'lucide-react';
import { ExcelData, UploadedFile, ExtractedControl, ExtractedITAC, ExtractedKeyReport } from '../types';

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
  attendees?: any[];
}

interface ActionItem {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  category: string;
  status: string;
  technicalStatus: string;
  type: 'control' | 'keyReport' | 'itac' | 'walkthrough';
  nextAction: string;
  needsAction: boolean;
  icon: any;
  colorScheme: string;
}

interface OverviewTabProps {
  currentData: ExcelData | null;
  walkthroughApplications: WalkthroughApplication[];
  walkthroughRequests?: any[];
  user: User | null;
  uploadedFiles: UploadedFile[];
  isDragOver: boolean;
  onSummaryCardClick: (moduleId: string) => void;
  onFileUpload: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  formatFileSize: (bytes: number) => string;
  // NEW: Action Items props
  getSamplingStatusInfo?: (controlId: string) => any;
  getShortDescriptionForParsing?: (description: string) => string;
  getRiskLevelColor?: (riskLevel: string) => string;
  onControlClick?: (control: ExtractedControl) => void;
  onITACClick?: (itac: ExtractedITAC) => void;
  onKeyReportClick?: (keyReport: ExtractedKeyReport) => void;
  onWalkthroughClick?: (application: any) => void;
  // Action handlers
  onSamplingConfigure?: (controlId: string) => void;
  onGenerateSamples?: (controlId: string) => void;
  onSendEvidenceRequest?: (controlId: string) => void;
  onReviewEvidence?: (controlId: string) => void;
  onIndividualSendRequest?: (requestId: string, applicationName: string) => void;
  onOpenScheduling?: (application: any) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  currentData,
  walkthroughApplications = [],
  walkthroughRequests = [],
  user,
  uploadedFiles,
  isDragOver,
  onSummaryCardClick,
  onFileUpload,
  onDrop,
  onDragOver,
  onDragLeave,
  formatFileSize,
  getSamplingStatusInfo,
  getShortDescriptionForParsing,
  getRiskLevelColor,
  onControlClick,
  onITACClick,
  onKeyReportClick,
  onWalkthroughClick,
  onSamplingConfigure,
  onGenerateSamples,
  onSendEvidenceRequest,
  onReviewEvidence,
  onIndividualSendRequest,
  onOpenScheduling
}) => {

  // 🚀 Default implementations for missing props
  const defaultGetRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const defaultGetShortDescription = (description: string): string => {
    if (!description) return 'Unknown Control';
    const words = description.split(' ').slice(0, 3).join(' ');
    return words || 'System Control';
  };

  const defaultGetSamplingStatusInfo = (controlId: string) => {
    return {
      status: 'Needs Sampling',
      technicalStatus: 'Needs Sampling',
      needsAction: true,
      colorClass: 'bg-yellow-100 text-yellow-700',
      borderClass: 'border-red-400 border-2'
    };
  };

  // Use provided functions or defaults
  const getRiskColor = getRiskLevelColor || defaultGetRiskLevelColor;
  const getShortDesc = getShortDescriptionForParsing || defaultGetShortDescription;
  const getStatusInfo = getSamplingStatusInfo || defaultGetSamplingStatusInfo;

  // 🚀 Helper function to get control icon
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

  // 🚀 Get next action info for controls
  const getNextActionInfo = (controlId: string, type: string) => {
    if (user?.userType !== 'auditor') {
      return { showAction: false, actionText: '', actionIcon: null, actionHandler: null };
    }
    
    const statusInfo = getStatusInfo(controlId);
    const { technicalStatus } = statusInfo;
    
    switch (technicalStatus) {
      case 'Needs Sampling':
        return {
          showAction: true,
          actionText: 'Configure Sampling',
          actionIcon: Settings,
          actionHandler: () => onSamplingConfigure?.(controlId)
        };
      case 'Sampling Configured':
        return {
          showAction: true,
          actionText: 'Generate Samples',
          actionIcon: Play,
          actionHandler: () => onGenerateSamples?.(controlId)
        };
      case 'Samples Generated':
      case 'Ready for Evidence Request':
        return {
          showAction: true,
          actionText: 'Send Evidence Request',
          actionIcon: Send,
          actionHandler: () => onSendEvidenceRequest?.(controlId)
        };
      case 'All Evidence Submitted':
      case 'Partial Evidence Submitted':
        return {
          showAction: true,
          actionText: 'Review Evidence',
          actionIcon: Eye,
          actionHandler: () => onReviewEvidence?.(controlId)
        };
      default:
        return { showAction: false, actionText: '', actionIcon: null, actionHandler: null };
    }
  };

  // 🚀 Get walkthrough status info
  const getWalkthroughStatusInfo = (walkthrough: any) => {
    const businessOwner = walkthrough.attendees?.find((a: any) => a.role === 'application_owner')?.name || 
                         walkthrough.owner || 
                         'Unknown Owner';
    
    const relatedRequest = walkthroughRequests?.find(req => 
      req.application === walkthrough.name && 
      req.owner === businessOwner
    );

    let needsAction = false;
    let borderClass = 'border-gray-200';

    if (relatedRequest) {
      const auditorActionRequired = ['not_scheduled', 'draft'];
      const clientActionRequired = ['sent'];
      
      if (user?.userType === 'auditor' && auditorActionRequired.includes(relatedRequest.status)) {
        needsAction = true;
        borderClass = 'border-red-400 border-2';
      } else if (user?.userType === 'client' && clientActionRequired.includes(relatedRequest.status)) {
        needsAction = true;
        borderClass = 'border-red-400 border-2';
      }
    } else if (user?.userType === 'auditor') {
      // If no request exists, auditor needs to create one
      needsAction = true;
      borderClass = 'border-red-400 border-2';
    }

    return {
      needsAction,
      borderClass,
      relatedRequest,
      businessOwner
    };
  };

  // 🚀 Collect all action items
  const getActionItems = (): ActionItem[] => {
    const actionItems: ActionItem[] = [];

    // ITGCs
    if (currentData?.controls) {
      currentData.controls.forEach(control => {
        const statusInfo = getStatusInfo(control.id);
        if (statusInfo.needsAction) {
          const nextActionInfo = getNextActionInfo(control.id, 'control');
          actionItems.push({
            id: control.id,
            name: getShortDesc(control.description),
            description: control.description,
            riskLevel: control.riskLevel || 'medium',
            category: control.category || 'General Control',
            status: statusInfo.status,
            technicalStatus: statusInfo.technicalStatus,
            type: 'control',
            nextAction: nextActionInfo.actionText || 'Review',
            needsAction: statusInfo.needsAction,
            icon: getControlIcon(control.description),
            colorScheme: 'blue'
          });
        }
      });
    }

    // Key Reports
    if (currentData?.keyReports) {
      currentData.keyReports.forEach(report => {
        const statusInfo = getStatusInfo(report.id);
        if (statusInfo.needsAction) {
          const nextActionInfo = getNextActionInfo(report.id, 'keyReport');
          actionItems.push({
            id: report.id,
            name: report.name || `Report`,
            description: report.description || 'Key report for audit testing',
            riskLevel: report.criticality || 'medium',
            category: report.reportType || 'Standard Report',
            status: statusInfo.status,
            technicalStatus: statusInfo.technicalStatus,
            type: 'keyReport',
            nextAction: nextActionInfo.actionText || 'Review',
            needsAction: statusInfo.needsAction,
            icon: FileText,
            colorScheme: 'green'
          });
        }
      });
    }

    // ITACs
    if (currentData?.itacs) {
      currentData.itacs.forEach(itac => {
        const statusInfo = getStatusInfo(itac.id);
        if (statusInfo.needsAction) {
          const nextActionInfo = getNextActionInfo(itac.id, 'itac');
          actionItems.push({
            id: itac.id,
            name: itac.processName || `ITAC`,
            description: itac.controlDescription || 'Application control',
            riskLevel: itac.riskLevel || 'medium',
            category: itac.system || 'Application Control',
            status: statusInfo.status,
            technicalStatus: statusInfo.technicalStatus,
            type: 'itac',
            nextAction: nextActionInfo.actionText || 'Review',
            needsAction: statusInfo.needsAction,
            icon: Settings,
            colorScheme: 'purple'
          });
        }
      });
    }

    // Walkthroughs
    if (walkthroughApplications) {
      walkthroughApplications.forEach(walkthrough => {
        const walkthroughStatusInfo = getWalkthroughStatusInfo(walkthrough);
        if (walkthroughStatusInfo.needsAction) {
          actionItems.push({
            id: walkthrough.id,
            name: walkthrough.name || `Walkthrough`,
            description: walkthrough.description || 'Business process walkthrough',
            riskLevel: walkthrough.riskLevel || 'medium',
            category: walkthrough.category || 'Application Walkthrough',
            status: user?.userType === 'auditor' ? 'Ready to Send' : 'Meeting Request Sent',
            technicalStatus: walkthroughStatusInfo.relatedRequest?.status || 'draft',
            type: 'walkthrough',
            nextAction: user?.userType === 'auditor' ? 'Send Request' : 'Schedule Meeting',
            needsAction: walkthroughStatusInfo.needsAction,
            icon: Activity,
            colorScheme: 'orange'
          });
        }
      });
    }

    // Sort by priority: High > Medium > Low
    return actionItems.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const aPriority = priorityOrder[a.riskLevel.toLowerCase() as keyof typeof priorityOrder] || 2;
      const bPriority = priorityOrder[b.riskLevel.toLowerCase() as keyof typeof priorityOrder] || 2;
      return bPriority - aPriority;
    });
  };

  const actionItems = getActionItems();

  // 🚀 Render action item card
  const renderActionItemCard = (item: ActionItem) => {
    const nextActionInfo = getNextActionInfo(item.id, item.type);
    const colorClasses = {
      blue: 'bg-blue-50 hover:bg-blue-100',
      green: 'bg-green-50 hover:bg-green-100',
      purple: 'bg-purple-50 hover:bg-purple-100',
      orange: 'bg-orange-50 hover:bg-orange-100'
    };

    const iconColorClasses = {
      blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 group-hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
    };

    const handleCardClick = () => {
      switch (item.type) {
        case 'control':
          const control = currentData?.controls?.find(c => c.id === item.id);
          if (control && onControlClick) onControlClick(control);
          break;
        case 'keyReport':
          const report = currentData?.keyReports?.find(r => r.id === item.id);
          if (report && onKeyReportClick) onKeyReportClick(report);
          break;
        case 'itac':
          const itac = currentData?.itacs?.find(i => i.id === item.id);
          if (itac && onITACClick) onITACClick(itac);
          break;
        case 'walkthrough':
          const walkthrough = walkthroughApplications?.find(w => w.id === item.id);
          if (walkthrough && onWalkthroughClick) onWalkthroughClick(walkthrough);
          break;
      }
    };

    const handleActionClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (item.type === 'walkthrough') {
        const walkthroughStatusInfo = getWalkthroughStatusInfo(walkthroughApplications?.find(w => w.id === item.id));
        if (user?.userType === 'auditor' && walkthroughStatusInfo.relatedRequest) {
          onIndividualSendRequest?.(walkthroughStatusInfo.relatedRequest.id, item.name);
        } else if (user?.userType === 'client') {
          const walkthrough = walkthroughApplications?.find(w => w.id === item.id);
          if (walkthrough) onOpenScheduling?.(walkthrough);
        }
      } else {
        nextActionInfo.actionHandler?.();
      }
    };

    return (
      <div
        key={item.id}
        onClick={handleCardClick}
        className={`${colorClasses[item.colorScheme as keyof typeof colorClasses]} border-2 border-red-400 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all group overflow-hidden`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${iconColorClasses[item.colorScheme as keyof typeof iconColorClasses]}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 transition-colors truncate">
                {item.name}
              </h3>
              <p className="text-sm text-gray-700 truncate">{item.category}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
            {/* Action Button */}
            {(nextActionInfo.showAction || item.type === 'walkthrough') && (
              <button
                onClick={handleActionClick}
                className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition-colors"
              >
                {item.type === 'walkthrough' ? (
                  <>
                    {user?.userType === 'auditor' ? <Send className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                    {item.nextAction}
                  </>
                ) : (
                  <>
                    <nextActionInfo.actionIcon className="h-3 w-3 mr-1" />
                    {nextActionInfo.actionText}
                  </>
                )}
              </button>
            )}
            
            {/* Status and Risk Level Row */}
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getRiskColor(item.riskLevel)}`}>
                {item.riskLevel.toUpperCase()}
              </span>
              <div className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700">
                {item.status}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-700">
            <Target className="h-4 w-4" />
            <span className="truncate">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 🚀 NEW: Action Items Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Action Items</h2>
        
        {actionItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actionItems.map(item => renderActionItemCard(item))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {user?.userType === 'client' 
                ? '🎉 All caught up! No action items require your attention.'
                : 'No pending action items at this time.'
              }
            </h3>
            <p className="text-gray-400">
              {user?.userType === 'client' 
                ? 'Check back later for new evidence requests or meeting invitations.'
                : 'All controls and workflows are up to date.'
              }
            </p>
          </div>
        )}
      </div>

      {/* File Upload Section - AUDITOR ONLY */}
      {user?.userType === 'auditor' && (
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