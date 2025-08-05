// components/audit/CreateNewAudit.tsx - WITH COLUMN F FREQUENCY FIX
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';
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
    auditType: '',
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
      console.log(`🚀 Starting Excel file processing: ${file.name}`);
      
      // Parse Excel file to extract profile data AND create real data
      const { profileData, excelData } = await parseExcelFile(file);
      
      // Auto-fill form fields from Profile sheet
      if (profileData) {
        console.log(`📋 Auto-filling form with profile data:`, profileData);
        setFormData(prev => ({
          ...prev,
          companyName: profileData.companyName || prev.companyName,
          clientId: profileData.clientId || prev.clientId,
          website: profileData.website || prev.website,
          clientLead: profileData.clientLead || prev.clientLead,
          auditLead: profileData.auditLead || prev.auditLead
        }));
      }
      
      setExtractedData(excelData);
      
      console.log(`🎉 Excel file parsed successfully:`, {
        controls: excelData.controls.length,
        itacs: excelData.itacs.length,
        keyReports: excelData.keyReports.length,
        applications: excelData.applications?.length || 0
      });
      
      if (excelData.controls.length > 0) {
        console.log(`🔍 Sample control with frequency:`, excelData.controls[0]);
      }
      
    } catch (error) {
      console.error('❌ Error processing Excel file:', error);
      alert('Error processing Excel file. Please check the format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function for extracting meaningful titles from real descriptions
  const getShortDescriptionForParsing = (fullDescription: string, type: 'control' | 'itac' | 'report', reportName?: string, processName?: string): string => {
    console.log(`📝 getShortDescriptionForParsing called with: "${fullDescription.substring(0, 50)}..." type: ${type}`);
    
    // For reports, use the Report Name field directly
    if (type === 'report' && reportName) {
      console.log(`✅ Using report name: ${reportName}`);
      return reportName;
    }
    
    // For ITACs, use the Process field directly
    if (type === 'itac' && processName) {
      console.log(`✅ Using process name: ${processName}`);
      return processName;
    }
    
    // For ITGCs, extract main topic from description
    if (type === 'control') {
      const desc = fullDescription.toLowerCase();
      
      if (desc.includes('back-up') || desc.includes('backup')) {
        console.log(`✅ Identified as System Backups`);
        return 'System Backups';
      }
      if (desc.includes('access') && desc.includes('review')) {
        console.log(`✅ Identified as Access Review`);
        return 'Access Review';
      }
      if (desc.includes('physical access')) {
        console.log(`✅ Identified as Physical Security`);
        return 'Physical Security';
      }
      if (desc.includes('password')) {
        console.log(`✅ Identified as Password Management`);
        return 'Password Management';
      }
      if (desc.includes('change') && (desc.includes('management') || desc.includes('approval'))) {
        console.log(`✅ Identified as Change Management`);
        return 'Change Management';
      }
      if (desc.includes('monitoring') || desc.includes('log')) {
        console.log(`✅ Identified as System Monitoring`);
        return 'System Monitoring';
      }
      if (desc.includes('privilege')) {
        console.log(`✅ Identified as Privileged Access`);
        return 'Privileged Access';
      }
      if (desc.includes('patch') || desc.includes('update')) {
        console.log(`✅ Identified as Patch Management`);
        return 'Patch Management';
      }
      if (desc.includes('testing') && desc.includes('program')) {
        console.log(`✅ Identified as Testing Controls`);
        return 'Testing Controls';
      }
      if (desc.includes('approval') && desc.includes('program')) {
        console.log(`✅ Identified as Change Approval`);
        return 'Change Approval';
      }
      if (desc.includes('vulnerability')) {
        console.log(`✅ Identified as Vulnerability Management`);
        return 'Vulnerability Management';
      }
      if (desc.includes('segregation') && desc.includes('duties')) {
        console.log(`✅ Identified as Segregation of Duties`);
        return 'Segregation of Duties';
      }
      if (desc.includes('encryption')) {
        console.log(`✅ Identified as Data Encryption`);
        return 'Data Encryption';
      }
      if (desc.includes('network') || desc.includes('firewall')) {
        console.log(`✅ Identified as Network Security`);
        return 'Network Security';
      }
      
      // Fallback: return first meaningful phrase
      const words = fullDescription.split(' ');
      const fallback = words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
      console.log(`⚠️ Using fallback title: ${fallback}`);
      return fallback;
    }
    
    // Fallback for other types
    const fallback = fullDescription.split(' ').slice(0, 3).join(' ') + '...';
    console.log(`⚠️ Using generic fallback: ${fallback}`);
    return fallback;
  };

  // Helper function for parsing risk ratings
  const parseRiskRating = (value: string): string => {
    const lowerValue = value.toLowerCase().trim();
    console.log(`🔍 Parsing risk rating: "${value}" -> "${lowerValue}"`);
    
    if (lowerValue === 'h' || lowerValue.includes('high')) {
      console.log(`✅ Risk rating identified as High`);
      return 'High';
    }
    if (lowerValue === 'l' || lowerValue.includes('low')) {
      console.log(`✅ Risk rating identified as Low`);
      return 'Low';
    }
    console.log(`✅ Risk rating identified as Medium (default)`);
    return 'Medium';
  };

  // NEW: Helper function for parsing frequency values - matches sampling engine expectations
  const parseFrequency = (value: string): string => {
    if (!value) {
      console.log(`⚠️ No frequency value provided, defaulting to Monthly`);
      return 'Monthly';
    }
    
    const lowerValue = value.toLowerCase().trim();
    console.log(`🔍 Parsing frequency: "${value}" -> "${lowerValue}"`);
    
    // Map Excel frequency values to EXACT format expected by sampling engine
    if (lowerValue.includes('annual') || lowerValue === 'yearly' || lowerValue === '1/year' || lowerValue === 'annually') {
      console.log(`✅ Frequency identified as Annually`);
      return 'Annually';
    }
    if (lowerValue.includes('quarter') || lowerValue === '4/year' || lowerValue.includes('q1') || lowerValue.includes('q2') || lowerValue.includes('q3') || lowerValue.includes('q4') || lowerValue === 'quarterly') {
      console.log(`✅ Frequency identified as Quarterly`);
      return 'Quarterly';
    }
    if (lowerValue.includes('month') || lowerValue === '12/year' || lowerValue.includes('/month') || lowerValue === 'monthly') {
      console.log(`✅ Frequency identified as Monthly`);
      return 'Monthly';
    }
    if (lowerValue.includes('week') || lowerValue === '52/year' || lowerValue.includes('/week') || lowerValue === 'weekly') {
      console.log(`✅ Frequency identified as Weekly`);
      return 'Weekly';
    }
    if (lowerValue.includes('daily') || lowerValue.includes('/day')) {
      console.log(`✅ Frequency identified as Daily`);
      return 'Daily';
    }
    if (lowerValue.includes('as needed') || lowerValue.includes('adhoc') || lowerValue.includes('ad hoc') || lowerValue === 'n/a') {
      console.log(`✅ Frequency identified as As needed`);
      return 'As needed';
    }
    if (lowerValue.includes('continuous') || lowerValue.includes('ongoing') || lowerValue.includes('real-time')) {
      console.log(`✅ Frequency identified as Continuous`);
      return 'Continuous';
    }
    
    // Default fallback - use Monthly as safe default
    console.log(`⚠️ Unknown frequency "${value}", defaulting to Monthly`);
    return 'Monthly';
  };

  // FIXED: parseControlsFromSheet now extracts Column F (frequency)
  const parseControlsFromSheet = (data: any[][], sheetName: string): ExtractedControl[] => {
    console.log(`🚀 parseControlsFromSheet called for sheet: ${sheetName}`);
    console.log(`📊 Input data has ${data.length} rows`);
    
    if (data.length < 3) {
      console.log(`⚠️ Not enough rows in sheet ${sheetName}, returning empty array`);
      return [];
    }
    
    const controls: ExtractedControl[] = [];
    
    console.log(`🔍 Analyzing sheet structure for ${sheetName}:`);
    console.log(`   Row 0 (headers):`, data[0]);
    console.log(`   Row 1 (sub-headers):`, data[1]);
    console.log(`   Row 2 (first data):`, data[2]);
    
    // Start from row 2 (index 2) to skip headers
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      console.log(`\n🔍 Processing row ${i + 1}:`, row);
      
      if (!row || row.length === 0) {
        console.log(`⚠️ Skipping empty row ${i + 1}`);
        continue;
      }
      
      // Check if we have the essential columns (C and D)
      if (!row[2] || !row[3]) {
        console.log(`⚠️ Skipping row ${i + 1} - missing control ID (C) or description (D)`);
        continue;
      }
      
      try {
        // Extract actual data from Excel columns - NOW INCLUDING COLUMN F
        const controlId = row[2]?.toString().trim(); // Column C - Control ID
        const actualDescription = row[3]?.toString().trim(); // Column D - Control Description
        const riskRating = row[4]?.toString().trim() || 'M'; // Column E - Risk Rating
        const frequencyRaw = row[5]?.toString().trim() || 'Monthly'; // Column F - Frequency ✅ ADDED!
        
        console.log(`📝 Extracted data from row ${i + 1}:`);
        console.log(`   Control ID: "${controlId}"`);
        console.log(`   Description: "${actualDescription}"`);
        console.log(`   Risk Rating: "${riskRating}"`);
        console.log(`   Frequency (raw): "${frequencyRaw}"`); // ✅ NEW LOG
        
        if (!actualDescription || actualDescription.length < 5) {
          console.log(`⚠️ Skipping row ${i + 1} - description too short: "${actualDescription}"`);
          continue;
        }
        
        // Generate meaningful title from REAL description
        const shortTitle = getShortDescriptionForParsing(actualDescription, 'control');
        console.log(`🏷️ Generated title for "${actualDescription}": "${shortTitle}"`);
        
        // Parse frequency to standard format
        const parsedFrequency = parseFrequency(frequencyRaw);
        console.log(`📅 Parsed frequency: "${frequencyRaw}" -> "${parsedFrequency}"`);
        
        const control: ExtractedControl = {
          id: controlId,
          name: shortTitle, // This will be "System Backups", "Access Review", etc.
          description: actualDescription, // Full real description from Excel
          riskRating: parseRiskRating(riskRating),
          frequency: parsedFrequency, // ✅ NEW FIELD - Now includes actual Excel frequency!
          controlFamily: 'ITGC',
          testingStatus: 'Not Started'
        };
        
        controls.push(control);
        console.log(`✅ Successfully added control:`, {
          id: control.id,
          name: control.name,
          description: control.description.substring(0, 50) + '...',
          riskRating: control.riskRating,
          frequency: control.frequency // ✅ NEW LOG
        });
        
      } catch (err) {
        console.error(`❌ Error parsing control row ${i + 1}:`, err);
      }
    }
    
    console.log(`🎉 parseControlsFromSheet completed for ${sheetName}`);
    console.log(`📊 Total controls parsed: ${controls.length}`);
    
    // ✅ NEW: Log frequency distribution
    const frequencyCounts = controls.reduce((acc, control) => {
      acc[control.frequency] = (acc[control.frequency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`📊 Frequency distribution:`, frequencyCounts);
    
    return controls;
  };

  const parseITACsFromSheet = (data: any[][], sheetName: string): ExtractedITAC[] => {
    console.log(`🚀 parseITACsFromSheet called for sheet: ${sheetName}`);
    console.log(`📊 Input data has ${data.length} rows`);
    
    if (data.length < 2) {
      console.log(`⚠️ Not enough rows in sheet ${sheetName}`);
      return [];
    }
    
    const itacs: ExtractedITAC[] = [];
    const seenIds = new Set<string>();
    
    // Start from row 6 (index 6) where actual ITAC data begins
    for (let i = 6; i < data.length; i++) {
      const row = data[i];
      console.log(`\n🔍 Processing ITAC row ${i + 1}:`, row);
      
      if (!row || row.length === 0) {
        console.log(`⚠️ Skipping empty row ${i + 1}`);
        continue;
      }
      
      const firstCol = row[0]?.toString().trim();
      if (!firstCol || !firstCol.match(/^\d+$/)) {
        console.log(`⚠️ Skipping non-data row ${i + 1}: "${firstCol}"`);
        continue;
      }
      
      try {
        const controlId = row[1]?.toString().trim() || 'Unknown ID'; // Column B
        const processName = row[2]?.toString().trim() || 'Unknown Process'; // Column C
        const controlDescription = row[3]?.toString().trim() || ''; // Column D
        const owner = row[5]?.toString().trim() || 'Unknown Owner'; // Column F
        const riskRating = row[7]?.toString().trim() || 'L'; // Column H
        const system = row[8]?.toString().trim() || 'Unknown System'; // Column I
        
        console.log(`📝 Extracted ITAC data from row ${i + 1}:`);
        console.log(`   Control ID: "${controlId}"`);
        console.log(`   Process: "${processName}"`);
        console.log(`   System: "${system}"`);
        
        // Skip duplicates
        if (seenIds.has(controlId)) {
          console.log(`⚠️ Skipping duplicate ITAC: ${controlId}`);
          continue;
        }
        
        seenIds.add(controlId);
        
        const itac: ExtractedITAC = {
          id: controlId,
          system: system,
          controlType: controlDescription || processName,
          owner: owner,
          riskLevel: parseRiskRating(riskRating) as any,
          testingStatus: 'Not Started',
          controlDescription: controlDescription,
          processName: processName
        };
        
        itacs.push(itac);
        console.log(`✅ Successfully added ITAC: ${itac.id}`);
        
      } catch (err) {
        console.error(`❌ Error parsing ITAC row ${i + 1}:`, err);
      }
    }
    
    console.log(`🎉 parseITACsFromSheet completed: ${itacs.length} ITACs`);
    return itacs;
  };

  const parseReportsFromSheet = (data: any[][], sheetName: string): ExtractedKeyReport[] => {
    console.log(`🚀 parseReportsFromSheet called for sheet: ${sheetName}`);
    console.log(`📊 Input data has ${data.length} rows`);
    
    if (data.length < 2) {
      console.log(`⚠️ Not enough rows in sheet ${sheetName}`);
      return [];
    }
    
    const reports: ExtractedKeyReport[] = [];
    
    // Start from row 1 (index 1) to skip header
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      console.log(`\n🔍 Processing report row ${i + 1}:`, row);
      
      if (!row || row.length === 0) {
        console.log(`⚠️ Skipping empty row ${i + 1}`);
        continue;
      }
      
      try {
        const reportName = row[3]?.toString().trim() || ''; // Column D - Report Name
        const controlDescription = row[4]?.toString().trim() || ''; // Column E - Description
        const application = row[6]?.toString().trim() || ''; // Column G - Application
        
        console.log(`📝 Extracted report data from row ${i + 1}:`);
        console.log(`   Report Name: "${reportName}"`);
        console.log(`   Application: "${application}"`);
        
        if (!reportName || reportName.length < 2) {
          console.log(`⚠️ Skipping row ${i + 1} - no meaningful report name`);
          continue;
        }
        
        const report: ExtractedKeyReport = {
          id: `RPT-${i}`,
          name: reportName, // Use actual report name from Excel
          source: application || 'Unknown Source',
          frequency: 'Monthly',
          owner: 'Unknown Owner',
          reviewStatus: 'Current',
          description: controlDescription || reportName
        };
        
        reports.push(report);
        console.log(`✅ Successfully added report: ${report.name}`);
        
      } catch (err) {
        console.error(`❌ Error parsing report row ${i + 1}:`, err);
      }
    }
    
    console.log(`🎉 parseReportsFromSheet completed: ${reports.length} reports`);
    return reports;
  };

  // UPDATED: Parse Excel file for profile data AND real content
  const parseExcelFile = async (file: File): Promise<{profileData: any, excelData: ExcelData}> => {
    console.log(`🚀 parseExcelFile called for: ${file.name}`);
    
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          console.log(`📋 Excel workbook loaded with ${workbook.SheetNames.length} sheets:`, workbook.SheetNames);
          
          let profileData = null;
          let applications: any[] = [];
          let controls: ExtractedControl[] = [];
          let itacs: ExtractedITAC[] = [];
          let keyReports: ExtractedKeyReport[] = [];
          
          // Parse Profile sheet for form auto-fill
          if (workbook.SheetNames.includes('Profile')) {
            const profileSheet = workbook.Sheets['Profile'];
            const profileRows = XLSX.utils.sheet_to_json(profileSheet, { header: 1 }) as any[][];
            
            console.log('📋 Profile sheet found. Processing...');
            
            profileData = {};
            for (let i = 0; i < profileRows.length; i++) {
              const row = profileRows[i];
              if (row && row.length >= 2 && row[0] && row[1]) {
                const key = row[0].toString().toLowerCase().trim();
                const value = row[1].toString().trim();
                
                if (key === 'company') profileData.companyName = value;
                else if (key === 'client id' || key === 'clientid') profileData.clientId = value;
                else if (key === 'url' || key.includes('website')) profileData.website = value;
                else if (key === 'lead finance' || key.includes('client lead')) profileData.clientLead = value;
                else if (key === 'lead itgc' || key.includes('audit lead')) profileData.auditLead = value;
              }
            }
            
            console.log('📊 Profile data extracted:', profileData);
          }
          
          // Parse each sheet for real data
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
          
          // Extract applications from Column G (keep existing logic)
          try {
            console.log('🔄 Extracting applications from Column G...');
            
            const sheetNames = ['Applications', 'Apps', 'Walkthrough', 'Key Reports', 'ITGCs', 'ITACs', workbook.SheetNames[0]];
            let applicationsSheet = null;
            let sheetNameUsed = '';
            
            for (const sheetName of sheetNames) {
              if (workbook.SheetNames.includes(sheetName)) {
                applicationsSheet = workbook.Sheets[sheetName];
                sheetNameUsed = sheetName;
                console.log(`📋 Found applications in sheet: ${sheetName}`);
                break;
              }
            }
            
            if (applicationsSheet) {
              const appRows = XLSX.utils.sheet_to_json(applicationsSheet, { header: 1 }) as any[][];
              const uniqueAppNames = new Set<string>();
              const tempApplications: any[] = [];
              
              for (let i = 1; i < appRows.length; i++) {
                const row = appRows[i];
                const appName = row[6]; // Column G
                
                if (appName && typeof appName === 'string' && appName.trim()) {
                  const trimmedName = appName.trim();
                  
                  if (!uniqueAppNames.has(trimmedName)) {
                    uniqueAppNames.add(trimmedName);
                    
                    const application = {
                      id: `app-${uniqueAppNames.size}`,
                      name: trimmedName,
                      description: `${trimmedName} application for walkthrough testing`,
                      riskLevel: 'medium',
                      owner: row[7] || 'Unknown',
                      category: row[8] || 'General'
                    };
                    
                    tempApplications.push(application);
                  }
                }
              }
              
              applications = tempApplications;
              console.log(`📱 Extracted ${applications.length} unique applications`);
            }
          } catch (error) {
            console.error('⚠️ Error extracting applications:', error);
            applications = [];
          }
          
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
          console.log(`   📊 Applications: ${applications.length}`);
          
          resolve({ profileData, excelData });
        } catch (error) {
          console.error('❌ Excel parsing error:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = () => {
    if (!formData.companyName) {
      alert('Please enter a company name');
      return;
    }
    
    console.log(`🚀 Submitting audit with data:`, {
      formData,
      hasExcelData: !!extractedData,
      excelDataSummary: extractedData ? {
        controls: extractedData.controls.length,
        itacs: extractedData.itacs.length,
        keyReports: extractedData.keyReports.length,
        applications: extractedData.applications?.length || 0
      } : 'None'
    });
    
    // Pass the REAL Excel data
    onSubmit(formData, extractedData || undefined);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const getButtonText = () => {
    if (extractedData) {
      const totalItems = extractedData.controls.length + extractedData.itacs.length + extractedData.keyReports.length;
      const appCount = extractedData.applications?.length || 0;
      return `Create Audit with ${totalItems} Items${appCount > 0 ? ` + ${appCount} Walkthroughs` : ''}`;
    }
    return 'Create Audit';
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Audit</h1>
          <p className="text-gray-600">Set up a new audit engagement</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID
            </label>
            <input
              type="text"
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter client ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Lead
            </label>
            <input
              type="text"
              value={formData.clientLead}
              onChange={(e) => handleInputChange('clientLead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter client lead name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audit Lead
            </label>
            <input
              type="text"
              value={formData.auditLead}
              onChange={(e) => handleInputChange('auditLead', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter audit lead name"
            />
          </div>
        </div>

        {/* Excel File Upload */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel File (Optional)</h3>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-gray-600 mb-2">
              {isDragOver ? 'Drop your Excel file here' : 'Upload Excel file with Controls, ITACs, Key Reports, and Applications'}
            </p>
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
              Choose Excel File
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                  {isProcessing && <p className="text-xs text-gray-500">Processing real Excel data...</p>}
                  {extractedData && (
                    <p className="text-xs text-green-600">
                      ✓ Extracted: {extractedData.controls.length} controls, {extractedData.itacs.length} ITACs, {extractedData.keyReports.length} key reports
                      {extractedData.applications && extractedData.applications.length > 0 && (
                        <span>, {extractedData.applications.length} unique applications for walkthroughs</span>
                      )}
                    </p>
                  )}
                </div>
                {extractedData && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {getButtonText()}
          </button>
          <button
            onClick={onBack}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}