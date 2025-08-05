// types/index.ts
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
  // Added missing properties for AuditSetup compatibility
  companyName: string;
  auditType: string;
  riskAssessment: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  clientLead?: string;
  auditLead?: string;
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

// Enhanced control interfaces with sampling support
export interface ExtractedControl {
  id: string;
  name: string;
  description: string;
  riskRating: string;
  controlFamily: string;
  testingStatus: string;
  owner?: string;
  frequency?: string;
  lastTested?: string;
  evidence?: string[];
  notes?: string;
  controlType?: string;
  // Added missing properties
  category?: string;
  riskLevel?: string;
  controlObjective?: string;
  testingProcedure?: string;
  status?: string;
  // Sampling enhancement properties
  requiresSampling?: boolean;
  samplingMethodology?: 'random' | 'systematic' | 'judgmental';
  isAutomated?: boolean;
  controlFrequencyType?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
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
  controlDescription?: string;
  processName?: string;
  testingStrategy?: string;
  comments?: string;
  // Added missing properties
  controlName?: string;
  application?: string;
  controlObjective?: string;
  testingProcedure?: string;
  lastTested?: string;
  status?: string;
  // Sampling enhancement properties
  requiresSampling?: boolean;
  samplingMethodology?: 'random' | 'systematic' | 'judgmental';
  isAutomated?: boolean;
  controlFrequencyType?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
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
  lastReviewed?: string;
  cycle?: string;
  reportType?: string;
  keyControl?: string;
  // Added missing properties
  reportName?: string;
  criticality?: string;
  controlObjective?: string;
  testingProcedure?: string;
  dataSource?: string;
  status?: string;
}

export interface ExcelData {
  controls: ExtractedControl[];
  itacs: ExtractedITAC[];
  keyReports: ExtractedKeyReport[];
  applications?: Application[];
}

// Application interface for walkthroughs
export interface Application {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

// Control Detail Modal Props
export interface ControlDetailModalProps {
  control: ExtractedControl;
  isOpen: boolean;
  onClose: () => void;
  onUpdateControl?: (control: ExtractedControl) => void;
  onEvidenceUpload?: (controlId: string, evidence: any) => void;
}

// === NEW SAMPLING INTERFACES ===

// Core sampling configuration - FIXED: Added 'generated' status
export interface SamplingConfig {
  id: string;
  controlId: string;
  sampleSize: number;
  methodology: 'random' | 'systematic' | 'judgmental';
  timePeriod: TimePeriod;
  minimumInterval: number; // Days between samples
  seed?: number; // For reproducible random sampling
  customPeriods?: CustomTimePeriod[];
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'generated' | 'approved' | 'sent' | 'completed'; // FIXED: Added 'generated'
  approvedAt?: string; // NEW: When samples were approved
  approvedBy?: string; // NEW: Who approved the samples
  notes?: string;
}

// Time period definitions
export interface TimePeriod {
  type: 'calendar_quarters' | 'fiscal_quarters' | 'rolling_months' | 'custom';
  startDate: string;
  endDate: string;
  quarters?: QuarterDefinition[];
}

export interface QuarterDefinition {
  id: string;
  name: string; // "Q1 2025", "Q2 2025", etc.
  startDate: string;
  endDate: string;
  samplesRequired: number;
}

export interface CustomTimePeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  samplesRequired: number;
}

// Generated sample data
export interface GeneratedSample {
  id: string;
  samplingConfigId: string;
  quarterId?: string;
  customPeriodId?: string;
  sampleDate: string;
  sampleIndex: number; // 1, 2, 3, etc. for ordering
  quarterName?: string; // "Q1 2025"
  isWeekend?: boolean;
  isHoliday?: boolean;
  status: 'pending' | 'evidence_requested' | 'evidence_received' | 'approved' | 'rejected';
  notes?: string;
}

// Evidence request system
export interface EvidenceRequest {
  id: string;
  controlId: string;
  samplingConfigId?: string;
  type: 'sampling' | 'full_population';
  title: string;
  instructions: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'sent' | 'acknowledged' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'requires_clarification';
  createdAt: string;
  createdBy: string;
  sentAt?: string;
  acknowledgedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  
  // Sampling-specific fields
  samplingDetails?: {
    methodology: string;
    sampleSize: number;
    selectedDates: string[];
    populationDescription: string;
    samplingRationale: string;
  };
  
  // Communication
  clientMessage?: string;
  auditorNotes?: string;
  clarificationRequests?: ClarificationRequest[];
}

export interface ClarificationRequest {
  id: string;
  requestedAt: string;
  requestedBy: string;
  question: string;
  response?: string;
  respondedAt?: string;
  status: 'pending' | 'answered';
}

// Evidence submission by client
export interface EvidenceSubmission {
  id: string;
  evidenceRequestId: string;
  sampleId?: string; // Links to specific sample if applicable
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  sampleDate?: string; // For sampling evidence
  status: 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'requires_resubmission';
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Audit trail for sampling
export interface SamplingAuditLog {
  id: string;
  samplingConfigId: string;
  action: 'created' | 'modified' | 'regenerated' | 'approved' | 'sent' | 'evidence_received' | 'completed';
  performedBy: string;
  performedAt: string;
  details: string;
  oldValues?: any;
  newValues?: any;
}

// Control classification for auto-detection
export interface ControlClassification {
  controlId: string;
  requiresSampling: boolean;
  riskLevel: 'high' | 'medium' | 'low';
  controlType: 'automated' | 'manual' | 'hybrid';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'adhoc';
  confidence: number; // 0-1 score for auto-classification accuracy
  detectedKeywords: string[];
  suggestedSampleSize: number;
  suggestedMethodology: 'random' | 'systematic' | 'judgmental';
  classifiedAt: string;
  manuallyOverridden?: boolean;
  overriddenAt?: string;
  overriddenBy?: string;
}

// Sample size calculation parameters
export interface SampleSizeConfig {
  riskLevel: 'high' | 'medium' | 'low';
  controlType: 'automated' | 'manual';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  samplesPerQuarter: number;
  minimumSamples: number;
  maximumSamples: number;
  rationale: string;
}

// Default sample size matrix
export const DEFAULT_SAMPLE_SIZES: SampleSizeConfig[] = [
  // Automated Controls
  { riskLevel: 'low', controlType: 'automated', frequency: 'daily', samplesPerQuarter: 2, minimumSamples: 2, maximumSamples: 3, rationale: 'Low risk automated daily controls require minimal testing' },
  { riskLevel: 'medium', controlType: 'automated', frequency: 'daily', samplesPerQuarter: 3, minimumSamples: 2, maximumSamples: 4, rationale: 'Medium risk automated controls need moderate coverage' },
  { riskLevel: 'high', controlType: 'automated', frequency: 'daily', samplesPerQuarter: 4, minimumSamples: 3, maximumSamples: 6, rationale: 'High risk controls require increased testing frequency' },
  
  // Manual Controls
  { riskLevel: 'low', controlType: 'manual', frequency: 'weekly', samplesPerQuarter: 4, minimumSamples: 3, maximumSamples: 6, rationale: 'Manual controls require higher testing due to human error risk' },
  { riskLevel: 'medium', controlType: 'manual', frequency: 'weekly', samplesPerQuarter: 6, minimumSamples: 4, maximumSamples: 8, rationale: 'Medium risk manual controls need comprehensive testing' },
  { riskLevel: 'high', controlType: 'manual', frequency: 'daily', samplesPerQuarter: 8, minimumSamples: 6, maximumSamples: 12, rationale: 'High risk manual controls require extensive testing coverage' },
  
  // Monthly/Quarterly Controls
  { riskLevel: 'low', controlType: 'automated', frequency: 'monthly', samplesPerQuarter: 2, minimumSamples: 2, maximumSamples: 3, rationale: 'Monthly automated controls with low risk' },
  { riskLevel: 'medium', controlType: 'manual', frequency: 'monthly', samplesPerQuarter: 3, minimumSamples: 3, maximumSamples: 3, rationale: 'Test all instances of medium risk monthly manual controls' },
  { riskLevel: 'high', controlType: 'manual', frequency: 'quarterly', samplesPerQuarter: 1, minimumSamples: 1, maximumSamples: 1, rationale: 'Test all instances of quarterly high risk controls' }
];