'use client';

import React, { useState } from 'react';
import { 
  User, FileText, AlertTriangle, Calendar, Building2, Plus, Search, Filter, 
  Upload, Eye, CheckCircle, Clock, AlertCircle, XCircle, ArrowLeft, ArrowRight,
  Settings
} from 'lucide-react';
import * as XLSX from 'xlsx';

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
  createdAudits: Audit[];
}

export default function AuditDashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // FIXED: Start with overview tab when audit is selected
  const [currentModule, setCurrentModule] = useState('overview');
  
  // FIXED: Audit-scoped data instead of global state
  const [auditDataMap, setAuditDataMap] = useState<Record<string, ExcelData>>({});
  const [auditFilesMap, setAuditFilesMap] = useState<Record<string, UploadedFile[]>>({});
  
  // PROBLEM 2 FIX: Separate state for created audits
  const [createdAudits, setCreatedAudits] = useState<Audit[]>([]);

  // Helper to get current audit's data
  const getCurrentAuditData = (): ExcelData => {
    if (!selectedAudit) {
      return { controls: [], itacs: [], keyReports: [] };
    }
    return auditDataMap[selectedAudit.id] || { controls: [], itacs: [], keyReports: [] };
  };

  // Helper to get current audit's files
  const getCurrentAuditFiles = (): UploadedFile[] => {
    if (!selectedAudit) {
      return [];
    }
    return auditFilesMap[selectedAudit.id] || [];
  };

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
    setCurrentModule('overview'); // FIXED: Start with overview
    setCurrentView('audit-setup');
  };

  const handleCreateNewAudit = () => {
    setCurrentView('create-audit');
  };

  // FIXED: Accept full Excel data and store everything
  const handleAuditSubmit = (formData: AuditFormData, excelData?: any) => {
    const newAudit: Audit = {
      id: `audit-${Date.now()}`,
      clientName: formData.companyName || 'Test Company',
      relationshipOwner: formData.clientLead || 'Test Client Lead',
      auditOwner: formData.auditLead || 'Test Audit Lead',
      progress: 0,
      website: formData.website || 'test.com',
      clientId: formData.clientId || `TEST-${Date.now()}`
    };
    
    // PROBLEM 2 FIX: Add to created audits so it shows in dashboard
    setCreatedAudits(prev => [...prev, newAudit]);
    
    // FIXED: Store ALL Excel data if it was uploaded during audit creation
    if (excelData) {
      console.log(`🎯 Storing full Excel data for new audit: ${newAudit.clientName}`);
      console.log(`📊 Data includes:`, {
        controls: excelData.controls?.length || 0,
        itacs: excelData.itacs?.length || 0,
        keyReports: excelData.keyReports?.length || 0
      });
      
      // Store the complete Excel data
      setAuditDataMap(prev => ({
        ...prev,
        [newAudit.id]: {
          controls: excelData.controls || [],
          itacs: excelData.itacs || [],
          keyReports: excelData.keyReports || []
        }
      }));
      
      console.log(`✅ Full Excel data stored for ${newAudit.clientName}!`);
    }
    
    setSelectedAudit(newAudit);
    setCurrentModule('overview'); // FIXED: Start with overview
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

  // PROBLEM 1 FIX: Enhanced Excel parsing to read all relevant tabs
  const handleFileUpload = async (files: File[]) => {
    if (!selectedAudit) {
      alert('Please select an audit first');
      return;
    }

    try {
      for (const file of files) {
        if (isValidExcelFile(file)) {
          // PROBLEM 1 FIX: Parse all tabs with flexible naming
          const data = await parseExcelFileAllTabs(file);
          
          // Store data for THIS SPECIFIC AUDIT ONLY
          setAuditDataMap(prev => ({
            ...prev,
            [selectedAudit.id]: data
          }));
          
          console.log(`✅ Data uploaded for ${selectedAudit.clientName} ONLY`);
          console.log(`📊 ${selectedAudit.clientName} now has:`, {
            controls: data.controls.length,
            itacs: data.itacs.length,
            keyReports: data.keyReports.length
          });
          
          // Add to uploaded files list FOR THIS AUDIT ONLY
          const uploadedFile: UploadedFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            status: 'completed'
          };
          
          setAuditFilesMap(prev => ({
            ...prev,
            [selectedAudit.id]: [...(prev[selectedAudit.id] || []), uploadedFile]
          }));
          
          console.log(`📁 File added to ${selectedAudit.clientName} ONLY`);
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  // FIXED: Enhanced parseExcelFileAllTabs with better duplicate detection
  const parseExcelFileAllTabs = async (file: File): Promise<ExcelData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer);
          
          let controls: ExtractedControl[] = [];
          let itacs: ExtractedITAC[] = [];
          let keyReports: ExtractedKeyReport[] = [];
          
          console.log(`📋 Processing Excel file with ${workbook.SheetNames.length} sheets:`, workbook.SheetNames);
          
          // FIXED: Track processed sheets to avoid duplicates
          const processedSheets = {
            controls: [] as string[],
            itacs: [] as string[],
            keyReports: [] as string[]
          };
          
          // Check all sheet names and categorize them
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            
            const lowerSheetName = sheetName.toLowerCase();
            
            // FIXED: Flexible tab name detection with duplicate prevention
            if (lowerSheetName.includes('itgc') || lowerSheetName.includes('control')) {
              console.log(`📊 Found controls in sheet: ${sheetName}`);
              const parsedControls = parseControlsFromSheet(sheetData, sheetName);
              controls = [...controls, ...parsedControls];
              processedSheets.controls.push(sheetName);
            }
            else if (lowerSheetName.includes('itac') || lowerSheetName.includes('application')) {
              console.log(`📊 Found ITACs in sheet: ${sheetName}`);
              // FIXED: Only process if we haven't already processed an ITAC sheet
              if (processedSheets.itacs.length === 0) {
                const parsedITACs = parseITACsFromSheet(sheetData, sheetName);
                itacs = [...itacs, ...parsedITACs];
                processedSheets.itacs.push(sheetName);
                console.log(`✅ Processed ITAC sheet: ${sheetName} (${parsedITACs.length} ITACs)`);
              } else {
                console.log(`⚠️ Skipping duplicate ITAC sheet: ${sheetName}`);
              }
            }
            else if (lowerSheetName.includes('report') || lowerSheetName.includes('key report')) {
              console.log(`📊 Found key reports in sheet: ${sheetName}`);
              const parsedReports = parseReportsFromSheet(sheetData, sheetName);
              keyReports = [...keyReports, ...parsedReports];
              processedSheets.keyReports.push(sheetName);
            }
          });
          
          console.log(`✅ Final parsed results:`);
          console.log(`   - Controls: ${controls.length} from sheets: ${processedSheets.controls.join(', ')}`);
          console.log(`   - ITACs: ${itacs.length} from sheets: ${processedSheets.itacs.join(', ')}`);
          console.log(`   - Key Reports: ${keyReports.length} from sheets: ${processedSheets.keyReports.join(', ')}`);
          
          resolve({ controls, itacs, keyReports });
        } catch (error) {
          console.error('Excel parsing error:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Helper functions for parsing different sheet types
  const parseControlsFromSheet = (data: any[][], sheetName: string): ExtractedControl[] => {
    if (data.length < 3) return [];
    
    const controls: ExtractedControl[] = [];
    
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[2] || !row[3]) continue;
      
      try {
        const control: ExtractedControl = {
          id: row[2]?.toString().trim() || `CTRL-${i}`,
          name: row[3]?.toString().trim() || 'Unnamed Control',
          description: row[3]?.toString().trim() || 'No description',
          riskRating: parseRiskRating(row[4]?.toString() || 'M'),
          controlFamily: 'ITGC',
          testingStatus: 'Not Started'
        };
        
        controls.push(control);
      } catch (err) {
        console.warn(`Error parsing control row ${i + 1}:`, err);
      }
    }
    
    return controls;
  };

  // FIXED: parseITACsFromSheet - Skip header/summary rows properly
  const parseITACsFromSheet = (data: any[][], sheetName: string): ExtractedITAC[] => {
    if (data.length < 2) return [];
    
    const itacs: ExtractedITAC[] = [];
    const seenIds = new Set<string>();
    
    console.log(`🔍 ITAC Sheet "${sheetName}" has ${data.length} rows`);
    
    // Start from row 1 (index 1) to skip just the header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row || row.length === 0) {
        console.log(`⚠️ Skipping empty row ${i + 1}`);
        continue;
      }
      
      const firstCol = row[0]?.toString().trim();
      if (!firstCol) {
        console.log(`⚠️ Skipping row ${i + 1} - no first column`);
        continue;
      }
      
      // FIXED: Skip header and summary rows specifically
      if (firstCol.toLowerCase() === 'rely' ||
          firstCol.toLowerCase() === 'independent' ||
          firstCol.toLowerCase().includes('total') ||
          firstCol.toLowerCase() === 'ref' ||
          firstCol === 'Control #') {
        console.log(`⚠️ Skipping header/summary row ${i + 1}: "${firstCol}"`);
        continue;
      }
      
      // FIXED: Only process rows that start with a number (actual control rows)
      if (!firstCol.match(/^\d+$/)) {
        console.log(`⚠️ Skipping non-numeric row ${i + 1}: "${firstCol}"`);
        continue;
      }
      
      console.log(`🔍 Processing valid ITAC row ${i + 1}: "${firstCol}"`);
      
      try {
        const controlId = row[1]?.toString().trim() || 'Unknown ID';
        const processName = row[2]?.toString().trim() || 'Unknown Process';
        const uniqueId = `ITAC-${firstCol}-${controlId}`;
        
        // Skip if we've already seen this ITAC
        if (seenIds.has(uniqueId)) {
          console.log(`⚠️ Skipping duplicate ITAC: ${uniqueId}`);
          continue;
        }
        
        seenIds.add(uniqueId);
        
        const itac: ExtractedITAC = {
          id: uniqueId,
          system: row[8]?.toString().trim() || 'Unknown System', // IT System column
          controlType: processName,
          owner: row[5]?.toString().trim() || 'Unknown Owner', // Control Owner column
          riskLevel: parseRiskRating(row[7]?.toString() || 'M') as any, // Risk Rating column
          testingStatus: 'Not Started'
        };
        
        // Add additional fields for better display
        (itac as any).controlDescription = row[3]?.toString().trim() || '';
        (itac as any).testingStrategy = row[4]?.toString().trim() || '';
        (itac as any).frequency = row[6]?.toString().trim() || '';
        (itac as any).comments = row[9]?.toString().trim() || '';
        
        itacs.push(itac);
        console.log(`✅ Added valid ITAC: ${uniqueId} - ${processName} - ${itac.system}`);
      } catch (err) {
        console.warn(`❌ Error parsing ITAC row ${i + 1}:`, err);
      }
    }
    
    console.log(`📊 Total valid ITACs parsed: ${itacs.length}`);
    return itacs;
  };

  // FIXED: Enhanced parseReportsFromSheet with better title extraction
  const parseReportsFromSheet = (data: any[][], sheetName: string): ExtractedKeyReport[] => {
    if (data.length < 2) return [];
    
    const reports: ExtractedKeyReport[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[0]) continue;
      
      try {
        // FIXED: Better report name extraction from multiple possible columns
        const possibleNames = [
          row[0]?.toString().trim(),
          row[1]?.toString().trim(),
          row[2]?.toString().trim()
        ].filter(name => name && name.length > 1);
        
        const reportName = possibleNames[0] || 'Unnamed Report';
        
        const report: ExtractedKeyReport = {
          id: `RPT-${i}`,
          name: reportName,
          source: row[1]?.toString().trim() || row[2]?.toString().trim() || 'Unknown Source',
          frequency: row[2]?.toString().trim() || row[3]?.toString().trim() || 'Unknown',
          owner: row[3]?.toString().trim() || row[4]?.toString().trim() || 'Unknown Owner',
          reviewStatus: 'Pending'
        };
        
        // FIXED: Add additional fields that might be in the Excel
        if (row[4]) (report as any).description = row[4]?.toString().trim();
        if (row[5]) (report as any).period = row[5]?.toString().trim();
        
        reports.push(report);
      } catch (err) {
        console.warn(`Error parsing report row ${i + 1}:`, err);
      }
    }
    
    return reports;
  };

  // Helper functions for parsing
  const parseRiskRating = (value: string): string => {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue === 'h' || lowerValue.includes('high')) return 'High';
    if (lowerValue === 'l' || lowerValue.includes('low')) return 'Low';
    return 'Medium';
  };

  const parseFrequency = (value: string): string => {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue.includes('daily')) return 'Daily';
    if (lowerValue.includes('weekly')) return 'Weekly';
    if (lowerValue.includes('quarterly')) return 'Quarterly';
    if (lowerValue.includes('annual')) return 'Annual';
    return 'Monthly';
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
            createdAudits={createdAudits}
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
            uploadedFiles={getCurrentAuditFiles()} // Use audit-specific files
            extractedData={getCurrentAuditData()} // Use audit-specific data
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
function AuditDashboardComponent({ onAuditSelect, onCreateNewAudit, createdAudits }: AuditDashboardProps) {
  // PROBLEM 2 FIX: Combine mock audits with created audits
  const allAudits = [...mockAudits, ...createdAudits];
  
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

      {/* PROBLEM 2 FIX: Show section headers when we have created audits */}
      {createdAudits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Created Audits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdAudits.map((audit) => (
              <AuditCard key={audit.id} audit={audit} onSelect={onAuditSelect} isCreated={true} />
            ))}
          </div>
        </div>
      )}

      {mockAudits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {createdAudits.length > 0 ? 'Example Audits' : 'Available Audits'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAudits.map((audit) => (
              <AuditCard key={audit.id} audit={audit} onSelect={onAuditSelect} isCreated={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Audit Card Component
function AuditCard({ audit, onSelect, isCreated }: { audit: Audit; onSelect: (audit: Audit) => void; isCreated: boolean }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
        isCreated ? 'border-l-4 border-l-green-500' : ''
      }`}
      onClick={() => onSelect(audit)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{audit.clientName}</h3>
          <p className="text-sm text-gray-600">{audit.clientId}</p>
          {isCreated && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
              Created by you
            </span>
          )}
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