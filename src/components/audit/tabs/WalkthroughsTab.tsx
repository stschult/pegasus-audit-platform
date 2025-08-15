// File: src/components/audit/tabs/WalkthroughsTab.tsx
'use client';

import React from 'react';
import { 
  Download, 
  Send, 
  Target,
  Activity,
  Calendar,
  Clock,
  CheckSquare
} from 'lucide-react';
import AuditCard from '../shared/AuditCard';

interface WalkthroughsTabProps {
  walkthroughApplications: any[];
  walkthroughRequests: any[];
  user: any;
  onBulkSendWalkthroughRequests: () => void;
  onIndividualSendRequest: (requestId: string, applicationName: string) => void;
  onOpenScheduling: (application: any) => void;
  onWalkthroughClick: (application: any) => void;
  onOpenCompletion?: (application: any, request: any) => void;
  getRiskLevelColor: (riskLevel: string) => string;
}

const WalkthroughsTab: React.FC<WalkthroughsTabProps> = ({
  walkthroughApplications,
  walkthroughRequests,
  user,
  onBulkSendWalkthroughRequests,
  onIndividualSendRequest,
  onOpenScheduling,
  onWalkthroughClick,
  onOpenCompletion,
  getRiskLevelColor
}) => {

  // 🚀 PRESERVED: Exact working status logic from TabContentRenderer
  const getWalkthroughStatusInfo = (walkthrough: any) => {
    console.log('🔧 DEBUG getWalkthroughStatusInfo: Looking for walkthrough:', walkthrough.name);
    console.log('🔧 DEBUG Available requests:', walkthroughRequests?.map(req => ({
      id: req.id,
      application: req.application,
      owner: req.owner,
      status: req.status
    })));
    
    // Extract business owner from walkthrough data
    const businessOwner = walkthrough.attendees?.find(a => a.role === 'application_owner')?.name || 
                         walkthrough.owner || 
                         'Unknown Owner';
    
    // 🚀 CRITICAL: EXACT FIELD MATCHING - Use working field names from TabContentRenderer
    // Applications: walkthrough.name, walkthrough.owner  
    // Requests: req.application, req.owner
    const relatedRequest = walkthroughRequests?.find(req => 
      req.application === walkthrough.name && 
      req.owner === businessOwner
    );

    console.log('🔧 DEBUG Matching result:', {
      walkthroughName: walkthrough.name,
      businessOwner: businessOwner,
      foundRequest: relatedRequest ? { id: relatedRequest.id, status: relatedRequest.status } : null
    });

    let status = 'Meeting Request Sent';
    let colorClass = 'bg-blue-100 text-blue-700';
    let borderClass = 'border-gray-200';
    let icon = Send;
    let needsAction = false;

    if (relatedRequest) {
      switch (relatedRequest.status) {
        case 'not_scheduled':
          status = 'Ready to Send';
          colorClass = 'bg-gray-100 text-gray-700';
          borderClass = 'border-red-400 border-2'; // Red border - auditor action needed
          icon = Clock;
          needsAction = user?.userType === 'auditor';
          break;
        case 'draft':
          status = 'Ready to Send';
          colorClass = 'bg-gray-100 text-gray-700';
          borderClass = 'border-red-400 border-2'; // Red border - auditor action needed
          icon = Clock;
          needsAction = user?.userType === 'auditor';
          break;
        case 'sent':
          status = 'Meeting Request Sent';
          colorClass = 'bg-blue-100 text-blue-700';
          borderClass = 'border-gray-200'; // Normal border - waiting on client
          icon = Send;
          needsAction = user?.userType === 'client';
          break;
        case 'scheduled':
          status = 'Meeting Scheduled';
          colorClass = 'bg-purple-100 text-purple-700';
          borderClass = 'border-gray-200'; // Normal border - scheduled
          icon = Calendar;
          needsAction = false;
          break;
        case 'in_progress':
          status = 'Awaiting Follow-up Items';
          colorClass = 'bg-orange-100 text-orange-700';
          borderClass = 'border-gray-200'; // Normal border - waiting on client
          icon = Clock;
          needsAction = false;
          break;
        case 'completed':
          status = 'Walkthrough Complete';
          colorClass = 'bg-green-100 text-green-700';
          borderClass = 'border-gray-200'; // Normal border - complete
          icon = CheckSquare;
          needsAction = false;
          break;
        default:
          status = 'Ready to Send';
          colorClass = 'bg-gray-100 text-gray-700';
          borderClass = 'border-red-400 border-2'; // Red border - auditor action needed
          icon = Clock;
          needsAction = user?.userType === 'auditor';
      }
    } else {
      // No request found - this shouldn't happen if requests are created properly
      status = 'Ready to Send';
      colorClass = 'bg-gray-100 text-gray-700';
      borderClass = 'border-red-400 border-2'; // Red border - auditor action needed
      icon = Clock;
      needsAction = user?.userType === 'auditor';
    }

    return {
      status,
      colorClass,
      borderClass,
      icon,
      needsAction,
      relatedRequest // Return the request for use in button logic
    };
  };

  // 🚀 PRESERVED: Get action button for walkthrough based on user type and status
  const getWalkthroughActionButton = (walkthrough: any) => {
    const statusInfo = getWalkthroughStatusInfo(walkthrough);
    const { relatedRequest } = statusInfo;
    
    // 🚀 CRITICAL: EXACT BUTTON LOGIC - Show send button for auditors only when status is not_scheduled
    const showSendButton = user?.userType === 'auditor' && relatedRequest && relatedRequest.status === 'not_scheduled';
    
    // 🚀 CRITICAL: EXACT BUTTON LOGIC - Show schedule button for clients when status is sent
    const showScheduleButton = user?.userType === 'client' && relatedRequest && relatedRequest.status === 'sent';
    
    // Debug logs from original
    console.log('🔧 BUTTON DEBUG:', {
      walkthroughName: walkthrough.name,
      businessOwner: walkthrough.attendees?.find(a => a.role === 'application_owner')?.name || walkthrough.owner,
      userType: user?.userType,
      relatedRequestExists: !!relatedRequest,
      relatedRequestStatus: relatedRequest?.status,
      showSendButton: showSendButton,
      showScheduleButton: showScheduleButton,
      statusInfoStatus: statusInfo.status
    });
    
    if (showSendButton) {
      return {
        text: 'Send Request',
        icon: Send,
        onClick: () => {
          console.log('🚨 INDIVIDUAL SEND BUTTON CLICKED for:', {
            requestId: relatedRequest.id,
            applicationName: walkthrough.name,
            businessOwner: walkthrough.attendees?.find(a => a.role === 'application_owner')?.name || walkthrough.owner
          });
          
          onIndividualSendRequest(relatedRequest.id, walkthrough.name || walkthrough.application);
        }
      };
    }
    
    if (showScheduleButton) {
      return {
        text: 'Schedule Meeting',
        icon: Calendar,
        onClick: () => {
          console.log('🚨 SCHEDULE MEETING BUTTON CLICKED for:', {
            applicationName: walkthrough.name,
            businessOwner: walkthrough.attendees?.find(a => a.role === 'application_owner')?.name || walkthrough.owner
          });
          
          onOpenScheduling(walkthrough);
        }
      };
    }
    
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Walkthroughs ({walkthroughApplications?.length || 0})
        </h2>
        {/* Hide "Send All Requests" button for clients */}
        {user?.userType === 'auditor' && (
          <button 
            onClick={() => {
              console.log('🚨 BULK SEND CLICKED - onBulkSendWalkthroughRequests called');
              console.log('🚨 BULK SEND - walkthroughRequests length:', walkthroughRequests?.length);
              console.log('🚨 BULK SEND - not_scheduled requests:', walkthroughRequests?.filter(req => req.status === 'not_scheduled').length);
              onBulkSendWalkthroughRequests();
            }}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Send All Requests
          </button>
        )}
      </div>

      {walkthroughApplications && walkthroughApplications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {walkthroughApplications.map((walkthrough, index) => {
            const businessOwner = walkthrough.attendees?.find(a => a.role === 'application_owner')?.name || 
                                 walkthrough.owner || 
                                 'Unknown Owner';
            
            const statusInfo = getWalkthroughStatusInfo(walkthrough);
            const actionButton = getWalkthroughActionButton(walkthrough);
            
            return (
              <AuditCard
                key={walkthrough.id || index}
                id={walkthrough.id}
                title={walkthrough.name || walkthrough.application || `Walkthrough ${index + 1}`}
                subtitle={walkthrough.category || 'Application Walkthrough'}
                description={walkthrough.description || 'Business process walkthrough for application controls and procedures'}
                theme="orange"
                icon={Activity}
                statusInfo={!actionButton ? {
                  status: statusInfo.status,
                  colorClass: statusInfo.colorClass
                } : undefined}
                actionButton={actionButton}
                needsAction={statusInfo.needsAction}
                riskLevel={walkthrough.riskLevel || 'medium'}
                bottomLeftText={businessOwner}
                onClick={() => onWalkthroughClick({
                  id: walkthrough.id,
                  name: walkthrough.name || walkthrough.application,
                  description: walkthrough.description || 'Business process walkthrough',
                  riskLevel: walkthrough.riskLevel || 'medium',
                  owner: businessOwner,
                  category: walkthrough.category || 'Application Walkthrough'
                })}
                getRiskLevelColor={getRiskLevelColor}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Walkthroughs Found</h3>
          <p className="text-gray-600">Upload an Excel file to load walkthrough data</p>
        </div>
      )}
    </div>
  );
};

export default WalkthroughsTab;