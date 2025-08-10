// File: types/index.ts - ✅ PHASE 1.1 COMPLETE: Added userType field for dual-user system
// ✅ STEP 3: Added clientDomain and extractedData fields for client-audit auto-matching
// ✅ PHASE 1 WALKTHROUGH: Added complete walkthrough system interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  userType: 'auditor' | 'client'; // ✅ ADDED: Dual-user type system
  isClient: boolean; // Keep for backward compatibility
}

export interface Audit {
  id: string;
  clientName: string;
  relationshipOwner: string;
  auditOwner: string;
  progress: number;
  website: string;
  clientId: string;
  // ✅ STEP 3: NEW - Add client domain for matching
  clientDomain?: string;
  // ✅ STEP 3: NEW - Store extracted data with audit
  extractedData?: ExcelData;
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
  
  // ✅ PHASE 1 WALKTHROUGH: Add walkthrough metadata
  walkthroughsExtracted?: boolean;
  totalWalkthroughs?: number;
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
  
  // ✅ PHASE 1 WALKTHROUGH: Add walkthrough-specific fields
  application?: string; // Column G - for walkthrough extraction
  walkthroughGenerated?: boolean; // Track if walkthrough was created from this report
  walkthroughApplicationId?: string; // Link to created walkthrough application
}

export interface ExcelData {
  controls: ExtractedControl[];
  itacs: ExtractedITAC[];
  keyReports: ExtractedKeyReport[];
  applications?: Application[];
  
  // ✅ PHASE 1 WALKTHROUGH: Add walkthrough data
  walkthroughApplications?: WalkthroughApplication[];
  walkthroughRequests?: WalkthroughRequest[];
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

// ===================================================================
// ✅ PHASE 1 WALKTHROUGH: COMPLETE WALKTHROUGH SYSTEM INTERFACES
// ===================================================================

// Key Report reference for traceability
export interface KeyReportReference {
  reportName: string;
  reportType: string;
  frequency: string;
  keyControlDescription: string;
  originalRowIndex?: number; // For Excel traceability
}

// Application extracted from Key Reports data
export interface WalkthroughApplication {
  id: string;
  name: string; // Application name (AX, Workday, etc.)
  description: string;
  riskLevel: 'high' | 'medium' | 'low';
  owner: string; // Primary business owner
  category: string;
  relatedReports: KeyReportReference[];
  extractedFromReports: boolean; // vs manually added
  
  // Default settings
  estimatedDuration: number; // Default to 1 hour (60 minutes)
  criticality: 'critical' | 'important' | 'standard';
  
  // Metadata
  createdAt: string;
  createdBy: string;
  auditId: string;
}

// Walkthrough request that gets sent to client
export interface WalkthroughRequest {
  id: string;
  auditId: string;
  applicationId: string; // Link to WalkthroughApplication
  applicationName: string;
  businessOwner: string;
  requestType: 'walkthrough';
  
  // Status workflow
  status: 'draft' | 'sent' | 'scheduled' | 'completed' | 'cancelled';
  currentResponsibleParty: 'auditor' | 'client' | 'completed';
  
  // Timestamps
  createdAt: string;
  createdBy: string;
  sentAt?: string;
  scheduledAt?: string;
  completedAt?: string;
  
  // Scheduling details (filled by client)
  schedulingData?: {
    scheduledDate: string;
    scheduledTime: string;
    location: 'client_office' | 'auditor_office' | 'teams' | 'zoom' | 'phone';
    attendees: string;
    notes?: string;
    clientContact: string; // Who scheduled it
  };
  
  // Process details
  relatedReports: KeyReportReference[];
  estimatedDuration: number; // Minutes
  criticality: 'critical' | 'important' | 'standard';
  
  // Communication
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  internalNotes?: string; // Auditor-only notes
}

// Session tracking for completed walkthroughs
export interface WalkthroughSession {
  id: string;
  requestId: string;
  applicationName: string;
  businessOwner: string;
  
  // Session details
  actualDate: string;
  actualTime: string;
  actualDuration: number; // Minutes
  location: string;
  attendees: string[];
  
  // Status
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // Documentation
  completedDate?: string;
  completedBy: string;
  sessionNotes?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  
  // Outcomes
  controlsDocumented?: number;
  issuesIdentified?: number;
  recommendationsProvided?: number;
}

// Bulk operation interfaces
export interface BulkWalkthroughOperation {
  operationType: 'send' | 'schedule' | 'complete';
  requestIds: string[];
  groupingCriteria: 'application' | 'owner' | 'criticality';
  batchData?: any;
  performedBy: string;
  performedAt: string;
}

// Progress tracking interfaces
export interface WalkthroughProgress {
  auditId: string;
  total: number;
  draft: number;
  sent: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  
  // Calculated fields
  percentComplete: number;
  percentScheduled: number;
  inProgress: number; // scheduled but not completed
  urgentCount: number; // items requiring immediate attention
  
  // Timeline
  isFirstWeek: boolean;
  daysUntilDeadline: number;
  isOverdue: boolean;
  isUrgent: boolean;
}

// Application-specific progress
export interface ApplicationProgress {
  applicationName: string;
  status: 'not_started' | 'partial' | 'scheduled' | 'completed';
  progress: number; // 0-100
  totalWalkthroughs: number;
  completedWalkthroughs: number;
  scheduledWalkthroughs: number;
  nextAction: string;
  responsibleParty: 'auditor' | 'client' | 'completed';
}

// Timeline and deadline tracking
export interface WalkthroughTimeline {
  auditStartDate: string;
  firstWeekDeadline: string;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean; // <= 2 days remaining
  milestones: {
    allSent: boolean;
    allScheduled: boolean;
    allCompleted: boolean;
    sentDate?: string;
    allScheduledDate?: string;
    allCompletedDate?: string;
  };
}

// Storage keys for localStorage
export const WALKTHROUGH_STORAGE_KEYS = {
  APPLICATIONS: 'audit_walkthrough_applications',
  REQUESTS: 'audit_walkthrough_requests',  
  SESSIONS: 'audit_walkthrough_sessions',
  PROGRESS: 'audit_walkthrough_progress',
  BULK_OPERATIONS: 'audit_walkthrough_bulk_operations'
} as const;

// Status workflow constants
export const WALKTHROUGH_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  SCHEDULED: 'scheduled', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const WALKTHROUGH_STATUS_LABELS = {
  [WALKTHROUGH_STATUSES.DRAFT]: 'Draft - Ready to Send',
  [WALKTHROUGH_STATUSES.SENT]: 'Sent to Client',
  [WALKTHROUGH_STATUSES.SCHEDULED]: 'Scheduled by Client',
  [WALKTHROUGH_STATUSES.COMPLETED]: 'Walkthrough Completed',
  [WALKTHROUGH_STATUSES.CANCELLED]: 'Cancelled'
} as const;

// Responsible party logic
export const getResponsibleParty = (status: string): 'auditor' | 'client' | 'completed' => {
  switch (status) {
    case WALKTHROUGH_STATUSES.DRAFT:
      return 'auditor'; // Auditor needs to send
    case WALKTHROUGH_STATUSES.SENT:
      return 'client'; // Client needs to schedule
    case WALKTHROUGH_STATUSES.SCHEDULED:
      return 'auditor'; // Auditor needs to conduct
    case WALKTHROUGH_STATUSES.COMPLETED:
    case WALKTHROUGH_STATUSES.CANCELLED:
      return 'completed';
    default:
      return 'auditor';
  }
};

// Status styling helpers
export const getWalkthroughStatusColor = (status: string): string => {
  switch (status) {
    case WALKTHROUGH_STATUSES.DRAFT:
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case WALKTHROUGH_STATUSES.SENT:
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case WALKTHROUGH_STATUSES.SCHEDULED:
      return 'bg-green-100 text-green-700 border-green-300';
    case WALKTHROUGH_STATUSES.COMPLETED:
      return 'bg-green-100 text-green-700 border-green-300';
    case WALKTHROUGH_STATUSES.CANCELLED:
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// Action requirement helpers
export const getNeedsAction = (status: string, userType: 'auditor' | 'client'): boolean => {
  if (userType === 'auditor') {
    return [WALKTHROUGH_STATUSES.DRAFT, WALKTHROUGH_STATUSES.SCHEDULED].includes(status as any);
  } else {
    return status === WALKTHROUGH_STATUSES.SENT;
  }
};

export const getBorderClass = (status: string, userType: 'auditor' | 'client'): string => {
  const needsAction = getNeedsAction(status, userType);
  return needsAction ? 'border-red-400 border-2' : 'border-gray-200';
};

// ===================================================================
// EXISTING SAMPLING INTERFACES (UNCHANGED)
// ===================================================================

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
  
  // ✅ PHASE 4.1: Added currentResponsibleParty for workflow tracking
  currentResponsibleParty?: 'auditor' | 'client' | 'completed';
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
  
  // ✅ PHASE 4.1: Added currentResponsibleParty for workflow tracking
  currentResponsibleParty?: 'auditor' | 'client' | 'completed';
  
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