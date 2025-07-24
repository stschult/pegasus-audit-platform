// lib/utils.tsx
import { ExtractedControl, ExtractedITAC, ExtractedKeyReport, ExcelData } from '@/types';
import { MOCK_EXCEL_DATA } from './constants';

/**
 * Simulates Excel file parsing - replace with real SheetJS implementation
 */
export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_EXCEL_DATA);
    }, 2000);
  });
};

/**
 * Processes raw Excel control data into standardized format
 */
export const processControlData = (data: any[]): ExtractedControl[] => {
  return data.map((row, index) => ({
    id: row['Control ID'] || `CTRL-${index + 1}`,
    title: row['Control Title'] || row['Control Name'] || 'Untitled Control',
    description: row['Control Description'] || row['Description'] || 'No description available',
    owner: row['Owner'] || 'Unknown',
    riskRating: row['Risk Rating'] || 'Medium',
    controlType: row['Control Type'] || 'Manual',
    frequency: row['Frequency'] || 'Annual',
    location: row['Location'] || 'Corporate',
    category: row['Category'] || 'General',
    subcategory: row['Subcategory'] || 'Other',
    status: 'extracted',
    needsReview: true,
    progress: 0,
    refNumber: index + 1,
    // Preserve original Excel fields
    ...row
  }));
};

/**
 * Processes raw Excel ITAC data into standardized format
 */
export const processITACData = (data: any[]): ExtractedITAC[] => {
  return data.map((row, index) => ({
    id: row['ITAC ID'] || `ITAC-${index + 1}`,
    controlName: row['Control Name'] || 'Untitled ITAC',
    description: row['Description'] || 'No description available',
    application: row['Application'] || 'Unknown System',
    controlType: row['Control Type'] || 'Preventive',
    frequency: row['Frequency'] || 'Daily',
    owner: row['Owner'] || 'Unknown',
    automationLevel: row['Automation Level'] || 'Semi-Automated',
    keyFields: row['Key Fields'] || 'Not specified',
    exceptionHandling: row['Exception Handling'] || 'Manual review',
    status: 'extracted',
    needsReview: true,
    // Preserve original Excel fields
    ...row
  }));
};

/**
 * Processes raw Excel Key Report data into standardized format
 */
export const processKeyReportData = (data: any[]): ExtractedKeyReport[] => {
  return data.map((row, index) => ({
    id: row['Report ID'] || `RPT-${index + 1}`,
    reportName: row['Report Name'] || 'Untitled Report',
    description: row['Description'] || 'No description available',
    owner: row['Owner'] || 'Unknown',
    application: row['Application'] || 'Unknown System',
    frequency: row['Frequency'] || 'Monthly',
    recipients: row['Recipients'] || 'Not specified',
    keyFields: row['Key Fields'] || 'Not specified',
    format: row['Format'] || 'Excel',
    automated: row['Automated'] || 'No',
    status: 'extracted',
    needsReview: true,
    // Preserve original Excel fields
    ...row
  }));
};

/**
 * Validates Excel file type
 */
export const isValidExcelFile = (file: File): boolean => {
  return file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

/**
 * Gets risk rating color classes
 */
export const getRiskRatingColor = (rating: string): string => {
  switch (rating?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Generates unique file ID
 */
export const generateFileId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

/**
 * Creates audit from form data
 */
export const createAuditFromFormData = (formData: any, existingAudits: any[]) => {
  return {
    id: String(existingAudits.length + 1),
    clientName: formData.companyName,
    relationshipOwner: formData.clientLead,
    auditOwner: formData.auditLead,
    progress: 0,
    website: formData.companyWebsite,
    clientId: formData.clientUniqueId,
    auditTypes: formData.auditTypes,
    startDate: formData.auditStartDate,
    completionDate: formData.expectedCompletionDate
  };
};

/**
 * Filters controls based on search term and status
 */
export const filterControls = (controls: any[], searchTerm: string, statusFilter: string) => {
  return controls.filter(control => {
    const matchesSearch = control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || control.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};