// File: src/components/audit/tabs/WalkthroughsTab.tsx - Dark Theme Modern Design
'use client';

import React from 'react';
import { 
  Download, 
  Send, 
  AlertTriangle, 
  Eye, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock,
  Check
} from 'lucide-react';

// Import types from your main types file
import { WalkthroughApplication, WalkthroughRequest, User } from '../types';

interface Application {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

interface WalkthroughsTabProps {
  walkthroughApplications: WalkthroughApplication[];
  walkthroughRequests: WalkthroughRequest[];
  user: User | null;
  onBulkSendRequests: () => void;
  onIndividualSendRequest: (requestId: string, applicationName: string) => void;
  onOpenScheduling: (application: Application) => void;
  onWalkthroughClick: (application: Application) => void;
  onOpenCompletion?: (application: Application, request: WalkthroughRequest) => void;
}

// Description parser function
const parseWalkthroughDescription = (description: string) => {
  if (!description) return null;
  
  // Split by double newlines to get sections
  const sections = description.split('\n\n').filter(section => section.trim());
  
  if (sections.length === 0) return null;
  
  // Find the business process line (usually the first or second section)
  const businessProcessSection = sections.find(section => 
    section.includes('Business process walkthrough') || 
    section.includes('walkthrough for') ||
    section.includes('process walkthrough')
  );
  
  // Find numbered sections (sections that start with digits followed by a period)
  const numberedSections = sections.filter(section => 
    /^\d+\./.test(section.trim())
  );
  
  return {
    businessProcess: businessProcessSection?.trim(),
    numberedSections: numberedSections.map(section => section.trim())
  };
};

// Formatted Description Component - Dark Theme
const FormattedDescription: React.FC<{ description: string }> = ({ description }) => {
  const parsedDescription = parseWalkthroughDescription(description);
  
  if (!parsedDescription) {
    // Fallback to original rendering if parsing fails
    return (
      <div className="text-sm text-gray-300 mb-4 max-h-24 overflow-y-auto whitespace-pre-line font-inter">
        {description}
      </div>
    );
  }
  
  return (
    <div className="text-sm text-gray-300 mb-4 max-h-24 overflow-y-auto font-inter">
      <div className="font-medium text-gray-200 mb-2">What we will cover:</div>
      
      {parsedDescription.businessProcess && (
        <div className="mb-3 text-gray-300">
          {parsedDescription.businessProcess}
        </div>
      )}
      
      {parsedDescription.numberedSections.length > 0 && (
        <div>
          <div className="font-medium text-gray-200 mb-2">Key Control Descriptions:</div>
          <div className="space-y-2">
            {parsedDescription.numberedSections.map((section, index) => (
              <div key={index} className="text-sm text-gray-300">
                {section}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const WalkthroughsTab: React.FC<WalkthroughsTabProps> = ({
  walkthroughApplications,
  walkthroughRequests,
  user,
  onBulkSendRequests,
  onIndividualSendRequest,
  onOpenScheduling,
  onWalkthroughClick,
  onOpenCompletion
}) => {
  return (
    <div className="bg-gray-800 min-h-screen -m-8 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          Walkthroughs ({walkthroughApplications?.length || 0})
        </h2>
        <div className="flex items-center gap-3">
          {/* Bulk Send Button for auditors */}
          {user?.userType === 'auditor' && walkthroughApplications && walkthroughApplications.length > 0 && (
            <button 
              onClick={onBulkSendRequests}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ease-out font-medium shadow-lg"
            >
              <Send className="h-4 w-4 mr-2" />
              Send All Requests
            </button>
          )}
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 ease-out font-medium shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Export Walkthroughs
          </button>
        </div>
      </div>

      {/* Timeline Alert for auditors - Dark Theme */}
      {user?.userType === 'auditor' && walkthroughApplications && walkthroughApplications.length > 0 && (
        <div className="bg-[#1F1F1F] border border-[#EF4444]/20 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-[#EF4444] mb-1 font-inter">Walkthrough Timeline Alert</h3>
              <p className="text-sm text-gray-300 mb-2 font-inter">
                {walkthroughApplications.length} walkthroughs need to be scheduled and completed within the first week of the audit period.
              </p>
              <p className="text-xs text-gray-400 font-inter">
                Send requests to client now to allow time for coordination with business owners.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough Cards - Dark Theme */}
      {walkthroughApplications && walkthroughApplications.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 bg-gray-800 p-6 rounded-lg">
          {walkthroughApplications.map((walkthrough, index) => {
            const applicationName = walkthrough.name;
            const businessOwner = walkthrough.owner;
            
            // Get the status from walkthroughRequests if available
            const relatedRequest = walkthroughRequests?.find(req => 
              req.applicationName === applicationName && 
              req.businessOwner === businessOwner
            );
            
            const status = relatedRequest?.status || 'draft';
            const needsAction = user?.userType === 'auditor' && status === 'draft';
            
            // Dynamic border and hover effects
            const borderClass = needsAction 
              ? 'border-[#EF4444] border-2 shadow-red-500/25' 
              : 'border-gray-700 hover:border-transparent';
            
            const hoverGradient = 'hover:bg-gradient-to-r hover:from-[#3A8DFF]/10 hover:via-transparent hover:to-[#1FD1A4]/10 hover:border-gradient-to-r hover:border-[#3A8DFF] hover:border-[#1FD1A4]';
            
            return (
              <div
                key={`${applicationName}-${businessOwner}-${index}`}
                onClick={() => {
                  onWalkthroughClick({
                    id: walkthrough.id,
                    name: applicationName,
                    description: walkthrough.description,
                    riskLevel: walkthrough.riskLevel,
                    owner: businessOwner,
                    category: walkthrough.category
                  });
                }}
                className={`bg-orange-100 border rounded-lg p-6 hover:shadow-2xl transition-all duration-200 ease-out group overflow-hidden cursor-pointer relative ${borderClass}`}
                style={{
                  boxShadow: needsAction 
                    ? '0 0 0 1px #EF4444, 0 10px 25px rgba(239, 68, 68, 0.15)' 
                    : '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!needsAction) {
                    e.currentTarget.style.boxShadow = '0 0 0 2px transparent, 0 0 0 4px rgba(58, 141, 255, 0.3), 0 20px 40px rgba(0, 0, 0, 0.4)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(254, 215, 170, 0.05))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!needsAction) {
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.background = 'rgb(255 247 237)';
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-3 bg-[#3A8DFF]/20 rounded-xl group-hover:bg-[#3A8DFF]/30 transition-all duration-200 ease-out flex-shrink-0">
                      <Eye className="h-5 w-5 text-[#3A8DFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-[#3A8DFF] transition-colors duration-200 ease-out truncate font-inter">
                        {applicationName}
                      </h3>
                      <p className="text-sm text-gray-400 truncate font-inter">{businessOwner}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
                    {/* Risk Level Chip */}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap font-inter ${
                      walkthrough.riskLevel?.toLowerCase() === 'high' 
                        ? 'bg-[#EF4444] text-white' 
                        : walkthrough.riskLevel?.toLowerCase() === 'medium'
                        ? 'bg-[#F59E0B] text-white'
                        : 'bg-[#10B981] text-white'
                    }`}>
                      {walkthrough.riskLevel?.toUpperCase()}
                    </span>
                    
                    {/* Status badges with role-based display */}
                    {user?.userType === 'auditor' && status === 'draft' && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-[#EF4444] text-white font-inter">
                        <AlertTriangle size={12} />
                        <span className="truncate max-w-24">Send Request</span>
                      </div>
                    )}
                    {status === 'sent' && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-[#3A8DFF] text-white font-inter">
                        <Clock size={12} />
                        <span className="truncate max-w-24">
                          {user?.userType === 'client' ? 'Schedule Required' : 'Awaiting Response'}
                        </span>
                      </div>
                    )}
                    {status === 'scheduled' && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-[#10B981] text-white font-inter">
                        <CheckCircle size={12} />
                        <span className="truncate max-w-24">Scheduled</span>
                      </div>
                    )}
                    {status === 'completed' && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-[#1FD1A4] text-white font-inter">
                        <CheckCircle size={12} />
                        <span className="truncate max-w-24">Completed</span>
                      </div>
                    )}
                    {status === 'cancelled' && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-[#EF4444] text-white font-inter">
                        <AlertTriangle size={12} />
                        <span className="truncate max-w-24">Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Updated Description Rendering - Dark Theme */}
                <FormattedDescription description={walkthrough.description} />
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center space-x-1 text-gray-400 flex-1 min-w-0 font-inter">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{businessOwner}</span>
                  </div>
                </div>

                {/* Action Buttons Section - Dark Theme */}
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  {/* AUDITOR ACTIONS */}
                  {user?.userType === 'auditor' && (
                    <>
                      {status === 'draft' && relatedRequest && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onIndividualSendRequest(relatedRequest.id, applicationName);
                          }}
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#3A8DFF] text-white text-sm font-medium rounded-xl hover:bg-[#2B7DE8] transition-all duration-200 ease-out font-inter shadow-lg hover:shadow-blue-500/25"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Request
                        </button>
                      )}
                      
                      {status === 'scheduled' && relatedRequest && onOpenCompletion && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCompletion({
                              id: walkthrough.id,
                              name: applicationName,
                              description: walkthrough.description,
                              riskLevel: walkthrough.riskLevel,
                              owner: businessOwner,
                              category: walkthrough.category
                            }, relatedRequest);
                          }}
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#10B981] text-white text-sm font-medium rounded-xl hover:bg-[#059669] transition-all duration-200 ease-out font-inter shadow-lg hover:shadow-green-500/25"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </button>
                      )}
                      
                      {status === 'sent' && (
                        <div className="text-center text-sm text-gray-400 py-2 font-inter">
                          Waiting for client to schedule
                        </div>
                      )}
                      
                      {status === 'completed' && (
                        <div className="text-center text-sm text-[#1FD1A4] py-2 font-medium font-inter">
                          ✅ Walkthrough Completed
                        </div>
                      )}
                      
                      {status === 'cancelled' && (
                        <div className="text-center text-sm text-[#EF4444] py-2 font-medium font-inter">
                          ❌ Walkthrough Cancelled
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
                            e.stopPropagation();
                            onOpenScheduling({
                              id: walkthrough.id,
                              name: applicationName,
                              description: walkthrough.description,
                              riskLevel: walkthrough.riskLevel,
                              owner: businessOwner,
                              category: walkthrough.category
                            });
                          }}
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#10B981] text-white text-sm font-medium rounded-xl hover:bg-[#059669] transition-all duration-200 ease-out font-inter shadow-lg hover:shadow-green-500/25"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Walkthrough
                        </button>
                      )}
                      {status === 'scheduled' && (
                        <div className="text-center text-sm text-[#10B981] py-2 font-medium font-inter">
                          ✅ Walkthrough Scheduled
                        </div>
                      )}
                      {status === 'completed' && (
                        <div className="text-center text-sm text-[#1FD1A4] py-2 font-medium font-inter">
                          ✅ Walkthrough Completed
                        </div>
                      )}
                      {status === 'cancelled' && (
                        <div className="text-center text-sm text-[#EF4444] py-2 font-medium font-inter">
                          ❌ Walkthrough Cancelled
                        </div>
                      )}
                      {status === 'draft' && (
                        <div className="text-center text-sm text-gray-400 py-2 font-inter">
                          Waiting for auditor to send request
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2 font-inter">No Walkthrough Applications Found</h3>
          <p className="text-gray-400 font-inter">Upload an Excel file with Key Reports to extract walkthrough applications</p>
        </div>
      )}
    </div>
  );
};

export default WalkthroughsTab;