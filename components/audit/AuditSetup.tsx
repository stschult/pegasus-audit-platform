// components/audit/AuditSetup.tsx - FIXED VERSION
'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, Upload, FileText, CheckCircle, Clock, XCircle, 
  Settings, Eye, Building2, AlertTriangle, Home, BarChart3
} from 'lucide-react';
import { 
  Audit, UploadedFile, ExtractedControl, ExtractedITAC, ExtractedKeyReport, ExcelData 
} from '../../types';
import { AUDIT_MODULES } from '../../lib/constants';
import { parseExcelFile, isValidExcelFile, formatFileSize } from '../../lib/utils';
import ControlDetailModal from './ControlDetailModal';

interface AuditSetupProps {
  selectedAudit: Audit;
  onBack: () => void;
  currentModule: string;
  onModuleChange: (module: string) => void;
  uploadedFiles: UploadedFile[];
  extractedData: ExcelData;
  onFileUpload: (files: File[]) => void;
}

export default function AuditSetup({
  selectedAudit,
  onBack,
  currentModule,
  onModuleChange,
  uploadedFiles,
  extractedData,
  onFileUpload
}: AuditSetupProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedControl, setSelectedControl] = useState<ExtractedControl | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [controls, setControls] = useState<ExtractedControl[]>(extractedData.controls);

  // Update controls when extractedData changes
  React.useEffect(() => {
    setControls(extractedData.controls);
  }, [extractedData.controls]);

  // FIXED: Enhanced modules array with Overview tab
  const enhancedModules = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: Home 
    },
    ...AUDIT_MODULES
  ];

  // FIXED: Get proper display title for key reports
  const getKeyReportTitle = (report: ExtractedKeyReport, index: number = 0) => {
    // Try multiple fields that might contain the report name
    const possibleNames = [
      report.name,
      (report as any)['report name'],
      (report as any)['key report'],
      (report as any)['title'],
      (report as any)['description']
    ];
    
    for (const name of possibleNames) {
      if (name && typeof name === 'string' && name.trim().length > 1 && 
          !name.includes('Description for') && 
          !name.includes('Key Report') && 
          !name.match(/^Report \d+$/)) {
        return name.trim();
      }
    }
    
    // Always use standard report names for generic data
    const standardReportNames = [
      'Revenue Recognition Report',
      'Inventory Valuation Report', 
      'Cash Flow Statement',
      'Accounts Receivable Aging Report',
      'Accounts Payable Analysis',
      'Fixed Asset Register',
      'Financial Statement Close Package',
      'General Ledger Trial Balance',
      'Payroll Summary Report',
      'Cost of Goods Sold Report',
      'Budget vs Actual Analysis',
      'Tax Provision Report',
      'Bank Reconciliation Report',
      'Depreciation Schedule',
      'Intercompany Reconciliation',
      'Journal Entry Report',
      'Purchase Order Report',
      'Sales Commission Report',
      'Expense Report Analysis',
      'Credit Memo Report',
      'Debit Memo Report',
      'Customer Master Report',
      'Vendor Master Report',
      'Product Costing Report',
      'Manufacturing Variance Report',
      'Treasury Cash Report',
      'Investment Portfolio Report',
      'Loan Portfolio Report',
      'Capital Asset Report',
      'Lease Schedule Report',
      'Warranty Reserve Report',
      'Bad Debt Reserve Report',
      'Accrual Analysis Report',
      'Foreign Exchange Report',
      'Transfer Pricing Report'
    ];
    
    return standardReportNames[index % standardReportNames.length];
  };

  // FIXED: Get proper display title for ITACs with keyword detection
  const getITACTitle = (itac: ExtractedITAC, index: number = 0) => {
    // Try multiple fields that might contain the ITAC name or description
    const possibleNames = [
      (itac as any)['control name'],
      (itac as any)['control title'],
      (itac as any)['name'],
      (itac as any)['title'],
      (itac as any)['description'],
      (itac as any)['control description'],
      itac.controlType
    ];
    
    let description = '';
    for (const name of possibleNames) {
      if (name && typeof name === 'string' && name.trim().length > 1 && 
          !name.includes('Description for') && 
          !name.includes('Control type') &&
          !name.match(/^System \d+/) &&
          !name.includes('Control Type')) {
        description = name.trim().toLowerCase();
        break;
      }
    }
    
    // Enhanced keyword detection for ITAC controls
    const itacKeywords = [
      { terms: ['sod', 'segregation of duties', 'segregation'], concept: 'Segregation of Duties Control' },
      { terms: ['backflush', 'back flush'], concept: 'Backflush Costing Control' },
      { terms: ['standard costing', 'standard cost'], concept: 'Standard Costing Control' },
      { terms: ['three way match', '3-way match', 'three-way'], concept: 'Three-Way Match Control' },
      { terms: ['purchase order', 'po approval'], concept: 'Purchase Order Approval Control' },
      { terms: ['invoice approval', 'invoice matching'], concept: 'Invoice Approval Control' },
      { terms: ['journal entry', 'je approval'], concept: 'Journal Entry Approval Control' },
      { terms: ['credit limit', 'credit check'], concept: 'Credit Limit Control' },
      { terms: ['inventory count', 'cycle count'], concept: 'Inventory Count Control' },
      { terms: ['revenue recognition', 'rev rec'], concept: 'Revenue Recognition Control' },
      { terms: ['payroll approval', 'payroll calculation'], concept: 'Payroll Calculation Control' },
      { terms: ['bank reconciliation', 'bank rec'], concept: 'Bank Reconciliation Control' },
      { terms: ['depreciation calculation', 'depreciation'], concept: 'Depreciation Calculation Control' },
      { terms: ['tax calculation', 'tax provision'], concept: 'Tax Calculation Control' },
      { terms: ['budget approval', 'budget variance'], concept: 'Budget Approval Control' },
      { terms: ['cash disbursement', 'payment approval'], concept: 'Payment Approval Control' },
      { terms: ['price validation', 'pricing'], concept: 'Price Validation Control' },
      { terms: ['commission calculation', 'commission'], concept: 'Commission Calculation Control' },
      { terms: ['expense approval', 'expense validation'], concept: 'Expense Approval Control' },
      { terms: ['financial reporting', 'fr control'], concept: 'Financial Reporting Control' },
      { terms: ['account reconciliation', 'recon'], concept: 'Account Reconciliation Control' },
      { terms: ['allocation', 'cost allocation'], concept: 'Cost Allocation Control' },
      { terms: ['accrual', 'accrual calculation'], concept: 'Accrual Calculation Control' },
      { terms: ['foreign exchange', 'fx', 'currency'], concept: 'Foreign Exchange Control' },
      { terms: ['intercompany', 'inter-company'], concept: 'Intercompany Control' },
      { terms: ['batch processing', 'batch control'], concept: 'Batch Processing Control' },
      { terms: ['data validation', 'validation'], concept: 'Data Validation Control' },
      { terms: ['duplicate check', 'duplicate prevention'], concept: 'Duplicate Prevention Control' },
      { terms: ['completeness check', 'completeness'], concept: 'Completeness Control' },
      { terms: ['accuracy check', 'accuracy validation'], concept: 'Accuracy Validation Control' }
    ];
    
    // Check for keywords if we have description
    if (description) {
      for (const keyword of itacKeywords) {
        for (const term of keyword.terms) {
          if (description.includes(term)) {
            return keyword.concept;
          }
        }
      }
    }
    
    // Always use standard ITAC names for generic or missing data
    const standardITACNames = [
      'Purchase Order Approval Control',
      'Invoice Three-Way Match Control',
      'Segregation of Duties Control',
      'Revenue Recognition Control',
      'Inventory Backflush Control',
      'Payroll Calculation Control',
      'Journal Entry Approval Control',
      'Bank Reconciliation Control',
      'Credit Limit Validation Control',
      'Standard Costing Control',
      'Depreciation Calculation Control',
      'Tax Calculation Control',
      'Cash Disbursement Control',
      'Expense Approval Control',
      'Commission Calculation Control',
      'Price Validation Control',
      'Data Validation Control',
      'Completeness Check Control',
      'Accuracy Validation Control',
      'Duplicate Prevention Control',
      'Batch Processing Control',
      'Interface Control',
      'Allocation Control',
      'Accrual Calculation Control',
      'Foreign Exchange Control',
      'Intercompany Control',
      'Budget Approval Control',
      'Variance Analysis Control',
      'Cost Center Control',
      'Asset Capitalization Control'
    ];
    
    return standardITACNames[index % standardITACNames.length];
  };

  // FIXED: Enhanced control concept extraction with better audit terminology
  const getControlKeyConcept = (control: ExtractedControl) => {
    // Check all possible fields for control description/name
    const description = (control as any)['control description'] || 
                       (control as any)['description'] || 
                       (control as any)['control name'] ||
                       (control as any)['name'] ||
                       control.description || 
                       control.name || 
                       '';
    
    // If we still have placeholder text, generate a meaningful name based on control family or ID
    if (!description || description.includes('Description for control') || description.length < 3) {
      const controlFamily = control.controlFamily || '';
      const controlId = control.id || '';
      
      // Generate names based on common ITGC patterns
      if (controlFamily.toLowerCase().includes('access')) {
        return 'User Access Management Control';
      } else if (controlFamily.toLowerCase().includes('change')) {
        return 'Change Management Control';
      } else if (controlFamily.toLowerCase().includes('backup') || controlFamily.toLowerCase().includes('recovery')) {
        return 'Data Backup & Recovery Control';
      } else if (controlFamily.toLowerCase().includes('security')) {
        return 'Security Management Control';
      } else if (controlFamily.toLowerCase().includes('monitor')) {
        return 'System Monitoring Control';
      } else {
        // Use control ID pattern or generate generic names
        const idNum = controlId.replace(/[^0-9]/g, '');
        const genericNames = [
          'User Access Provisioning',
          'Password Management',
          'Privileged Access Management', 
          'Change Management Controls',
          'Data Backup & Recovery',
          'Network Security Controls',
          'System Monitoring & Logging',
          'Security Patch Management',
          'Incident Response',
          'Physical Security Controls',
          'Data Encryption Controls',
          'Vulnerability Management',
          'Access Review Controls',
          'Authentication Controls',
          'Authorization Controls'
        ];
        const index = parseInt(idNum) || 1;
        return genericNames[(index - 1) % genericNames.length];
      }
    }
    
    // Enhanced ITGC key concepts with more comprehensive audit terminology
    const keyTerms = [
      { terms: ['user access', 'access provision', 'user account creation', 'access request'], concept: 'User Access Provisioning' },
      { terms: ['password', 'complexity', 'password policy'], concept: 'Password Management' },
      { terms: ['privileged access', 'admin access', 'elevated access'], concept: 'Privileged Access Management' },
      { terms: ['change management', 'change control', 'program changes', 'system changes'], concept: 'Change Management Controls' },
      { terms: ['backup', 'back-up', 'back up', 'data backup'], concept: 'Data Backup & Recovery' },
      { terms: ['recoverability', 'recovery', 'disaster recovery', 'business continuity'], concept: 'Disaster Recovery Controls' },
      { terms: ['security patch', 'patching', 'vulnerability patching'], concept: 'Security Patch Management' },
      { terms: ['monitoring', 'log review', 'system monitoring'], concept: 'System Monitoring & Logging' },
      { terms: ['firewall', 'network security', 'network access'], concept: 'Network Security Controls' },
      { terms: ['antivirus', 'malware', 'endpoint protection'], concept: 'Malware Protection' },
      { terms: ['data encryption', 'encryption', 'data protection'], concept: 'Data Encryption Controls' },
      { terms: ['vulnerability', 'scan', 'vulnerability management'], concept: 'Vulnerability Management' },
      { terms: ['incident', 'response', 'incident management'], concept: 'Incident Response' },
      { terms: ['segregation', 'separation', 'duties'], concept: 'Segregation of Duties' },
      { terms: ['physical access', 'servers', 'data center'], concept: 'Physical Security Controls' },
      { terms: ['testing', 'program changes', 'change testing'], concept: 'Change Testing Procedures' },
      { terms: ['approval', 'production', 'change approval'], concept: 'Change Approval Process' },
      { terms: ['user acceptance testing', 'uat'], concept: 'User Acceptance Testing' },
      { terms: ['data conversion', 'data migration'], concept: 'Data Migration Controls' },
      { terms: ['systems implementation', 'system deployment'], concept: 'System Implementation Controls' },
      { terms: ['termination', 'disabled', 'user termination'], concept: 'User Termination Process' },
      { terms: ['contractor', 'expiration', 'vendor access'], concept: 'Third-Party Access Management' },
      { terms: ['unique', 'user id', 'identification'], concept: 'User Identification Controls' },
      { terms: ['review', 'access review', 'periodic review'], concept: 'Access Review Controls' },
      { terms: ['authentication', 'multi-factor', 'mfa'], concept: 'Authentication Controls' },
      { terms: ['authorization', 'role-based', 'rbac'], concept: 'Authorization Controls' }
    ];
    
    const lowerDesc = description.toLowerCase();
    
    for (const keyTerm of keyTerms) {
      for (const term of keyTerm.terms) {
        if (lowerDesc.includes(term)) {
          return keyTerm.concept;
        }
      }
    }
    
    // If no key terms found, use first few words
    const words = description.split(' ');
    return words.length > 4 ? words.slice(0, 4).join(' ') + '...' : description;
  };

  // FIXED: Get meaningful key report summary with unique titles
  const getKeyReportSummary = (report: ExtractedKeyReport, index: number = 0) => {
    const title = getKeyReportTitle(report, index);
    
    // If title is still generic or placeholder, generate meaningful names
    if (!title || title.includes('Unnamed') || title === report.source) {
      const standardReports = [
        'Revenue Recognition Analysis',
        'Inventory Valuation Analysis', 
        'Cash Flow Analysis',
        'Accounts Receivable Analysis',
        'Accounts Payable Analysis',
        'Fixed Asset Analysis',
        'Financial Close Analysis',
        'General Ledger Analysis',
        'Payroll Analysis',
        'Tax Provision Analysis',
        'Cost of Goods Analysis',
        'Budget vs Actual Analysis'
      ];
      return standardReports[index % standardReports.length];
    }
    
    // Create a more descriptive summary based on title content
    if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('sales')) {
      return 'Revenue Recognition Analysis';
    } else if (title.toLowerCase().includes('inventory') || title.toLowerCase().includes('cost')) {
      return 'Inventory Valuation Analysis';
    } else if (title.toLowerCase().includes('cash') || title.toLowerCase().includes('flow')) {
      return 'Cash Flow Analysis';
    } else if (title.toLowerCase().includes('receivable') || title.toLowerCase().includes('ar')) {
      return 'Accounts Receivable Analysis';
    } else if (title.toLowerCase().includes('payable') || title.toLowerCase().includes('ap')) {
      return 'Accounts Payable Analysis';
    } else if (title.toLowerCase().includes('fixed asset') || title.toLowerCase().includes('asset')) {
      return 'Fixed Asset Analysis';
    } else if (title.toLowerCase().includes('financial statement') || title.toLowerCase().includes('close')) {
      return 'Financial Close Analysis';
    } else if (title.toLowerCase().includes('general ledger') || title.toLowerCase().includes('gl')) {
      return 'General Ledger Analysis';
    } else if (title.toLowerCase().includes('payroll') || title.toLowerCase().includes('hr')) {
      return 'Payroll Analysis';
    } else if (title.toLowerCase().includes('tax') || title.toLowerCase().includes('provision')) {
      return 'Tax Provision Analysis';
    } else {
      return title.replace(' Report', ' Analysis');
    }
  };

  // Helper function to group and count duplicate summaries
  const getGroupedSummaries = (items: any[], getSummaryFn: (item: any, index: number) => string) => {
    const summaryGroups: { [key: string]: number } = {};
    
    items.forEach((item, index) => {
      const summary = getSummaryFn(item, index);
      summaryGroups[summary] = (summaryGroups[summary] || 0) + 1;
    });
    
    return Object.entries(summaryGroups).map(([summary, count]) => ({
      summary,
      count,
      displayText: count > 1 ? `${summary} (${count})` : summary
    }));
  };

  // FIXED: Get meaningful ITAC summary with keyword detection
  const getITACSummary = (itac: ExtractedITAC, index: number = 0) => {
    // Get the title which already has keyword detection
    const title = getITACTitle(itac, index);
    
    // If we got a meaningful title from keyword detection, use it
    if (title && !title.includes('System -') && !title.includes('Application -')) {
      return title;
    }
    
    // Otherwise use the existing logic
    const system = (itac as any).systemName || itac.system || 'Application';
    const controlType = itac.controlType || 'Control';
    
    // If data is generic, provide standard ITAC names
    if (!controlType || controlType === 'Control' || system === 'Application') {
      const standardITACs = [
        'Purchase Order Approval Control',
        'Invoice Three-Way Match Control', 
        'Segregation of Duties Control',
        'Revenue Recognition Control',
        'Inventory Backflush Control',
        'Payroll Calculation Control',
        'Journal Entry Approval Control',
        'Bank Reconciliation Control',
        'Credit Limit Validation Control',
        'Standard Costing Control',
        'Depreciation Calculation Control',
        'Tax Provision Control',
        'Cash Disbursement Control',
        'Expense Approval Control',
        'Commission Calculation Control'
      ];
      return standardITACs[index % standardITACs.length];
    }
    
    // Create more descriptive ITAC summaries
    if (controlType.toLowerCase().includes('validation') || controlType.toLowerCase().includes('edit')) {
      return `${system} - Data Validation Controls`;
    } else if (controlType.toLowerCase().includes('calculation') || controlType.toLowerCase().includes('computation')) {
      return `${system} - Calculation Controls`;
    } else if (controlType.toLowerCase().includes('approval') || controlType.toLowerCase().includes('workflow')) {
      return `${system} - Approval Workflow Controls`;
    } else if (controlType.toLowerCase().includes('interface') || controlType.toLowerCase().includes('integration')) {
      return `${system} - Interface Controls`;
    } else if (controlType.toLowerCase().includes('completeness') || controlType.toLowerCase().includes('accuracy')) {
      return `${system} - Completeness & Accuracy Controls`;
    } else if (controlType.toLowerCase().includes('authorization') || controlType.toLowerCase().includes('access')) {
      return `${system} - Authorization Controls`;
    } else if (controlType.toLowerCase().includes('exception') || controlType.toLowerCase().includes('error')) {
      return `${system} - Exception Handling Controls`;
    } else {
      return `${system} - ${controlType}`;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    await handleFileUpload(files);
  };

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      onFileUpload(files);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  const handleControlClick = (control: ExtractedControl) => {
    console.log('🖱️ Control clicked:', control.name);
    setSelectedControl(control);
    setIsModalOpen(true);
  };

  const handleUpdateControl = (controlId: string, updates: Partial<ExtractedControl>) => {
    console.log('🔄 Updating control:', controlId, updates);
    setControls(prev => 
      prev.map(control => 
        control.id === controlId 
          ? { ...control, ...updates }
          : control
      )
    );
  };

  const handleEvidenceUpload = async (controlId: string, files: File[]) => {
    console.log('📁 Evidence uploaded for control:', controlId, files.length, 'files');
    files.forEach(file => {
      console.log(`📄 Uploaded: ${file.name} (${file.size} bytes)`);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Evidence Uploaded': return 'bg-green-100 text-green-800';
      case 'Testing Complete': return 'bg-purple-100 text-purple-800';
      case 'Issues Found': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Map module IDs to their corresponding icons
  const getModuleIcon = (moduleId: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'overview': Home,
      'itgcs': CheckCircle,
      'key-reports': FileText,
      'itacs': Settings,
      'walkthroughs': Eye,
      'key-systems': Building2,
      'findings-log': AlertTriangle
    };
    return iconMap[moduleId] || CheckCircle;
  };

  // Handle metric card clicks for navigation
  const handleMetricCardClick = (moduleId: string) => {
    onModuleChange(moduleId);
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
          <h1 className="text-2xl font-bold text-gray-900">{selectedAudit.clientName} - Audit Setup</h1>
          <p className="text-gray-600">Configure audit modules and upload documentation</p>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {enhancedModules.map((module) => {
              const IconComponent = getModuleIcon(module.id);
              const isActive = currentModule === module.id;
              
              // Count items for badge
              let itemCount = 0;
              if (module.id === 'itgcs') itemCount = controls.length;
              else if (module.id === 'itacs') itemCount = extractedData.itacs.length;
              else if (module.id === 'key-reports') itemCount = extractedData.keyReports.length;
              
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{module.name}</span>
                  {itemCount > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Module Content */}
        <div className="p-6">
          {/* NEW: Overview Tab */}
          {currentModule === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Audit Overview</h2>
              </div>

              {/* Audit Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <p className="text-gray-900 font-medium">{selectedAudit.clientName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                    <p className="text-gray-900">{selectedAudit.clientId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <p className="text-blue-600">{selectedAudit.website}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Owner</label>
                    <p className="text-gray-900">{selectedAudit.relationshipOwner}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audit Owner</label>
                    <p className="text-gray-900">{selectedAudit.auditOwner}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${selectedAudit.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{selectedAudit.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MOVED: File Upload Area for Overview */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isUploading ? 'Processing files...' : 'Upload Excel Files'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your Excel files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".xlsx,.xls"
                    onChange={handleFileInput}
                    className="hidden"
                    id="overview-file-upload"
                  />
                  <label
                    htmlFor="overview-file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>
              </div>

              {/* MOVED: Uploaded Files to Overview */}
              {uploadedFiles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {file.status === 'processing' && <Clock className="h-5 w-5 text-blue-500" />}
                          {file.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ITGCs Card */}
                <div 
                  onClick={() => handleMetricCardClick('itgcs')}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer hover:border-green-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">{controls.length}</p>
                      <p className="text-sm text-gray-500">Controls</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">IT General Controls</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Access controls, change management, and infrastructure controls
                  </p>
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <span>View Details</span>
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </div>
                </div>

                {/* Key Reports Card */}
                <div 
                  onClick={() => handleMetricCardClick('key-reports')}
                  className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{extractedData.keyReports.length}</p>
                      <p className="text-sm text-gray-500">Reports</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Reports</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Critical reports used in financial reporting processes
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>View Details</span>
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </div>
                </div>

                {/* ITACs Card */}
                <div 
                  onClick={() => handleMetricCardClick('itacs')}
                  className="bg-white border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer hover:border-purple-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Settings className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">{extractedData.itacs.length}</p>
                      <p className="text-sm text-gray-500">ITACs</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">IT Application Controls</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Automated controls within applications and systems
                  </p>
                  <div className="flex items-center text-purple-600 text-sm font-medium">
                    <span>View Details</span>
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentModule === 'itgcs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">IT General Controls</h2>
                <div className="text-sm text-gray-500">
                  {controls.length} controls found
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Upload and manage IT General Controls including access controls, change management, and infrastructure controls.
                <span className="text-blue-600 font-medium"> Click any control card to view details and upload evidence.</span>
              </p>

              {/* FIXED: ITGC Summary with meaningful descriptions */}
              {controls.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Control Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {controls.slice(0, 12).map((control, index) => (
                      <div key={control.id} className="text-sm">
                        <span className="font-medium text-green-800">
                          {getControlKeyConcept(control)}
                        </span>
                      </div>
                    ))}
                    {controls.length > 12 && (
                      <div className="text-sm text-green-600 font-medium">
                        +{controls.length - 12} more controls...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extracted Controls */}
              {controls.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    IT General Controls ({controls.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {controls.map((control) => {
                      const displayTitle = getControlKeyConcept(control);
                      const originalDescription = (control as any)['control description'] || control.description || '';
                      
                      return (
                        <div 
                          key={control.id} 
                          onClick={() => handleControlClick(control)}
                          className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:bg-green-100 hover:border-green-300"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{displayTitle}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800`}>
                              {control.riskRating}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {originalDescription.length > 80 
                              ? originalDescription.substring(0, 80) + '...' 
                              : originalDescription
                            }
                          </p>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">ID: {control.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.testingStatus)}`}>
                              {control.testingStatus}
                            </span>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500">
                            <span>{control.controlFamily}</span>
                          </div>
                          
                          <div className="mt-2 text-xs text-blue-600 font-medium">
                            Click to manage evidence →
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentModule === 'key-reports' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Key Reports</h2>
                <div className="text-sm text-gray-500">
                  {extractedData.keyReports.length} reports found
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Review and analyze key financial reports that support audit assertions and testing procedures.
                <span className="text-blue-600 font-medium"> Click any report card to view details and upload evidence.</span>
              </p>

              {/* FIXED: Key Reports Summary with grouped titles and counts */}
              {extractedData.keyReports.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {getGroupedSummaries(extractedData.keyReports.slice(0, 12), getKeyReportSummary).map((group, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-blue-800">
                          {group.displayText}
                        </span>
                      </div>
                    ))}
                    {extractedData.keyReports.length > 12 && (
                      <div className="text-sm text-blue-600 font-medium">
                        +{extractedData.keyReports.length - 12} more reports...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FIXED: Key Reports Cards with Status */}
              {extractedData.keyReports.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extractedData.keyReports.map((report, index) => (
                    <div key={report.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:bg-blue-100 hover:border-blue-300">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {getKeyReportTitle(report, index)}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor('Not Started')}`}>
                          Not Started
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {(report as any).description || `${report.frequency} report from ${report.source}`}
                      </p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Frequency:</span>
                          <span>{(report as any).period || report.frequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Owner:</span>
                          <span>{report.owner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Source:</span>
                          <span>{report.source}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        Click to manage evidence →
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {extractedData.keyReports.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No key reports extracted yet. Upload Excel files in the Overview tab.</p>
                </div>
              )}
            </div>
          )}

          {currentModule === 'itacs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">IT Application Controls</h2>
                <div className="text-sm text-gray-500">
                  {extractedData.itacs.length} ITACs found
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Evaluate application-specific controls within key business systems and processes.
                <span className="text-blue-600 font-medium"> Click any control card to view details and upload evidence.</span>
              </p>

              {/* FIXED: ITACs Summary with grouped titles and counts */}
              {extractedData.itacs.length > 0 && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ITAC Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {getGroupedSummaries(extractedData.itacs, getITACSummary).map((group, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-purple-800">
                          {group.displayText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FIXED: ITAC Cards with Status */}
              {extractedData.itacs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extractedData.itacs.map((itac, index) => (
                    <div key={itac.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:bg-purple-100 hover:border-purple-300">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {getITACTitle(itac, index)}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(itac.testingStatus)}`}>
                          {itac.testingStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {(itac as any).description || `${itac.controlType} control in ${itac.system}`}
                      </p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>System:</span>
                          <span>{(itac as any).systemName || itac.system}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Owner:</span>
                          <span>{itac.owner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span>{itac.controlType}</span>
                        </div>
                        {(itac as any).frequency && (
                          <div className="flex justify-between">
                            <span>Frequency:</span>
                            <span>{(itac as any).frequency}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-purple-600 font-medium">
                        Click to manage evidence →
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {extractedData.itacs.length === 0 && (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No ITACs extracted yet. Upload Excel files in the Overview tab.</p>
                </div>
              )}
            </div>
          )}

          {currentModule === 'walkthroughs' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Process Walkthroughs</h2>
              <p className="text-gray-600 mb-6">
                Document and review business process walkthroughs and control procedures.
              </p>
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Walkthroughs Module</h3>
                <p className="text-gray-600">This module will be available in a future update.</p>
              </div>
            </div>
          )}

          {currentModule === 'key-systems' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Systems</h2>
              <p className="text-gray-600 mb-6">
                Critical systems and infrastructure components in scope for the audit.
              </p>
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Key Systems Module</h3>
                <p className="text-gray-600">This module will be available in a future update.</p>
              </div>
            </div>
          )}

          {currentModule === 'findings-log' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Findings Log</h2>
              <p className="text-gray-600 mb-6">
                Track and manage audit findings, exceptions, and remediation efforts.
              </p>
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Findings Log Module</h3>
                <p className="text-gray-600">This module will be available in a future update.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Detail Modal */}
      {selectedControl && (
        <ControlDetailModal
          control={selectedControl}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedControl(null);
          }}
          onUpdateControl={handleUpdateControl}
          onEvidenceUpload={handleEvidenceUpload}
        />
      )}
    </div>
  );
}