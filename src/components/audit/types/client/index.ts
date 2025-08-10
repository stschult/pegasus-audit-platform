// types/client/index.ts

export interface SampleRequest {
  id: string;
  controlId: string;
  controlTitle: string;
  controlType: 'Access Management' | 'Change Management' | 'Data Backup' | 'System Monitoring' | 'Physical Security' | 'Network Security';
  riskRating: 'High' | 'Medium' | 'Low';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  description: string;
  dueDate: string;
  status: 'pending' | 'evidence_uploaded' | 'under_review' | 'reviewed' | 'approved';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  requiredEvidence: string[];
  uploadedFiles: UploadedFile[];
  comments: Comment[];
  assignedTo: string;
  createdDate: string;
  completionPercentage: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorRole: 'client' | 'auditor';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ClientUploadPortalProps {
  clientId: string;
  auditId: string;
  clientName: string;
}

export interface DashboardStats {
  totalRequests: number;
  completed: number;
  pending: number;
  overdue: number;
  avgCompletion: number;
  highPriority: number;
}