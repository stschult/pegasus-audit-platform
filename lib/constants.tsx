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
    name: 'Cash Reconciliation',
    title: 'Cash Reconciliation',
    description: 'Monthly bank reconciliation procedures and documentation',
    controlFamily: 'Financial Controls',
    owner: 'Finance Team',
    tester: 'Sarah Johnson',
    dueDate: '2024-03-15',
    deadline: '2024-03-20',
    status: 'testing' as const,
    progress: 75,
    riskRating: 'High' as const,
    frequency: 'Monthly'
  },
  {
    id: 'C002',
    name: 'Revenue Recognition',
    title: 'Revenue Recognition',
    description: 'Proper revenue recognition in accordance with GAAP',
    controlFamily: 'Financial Controls',
    owner: 'Accounting Team',
    tester: 'Mike Rodriguez',
    dueDate: '2024-03-10',
    deadline: '2024-03-18',
    status: 'evidence_review' as const,
    progress: 60,
    riskRating: 'Medium' as const,
    frequency: 'Monthly'
  },
  {
    id: 'C003',
    name: 'Inventory Count',
    title: 'Inventory Count',
    description: 'Physical inventory count and reconciliation procedures',
    controlFamily: 'Operational Controls',
    owner: 'Operations Team',
    tester: 'Jennifer Liu',
    dueDate: '2024-03-20',
    deadline: '2024-03-25',
    status: 'not-started' as const,
    progress: 0,
    riskRating: 'Low' as const,
    frequency: 'Quarterly'
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
  { value: 'soc1', label: 'SOC 1' },
  { value: 'soc2', label: 'SOC 2' },
  { value: 'financial', label: 'Financial Statement Audit' },
  { value: 'compliance', label: 'Compliance Audit' },
  { value: 'operational', label: 'Operational Audit' }
];

export const AUDIT_MODULES = [
  { id: 'control-mapping', name: 'Control Mapping', description: 'ITGCs and Manual Controls' },
  { id: 'key-reports', name: 'Key Reports', description: 'Business Reports & Queries' },
  { id: 'itacs', name: 'ITACs', description: 'Automated Controls' },
  { id: 'walkthroughs', name: 'Walkthroughs', description: 'Process Documentation' },
  { id: 'key-systems', name: 'Key Systems', description: 'ERP & IT Systems' },
  { id: 'findings-log', name: 'Findings Log', description: 'Issues & Remediation' }
];