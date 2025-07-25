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
  title: string;
  description: string;
  controlFamily: string;
  owner: string;
  tester: string;
  dueDate: string;
  deadline: string;
  status: 'not-started' | 'walkthrough' | 'design_review' | 'testing' | 'evidence_review' | 'management_review' | 'deficiency_review' | 'completed';
  progress: number;
  riskRating: 'High' | 'Medium' | 'Low';
  frequency: string;
}

export interface AuditFormData {
  clientName: string;
  relationshipOwner: string;
  auditOwner: string;
  website: string;
  clientId: string;
  auditTypes: string[];
  startDate: string;
  endDate: string;
  yearEnd: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;  // Changed to string to resolve the conflict
  status: 'processing' | 'completed' | 'error';
}

export interface ExtractedControl {
  id: string;
  name: string;
  description: string;
  riskRating: 'High' | 'Medium' | 'Low';
  controlFamily: string;
  controlType: string;
  frequency: string;
  owner: string;
}

export interface ExtractedITAC {
  id: string;
  name: string;
  systemName: string;
  description: string;
  controlType: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  owner: string;
  frequency: string;
}

export interface ExtractedKeyReport {
  id: string;
  name: string;
  description: string;
  period: string;
  source: string;
  owner: string;
  frequency: string;
}

export interface ExcelData {
  controls: ExtractedControl[];
  itacs: ExtractedITAC[];
  keyReports: ExtractedKeyReport[];
}