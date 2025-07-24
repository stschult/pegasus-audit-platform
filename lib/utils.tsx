// lib/utils.tsx
import { ExtractedControl, ExtractedITAC, ExtractedKeyReport, ExcelData, Control } from '../types';

/**
 * Simulates Excel file parsing - replace with real SheetJS implementation
 */
export const parseExcelFile = async (fileName: string): Promise<ExcelData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: ExcelData = {
        controls: [
          {
            id: 'CTRL-001',
            name: 'User Access Management',
            description: 'Management reviews user access rights quarterly',
            riskRating: 'High',
            controlFamily: 'IT General Controls',
            controlType: 'Manual',
            frequency: 'Quarterly',
            owner: 'IT Security Team'
          }
        ],
        itacs: [
          {
            id: 'ITAC-001',
            name: 'Automated Invoice Matching',
            systemName: 'ERP System',
            description: 'System automatically matches purchase orders',
            controlType: 'Preventive',
            riskLevel: 'Medium',
            owner: 'Accounts Payable',
            frequency: 'Real-time'
          }
        ],
        keyReports: [
          {
            id: 'RPT-001',
            name: 'Daily Cash Position Report',
            description: 'Daily report showing cash balances',
            period: 'Daily',
            source: 'Treasury System',
            owner: 'Treasury',
            frequency: 'Daily'
          }
        ]
      };
      resolve(mockData);
    }, 2000);
  });
};

/**
 * Processes Excel data into structured format
 */
export const processControlData = (data: ExcelData) => {
  return {
    controls: data.controls,
    itacs: data.itacs,
    keyReports: data.keyReports
  };
};

/**
 * Validates if uploaded file is Excel format
 */
export const isValidExcelFile = (file: File): boolean => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  return allowedTypes.includes(file.type) || 
         file.name.endsWith('.xlsx') || 
         file.name.endsWith('.xls');
};

/**
 * Filters controls based on search term, status, and risk
 */
export const filterControls = (
  controls: Control[], 
  searchTerm: string, 
  selectedStatus: string, 
  selectedRisk: string
): Control[] => {
  return controls.filter(control => {
    const matchesSearch = control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || control.status === selectedStatus;
    const matchesRisk = selectedRisk === 'all' || control.riskRating === selectedRisk;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });
};

/**
 * Formats file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets appropriate color classes for risk rating
 */
export const getRiskRatingColor = (riskRating: string): string => {
  switch (riskRating) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};