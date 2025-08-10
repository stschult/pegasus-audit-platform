// components/audit/cards/WalkthroughCard.tsx
'use client';

import React from 'react';
import { 
  Eye, 
  Send, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

// Type definitions
interface WalkthroughApplication {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

interface WalkthroughRequest {
  id: string;
  applicationName: string;
  businessOwner: string;
  status: 'draft' | 'sent' | 'scheduled' | 'completed' | 'cancelled';
  auditId: string;
  sentAt?: string;
}

interface Application {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

interface User {
  userType: 'auditor' | 'client';
}

interface WalkthroughCardProps {
  walkthrough: WalkthroughApplication;
  relatedRequest?: WalkthroughRequest;
  user: User | null;
  onIndividualSendRequest: (requestId: string, applicationName: string) => void;
  onOpenScheduling: (application: Application) => void;
  onWalkthroughClick: (application: Application) => void;
  index: number;
}

const WalkthroughCard: React.FC<WalkthroughCardProps> = ({
  walkthrough,
  relatedRequest,
  user,
  onIndividualSendRequest,
  onOpenScheduling,
  onWalkthroughClick,
  index
}) => {
  const applicationName = walkthrough.name;
  const businessOwner = walkthrough.owner;
  const status = relatedRequest?.status || 'draft';
  const needsAction = user?.userType === 'auditor' && status === 'draft';
  const borderClass = needsAction ? 'border-red-400 border-2' : 'border-gray-200';

  // ✅ FIXED: Handle card click to open details
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onWalkthroughClick({
      id: walkthrough.id,
      name: applicationName,
      description: walkthrough.description,
      riskLevel: walkthrough.riskLevel,
      owner: businessOwner,
      category: walkthrough.category
    });
  };

  return (
    <div
      key={`${applicationName}-${businessOwner}-${index}`}
      onClick={handleCardClick}
      className={`bg-white border rounded-lg p-6 hover:shadow-lg transition-all group overflow-hidden cursor-pointer hover:border-orange-300 ${borderClass}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors flex-shrink-0">
            <Eye className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors truncate">
              {applicationName}
            </h3>
            <p className="text-sm text-gray-500 truncate">{businessOwner}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
          <span className="px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-orange-100 text-orange-600">
            {walkthrough.riskLevel.toUpperCase()}
          </span>
          {/* Status badges with role-based display */}
          {user?.userType === 'auditor' && status === 'draft' && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700">
              <AlertTriangle size={12} />
              <span className="truncate max-w-24">Send Request</span>
            </div>
          )}
          {status === 'sent' && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-blue-100 text-blue-700">
              <Clock size={12} />
              <span className="truncate max-w-24">
                {user?.userType === 'client' ? 'Schedule Required' : 'Awaiting Response'}
              </span>
            </div>
          )}
          {status === 'scheduled' && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-green-100 text-green-700">
              <CheckCircle size={12} />
              <span className="truncate max-w-24">Scheduled</span>
            </div>
          )}
          {status === 'cancelled' && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-700">
              <AlertTriangle size={12} />
              <span className="truncate max-w-24">Cancelled</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4 max-h-24 overflow-y-auto">
        {walkthrough.description.split('\n').map((line, index) => (
          <div key={index}>{line || '\u00A0'}</div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center space-x-1 text-gray-500 flex-1 min-w-0">
          <Users className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{businessOwner}</span>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        {/* AUDITOR ACTIONS */}
        {user?.userType === 'auditor' && (
          <>
            {status === 'draft' && relatedRequest && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when clicking button
                  onIndividualSendRequest(relatedRequest.id, applicationName);
                }}
                className="w-full inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </button>
            )}
            {status !== 'draft' && (
              <div className="text-center text-sm text-gray-500 py-2">
                {status === 'sent' && 'Waiting for client to schedule'}
                {status === 'scheduled' && 'Scheduled - Ready for walkthrough'}
                {status === 'completed' && 'Walkthrough completed'}
                {status === 'cancelled' && 'Walkthrough cancelled'}
              </div>
            )}
          </>
        )}

        {/* CLIENT ACTIONS */}
        {user?.userType === 'client' && (
          <>
            {status === 'sent' && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when clicking button
                  onOpenScheduling({
                    id: walkthrough.id,
                    name: applicationName,
                    description: walkthrough.description,
                    riskLevel: walkthrough.riskLevel,
                    owner: businessOwner,
                    category: walkthrough.category
                  });
                }}
                className="w-full inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Walkthrough
              </button>
            )}
            {status === 'scheduled' && (
              <div className="text-center text-sm text-green-600 py-2 font-medium">
                ✅ Walkthrough Scheduled
              </div>
            )}
            {status === 'cancelled' && (
              <div className="text-center text-sm text-red-600 py-2 font-medium">
                ❌ Walkthrough Cancelled
              </div>
            )}
            {status === 'draft' && (
              <div className="text-center text-sm text-gray-500 py-2">
                Waiting for auditor to send request
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalkthroughCard;