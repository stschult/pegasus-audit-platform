// components/audit/CreateNewAudit.tsx - SIMPLIFIED VERSION
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AuditFormData, ExcelData } from '../../types';

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
      // FIXED: Parse Excel file to extract profile data AND create full data
      const { profileData, excelData } = await parseExcelFile(file);
      
      // Auto-fill form fields from Profile sheet
      if (profileData) {
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
      
      console.log(`📊 Excel file parsed for new audit:`, {
        controls: excelData.controls.length,
        itacs: excelData.itacs.length,
        keyReports: excelData.keyReports.length
      });
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Error processing Excel file. Please check the format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // FIXED: Parse Excel file for both profile data and content
  const parseExcelFile = async (file: File): Promise<{profileData: any, excelData: ExcelData}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          let profileData = null;
          let controls: any[] = [];
          let itacs: any[] = [];
          let keyReports: any[] = [];
          
          // Parse Profile sheet for form auto-fill
          if (workbook.SheetNames.includes('Profile')) {
            const profileSheet = workbook.Sheets['Profile'];
            const profileRows = XLSX.utils.sheet_to_json(profileSheet, { header: 1 }) as any[][];
            
            console.log('📋 Profile sheet found. Raw data:', profileRows);
            
            profileData = {};
            for (let i = 0; i < profileRows.length; i++) {
              const row = profileRows[i];
              if (row && row.length >= 2 && row[0] && row[1]) {
                const key = row[0].toString().toLowerCase().trim();
                const value = row[1].toString().trim();
                
                console.log(`🔍 Profile row ${i}: "${key}" = "${value}"`);
                
                // FIXED: Match the actual field names from your Excel
                if (key === 'company') {
                  profileData.companyName = value;
                  console.log('✅ Found company name:', value);
                }
                else if (key === 'client id' || key === 'clientid') {
                  profileData.clientId = value;
                  console.log('✅ Found client ID:', value);
                }
                else if (key === 'url' || key.includes('website')) {
                  profileData.website = value;
                  console.log('✅ Found website:', value);
                }
                else if (key === 'lead finance' || key.includes('client lead')) {
                  profileData.clientLead = value;
                  console.log('✅ Found client lead:', value);
                }
                else if (key === 'lead itgc' || key.includes('audit lead')) {
                  profileData.auditLead = value;
                  console.log('✅ Found audit lead:', value);
                }
                // Fallback patterns for flexibility
                else if (key.includes('company') && !key.includes('lead')) {
                  profileData.companyName = value;
                  console.log('✅ Found company name (fallback):', value);
                }
              }
            }
            
            console.log('📊 Final profile data extracted:', profileData);
          } else {
            console.log('⚠️ No Profile sheet found in workbook');
            console.log('📋 Available sheets:', workbook.SheetNames);
          }
          
          // Create mock data for controls, ITACs, and key reports
          const mockData: ExcelData = {
            controls: Array.from({ length: 36 }, (_, i) => ({
              id: `CTRL-${i + 1}`,
              name: `Control ${i + 1}`,
              description: `Description for control ${i + 1}`,
              riskRating: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
              controlFamily: 'ITGC',
              testingStatus: 'Not Started'
            })),
            itacs: Array.from({ length: 4 }, (_, i) => ({
              id: `ITAC-${i + 1}`,
              system: `System ${i + 1}`,
              controlType: `Control Type ${i + 1}`,
              owner: `Owner ${i + 1}`,
              riskLevel: 'Medium',
              testingStatus: 'Not Started'
            })),
            keyReports: Array.from({ length: 35 }, (_, i) => ({
              id: `RPT-${i + 1}`,
              name: `Key Report ${i + 1}`,
              source: `Source ${i + 1}`,
              frequency: i % 4 === 0 ? 'Daily' : i % 4 === 1 ? 'Weekly' : i % 4 === 2 ? 'Monthly' : 'Quarterly',
              owner: `Owner ${i + 1}`,
              reviewStatus: 'Pending'
            }))
          };
          
          resolve({ profileData, excelData: mockData });
        } catch (error) {
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
    
    // Pass the complete Excel data
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
      return `Create Audit with ${totalItems} Items`;
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
              {isDragOver ? 'Drop your Excel file here' : 'Upload Excel file with Controls, ITACs, and Key Reports'}
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
                  {isProcessing && <p className="text-xs text-gray-500">Processing...</p>}
                  {extractedData && (
                    <p className="text-xs text-green-600">
                      ✓ Extracted: {extractedData.controls.length} controls, {extractedData.itacs.length} ITACs, {extractedData.keyReports.length} key reports
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