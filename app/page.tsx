'use client';

import React, { useState } from 'react';

// Import types
import { 
  User as UserType, Audit, Control, UploadedFile, 
  ExtractedControl, ExtractedITAC, ExtractedKeyReport 
} from '../types';

// Import constants
import { mockUser, mockAudits, mockControls } from '../lib/constants';

// Import utilities
import { 
  parseExcelFile, processControlData, isValidExcelFile, filterControls
} from '../lib/utils';

// Import components
import LoginForm from '../components/auth/LoginForm';
import Navigation from '../components/shared/Navigation';
import AuditDashboard from '../components/dashboard/AuditDashboard';
import CreateNewAudit from '../components/audit/CreateNewAudit';
import AuditSetup from '../components/audit/AuditSetup';
import ControlsView from '../components/controls/ControlsView';
import ControlDetail from '../components/controls/ControlDetail';

export default function AuditPlatform() {
  const [user, setUser] = useState<UserType | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [audits, setAudits] = useState(mockAudits);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentModule, setCurrentModule] = useState('control-mapping');
  const [extractedData, setExtractedData] = useState<{
    controls: ExtractedControl[];
    itacs: ExtractedITAC[];
    keyReports: ExtractedKeyReport[];
  }>({
    controls: [],
    itacs: [],
    keyReports: []
  });

  const handleLogin = (email: string, password: string) => {
    if (password === 'demo123') {
      setUser(mockUser);
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setSelectedAudit(null);
    setSelectedControl(null);
  };

  const handleAuditSelect = (audit: Audit) => {
    setSelectedAudit(audit);
    setSelectedControl(null);
    setCurrentView('audit-setup');
  };

  // Fixed to match original form data structure
  const handleNewAuditSubmit = (auditData: any) => {
    const newAudit: Audit = {
      id: String(audits.length + 1),
      clientName: auditData.companyName,
      relationshipOwner: auditData.clientLead,
      auditOwner: auditData.auditLead,
      progress: 0,
      website: auditData.companyWebsite,
      clientId: auditData.clientUniqueId
    };
    
    setAudits(prev => [...prev, newAudit]);
    alert(`New audit created for ${auditData.companyName}!`);
    setSelectedAudit(newAudit);
    setCurrentView('audit-setup');
  };

  const handleFileUpload = async (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!isValidExcelFile(file)) {
        alert(`${file.name} is not a valid Excel file. Please upload .xlsx or .xls files only.`);
        continue;
      }

      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + i,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(), // Keep as Date object
        status: 'processing'
      };
      
      newFiles.push(uploadedFile);
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Process files
    for (const uploadedFile of newFiles) {
      try {
        const data = await parseExcelFile(uploadedFile.name);
        const processedData = processControlData(data);
        
        setExtractedData(prev => ({
          controls: [...prev.controls, ...processedData.controls],
          itacs: [...prev.itacs, ...processedData.itacs],
          keyReports: [...prev.keyReports, ...processedData.keyReports]
        }));
        
        // Update file status
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'completed' }
              : f
          )
        );
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'error' }
              : f
          )
        );
      }
    }
  };

  const handleViewChange = (view: string) => {
    if (view === 'dashboard') {
      setSelectedAudit(null);
      setSelectedControl(null);
    }
    setCurrentView(view);
  };

  const controls = mockControls;
  const filteredControls = filterControls(controls, searchTerm, selectedStatus, selectedRisk);

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView}
        user={user}
        selectedAudit={selectedAudit}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <AuditDashboard
            user={user}
            audits={audits}
            onAuditSelect={handleAuditSelect}
            onCreateAudit={() => setCurrentView('create-audit')}
          />
        )}

        {currentView === 'create-audit' && (
          <CreateNewAudit
            onBack={() => setCurrentView('dashboard')}
            onSubmit={handleNewAuditSubmit}
          />
        )}

        {currentView === 'audit-setup' && selectedAudit && (
          <AuditSetup
            selectedAudit={selectedAudit}
            currentModule={currentModule}
            onModuleChange={setCurrentModule}
            onBack={() => setCurrentView('dashboard')}
            uploadedFiles={uploadedFiles}
            extractedData={extractedData}
            onFileUpload={handleFileUpload}
          />
        )}

        {currentView === 'controls' && selectedAudit && (
          <ControlsView
            selectedAudit={selectedAudit}
            controls={filteredControls}
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            selectedRisk={selectedRisk}
            onSearchChange={setSearchTerm}
            onStatusChange={setSelectedStatus}
            onRiskChange={setSelectedRisk}
            onControlSelect={(control) => {
              setSelectedControl(control);
              setCurrentView('control-detail');
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'control-detail' && selectedControl && (
          <ControlDetail
            selectedControl={selectedControl}
            onBack={() => {
              setCurrentView('controls');
              setSelectedControl(null);
            }}
          />
        )}
      </main>
    </div>
  );
}