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
  auditTypes?: string[];
  startDate?: string;
  completionDate?: string;
}

export interface Control {
  id: string;
  title: string;
  description: string;
  owner: string;
  tester: string;
  dueDate: string;
  deadline: string;
  status: ControlStatus;
  progress: number;
}

export type ControlStatus = 
  | 'not_started'
  | 'walkthrough'
  | 'design_review'
  | 'testing'
  | 'evidence_review'
  | 'management_review'
  | 'deficiency_review'
  | 'completed';

export interface Evidence {
  id: string;
  fileName: string;
}

export interface PendingItem {
  id: string;
  item: string;
}

export interface AuditFormData {
  companyName: string;
  companyWebsite: string;
  clientUniqueId: string;
  clientLead: string;
  auditLead: string;
  auditTypes: string[];
  auditStartDate: string;
  expectedCompletionDate: string;
}

export interface Module {
  id: string;
  name: string;
  desc: string;
}

export interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type?: string;
  uploadDate?: string;
  module?: string;
}

export interface ExtractedControl {
  id: string;
  title?: string;
  description?: string;
  owner?: string;
  riskRating?: string;
  controlType?: string;
  frequency?: string;
  location?: string;
  category?: string;
  subcategory?: string;
  status: string;
  needsReview?: boolean;
  progress?: number;
  refNumber?: number;
  // Excel field mappings
  'Control ID'?: string;
  'Control Title'?: string;
  'Control Description'?: string;
  'Risk Rating'?: string;
  'Control Type'?: string;
  'Frequency'?: string;
  'Owner'?: string;
  'Location'?: string;
  'Category'?: string;
  'Subcategory'?: string;
}

export interface ExtractedITAC {
  id: string;
  controlName?: string;
  description?: string;
  application?: string;
  controlType?: string;
  frequency?: string;
  owner?: string;
  automationLevel?: string;
  keyFields?: string;
  exceptionHandling?: string;
  status: string;
  needsReview?: boolean;
  // Excel field mappings
  'ITAC ID'?: string;
  'Control Name'?: string;
  'Description'?: string;
  'Application'?: string;
  'Control Type'?: string;
  'Frequency'?: string;
  'Owner'?: string;
  'Automation Level'?: string;
  'Key Fields'?: string;
  'Exception Handling'?: string;
}

export interface ExtractedKeyReport {
  id: string;
  reportName?: string;
  description?: string;
  owner?: string;
  application?: string;
  frequency?: string;
  recipients?: string;
  keyFields?: string;
  format?: string;
  automated?: string;
  status: string;
  needsReview?: boolean;
  // Excel field mappings
  'Report ID'?: string;
  'Report Name'?: string;
  'Description'?: string;
  'Owner'?: string;
  'Application'?: string;
  'Frequency'?: string;
  'Recipients'?: string;
  'Key Fields'?: string;
  'Format'?: string;
  'Automated'?: string;
}

export interface ExcelData {
  'ITGC Controls'?: any[];
  'ITACs'?: any[];
  'Key Reports'?: any[];
}

// Component Props Types
export interface AuditDashboardProps {
  audits: Audit[];
  onAuditSelect: (audit: Audit) => void;
  onCreateNewAudit: () => void;
}

export interface CreateNewAuditProps {
  onBack: () => void;
  onSubmit: (data: AuditFormData) => void;
}

export interface AuditSetupProps {
  audit: Audit;
  onBack: () => void;
}

export interface ControlDashboardProps {
  selectedAudit: Audit;
  onControlSelect: (control: Control) => void;
}

export interface ControlDetailProps {
  control: Control;
  onBack: () => void;
  onMarkVerified: () => void;
}

export interface NavigationProps {
  currentView: string;
  user: User;
  selectedAudit: Audit | null;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export interface LoginFormProps {
  onLogin: (user: User) => void;
}