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
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[status] || colors.pending;
};

export const getPriorityColor = (priority: SampleRequest['priority']) => {
  const colors = {
    low: 'text-gray-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  };
  return colors[priority] || colors.medium;
};

export const calculateProgress = (samples: SampleRequest[]): number => {
  if (samples.length === 0) return 0;
  const completed = samples.filter(s => s.status === 'completed').length;
  return Math.round((completed / samples.length) * 100);
};

export const generateMockData = (): SampleRequest[] => {
  const mockData: SampleRequest[] = [
    {
      id: 'USR-001',
      controlId: 'CC1.1',
      title: 'User Access Review',
      description: 'Review user access permissions for Q3 2024',
      sampleItem: 'john.doe@techcorp.com - Admin Access',
      period: 'Q3 2024',
      dueDate: '2024-12-15',
      status: 'pending',
      priority: 'high',
      evidenceRequested: [
        'User access report showing current permissions',
        'Business justification for admin access',
        'Manager approval for access level'
      ],
      files: [],
      comments: []
    },
    {
      id: 'CHG-002', 
      controlId: 'CC2.1',
      title: 'Change Management',
      description: 'Validate change management process for system updates',
      sampleItem: 'Production Database Update - Oct 15, 2024',
      period: 'Q4 2024',
      dueDate: '2024-12-20',
      status: 'in-progress',
      priority: 'medium',
      evidenceRequested: [
        'Change request form with approvals',
        'Testing documentation',
        'Rollback procedures',
        'Post-implementation validation'
      ],
      files: [
        {
          id: '1',
          name: 'change-request-form.pdf',
          size: 1024000,
          type: 'application/pdf',
          uploadedAt: '2024-11-15T10:00:00Z',
          uploadedBy: 'Sarah Chen'
        }
      ],
      comments: [
        {
          id: '1',
          text: 'Initial change request uploaded. Still need testing docs.',
          author: 'Sarah Chen',
          timestamp: '2024-11-15T10:05:00Z',
          type: 'client'
        }
      ]
    },
    {
      id: 'BAK-003',
      controlId: 'CC3.2', 
      title: 'Data Backup Verification',
      description: 'Verify data backup completeness and recovery procedures',
      sampleItem: 'Customer Database Backup - November 1, 2024',
      period: 'Q4 2024',
      dueDate: '2024-12-25',
      status: 'completed',
      priority: 'critical',
      evidenceRequested: [
        'Backup log files',
        'Recovery test documentation',
        'Backup integrity verification',
        'Off-site storage confirmation'
      ],
      files: [
        {
          id: '2',
          name: 'backup-logs-nov-2024.xlsx',
          size: 512000,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadedAt: '2024-11-20T14:30:00Z',
          uploadedBy: 'Mike Johnson'
        },
        {
          id: '3',
          name: 'recovery-test-results.pdf',
          size: 2048000,
          type: 'application/pdf',
          uploadedAt: '2024-11-21T09:15:00Z',
          uploadedBy: 'Mike Johnson'
        }
      ],
      comments: [
        {
          id: '2',
          text: 'All backup documentation provided and verified.',
          author: 'Mike Johnson',
          timestamp: '2024-11-21T09:20:00Z',
          type: 'client'
        },
        {
          id: '3',
          text: 'Excellent documentation. Sample testing complete.',
          author: 'Tom Cruise',
          timestamp: '2024-11-22T11:00:00Z',
          type: 'auditor'
        }
      ]
    }
  ];

  return mockData;
};

export const getDashboardStats = (samples: SampleRequest[]): DashboardStats => {
  const totalSamples = samples.length;
  const completedSamples = samples.filter(s => s.status === 'completed').length;
  const pendingSamples = samples.filter(s => s.status === 'pending').length;
  const overdueSamples = samples.filter(s => {
    const dueDate = new Date(s.dueDate);
    const today = new Date();
    return s.status !== 'completed' && dueDate < today;
  }).length;

  const progressPercentage = totalSamples > 0 ? Math.round((completedSamples / totalSamples) * 100) : 0;

  return {
    totalSamples,
    completedSamples, 
    pendingSamples,
    overdueSamples,
    progressPercentage
  };
};