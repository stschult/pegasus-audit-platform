// lib/utils.tsx
import * as XLSX from 'xlsx';
import { ExtractedControl, ExtractedITAC, ExtractedKeyReport, ExcelData, Control } from '../types';

/**
 * Real Excel file parsing using SheetJS - Fixed Detection Logic
 */
export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        console.log('📊 Excel file loaded:', file.name);
        console.log('📋 Available sheets:', workbook.SheetNames);
        
        const result: ExcelData = {
          controls: [], // These are now ITGCs
          itacs: [],
          keyReports: []
        };
        
        workbook.SheetNames.forEach(sheetName => {
          console.log(`\n🔍 Processing sheet: "${sheetName}"`);
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            console.log(`⚠️ Sheet "${sheetName}" is empty or has no data`);
            return;
          }
          
          // Process headers more carefully - keep original indices
          const originalHeaders = jsonData[0] as any[];
          const headerMapping: { [key: string]: number } = {};
          const cleanHeaders: string[] = [];
          
          originalHeaders.forEach((header, index) => {
            if (header !== null && header !== undefined && header.toString().trim() !== '') {
              const cleanHeader = header.toString().toLowerCase().trim();
              headerMapping[cleanHeader] = index;
              cleanHeaders.push(cleanHeader);
            }
          });
          
          console.log('📝 Clean headers found:', cleanHeaders);
          
          // Fixed sheet type detection - PRIORITIZE SHEET NAME
          const sheetType = detectSheetType(sheetName, cleanHeaders);
          console.log(`🎯 Sheet "${sheetName}" identified as ${sheetType === 'control' ? 'ITGC' : sheetType}`);
          
          // Process data rows
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            
            // Skip empty rows
            if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
              continue;
            }
            
            // Create row object using header mapping
            const rowData: any = {};
            cleanHeaders.forEach((header) => {
              const columnIndex = headerMapping[header];
              if (columnIndex !== undefined && row[columnIndex] !== undefined) {
                const cellValue = row[columnIndex];
                rowData[header] = cellValue ? cellValue.toString().trim() : '';
              }
            });
            
            console.log(`📝 Row ${i} data keys:`, Object.keys(rowData));
            
            // Process based on type
            if (sheetType === 'control') {
              const control = extractControlFromRow(rowData, cleanHeaders);
              if (control) {
                result.controls.push(control);
                console.log(`✅ Added ITGC: ${control.name}`);
              }
            } else if (sheetType === 'itac') {
              const itac = extractITACFromRow(rowData, cleanHeaders);
              if (itac) {
                result.itacs.push(itac);
                console.log(`✅ Added ITAC: ${itac.system}`);
              }
            } else if (sheetType === 'report') {
              const report = extractKeyReportFromRow(rowData, cleanHeaders);
              if (report) {
                result.keyReports.push(report);
                console.log(`✅ Added Report: ${report.name}`);
              }
            }
          }
        });
        
        console.log('\n✅ Extraction complete:');
        console.log(`🛡️ ITGCs: ${result.controls.length}`);
        console.log(`⚙️ ITACs: ${result.itacs.length}`);
        console.log(`📋 Key Reports: ${result.keyReports.length}`);
        
        resolve(result);
      } catch (error) {
        console.error('❌ Error parsing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

/**
 * Fixed sheet type detection - PRIORITIZE SHEET NAME
 */
function detectSheetType(sheetName: string, headers: string[]): 'control' | 'itac' | 'report' {
  console.log(`🔍 Detecting type for sheet "${sheetName}" with ${headers.length} headers`);
  
  const name = sheetName.toLowerCase();
  
  // PRIORITIZE SHEET NAME - If sheet name is clear, use it!
  if (name.includes('itgc') || name === 'itgcs') {
    console.log(`📋 Sheet name "${sheetName}" clearly indicates ITGC`);
    return 'control';
  }
  
  if (name.includes('key reports') || name === 'key reports') {
    console.log(`📋 Sheet name "${sheetName}" clearly indicates Key Reports`);
    return 'report';
  }
  
  if (name.includes('itac') || name === 'itacs') {
    console.log(`📋 Sheet name "${sheetName}" clearly indicates ITACs`);
    return 'itac';
  }
  
  // Fallback to header detection only if sheet name is unclear
  console.log(`📋 Sheet name unclear, checking headers...`);
  return detectSheetTypeByHeaders(headers);
}

function detectSheetTypeByHeaders(headers: string[]): 'control' | 'itac' | 'report' {
  if (!headers || headers.length === 0) {
    return 'control';
  }
  
  const headerStr = headers.filter(h => h && h.trim() !== '').join(' ').toLowerCase();
  console.log('📝 Checking headers string:', headerStr);
  
  // Very specific ITAC indicators
  const itacIndicators = [
    'application control', 'automated control', 'system validation', 'programmed control'
  ];
  
  // Report indicators - but be more specific
  const reportIndicators = [
    'report name', 'report title', 'generated by', 'report source'
  ];
  
  const itacMatches = itacIndicators.filter(indicator => headerStr.includes(indicator)).length;
  const reportMatches = reportIndicators.filter(indicator => headerStr.includes(indicator)).length;
  
  console.log(`📊 Header matches - Reports: ${reportMatches}, ITACs: ${itacMatches}`);
  
  if (reportMatches >= 1) {
    return 'report';
  }
  
  if (itacMatches >= 1) {
    return 'itac';
  }
  
  // Default to control (ITGC)
  return 'control';
}

/**
 * Extract control from row data - FIXED to exclude headers and empty rows
 */
function extractControlFromRow(rowData: any, headers: string[]): ExtractedControl | null {
  try {
    console.log('🔧 Attempting to extract control from row:', Object.keys(rowData));
    
    // Your specific headers: 'ref #', 'control #', 'control description', 'pwc risk rating (h/m/l)', 'control frequency', 'preventative or detective'
    const idField = headers.find(h => 
      h && (h.includes('ref #') || h.includes('control #') || h.includes('id'))
    );
    
    const nameField = headers.find(h => 
      h && (h.includes('control description') || h.includes('description') || h.includes('name'))
    );
    
    const riskField = headers.find(h => 
      h && (h.includes('risk rating') || h.includes('risk') || h.includes('rating'))
    );
    
    console.log('🔧 Field mapping:', { idField, nameField, riskField });
    
    // Extract data
    const controlId = idField ? rowData[idField] : `CTRL-${Math.random().toString(36).substr(2, 6)}`;
    const controlName = nameField ? rowData[nameField] : null;
    const riskRating = riskField ? rowData[riskField] : 'Medium';
    
    // FIXED: Filter out header rows and empty/invalid data
    if (!controlName || 
        controlName.trim() === '' || 
        controlName.trim() === 'undefined' ||
        controlName.toLowerCase().includes('control description') || // Skip header row
        controlName.toLowerCase().includes('description') || // Skip header variations
        controlName.toLowerCase() === 'control' ||
        controlName.length < 5 || // Skip very short descriptions
        controlId === 'Generated ID' || // Skip generated IDs for headers
        /^(ref #|control #|id)$/i.test(controlName) || // Skip if it's just a header value
        controlName.toLowerCase() === controlName.toLowerCase().replace(/[a-z]/g, '') // Skip if no letters (just symbols/numbers)
    ) {
      console.log('⚠️ Skipping invalid/header row:', controlName);
      return null;
    }
    
    // If we have a meaningful control description, create a control
    const control = {
      id: controlId || 'Generated ID',
      name: controlName,
      description: controlName, // Use description as name since that's what you have
      riskRating: riskRating,
      controlFamily: 'ITGC',
      testingStatus: 'Not Started'
    };
    
    console.log('✅ Successfully extracted control:', control.name);
    return control;
  } catch (error) {
    console.error('❌ Error extracting control:', error);
    return null;
  }
}

/**
 * Extract ITAC from row data - Fixed to prevent double counting
 */
function extractITACFromRow(rowData: any, headers: string[]): ExtractedITAC | null {
  try {
    console.log('🔧 Attempting to extract ITAC from row:', Object.keys(rowData), 'Values:', Object.values(rowData));
    
    // Find system name or any meaningful identifier
    const systemField = headers.find(h => 
      h && (h.includes('system') || h.includes('application') || h.includes('app') || h.includes('testing approach'))
    );
    
    const idField = headers.find(h => 
      h && (h.includes('id') || h.includes('control') || h.includes('ref'))
    );
    
    const systemName = systemField ? rowData[systemField] : null;
    const itacId = idField ? rowData[idField] : systemName;
    
    console.log('🔧 ITAC extraction - systemName:', systemName, 'itacId:', itacId);
    
    // Be more selective - only create ITAC if we have meaningful data
    if (!systemName || 
        systemName.trim() === '' || 
        systemName === 'Unknown System' ||
        systemName.length < 2 ||
        /^\d+$/.test(systemName.trim()) || // Skip if it's just a number
        systemName.toLowerCase().includes('control #') || // Skip header-like values
        systemName.toLowerCase().includes('testing approach')) { // Skip generic values
      
      console.log('⚠️ Skipping ITAC - not meaningful data:', systemName);
      return null;
    }
    
    const itac = {
      id: itacId || `ITAC-${Math.random().toString(36).substr(2, 6)}`,
      system: systemName,
      controlType: 'Application Control',
      owner: 'Unassigned',
      riskLevel: 'Medium',
      testingStatus: 'Not Started'
    };
    
    console.log('✅ Creating ITAC:', itac);
    return itac;
  } catch (error) {
    console.error('❌ Error extracting ITAC:', error);
    return null;
  }
}

/**
 * Extract key report from row data
 */
function extractKeyReportFromRow(rowData: any, headers: string[]): ExtractedKeyReport | null {
  try {
    // Find report name
    const nameField = headers.find(h => 
      h && (h.includes('report name') || h.includes('name') || h.includes('title'))
    );
    
    // Find frequency
    const frequencyField = headers.find(h => 
      h && (h.includes('frequency') || h.includes('schedule') || h.includes('period'))
    );
    
    // Find source/application
    const sourceField = headers.find(h => 
      h && (h.includes('application') || h.includes('source') || h.includes('system'))
    );
    
    // Find owner
    const ownerField = headers.find(h => 
      h && (h.includes('business owner') || h.includes('owner') || h.includes('responsible'))
    );
    
    const reportName = nameField ? rowData[nameField] : null;
    
    if (!reportName || reportName.trim() === '') {
      return null;
    }
    
    return {
      id: `RPT-${Math.random().toString(36).substr(2, 6)}`,
      name: reportName,
      frequency: rowData[frequencyField] || 'Unknown',
      source: rowData[sourceField] || 'Unknown Source',
      owner: rowData[ownerField] || 'Unassigned',
      reviewStatus: 'Pending'
    };
  } catch (error) {
    console.error('Error extracting key report:', error);
    return null;
  }
}

// Helper functions
export const filterControls = (controls: Control[], searchTerm: string, statusFilter: string) => {
  return controls.filter(control => {
    const matchesSearch = control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || control.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getRiskRatingColor = (rating: string): string => {
  switch (rating.toLowerCase()) {
    case 'high': return 'text-red-600 bg-red-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

export const isValidExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  return validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
};