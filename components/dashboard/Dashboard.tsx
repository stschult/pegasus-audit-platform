// components/dashboard/Dashboard.tsx - ✅ PHASE 3.2: Enhanced client experience - COMPLETE FULL FILE
'use client';

import React from 'react';
import { Audit, User } from '../../types';
import { CheckCircle, Clock, AlertCircle, FileText, Upload, Users, Building2 } from 'lucide-react';

interface DashboardProps {
  user: User | null;
  selectedAudit: Audit | null;
  onCreateNewAudit: () => void;
  onContinueAudit: () => void;
  onLogout: () => void;
}

export default function Dashboard({
  user,
  selectedAudit,
  onCreateNewAudit,
  onContinueAudit,
  onLogout
}: DashboardProps) {
  // ✅ PHASE 3.2: Role-based messaging and content
  const isClient = user?.userType === 'client';
  
  // ✅ PHASE 3.2: Client-specific welcome messaging
  const getWelcomeMessage = () => {
    if (isClient) {
      return {
        title: "Client Audit Portal",
        subtitle: `Welcome ${user?.name}`,
        description: "Access your audit workspace, upload requested documents, and track progress with your audit team."
      };
    } else {
      return {
        title: "Audit Platform",
        subtitle: `Welcome back, ${user?.name}`,
        description: "Professional audit management for SOC 2, ITGC, and financial audits"
      };
    }
  };

  const welcomeMsg = getWelcomeMessage();

  // ✅ PHASE 3.2: Client-specific action items
  const getClientActionItems = () => [
    {
      id: 'pending-evidence',
      title: 'Evidence Requests',
      description: 'Upload requested documents and evidence',
      count: 3, // This would come from real data
      color: 'red',
      icon: Upload,
      urgent: true
    },
    {
      id: 'under-review',
      title: 'Under Review',
      description: 'Items being reviewed by audit team',
      count: 2,
      color: 'blue',
      icon: Clock,
      urgent: false
    },
    {
      id: 'completed',
      title: 'Completed Items',
      description: 'Evidence approved and accepted',
      count: 8,
      color: 'green',
      icon: CheckCircle,
      urgent: false
    },
    {
      id: 'questions',
      title: 'Questions & Clarifications',
      description: 'Items needing follow-up discussion',
      count: 1,
      color: 'orange',
      icon: AlertCircle,
      urgent: true
    }
  ];

  // ✅ PHASE 3.2: Client progress indicators
  const getClientProgress = () => {
    const totalItems = 14; // This would come from real data
    const completedItems = 8;
    const pendingItems = 3;
    const underReview = 2;
    const questions = 1;
    
    const completionPercentage = Math.round((completedItems / totalItems) * 100);
    
    return {
      completionPercentage,
      totalItems,
      completedItems,
      pendingItems,
      underReview,
      questions,
      nextAction: pendingItems > 0 ? 'Upload pending evidence' : 'Review items under audit'
    };
  };

  const clientProgress = getClientProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{welcomeMsg.title}</h1>
              </div>
              <p className="text-xl text-gray-600">{welcomeMsg.subtitle}</p>
              {/* ✅ PHASE 3.2: Role-based user type indicator */}
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isClient ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isClient ? 'Client User' : 'Auditor'}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 mb-8">{welcomeMsg.description}</p>
          
          {/* ✅ PHASE 3.2: Different primary actions based on user type */}
          {!isClient ? (
            <button
              onClick={onCreateNewAudit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
            >
              Create New Audit
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Audit Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${clientProgress.completionPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>{clientProgress.completedItems} of {clientProgress.totalItems} completed</span>
                <span>{clientProgress.completionPercentage}% complete</span>
              </div>
              <div className="text-sm text-gray-700">
                <strong>Next Action:</strong> {clientProgress.nextAction}
              </div>
            </div>
          )}
        </div>

        {/* ✅ PHASE 3.2: Client-specific action items dashboard */}
        {isClient && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Your Action Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {getClientActionItems().map((item) => {
                const Icon = item.icon;
                const colorClasses = {
                  red: 'bg-red-50 border-red-200 text-red-600',
                  blue: 'bg-blue-50 border-blue-200 text-blue-600',
                  green: 'bg-green-50 border-green-200 text-green-600',
                  orange: 'bg-orange-50 border-orange-200 text-orange-600'
                };
                
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-lg border-2 p-6 hover:shadow-lg transition-all cursor-pointer ${
                      colorClasses[item.color as keyof typeof colorClasses]
                    } ${item.urgent ? 'ring-2 ring-red-200' : ''}`}
                  >
                    {item.urgent && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-8 h-8" />
                      <span className="text-3xl font-bold">{item.count}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Show current audit info */}
        {selectedAudit && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {isClient ? 'Your Current Audit' : 'Recent Audits'}
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div className="text-left">
                  <h3 className="text-lg font-medium text-gray-900">{selectedAudit.clientName}</h3>
                  <p className="text-sm text-gray-500">{selectedAudit.auditType}</p>
                </div>
              </div>
              
              {/* ✅ PHASE 3.2: Different progress messaging */}
              {isClient ? (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${clientProgress.completionPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {clientProgress.completionPercentage}% of your items complete
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 mb-4">Progress: {selectedAudit.progress}%</p>
              )}
              
              <button
                onClick={onContinueAudit}
                className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                  isClient 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isClient ? 'View Your Workspace' : 'Continue Audit'}
              </button>
            </div>
          </div>
        )}

        {/* ✅ PHASE 3.2: Client-specific helpful tips */}
        {isClient && (
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Tips for a Smooth Audit Process
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Upload evidence as soon as requests are received
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Ask questions if any evidence request is unclear
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Keep your contact information updated in settings
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Check back regularly for new requests or updates
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}