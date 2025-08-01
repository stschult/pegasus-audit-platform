'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  Eye,
  Trash2,
  Save,
  FileText,
  Building2,
  Calendar,
  Shield,
  Activity,
  Users,
  Clock,
  ArrowRight,
  X,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SampleRequest } from '../../types/client';
import { formatFileSize } from '../../lib/client/utils';

interface ControlSheetData {
  companyInfo: CompanyInfo;
  controlDefinitions: ControlDefinition[];
}

interface CompanyInfo {
  companyName: string;
  auditPeriod: string;
  auditScope: string;
  methodology: string;
  auditorName: string;
  auditorEmail: string;
  clientContact: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  url?: string;
  auditType?: string;
}

interface ControlDefinition {
  controlId: string;
  controlTitle: string;
  controlType: SampleRequest['controlType'];
  riskRating: SampleRequest['riskRating'];
  frequency: SampleRequest['frequency'];
  description: string;
  dueDate: string;
  priority: SampleRequest['priority'];
  requiredEvidence: string[];
  assignedTo: string;
  location?: string;
}

interface ControlSheetUploadProps {
  onImportComplete: (requests: SampleRequest[], companyInfo: CompanyInfo) => void;
  onCancel: () => void;
}

const ControlSheetUpload: React.FC<ControlSheetUploadProps> = ({
  onImportComplete,
  onCancel
}) => {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ControlSheetData | null>(null);
  const [previewRequests, setPreviewRequests] = useState<SampleRequest[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/excel'
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const parseExcelFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);

      const profileSheet = workbook.Sheets['Profile'];
      if (!profileSheet) {
        throw new Error('Profile sheet not found. Please ensure your Excel file has a "Profile" tab.');
      }

      const profileData = XLSX.utils.sheet_to_json(profileSheet, { header: 1 }) as any[][];
      const companyInfo = parseProfileSheet(profileData);

      const itgcSheet = workbook.Sheets['ITGCs'];
      if (!itgcSheet) {
        throw new Error('ITGCs sheet not found. Please ensure your Excel file has an "ITGCs" tab.');
      }

      const itgcData = XLSX.utils.sheet_to_json(itgcSheet, { header: 1 }) as any[][];
      const controlDefinitions = parseITGCSheet(itgcData);

      const parsedSheetData: ControlSheetData = {
        companyInfo,
        controlDefinitions
      };

      setParsedData(parsedSheetData);
      const generatedRequests = generateSampleRequests(controlDefinitions, companyInfo);
      setPreviewRequests(generatedRequests);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseProfileSheet = (data: any[][]): CompanyInfo => {
    const getValue = (label: string): string => {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[0].toString().toLowerCase().includes(label.toLowerCase())) {
          return row[1]?.toString() || '';
        }
      }
      return '';
    };

    let auditorName = 'Audit Team';
    let auditorEmail = '';
    let clientContact = 'Client Team';
    let clientEmail = '';

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[0].toString().toLowerCase() === 'pegasus') {
        if (i + 1 < data.length && data[i + 1][0]?.toString().toLowerCase().includes('principle')) {
          auditorName = data[i + 1][1]?.toString() || auditorName;
          auditorEmail = data[i + 1][2]?.toString() || '';
        }
        break;
      }
    }

    const companyName = data[0]?.[1]?.toString() || 'Unknown Company';
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[0].toString().toLowerCase() === companyName.toLowerCase()) {
        if (i + 1 < data.length && data[i + 1][0]?.toString().toLowerCase().includes('principle')) {
          clientContact = data[i + 1][1]?.toString() || clientContact;
          clientEmail = data[i + 1][2]?.toString() || '';
        }
        break;
      }
    }

    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        if (dateStr.includes('.')) {
          const parts = dateStr.split('.');
          if (parts.length === 3) {
            const date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            return date.toISOString().split('T')[0];
          }
        }
        return new Date(dateStr).toISOString().split('T')[0];
      } catch {
        return dateStr;
      }
    };

    return {
      companyName: companyName,
      auditPeriod: formatDate(getValue('start date')) + ' to ' + formatDate(getValue('end date')),
      auditScope: getValue('audit') || 'SOC 2 Finance and ITGC',
      methodology: 'Risk-based ITGC Approach',
      auditorName: auditorName,
      auditorEmail: auditorEmail,
      clientContact: clientContact,
      clientEmail: clientEmail,
      startDate: formatDate(getValue('start date')),
      endDate: formatDate(getValue('end date')),
      url: getValue('url'),
      auditType: getValue('audit')
    };
  };

  const parseITGCSheet = (data: any[][]): ControlDefinition[] => {
    if (data.length < 3) {
      throw new Error('ITGCs sheet must have a header row and at least one data row');
    }

    const controls: ControlDefinition[] = [];

    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || !row[2] || !row[3]) continue;

      try {
        const controlId = row[2]?.toString().trim() || `CTRL-${String(i).padStart(3, '0')}`;
        const description = row[3]?.toString().trim() || 'Control description not provided';
        const riskRating = parseRiskRating(row[4]?.toString() || 'M');
        const frequency = parseFrequency(row[5]?.toString() || 'Monthly');
        const location = row[1]?.toString().trim() || 'Unknown';
        
        const control: ControlDefinition = {
          controlId: controlId,
          controlTitle: generateControlTitle(description),
          controlType: inferControlType(description, controlId),
          riskRating: riskRating,
          frequency: frequency,
          description: description,
          dueDate: calculateDueDateFromFrequency(frequency),
          priority: riskRatingToPriority(riskRating),
          requiredEvidence: generateRequiredEvidence(description),
          assignedTo: `${location} Team`,
          location: location
        };

        controls.push(control);
      } catch (err) {
        console.warn(`Error parsing row ${i + 1}:`, err);
      }
    }

    if (controls.length === 0) {
      throw new Error('No valid control definitions found in the ITGCs sheet');
    }

    return controls;
  };

  const generateControlTitle = (description: string): string => {
    if (description.length <= 50) return description;
    const words = description.split(' ');
    let title = '';
    for (const word of words) {
      if ((title + ' ' + word).length > 50) break;
      title += (title ? ' ' : '') + word;
    }
    return title + '...';
  };

  const inferControlType = (description: string, controlId: string): SampleRequest['controlType'] => {
    const lowerDesc = description.toLowerCase();
    const lowerControlId = controlId.toLowerCase();
    
    if (lowerDesc.includes('backup') || lowerDesc.includes('recovery') || lowerControlId.includes('ops')) {
      return 'Data Backup';
    }
    if (lowerDesc.includes('access') || lowerDesc.includes('user') || lowerDesc.includes('account') || lowerControlId.includes('sec')) {
      return 'Access Management';
    }
    if (lowerDesc.includes('change') || lowerDesc.includes('program') || lowerDesc.includes('deployment') || lowerControlId.includes('cm')) {
      return 'Change Management';
    }
    if (lowerDesc.includes('monitor') || lowerDesc.includes('log') || lowerDesc.includes('alert')) {
      return 'System Monitoring';
    }
    if (lowerDesc.includes('physical') || lowerDesc.includes('server') || lowerDesc.includes('facility')) {
      return 'Physical Security';
    }
    if (lowerDesc.includes('network') || lowerDesc.includes('firewall') || lowerDesc.includes('perimeter')) {
      return 'Network Security';
    }
    return 'Access Management';
  };

  const parseRiskRating = (value: string): SampleRequest['riskRating'] => {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue === 'h' || lowerValue.includes('high')) return 'High';
    if (lowerValue === 'l' || lowerValue.includes('low')) return 'Low';
    return 'Medium';
  };

  const parseFrequency = (value: string): SampleRequest['frequency'] => {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue.includes('daily')) return 'Daily';
    if (lowerValue.includes('weekly')) return 'Weekly';
    if (lowerValue.includes('quarterly')) return 'Quarterly';
    if (lowerValue.includes('annual')) return 'Quarterly'; // Map annually to quarterly
    return 'Monthly';
  };

  const calculateDueDateFromFrequency = (frequency: SampleRequest['frequency']): string => {
    const now = new Date();
    let dueDate = new Date(now);

    switch (frequency) {
      case 'Daily':
        dueDate.setDate(now.getDate() + 1);
        break;
      case 'Weekly':
        dueDate.setDate(now.getDate() + 7);
        break;
      case 'Monthly':
        dueDate.setMonth(now.getMonth() + 1);
        break;
      case 'Quarterly':
        dueDate.setMonth(now.getMonth() + 3);
        break;
      default:
        dueDate.setMonth(now.getMonth() + 1);
    }

    return dueDate.toISOString().split('T')[0];
  };

  const riskRatingToPriority = (riskRating: SampleRequest['riskRating']): SampleRequest['priority'] => {
    switch (riskRating) {
      case 'High':
        return 'urgent';
      case 'Medium':
        return 'high';
      case 'Low':
        return 'medium';
      default:
        return 'medium';
    }
  };

  const generateRequiredEvidence = (description: string): string[] => {
    const lowerDesc = description.toLowerCase();
    const evidence: string[] = [];

    if (lowerDesc.includes('access') || lowerDesc.includes('user')) {
      evidence.push('User access reports');
      evidence.push('Access control documentation');
      evidence.push('User provisioning/deprovisioning logs');
    }

    if (lowerDesc.includes('backup') || lowerDesc.includes('recovery')) {
      evidence.push('Backup success logs');
      evidence.push('Recovery test results');
      evidence.push('Backup schedule documentation');
    }

    if (lowerDesc.includes('change') || lowerDesc.includes('deployment')) {
      evidence.push('Change request forms');
      evidence.push('Approval documentation');
      evidence.push('Testing evidence');
      evidence.push('Deployment logs');
    }

    if (lowerDesc.includes('monitor') || lowerDesc.includes('log')) {
      evidence.push('System monitoring logs');
      evidence.push('Alert configuration documentation');
      evidence.push('Incident response records');
    }

    if (lowerDesc.includes('network') || lowerDesc.includes('firewall')) {
      evidence.push('Network configuration files');
      evidence.push('Firewall rule documentation');
      evidence.push('Network access logs');
    }

    if (lowerDesc.includes('physical') || lowerDesc.includes('security')) {
      evidence.push('Physical access logs');
      evidence.push('Security camera footage');
      evidence.push('Badge access reports');
    }

    // Default evidence if no specific matches
    if (evidence.length === 0) {
      evidence.push('Control documentation');
      evidence.push('Evidence of control execution');
      evidence.push('Management review and approval');
    }

    return evidence;
  };

  const generateSampleRequests = (controlDefinitions: ControlDefinition[], companyInfo: CompanyInfo): SampleRequest[] => {
    return controlDefinitions.map((control, index) => {
      const sampleRequest: SampleRequest = {
        id: `${control.controlId}-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        controlId: control.controlId,
        controlTitle: control.controlTitle,
        controlType: control.controlType,
        riskRating: control.riskRating,
        frequency: control.frequency,
        description: control.description,
        dueDate: control.dueDate,
        status: 'pending',
        priority: control.priority,
        requiredEvidence: control.requiredEvidence,
        uploadedFiles: [],
        comments: [
          {
            id: `comment-${control.controlId}-1`,
            author: companyInfo.auditorName,
            authorRole: 'auditor',
            message: `Please provide evidence for ${control.controlTitle} as part of the ${companyInfo.auditScope} audit.`,
            timestamp: new Date().toISOString(),
            isRead: true
          }
        ],
        assignedTo: control.assignedTo,
        createdDate: new Date().toISOString(),
        completionPercentage: 0
      };

      return sampleRequest;
    });
  };

  const handleImport = () => {
    if (parsedData && previewRequests.length > 0) {
      onImportComplete(previewRequests, parsedData.companyInfo);
    }
  };

  const handleRemoveRequest = (requestId: string) => {
    setPreviewRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">ITGC Master List Bulk Upload</h2>
              <p className="text-sm text-gray-600">
                {step === 'upload' ? 'Upload your Excel file with Profile and ITGCs sheets' : 'Review and confirm the imported controls'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'upload' ? 'border-blue-600 bg-blue-50' : 'border-green-600 bg-green-600'
              }`}>
                {step === 'preview' ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <span className="text-sm font-medium">1</span>
                )}
              </div>
              <span className="font-medium">Upload File</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${step === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'preview' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="font-medium">Preview & Import</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 'upload' && (
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">File Format Requirements</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Excel file (.xlsx or .xls) with two required sheets:</li>
                      <li>• <strong>"Profile"</strong> sheet: Company information, audit details, contacts</li>
                      <li>• <strong>"ITGCs"</strong> sheet: Control definitions with columns for ID, description, risk, frequency</li>
                      <li>• Maximum file size: 10MB</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragActive 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your ITGC Master List here
                </h3>
                <p className="text-gray-600 mb-6">
                  or click to browse and select your Excel file
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                >
                  Choose Excel File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileSelection(selectedFile);
                  }}
                />
              </div>

              {/* Selected File Info */}
              {file && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && parsedData && (
            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Company:</span>
                    <p className="text-gray-900">{parsedData.companyInfo.companyName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Audit Period:</span>
                    <p className="text-gray-900">{parsedData.companyInfo.auditPeriod}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Auditor:</span>
                    <p className="text-gray-900">{parsedData.companyInfo.auditorName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Client Contact:</span>
                    <p className="text-gray-900">{parsedData.companyInfo.clientContact}</p>
                  </div>
                </div>
              </div>

              {/* Controls Preview */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">Controls to Import</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {previewRequests.length} controls
                    </span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="divide-y divide-gray-200">
                    {previewRequests.map((request, index) => (
                      <div key={request.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                {request.controlId}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskBadgeColor(request.riskRating)}`}>
                                {request.riskRating} Risk
                              </span>
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                {request.frequency}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{request.controlTitle}</h4>
                            <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Due: {new Date(request.dueDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {request.assignedTo}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveRequest(request.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Remove this control"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Import Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Ready to Import</p>
                    <p className="text-sm text-green-700">
                      {previewRequests.length} controls will be added to your audit evidence requests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {step === 'upload' && file && (
              <span>File selected: {file.name}</span>
            )}
            {step === 'preview' && (
              <span>{previewRequests.length} controls ready for import</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            {step === 'upload' && (
              <button
                onClick={parseExcelFile}
                disabled={!file || isProcessing}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Parse & Preview</span>
                  </>
                )}
              </button>
            )}
            {step === 'preview' && (
              <button
                onClick={handleImport}
                disabled={previewRequests.length === 0}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Import {previewRequests.length} Controls</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ControlSheetUpload };