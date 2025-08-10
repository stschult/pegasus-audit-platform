// File: app/page.tsx - CLEAN PRODUCTION VERSION
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import LoginPage from '../components/auth/LoginPage';
import LoginAuditor from '../components/auth/LoginAuditor';
import LoginClient from '../components/auth/LoginClient';
import CreateNewAudit from '../components/audit/CreateNewAudit';
import AuditSetup from '../components/audit/AuditSetup';
import { useAppState } from '../hooks/useAppState';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [loginType, setLoginType] = useState<'default' | 'auditor' | 'client'>('default');
  const [showDevTools, setShowDevTools] = useState(false);

  const {
    currentView,
    selectedAudit,
    extractedData,
    uploadedFiles,
    currentModule,
    user,
    isInitialized,
    handleLogin,
    handleLogout,
    handleAuditSubmit,
    handleFileUpload,
    handleBackToDashboard,
    handleCreateNewAudit,
    handleContinueAudit,
    setCurrentModule,
    handleClearAll
  } = useAppState();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginParam = urlParams.get('login');
    
    if (loginParam === 'auditor') {
      setLoginType('auditor');
    } else if (loginParam === 'client') {
      setLoginType('client');
    } else if (pathname === '/login/auditor') {
      setLoginType('auditor');
    } else if (pathname === '/login/client') {
      setLoginType('client');
    } else {
      setLoginType('default');
    }
  }, [pathname]);

  const handleDualUserLogin = (email: string, password: string, userType?: 'auditor' | 'client') => {
    if (userType) {
      handleLogin(email, password, userType);
    } else {
      const detectedUserType = email.includes('@audit') || email.includes('auditor') ? 'auditor' : 'client';
      handleLogin(email, password, detectedUserType);
    }
  };

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Clean header with logout */}
      {user && (
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white">
                  {user.userType === 'auditor' ? 'Auditor Portal' : 'Client Portal'}
                </h1>
                <span className="ml-3 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                  {user.name}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Dev Tools Toggle (for testing only) */}
                <button
                  onClick={() => setShowDevTools(!showDevTools)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg"
                  title="Toggle dev tools"
                >
                  <Settings className="h-4 w-4" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Dev Tools (hidden by default) */}
      {showDevTools && user && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="text-xs text-yellow-800">
              <strong>Dev Mode:</strong> currentView: {currentView} | user: {user.email} | loginType: {loginType}
            </div>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}

      {/* Login View */}
      {currentView === 'login' && (
        <div>
          {loginType === 'auditor' && <LoginAuditor onLogin={handleDualUserLogin} />}
          {loginType === 'client' && <LoginClient onLogin={handleDualUserLogin} />}
          {loginType === 'default' && <LoginPage onLogin={handleDualUserLogin} />}
        </div>
      )}

      {/* Dashboard View */}
      {currentView === 'dashboard' && (
        <div className="min-h-screen bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Welcome, {user?.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="bg-blue-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">Your Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300"><strong>Email:</strong> {user?.email}</p>
                    <p className="text-gray-300"><strong>Role:</strong> {user?.role}</p>
                    <p className="text-gray-300"><strong>Organization:</strong> {user?.organization}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  {user?.userType === 'auditor' && (
                    <button
                      onClick={handleCreateNewAudit}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Create New Audit
                    </button>
                  )}

                  {user?.userType === 'client' && (
                    <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-300 mb-2">No Active Audit</h3>
                      <p className="text-gray-300 text-sm">
                        No audit found for your domain ({user?.email?.split('@')[1]}). 
                        Please contact your audit team to set up your audit.
                      </p>
                    </div>
                  )}

                  {selectedAudit && (
                    <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                      <h3 className="font-semibold text-green-300 mb-2">Active Audit</h3>
                      <p className="text-sm text-gray-300">
                        {selectedAudit.companyName} - {selectedAudit.auditType}
                      </p>
                      <button
                        onClick={handleContinueAudit}
                        className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                      >
                        Continue Audit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Audit View */}
      {currentView === 'create-audit' && (
        <CreateNewAudit
          onBack={handleBackToDashboard}
          onSubmit={handleAuditSubmit}
        />
      )}

      {/* Audit Setup View */}
      {currentView === 'audit-setup' && selectedAudit && (
        <div>
          {user?.userType === 'client' && (
            <div className="bg-green-800 border-b border-green-700 p-3">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-green-300 text-sm">
                  <strong>✅ Auto-matched to audit:</strong> {selectedAudit.companyName} ({selectedAudit.auditType})
                </p>
              </div>
            </div>
          )}
          <AuditSetup
            selectedAudit={selectedAudit}
            onBack={handleBackToDashboard}
            currentModule={currentModule}
            onModuleChange={setCurrentModule}
            uploadedFiles={uploadedFiles}
            extractedData={extractedData}
            onFileUpload={handleFileUpload}
          />
        </div>
      )}
    </div>
  );
}