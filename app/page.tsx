// app/page.tsx - Clean and modular
'use client';

import React from 'react';
import LoginPage from '../components/auth/LoginPage';
import Dashboard from '../components/dashboard/Dashboard';
import CreateNewAudit from '../components/audit/CreateNewAudit';
import AuditSetup from '../components/audit/AuditSetup';
import { useAppState } from '../hooks/useAppState';

export default function Home() {
  const {
    // State
    currentView,
    selectedAudit,
    extractedData,
    uploadedFiles,
    currentModule,
    user,
    // Actions
    handleLogin,
    handleLogout,
    handleAuditSubmit,
    handleFileUpload,
    handleBackToDashboard,
    handleCreateNewAudit,
    handleContinueAudit,
    setCurrentModule
  } = useAppState();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login View */}
      {currentView === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}

      {/* Dashboard View */}
      {currentView === 'dashboard' && (
        <Dashboard
          user={user}
          selectedAudit={selectedAudit}
          onCreateNewAudit={handleCreateNewAudit}
          onContinueAudit={handleContinueAudit}
          onLogout={handleLogout}
        />
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
        <AuditSetup
          selectedAudit={selectedAudit}
          onBack={handleBackToDashboard}
          currentModule={currentModule}
          onModuleChange={setCurrentModule}
          uploadedFiles={uploadedFiles}
          extractedData={extractedData}
          onFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
}