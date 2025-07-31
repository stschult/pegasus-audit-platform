// lib/client/utils.ts

import { SampleRequest, DashboardStats } from '../../types/client';

// Enhanced title extraction matching your getKeyConcept function
export const getControlKeyConcept = (description: string): string => {
  if (!description) return 'Unknown Control';
  
  // Extract key concepts from control descriptions
  const keyPhrases = [
    'user access', 'password', 'authentication', 'authorization',
    'data backup', 'backup', 'recovery', 'business continuity',
    'change management', 'change control', 'deployment', 'release',
    'monitoring', 'logging', 'audit trail', 'security monitoring',
    'encryption', 'data protection', 'privacy', 'confidentiality',
    'vulnerability', 'patch management', 'security updates',
    'incident response', 'security incident', 'breach response',
    'data retention', 'data disposal', 'data lifecycle',
    'network security', 'firewall', 'network access', 'perimeter',
    'logical access', 'physical access', 'facility security'
  ];

  const lowerDesc = description.toLowerCase();
  
  // Find the first matching key phrase
  for (const phrase of keyPhrases) {
    if (lowerDesc.includes(phrase)) {
      return phrase.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  }

  // Fallback: extract first few words
  const words = description.split(' ').slice(0, 3);
  return words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export const formatSampleId = (controlId: string, index: number): string => {
  const prefix = controlId.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase();
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
};

export const getStatusColor = (status: SampleRequest['status']) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    evidence_uploaded: 'bg-blue-100 text-blue-800 border-blue-200',
    under_review: 'bg-purple-100 text-purple-800 border-purple-200',
    reviewed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    approved: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[status] || colors.pending;
};

export const getPriorityColor = (priority: SampleRequest['priority']) => {
  const colors = {
    low: 'text-gray-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  };
  return colors[priority] || colors.medium;
};

export const calculateProgress = (samples: SampleRequest[]): number => {
  if (samples.length === 0) return 0;
  const completed = samples.filter(s => s.status === 'approved').length;
  return Math.round((completed / samples.length) * 100);
};

export const generateMockData = (): SampleRequest[] => {
  const mockData: SampleRequest[] = [
    {
      id: 'USR-001',
      controlId: 'CC1.1',
      controlTitle: 'User Access Review',
      controlType: 'Access Management',
      riskRating: 'High',
      frequency: 'Monthly',
      description: 'Review user access permissions for Q3 2024',
      dueDate: '2024-12-15',
      status: 'pending',
      priority: 'high',
      requiredEvidence: [
        'User access report showing current permissions',
        'Business justification for admin access',
        'Manager approval for access level'
      ],
      uploadedFiles: [],
      comments: [],
      assignedTo: 'auditor@company.com',
      createdDate: '2024-11-01',
      completionPercentage: 0
    },
    {
      id: 'CHG-002', 
      controlId: 'CC2.1',
      controlTitle: 'Change Management Process',
      controlType: 'Change Management',
      riskRating: 'Medium',
      frequency: 'Quarterly',
      description: 'Validate change management process for system updates',
      dueDate: '2024-12-20',
      status: 'evidence_uploaded',
      priority: 'medium',
      requiredEvidence: [
        'Change request form with approvals',
        'Testing documentation',
        'Rollback procedures',
        'Post-implementation validation'
      ],
      uploadedFiles: [
        {
          id: '1',
          name: 'change-request-form.pdf',
          size: 1024000,
          type: 'application/pdf',
          uploadDate: '2024-11-15T10:00:00Z',
          uploadedBy: 'Sarah Chen'
        }
      ],
      comments: [
        {
          id: '1',
          author: 'Sarah Chen',
          authorRole: 'client',
          message: 'Initial change request uploaded. Still need testing docs.',
          timestamp: '2024-11-15T10:05:00Z',
          isRead: false
        }
      ],
      assignedTo: 'sarah.chen@company.com',
      createdDate: '2024-11-01',
      completionPercentage: 60
    },
    {
      id: 'BAK-003',
      controlId: 'CC3.2', 
      controlTitle: 'Data Backup Verification',
      controlType: 'Data Backup',
      riskRating: 'High',
      frequency: 'Weekly',
      description: 'Verify data backup completeness and recovery procedures',
      dueDate: '2024-12-25',
      status: 'approved',
      priority: 'urgent',
      requiredEvidence: [
        'Backup log files',
        'Recovery test documentation',
        'Backup integrity verification',
        'Off-site storage confirmation'
      ],
      uploadedFiles: [
        {
          id: '2',
          name: 'backup-logs-nov-2024.xlsx',
          size: 512000,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadDate: '2024-11-20T14:30:00Z',
          uploadedBy: 'Mike Johnson'
        },
        {
          id: '3',
          name: 'recovery-test-results.pdf',
          size: 2048000,
          type: 'application/pdf',
          uploadDate: '2024-11-21T09:15:00Z',
          uploadedBy: 'Mike Johnson'
        }
      ],
      comments: [
        {
          id: '2',
          author: 'Mike Johnson',
          authorRole: 'client',
          message: 'All backup documentation provided and verified.',
          timestamp: '2024-11-21T09:20:00Z',
          isRead: true
        },
        {
          id: '3',
          author: 'Tom Cruise',
          authorRole: 'auditor',
          message: 'Excellent documentation. Sample testing complete.',
          timestamp: '2024-11-22T11:00:00Z',
          isRead: true
        }
      ],
      assignedTo: 'mike.johnson@company.com',
      createdDate: '2024-11-01',
      completionPercentage: 100
    }
  ];

  return mockData;
};

export const getDashboardStats = (samples: SampleRequest[]): DashboardStats => {
  const totalRequests = samples.length;
  const completed = samples.filter(s => s.status === 'approved').length;
  const pending = samples.filter(s => s.status === 'pending').length;
  const overdue = samples.filter(s => {
    const dueDate = new Date(s.dueDate);
    const today = new Date();
    return s.status !== 'approved' && dueDate < today;
  }).length;

  const avgCompletion = totalRequests > 0 ? 
    Math.round(samples.reduce((sum, s) => sum + s.completionPercentage, 0) / totalRequests) : 0;
  
  const highPriority = samples.filter(s => s.priority === 'high' || s.priority === 'urgent').length;

  return {
    totalRequests,
    completed,
    pending,
    overdue,
    avgCompletion,
    highPriority
  };
};

// Add these missing exports to fix the build errors:

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateDashboardStats = getDashboardStats; // Alias for existing function

export const isOverdue = (dueDate: string, status?: string): boolean => {
  // Don't consider approved items as overdue
  if (status === 'approved') return false;
  
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
};

export const getRiskColor = (priority: SampleRequest['priority'] | string): string => {
  // Convert to lowercase to handle both "High" and "high" formats
  const normalizedPriority = priority?.toLowerCase() as SampleRequest['priority'];
  
  const colors = {
    'urgent': 'bg-red-100 text-red-800',
    'high': 'bg-orange-100 text-orange-800', 
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800'
  };
  return colors[normalizedPriority] || 'bg-gray-100 text-gray-800';
};

export const getDaysDifference = (date1: string, date2?: string): number => {
  const d1 = new Date(date1);
  const d2 = date2 ? new Date(date2) : new Date();
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};