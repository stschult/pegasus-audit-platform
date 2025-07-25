// lib/constants.tsx

export const mockUser = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah@pegasusaudit.com',
  organization: 'Pegasus Audit',
  role: 'AUDITOR',
  isClient: false
};

export const mockAudits = [
  {
    id: '1',
    clientName: 'Acme Corporation',
    relationshipOwner: 'John Smith',
    auditOwner: 'Sarah Johnson',
    progress: 65,
    website: 'acme.com',
    clientId: 'ACME-2024-001'
  },
  {
    id: '2',
    clientName: 'TechStart Inc',
    relationshipOwner: 'Mike Davis',
    auditOwner: 'Sarah Johnson',
    progress: 30,
    website: 'techstart.io',
    clientId: 'TECH-2024-002'
  },
  {
    id: '3',
    clientName: 'Global Manufacturing',
    relationshipOwner: 'Lisa Chen',
    auditOwner: 'Sarah Johnson',
    progress: 85,
    website: 'globalmanuf.com',
    clientId: 'GLOB-2024-003'
  }
];

export const mockControls = [
  {
    id: 'CTRL-001',
    name: 'User Access Management',
    description: 'Controls for managing user access to systems',
    status: 'testing' as const,
    riskRating: 'High',
    controlFamily: 'Access Controls',
    lastUpdated: '2024-01-15',
    evidence: [],
    title: 'User Access Management Control',
    owner: 'IT Security Team',
    tester: 'Sarah Johnson',
    dueDate: '2024-02-15'
  },
  {
    id: 'CTRL-002',
    name: 'Data Backup Procedures',
    description: 'Regular backup and recovery procedures',
    status: 'completed' as const,
    riskRating: 'Medium',
    controlFamily: 'Data Management',
    lastUpdated: '2024-01-10',
    evidence: [],
    title: 'Data Backup Control',
    owner: 'IT Operations',
    tester: 'Mike Davis',
    dueDate: '2024-01-30'
  },
  {
    id: 'CTRL-003',
    name: 'Change Management Process',
    description: 'Formal change control procedures',
    status: 'not-started' as const,
    riskRating: 'High',
    controlFamily: 'Change Management',
    lastUpdated: '2024-01-08',
    evidence: [],
    title: 'Change Management Control',
    owner: 'IT Management',
    tester: 'Lisa Chen',
    dueDate: '2024-02-28'
  }
];

export const STATUS_LABELS = {
  'not-started': 'Not Started',
  'walkthrough': 'Walkthrough',
  'design_review': 'Design Review',
  'testing': 'Testing',
  'evidence_review': 'Evidence Review',
  'management_review': 'Management Review',
  'deficiency_review': 'Deficiency Review',
  'completed': 'Completed'
};

export const STATUS_COLORS = {
  'not-started': 'bg-gray-100 text-gray-800',
  'walkthrough': 'bg-blue-100 text-blue-800',
  'design_review': 'bg-yellow-100 text-yellow-800',
  'testing': 'bg-orange-100 text-orange-800',
  'evidence_review': 'bg-purple-100 text-purple-800',
  'management_review': 'bg-indigo-100 text-indigo-800',
  'deficiency_review': 'bg-red-100 text-red-800',
  'completed': 'bg-green-100 text-green-800'
};

export const AUDIT_TYPE_OPTIONS = [
  'SOC 1 Type II',
  'SOC 2 Type II',
  'ISO 27001',
  'PCI DSS',
  'HIPAA',
  'Custom Framework'
];

// Updated module names - Control Mapping renamed to ITGCs
export const AUDIT_MODULES = [
  {
    id: 'itgcs',
    name: 'ITGCs',
    description: 'IT General Controls - Infrastructure, access, and change management controls'
  },
  {
    id: 'key-reports',
    name: 'Key Reports',
    description: 'Critical reports used in financial reporting processes'
  },
  {
    id: 'itacs',
    name: 'ITACs',
    description: 'IT Application Controls - Automated controls within applications'
  },
  {
    id: 'walkthroughs',
    name: 'Walkthroughs',
    description: 'Process walkthroughs and documentation'
  },
  {
    id: 'key-systems',
    name: 'Key Systems',
    description: 'Critical systems and infrastructure components'
  },
  {
    id: 'findings-log',
    name: 'Findings Log',
    description: 'Track and manage audit findings and remediation'
  }
];

// Mock Excel data for demonstration
export const MOCK_EXCEL_DATA = {
  controls: [
    {
      id: 'ITGC-001',
      name: 'Network Security Controls',
      description: 'Firewall and network access controls',
      riskRating: 'High',
      controlFamily: 'Network Security',
      testingStatus: 'Not Started'
    },
    {
      id: 'ITGC-002', 
      name: 'User Access Management',
      description: 'User provisioning and access review controls',
      riskRating: 'High',
      controlFamily: 'Access Management',
      testingStatus: 'Planning'
    }
  ],
  itacs: [
    {
      id: 'ITAC-001',
      system: 'SAP ERP',
      controlType: 'Automated Approval',
      owner: 'Finance Team',
      riskLevel: 'Medium',
      testingStatus: 'Not Started'
    }
  ],
  keyReports: [
    {
      id: 'RPT-001',
      name: 'Daily Sales Report',
      frequency: 'Daily',
      source: 'CRM System',
      owner: 'Sales Manager',
      reviewStatus: 'Pending'
    }
  ]
};