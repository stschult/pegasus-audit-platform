'use client';

import React, { useState } from 'react';
import { 
  User, FileText, AlertTriangle, Calendar, Building2, Plus, Search, Filter, 
  Upload, Eye, CheckCircle, Clock, AlertCircle, XCircle, ArrowLeft, ArrowRight,
  Settings
} from 'lucide-react';

// Import types
import { 
  User as UserType, 
  Audit, 
  Control, 
  AuditFormData, 
  UploadedFile, 
  ExtractedControl, 
  ExtractedITAC, 
  ExtractedKeyReport,
  ExcelData
} from '../types';

// Import constants
import { 
  mockUser, 
  mockAudits, 
  mockControls, 
  STATUS_LABELS, 
  STATUS_COLORS,
  AUDIT_TYPE_OPTIONS,
  AUDIT_MODULES
} from '../lib/constants';

// Import utilities
import { 
  filterControls, 
  formatFileSize, 
  getRiskRatingColor, 
  isValidExcelFile,
  parseExcelFile 
} from '../lib/utils';

// Import components
import LoginForm from '../components/auth/LoginForm';
import Navigation from '../components/shared/Navigation';
import AuditSetup from '../components/audit/AuditSetup';
import CreateNewAudit from '../components/audit/CreateNewAudit';

// Component interfaces
interface AuditDashboardProps {
  onAuditSelect: (audit: Audit) => void;
  onCreateNewAudit: () => void;
}

export default function AuditDashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // AuditSetup specific state
  const [currentModule, setCurrentModule] = useState('itgcs');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [extractedData, setExtractedData] = useState<ExcelData>({
    controls: [],
    itacs: [],
    keyReports: []
  });

  const handleLogin = (email: string, password: string) => {
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setSelectedAudit(null);
    setSelectedControl(null);
  };

  const handleAuditSelect = (audit: Audit) => {
    setSelectedAudit(audit);
    setSelectedControl(null);
    setCurrentView('audit-setup');
  };

  const handleCreateNewAudit = () => {
    setCurrentView('create-audit');
  };

  const handleAuditSubmit = (formData: AuditFormData) => {
    const newAudit: Audit = {
      id: `audit-${Date.now()}`,
      clientName: formData.companyName || 'Test Company',
      relationshipOwner: formData.clientLead || 'Test Client Lead',
      auditOwner: formData.auditLead || 'Test Audit Lead',
      progress: 0,
      website: formData.website || 'test.com',
      clientId: formData.clientId || `TEST-${Date.now()}`
    };
    
    setSelectedAudit(newAudit);
    setCurrentView('audit-setup');
  };

  const handleControlSelect = (control: Control) => {
    setSelectedControl(control);
    setCurrentView('control-detail');
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      setSelectedAudit(null);
      setSelectedControl(null);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      // Process each file
      for (const file of files) {
        if (isValidExcelFile(file)) {
          const data = await parseExcelFile(file);
          setExtractedData(data);
          
          // Add to uploaded files list
          const uploadedFile: UploadedFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            status: 'completed'
          };
          setUploadedFiles(prev => [...prev, uploadedFile]);
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const filteredControls = filterControls(mockControls, searchTerm, statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentView={currentView}
        user={user}
        selectedAudit={selectedAudit}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && (
          <AuditDashboardComponent 
            onAuditSelect={handleAuditSelect}
            onCreateNewAudit={handleCreateNewAudit}
          />
        )}

        {currentView === 'create-audit' && (
          <CreateNewAudit
            onBack={() => setCurrentView('dashboard')}
            onSubmit={handleAuditSubmit}
          />
        )}

        {currentView === 'audit-setup' && selectedAudit && (
          <AuditSetup
            selectedAudit={selectedAudit}
            onBack={() => setCurrentView('dashboard')}
            currentModule={currentModule}
            onModuleChange={setCurrentModule}
            uploadedFiles={uploadedFiles}
            extractedData={extractedData}
            onFileUpload={handleFileUpload}
          />
        )}

        {currentView === 'control-detail' && selectedControl && (
          <ControlDetailView
            control={selectedControl}
            onBack={() => setCurrentView('dashboard')}
            onStatusUpdate={(controlId: string, newStatus: Control['status']) => {
              console.log('Status update:', controlId, newStatus);
            }}
          />
        )}
      </main>
    </div>
  );
}

// Audit Dashboard Component
function AuditDashboardComponent({ onAuditSelect, onCreateNewAudit }: AuditDashboardProps) {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
          <p className="text-gray-600">Manage your ongoing audits and assessments</p>
        </div>
        <button
          onClick={onCreateNewAudit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New Audit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAudits.map((audit) => (
          <div
            key={audit.id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onAuditSelect(audit)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{audit.clientName}</h3>
                <p className="text-sm text-gray-600">{audit.clientId}</p>
              </div>
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{audit.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${audit.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Relationship Owner</span>
                <span className="font-medium">{audit.relationshipOwner}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Audit Owner</span>
                <span className="font-medium">{audit.auditOwner}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Website</span>
                <span className="font-medium text-blue-600">{audit.website}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Control Detail View Component
function ControlDetailView({ 
  control, 
  onBack, 
  onStatusUpdate 
}: {
  control: Control;
  onBack: () => void;
  onStatusUpdate: (controlId: string, newStatus: Control['status']) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<Control['status']>(control.status);
  const [notes, setNotes] = useState('');

  const handleStatusChange = (newStatus: Control['status']) => {
    setSelectedStatus(newStatus);
    onStatusUpdate(control.id, newStatus);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{control.name}</h1>
          <p className="text-gray-600">{control.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-6">{control.description}</p>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value as Control['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Rating
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskRatingColor(control.riskRating)}`}>
                {control.riskRating}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Family
              </label>
              <p className="text-gray-900">{control.controlFamily}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Updated
              </label>
              <p className="text-gray-900">{control.lastUpdated}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Testing Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add testing notes, observations, or findings..."
          />
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence Upload</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
            <p className="text-sm text-gray-500">Supports: PDF, DOCX, XLSX, PNG, JPG</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
            Save Changes
          </button>
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}