// components/audit/CreateNewAudit.tsx - UPDATED for Auditor → Client Flow + WALKTHROUGH EXTRACTION FIX + DATE EXTRACTION FIX
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { AuditFormData, ExcelData, ExtractedControl, ExtractedITAC, ExtractedKeyReport } from '../../types';

interface CreateNewAuditProps {
  onBack: () => void;
  onSubmit: (formData: AuditFormData, excelData?: ExcelData) => void;
}

export default function CreateNewAudit({ onBack, onSubmit }: CreateNewAuditProps) {
  const [formData, setFormData] = useState<AuditFormData>({
    companyName: '',
    clientId: '',
    website: '',
    clientLead: '',
    auditLead: '',
    auditType: 'SOC 2',
    startDate: '',
    endDate: ''
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExcelData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInputChange = (field: keyof AuditFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setIsProcessing(true);
    setUploadedFile(file);

    try {
      console.log(`🚀 Processing Excel file: ${file.name}`);
      const excelData = await parseExcelFile(file);
      setExtractedData(excelData);
      
      console.log(`🎉 Excel file parsed successfully:`, {
        controls: excelData.controls.length,
        itacs: excelData.itacs.length,
        keyReports: excelData.keyReports.length,
        applications: excelData.applications?.length || 0
      });
      
    } catch (error) {
      console.error('❌ Error processing Excel file:', error);
      alert('Error processing Excel file. Please check the format and try again.');
      setUploadedFile(null);
      setExtractedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ NEW: Helper function to format dates for HTML date inputs
  const formatDateForInput = (excelDate: string): string => {
    try {
      // Handle various date formats from Excel
      console.log('🗓️ Formatting date:', excelDate);
      
      // If it's already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
        return excelDate;
      }
      
      // Handle formats like "8.30.2025" or "10.1.2025"
      if (excelDate.includes('.')) {
        const parts = excelDate.split('.');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          const formatted = `${year}-${month}-${day}`;
          console.log('🗓️ Converted date:', excelDate, '→', formatted);
          return formatted;
        }
      }
      
      // Handle formats like "8/30/2025" or "10/1/2025"
      if (excelDate.includes('/')) {
        const parts = excelDate.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          const formatted = `${year}-${month}-${day}`;
          console.log('🗓️ Converted date:', excelDate, '→', formatted);
          return formatted;
        }
      }
      
      // Handle Excel serial date numbers
      if (!isNaN(Number(excelDate))) {
        const serialDate = Number(excelDate);
        // Excel epoch starts at 1900-01-01, but Excel incorrectly treats 1900 as a leap year
        const excelEpoch = new Date(1900, 0, 1);
        const jsDate = new Date(excelEpoch.getTime() + (serialDate - 2) * 24 * 60 * 60 * 1000);
        const formatted = jsDate.toISOString().split('T')[0];
        console.log('🗓️ Converted Excel serial date:', serialDate, '→', formatted);
        return formatted;
      }
      
      // Try to parse as a regular date string
      const parsedDate = new Date(excelDate);
      if (!isNaN(parsedDate.getTime())) {
        const formatted = parsedDate.toISOString().split('T')[0];
        console.log('🗓️ Parsed date string:', excelDate, '→', formatted);
        return formatted;
      }
      
      console.warn('🗓️ Could not parse date:', excelDate);
      return '';
    } catch (error) {
      console.error('🗓️ Error formatting date:', excelDate, error);
      return '';
    }
  };

  // Enhanced parsing - includes Profile sheet auto-fill with DATE EXTRACTION
  const parseExcelFile = async (file: File): Promise<ExcelData> => {
    console.log(`🚀 parseExcelFile called for: ${file.name}`);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          console.log(`📋 Excel workbook loaded with ${workbook.SheetNames.length} sheets:`, workbook.SheetNames);
          
          let controls: ExtractedControl[] = [];
          let itacs: ExtractedITAC[] = [];
          let keyReports: ExtractedKeyReport[] = [];
          let applications: any[] = [];
          
          // ✅ FIXED: Enhanced Profile sheet parsing to include start and end dates
          if (workbook.SheetNames.includes('Profile')) {
            const profileSheet = workbook.Sheets['Profile'];
            const profileRows = XLSX.utils.sheet_to_json(profileSheet, { header: 1 }) as any[][];
            
            console.log('📋 Profile sheet found. Auto-filling form...');
            console.log('📋 Profile sheet data:', profileRows);
            
            for (let i = 0; i < profileRows.length; i++) {
              const row = profileRows[i];
              if (row && row.length >= 2 && row[0] && row[1]) {
                const key = row[0].toString().toLowerCase().trim();
                const value = row[1].toString().trim();
                
                console.log(`📋 Processing Profile row ${i}: "${key}" = "${value}"`);
                
                if (key === 'company' || key.includes('company name')) {
                  console.log('📋 Auto-filling company name:', value);
                  setFormData(prev => ({ ...prev, companyName: value }));
                }
                else if (key === 'url' || key.includes('website') || key.includes('domain')) {
                  console.log('📋 Auto-filling website:', value);
                  setFormData(prev => ({ ...prev, website: value }));
                }
                else if (key.includes('client lead') || key === 'lead finance') {
                  console.log('📋 Auto-filling client lead:', value);
                  setFormData(prev => ({ ...prev, clientLead: value }));
                }
                else if (key.includes('audit lead') || key === 'lead itgc') {
                  console.log('📋 Auto-filling audit lead:', value);
                  setFormData(prev => ({ ...prev, auditLead: value }));
                }
                else if (key === 'client id' || key === 'clientid') {
                  console.log('📋 Auto-filling client ID:', value);
                  setFormData(prev => ({ ...prev, clientId: value }));
                }
                // ✅ NEW: Extract start date
                else if (key === 'start date' || key.includes('start date')) {
                  const formattedDate = formatDateForInput(value);
                  console.log('📋 Auto-filling start date:', value, '→', formattedDate);
                  setFormData(prev => ({ ...prev, startDate: formattedDate }));
                }
                // ✅ NEW: Extract end date
                else if (key === 'end date' || key.includes('end date')) {
                  const formattedDate = formatDateForInput(value);
                  console.log('📋 Auto-filling end date:', value, '→', formattedDate);
                  setFormData(prev => ({ ...prev, endDate: formattedDate }));
                }
                // ✅ NEW: Extract audit type
                else if (key === 'audit' || key.includes('audit type')) {
                  console.log('📋 Auto-filling audit type:', value);
                  setFormData(prev => ({ ...prev, auditType: value }));
                }
              }
            }
          }
          
          // Parse each sheet for control data
          workbook.SheetNames.forEach(sheetName => {
            console.log(`🔍 Processing sheet: ${sheetName}`);
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            
            const lowerSheetName = sheetName.toLowerCase();
            
            if (lowerSheetName.includes('itgc') || lowerSheetName.includes('control')) {
              console.log(`📊 Parsing ITGCs from sheet: ${sheetName}`);
              const parsedControls = parseControlsFromSheet(sheetData, sheetName);
              controls = [...controls, ...parsedControls];
            }
            else if (lowerSheetName.includes('itac') || lowerSheetName.includes('application')) {
              console.log(`📊 Parsing ITACs from sheet: ${sheetName}`);
              const parsedITACs = parseITACsFromSheet(sheetData, sheetName);
              itacs = [...itacs, ...parsedITACs];
            }
            else if (lowerSheetName.includes('report') || lowerSheetName.includes('key report')) {
              console.log(`📊 Parsing Key Reports from sheet: ${sheetName}`);
              const parsedReports = parseReportsFromSheet(sheetData, sheetName);
              keyReports = [...keyReports, ...parsedReports];
            }
          });
          
          const excelData: ExcelData = {
            controls,
            itacs,
            keyReports,
            applications
          };
          
          console.log(`🎉 Final Excel parsing results:`);
          console.log(`   📊 Controls: ${controls.length}`);
          console.log(`   📊 ITACs: ${itacs.length}`);
          console.log(`   📊 Key Reports: ${keyReports.length}`);
          
          resolve(excelData);
        } catch (error) {
          console.error('❌ Excel parsing error:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Simplified control parsing - focus on essential data
  const parseControlsFromSheet = (data: any[][], sheetName: string): ExtractedControl[] => {
    console.log(`🚀 Parsing controls from sheet: ${sheetName}`);
    
    if (data.length < 3) {
      console.log(`⚠️ Not enough rows in sheet ${sheetName}`);
      return [];
    }
    
    const controls: ExtractedControl[] = [];
    
    // Start from row 2 (index 2) to skip headers
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      
      if (!row || row.length === 0 || !row[2] || !row[3]) {
        continue; // Skip empty or invalid rows
      }
      
      try {
        const controlId = row[2]?.toString().trim();
        const description = row[3]?.toString().trim();
        const riskRating = row[4]?.toString().trim() || 'M';
        const frequency = row[5]?.toString().trim() || 'Monthly';
        
        if (description && description.length > 5) {
          const control: ExtractedControl = {
            id: controlId,
            name: getControlName(description),
            description: description,
            riskRating: normalizeRiskRating(riskRating),
            frequency: normalizeFrequency(frequency),
            controlFamily: 'ITGC',
            testingStatus: 'Not Started'
          };
          
          controls.push(control);
          console.log(`✅ Added control: ${control.id} - ${control.name}`);
        }
      } catch (err) {
        console.error(`❌ Error parsing control row ${i + 1}:`, err);
      }
    }
    
    console.log(`🎉 Parsed ${controls.length} controls from ${sheetName}`);
    return controls;
  };

  // Simplified ITAC parsing
  const parseITACsFromSheet = (data: any[][], sheetName: string): ExtractedITAC[] => {
    console.log(`🚀 Parsing ITACs from sheet: ${sheetName}`);
    
    if (data.length < 6) return [];
    
    const itacs: ExtractedITAC[] = [];
    
    for (let i = 6; i < data.length; i++) {
      const row = data[i];
      
      if (!row || !row[1]) continue;
      
      try {
        const controlId = row[1]?.toString().trim();
        const processName = row[2]?.toString().trim() || 'Unknown Process';
        const system = row[8]?.toString().trim() || 'Unknown System';
        const riskRating = row[7]?.toString().trim() || 'L';
        
        const itac: ExtractedITAC = {
          id: controlId,
          system: system,
          controlType: processName,
          owner: 'Unknown Owner',
          riskLevel: normalizeRiskRating(riskRating) as any,
          testingStatus: 'Not Started',
          controlDescription: processName,
          processName: processName
        };
        
        itacs.push(itac);
        console.log(`✅ Added ITAC: ${itac.id} - ${itac.system}`);
        
      } catch (err) {
        console.error(`❌ Error parsing ITAC row ${i + 1}:`, err);
      }
    }
    
    console.log(`🎉 Parsed ${itacs.length} ITACs from ${sheetName}`);
    return itacs;
  };

  // ✅ FIXED: Enhanced report parsing for walkthrough extraction
  const parseReportsFromSheet = (data: any[][], sheetName: string): ExtractedKeyReport[] => {
    console.log(`🚀 Parsing reports from sheet: ${sheetName}`);
    console.log(`📊 Sheet has ${data.length} rows`);
    
    if (data.length < 2) return [];
    
    const reports: ExtractedKeyReport[] = [];
    
    // Let's inspect the header row to understand the structure
    if (data.length > 0) {
      console.log(`🔍 Header row (first 20 columns):`, data[0]?.slice(0, 20));
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row || row.length === 0) {
        console.log(`⚠️ Skipping empty row ${i}`);
        continue;
      }
      
      // Log the row for debugging
      console.log(`🔍 Processing row ${i} (first 20 columns):`, row.slice(0, 20));
      
      try {
        // Based on your original requirements and Excel structure:
        // Column A (0) = #
        // Column B (1) = Process / Business Process
        // Column C (2) = Control Family  
        // Column D (3) = Report Name ✅
        // Column E (4) = Description
        // Column F (5) = Report Type
        // Column G (6) = Application ✅ (for walkthrough extraction)
        // Column H (7) = Frequency
        // ...
        // Column Q (16) = Business Owner(s) ✅ (for walkthrough extraction)
        
        const reportName = row[3]?.toString().trim(); // Column D = Report Name
        const description = row[4]?.toString().trim(); // Column E = Description
        const reportType = row[5]?.toString().trim(); // Column F = Report Type
        const application = row[6]?.toString().trim(); // Column G = Application 
        const frequency = row[7]?.toString().trim(); // Column H = Frequency
        const businessOwner = row[16]?.toString().trim(); // Column Q = Business Owner(s)
        
        console.log(`🔍 Extracted data for row ${i}:`, {
          reportName,
          application,
          businessOwner,
          frequency,
          hasReportName: !!reportName,
          hasApplication: !!application,
          hasOwner: !!businessOwner
        });
        
        if (reportName && reportName.length > 2) {
          const report: ExtractedKeyReport = {
            id: `RPT-${i}`,
            name: reportName,
            source: application || 'Unknown Source', // Keep source for backward compatibility
            application: application, // ✅ ADD: Application field for walkthrough extraction
            frequency: frequency || 'Monthly',
            owner: businessOwner || 'Unknown Owner', // ✅ READ: Actual owner from Excel
            reviewStatus: 'Current',
            description: description || reportName,
            reportType: reportType || 'Standard Report'
          };
          
          reports.push(report);
          console.log(`✅ Added report: ${report.name} (App: ${report.application}, Owner: ${report.owner})`);
        } else {
          console.log(`⚠️ Skipping row ${i} - no valid report name`);
        }
      } catch (err) {
        console.error(`❌ Error parsing report row ${i}:`, err);
      }
    }
    
    console.log(`🎉 Parsed ${reports.length} reports from ${sheetName}`);
    
    // ✅ WALKTHROUGH PREVIEW: Log summary of applications and owners found
    const applications = [...new Set(reports.map(r => r.application).filter(Boolean))];
    const owners = [...new Set(reports.map(r => r.owner).filter(Boolean))];
    const validReports = reports.filter(r => 
      r.application && 
      r.owner && 
      r.application !== 'Unknown Source' && 
      r.owner !== 'Unknown Owner'
    );
    
    console.log(`📊 WALKTHROUGH PREVIEW:`);
    console.log(`   📊 Found applications:`, applications);
    console.log(`   📊 Found owners:`, owners);
    console.log(`   📊 Valid reports for walkthroughs: ${validReports.length}`);
    console.log(`   📊 Expected walkthrough applications: ~${validReports.length} (depends on unique app+owner combinations)`);
    
    // Show breakdown by application
    const appBreakdown = applications.reduce((acc, app) => {
      const appReports = validReports.filter(r => r.application === app);
      const appOwners = [...new Set(appReports.map(r => r.owner))];
      acc[app] = { reports: appReports.length, owners: appOwners.length, ownerNames: appOwners };
      return acc;
    }, {} as Record<string, any>);
    
    console.log(`   📊 Application breakdown:`, appBreakdown);
    
    return reports;
  };

  // Helper functions
  const getControlName = (description: string): string => {
    const desc = description.toLowerCase();
    
    if (desc.includes('backup')) return 'System Backups';
    if (desc.includes('access') && desc.includes('review')) return 'Access Review';
    if (desc.includes('password')) return 'Password Management';
    if (desc.includes('change')) return 'Change Management';
    if (desc.includes('monitoring')) return 'System Monitoring';
    if (desc.includes('patch')) return 'Patch Management';
    if (desc.includes('vulnerability')) return 'Vulnerability Management';
    if (desc.includes('encryption')) return 'Data Encryption';
    if (desc.includes('network')) return 'Network Security';
    
    // Fallback: first few words
    return description.split(' ').slice(0, 3).join(' ') + '...';
  };

  const normalizeRiskRating = (value: string): string => {
    const lower = value.toLowerCase().trim();
    if (lower === 'h' || lower.includes('high')) return 'High';
    if (lower === 'l' || lower.includes('low')) return 'Low';
    return 'Medium';
  };

  const normalizeFrequency = (value: string): string => {
    if (!value) return 'Monthly';
    const lower = value.toLowerCase().trim();
    
    if (lower.includes('annual')) return 'Annually';
    if (lower.includes('quarter')) return 'Quarterly';
    if (lower.includes('month')) return 'Monthly';
    if (lower.includes('week')) return 'Weekly';
    if (lower.includes('daily')) return 'Daily';
    
    return 'Monthly';
  };

  const handleSubmit = () => {
  // Use current form state values
  const currentFormData = { ...formData };
  
  if (!currentFormData.companyName) {
    alert('Please enter company name');
    return;
  }
  
  if (!currentFormData.website) {
    alert('Please enter website URL');
    return;
  }
  
  console.log('🎉 Submitting audit with extracted data:', {
    formData: currentFormData,
    hasExcelData: !!extractedData,
    controlCount: extractedData?.controls.length || 0,
    keyReportCount: extractedData?.keyReports.length || 0
  });
  
  // Submit with Excel data so client gets pre-configured audit
  onSubmit(currentFormData, extractedData || undefined);
};

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-4">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Audit</h1>
          <p className="text-gray-300">Set up audit with control framework for client</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-4">
        {/* Upload Section FIRST - Better workflow */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Upload Control Framework 
            <span className="text-sm text-gray-400 font-normal">(Required for client auto-matching and walkthroughs)</span>
          </h3>
          
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 mb-3">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-300">Enhanced Features</h4>
                <p className="text-xs text-gray-300 mt-1">
                  Upload first to auto-fill form fields. Client will be auto-matched and see your pre-configured controls. 
                  <strong className="text-blue-300"> NEW:</strong> Walkthroughs auto-generated from Key Reports.
                </p>
              </div>
            </div>
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-900/30' 
                : extractedData
                ? 'border-green-400 bg-green-900/30'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {extractedData ? (
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-400" />
            ) : (
              <Upload className={`h-6 w-6 mx-auto mb-2 ${isDragOver ? 'text-blue-400' : 'text-gray-400'}`} />
            )}
            
            <p className="text-gray-300 mb-2 text-sm">
              {extractedData 
                ? `✅ Controls loaded: ${extractedData.controls.length} ITGCs, ${extractedData.itacs.length} ITACs, ${extractedData.keyReports.length} Reports`
                : isDragOver 
                ? 'Drop your Excel file here'
                : 'Upload Excel file with ITGCs, ITACs, and Key Reports'
              }
            </p>
            
            {!extractedData && (
              <>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Choose Control Framework File
                </label>
              </>
            )}

            {isProcessing && (
              <div className="mt-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-300">Processing controls and extracting walkthroughs...</span>
              </div>
            )}
          </div>

          {uploadedFile && (
            <div className="mt-3 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{uploadedFile.name}</p>
                  {extractedData && (
                    <p className="text-xs text-green-400">
                      ✓ Successfully processed control framework + walkthrough data
                    </p>
                  )}
                </div>
                {extractedData && <CheckCircle className="h-4 w-4 text-green-400" />}
              </div>
            </div>
          )}
        </div>

        {/* Form Fields BELOW Upload - Gets auto-filled */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Website *
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="www.company.com"
            />
            <p className="text-xs text-gray-400 mt-1">Used for client auto-matching</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Audit Type
            </label>
            <select
              value={formData.auditType}
              onChange={(e) => handleInputChange('auditType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            >
              <option value="SOC 2">SOC 2</option>
              <option value="SOC 1">SOC 1</option>
              <option value="SOX">SOX</option>
              <option value="ISAE 3402">ISAE 3402</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="Enter client ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Client Lead
            </label>
            <input
              type="text"
              value={formData.clientLead}
              onChange={(e) => handleInputChange('clientLead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="Enter client lead name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Audit Lead
            </label>
            <input
              type="text"
              value={formData.auditLead}
              onChange={(e) => handleInputChange('auditLead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="Enter audit lead name"
            />
          </div>
        </div>

        {/* Compact Submit Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !formData.companyName}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            {extractedData 
              ? `Create Audit with ${extractedData.controls.length + extractedData.itacs.length + extractedData.keyReports.length} Controls + Walkthroughs`
              : 'Create Basic Audit'
            }
          </button>
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}