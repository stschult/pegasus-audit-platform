// types/index.tsx

export interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  isClient: boolean;
}

export interface Audit {
  id: string;
  clientName: string;
  relationshipOwner: string;
  auditOwner: string;
  progress: number;
  website: string;
  clientId: string;
}

export interface Control {
  id: string;
  name: string;
  description: string;
  status: 'not-started' | 'walkthrough' | 'design_review' | 'testing' | 'evidence_review' | 'management_review' | 'deficiency_review' | 'completed';
  riskRating: string;
  controlFamily: string;
  lastUpdated: string;
  evidence: any[];
  // Additional properties to match the interface
  title?: string;
  owner?: string;
  tester?: string;
  dueDate?: string;
  testing?: any;
  deficiencies?: any[];
  notes?: string;
}

export interface AuditFormData {
  companyName: string;
  clientLead: string;
  auditLead: string;
  auditType: string;
  startDate: string;
  endDate: string;
  website: string;
  clientId: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface ExtractedControl {
  id: string;
  name: string;
  description: string;
  riskRating: string;
  controlFamily: string;
  testingStatus: string;
}

export interface ExtractedITAC {
  id: string;
  system: string;
  controlType: string;
  owner: string;
  riskLevel: string;
  testingStatus: string;
  name?: string;
  description?: string;
  systemName?: string;
  frequency?: string;
}

export interface ExtractedKeyReport {
  id: string;
  name: string;
  frequency: string;
  source: string;
  owner: string;
  reviewStatus: string;
  description?: string;
  period?: string;
}

export interface ExcelData {
  controls: ExtractedControl[];
  itacs: ExtractedITAC[];
  keyReports: ExtractedKeyReport[];
}