// File: src/components/audit/sections/TabContentRenderer.tsx
'use client';

import React from 'react';
import { 
  CheckCircle, 
  FileText, 
  Settings, 
  AlertTriangle, 
  Download, 
  Eye,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { ExcelData, ExtractedControl, ExtractedITAC, ExtractedKeyReport, UploadedFile } from '../types';
import { extractKeySystemsFromData } from '../utils/keySystemsExtractor';

// Import tab components
import OverviewTab from '../tabs/OverviewTab';
import WalkthroughsTab from '../tabs/WalkthroughsTab';
import KeySystemsTab from '../tabs/KeySystemsTab';

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
  getControlIcon
}) => {
  
  if (currentModule === 'overview') {
    return (
      <OverviewTab
        currentData={currentData}
        walkthroughApplications={walkthroughApplications || []}
        user={user}
        uploadedFiles={uploadedFiles}
        isDragOver={isDragOver}
        onSummaryCardClick={onSummaryCardClick}
        onFileUpload={onFileUpload}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        formatFileSize={formatFileSize}
      />
    );
  }

  if (currentModule === 'walkthroughs') {
    return (
      <WalkthroughsTab
        walkthroughApplications={walkthroughApplications || []}
        walkthroughRequests={walkthroughRequests || []}
        user={user}
        onBulkSendRequests={onBulkSendWalkthroughRequests}
        onIndividualSendRequest={onIndividualSendRequest}
        onOpenScheduling={onOpenScheduling}
        onWalkthroughClick={onWalkthroughClick}
        onOpenCompletion={onOpenCompletion}
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
                  onClick={() => onControlClick(control)}
                  className={`bg-blue-50 border rounded-lg p-6 cursor-pointer hover:shadow-lg hover:bg-blue-100 transition-all group overflow-hidden ${statusInfo.borderClass}`}
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
                      {statusInfo.status !== 'No Sampling Required' && statusInfo.status !== 'Complete ✓' && (
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
    );
  }

  if (currentModule === 'key-reports') {
    return (
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
              const statusInfo = getSamplingStatusInfo(report.id);
              
              return (
                <div
                  key={report.id || index}
                  onClick={() => onKeyReportClick(report)}
                  className={`bg-green-50 border rounded-lg p-6 cursor-pointer hover:shadow-lg hover:bg-green-100 transition-all group overflow-hidden ${statusInfo.borderClass}`}
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
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0 ${getRiskLevelColor(report.criticality || 'medium')}`}>
                        {(report.criticality || 'MEDIUM').toUpperCase()}
                      </span>
                      {statusInfo.status !== 'No Sampling Required' && statusInfo.status !== 'Complete ✓' && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.colorClass}`}>
                          {statusInfo.icon && <statusInfo.icon size={12} />}
                          <span className="truncate max-w-24">{statusInfo.status}</span>
                        </div>
                      )}
                    </div>
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
    );
  }

  if (currentModule === 'itacs') {
    return (
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
                  onClick={() => onITACClick(itac)}
                  className={`bg-purple-50 border rounded-lg p-6 cursor-pointer hover:shadow-lg hover:bg-purple-100 transition-all group overflow-hidden ${statusInfo.borderClass}`}
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
                      {statusInfo.status !== 'No Sampling Required' && statusInfo.status !== 'Complete ✓' && (
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