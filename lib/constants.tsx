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
    id: 'C001',
    title: 'Cash Reconciliation',
    description: 'Monthly bank reconciliation procedures and documentation',
    owner: 'Finance Team',
    tester: 'Sarah Johnson',
    dueDate: '2024-03-15',
    deadline: '2024-03-20',
    status: 'testing',
    progress: 75
  },
  {
    id: 'C002',
    title: 'Revenue Recognition',
    description: 'Proper revenue recognition in accordance with GAAP',
    owner: 'Accounting Team',
    tester: 'Mike Rodriguez',
    dueDate: '2024-03-10',
    deadline: '2024-03-18',
    status: 'evidence_review',
    progress: 60
  },
  {
    id: 'C003',
    title: 'Inventory Count',
    description: 'Physical inventory count and reconciliation procedures',
    owner: 'Operations Team',
    tester: 'Jennifer Liu',
    dueDate: '2024-03-20',
    deadline: '2024-03-25',
    status: 'not_started',
    progress: 0
  }
];

export const mockEvidence = [
  { id: '1', fileName: 'Bank_Statement_Feb_2024.pdf' },
  { id: '2', fileName: 'Reconciliation_Worksheet.xlsx' },
  { id: '3', fileName: 'Supporting_Documentation.pdf' }
];

export const mockPendingItems = [
  { id: '1', item: 'Explanation for reconciling item #3' },
  { id: '2', item: 'Updated cash flow projection' }
];

export const STATUS_LABELS = {
  not_started: 'Not Started',
  walkthrough: 'Walkthrough',
  design_review: 'Design Review',
  testing: 'Testing',
  evidence_review: 'Evidence Review',
  management_review: 'Management Review',
  deficiency_review: 'Deficiency Review',
  completed: 'Completed'
} as const;

export const STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-800',
  walkthrough: 'bg-blue-100 text-blue-800',
  design_review: 'bg-yellow-100 text-yellow-800',
  testing: 'bg-orange-100 text-orange-800',
  evidence_review: 'bg-purple-100 text-purple-800',
  management_review: 'bg-indigo-100 text-indigo-800',
  deficiency_review: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800'
} as const;

export const AUDIT_TYPE_OPTIONS = [
  'Agreed-Upon Procedures (AUP)',
  'Compliance Audit',
  'Construction Audit',
  'Cybersecurity Audit',
  'Due Diligence Audit (e.g. M&A)',
  'Environmental Audit',
  'Financial Statement Audit',
  'Forensic Audit',
  'Human Resources (HR) Audit',
  'Information Systems Audit (IT Audit)',
  'Internal Audit',
  'Operational Audit',
  'Performance Audit',
  'Procurement Audit',
  'Quality Assurance (QA) Audit',
  'Risk Assessment Audit',
  'SOC 1 (System and Organization Controls – Financial Reporting)',
  'SOC 2 (System and Organization Controls – Trust Services Criteria)',
  'SOC 3 (General SOC Report)',
  'Tax Audit'
];

export const AUDIT_MODULES = [
  { id: 'control-mapping', name: 'Control Mapping', desc: 'ITGCs and Manual Controls' },
  { id: 'key-reports', name: 'Key Reports', desc: 'Business Reports & Queries' },
  { id: 'itacs', name: 'ITACs', desc: 'Automated Controls' },
  { id: 'walkthroughs', name: 'Walkthroughs', desc: 'Process Documentation' },
  { id: 'key-systems', name: 'Key Systems', desc: 'ERP & IT Systems' },
  { id: 'findings-log', name: 'Findings Log', desc: 'Issues & Remediation' }
];

// Mock Excel data for simulation
export const MOCK_EXCEL_DATA = {
  'ITGC Controls': [
    {
      'Control ID': 'ITGC-001',
      'Control Title': 'User Access Management',
      'Control Description': 'Management reviews user access rights quarterly',
      'Risk Rating': 'High',
      'Control Type': 'Manual',
      'Frequency': 'Quarterly',
      'Owner': 'IT Security Team'
    },
    {
      'Control ID': 'ITGC-002',
      'Control Title': 'Data Backup Procedures',
      'Control Description': 'Automated daily backups are performed and backup logs are reviewed weekly',
      'Risk Rating': 'Medium',
      'Control Type': 'Automated',
      'Frequency': 'Daily',
      'Owner': 'IT Operations'
    }
  ],
  'ITACs': [
    {
      'ITAC ID': 'ITAC-001',
      'Control Name': 'Automated Invoice Matching',
      'Description': 'System automatically matches purchase orders',
      'Application': 'ERP System',
      'Control Type': 'Preventive',
      'Frequency': 'Real-time',
      'Owner': 'Accounts Payable'
    },
    {
      'ITAC ID': 'ITAC-002',
      'Control Name': 'Duplicate Payment Prevention',
      'Description': 'System prevents duplicate payments by checking invoice numbers',
      'Application': 'Payment System',
      'Control Type': 'Preventive',
      'Frequency': 'Real-time',
      'Owner': 'Treasury'
    }
  ],
  'Key Reports': [
    {
      'Report ID': 'RPT-001',
      'Report Name': 'Daily Cash Position Report',
      'Description': 'Daily report showing cash balances',
      'Owner': 'Treasury',
      'Application': 'Cash Management System',
      'Frequency': 'Daily'
    },
    {
      'Report ID': 'RPT-002',
      'Report Name': 'Monthly Financial Close Report',
      'Description': 'Comprehensive financial close status and key metrics',
      'Owner': 'Financial Reporting',
      'Application': 'ERP System',
      'Frequency': 'Monthly'
    }
  ]
};