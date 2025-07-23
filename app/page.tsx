'use client';

import React, { useState } from 'react';
import { FileText, AlertTriangle, User } from 'lucide-react';

// Mock data
const mockUser = {
  id: '1',
  name: 'Alice Johnson',
  email: 'alice@aldridge.com',
  role: 'AUDIT_OWNER_FINANCE',
  organization: 'Aldridge Advisors',
  isClient: false
};

const mockAudits = [
  {
    id: '1',
    clientName: 'Acme Corp',
    relationshipOwner: 'J. Sanders',
    auditOwner: 'T. Robbins',
    progress: 10
  },
  {
    id: '2',
    clientName: 'Northbridge Logistics',
    relationshipOwner: 'L. Patel',
    auditOwner: 'S. El-Amin',
    progress: 60
  },
  {
    id: '3',
    clientName: 'Summit Accounting',
    relationshipOwner: 'A. Moreno',
    auditOwner: 'L. Maxwell',
    progress: 25
  },
  {
    id: '4',
    clientName: 'Blue Ridge Farms',
    relationshipOwner: 'R. Blake',
    auditOwner: 'D. Hollis',
    progress: 25
  }
];

const mockControls = [
  {
    id: '1',
    controlId: 'FIN-1',
    title: 'Monthly bank reconciliation',
    description: 'Ensures all cash accounts are reconciled monthly with supporting documentation and reviews.',
    type: 'FINANCE',
    status: 'EVIDENCE_RECEIVED',
    progress: 40,
    owner: 'John Smith',
    tester: 'Alice Lee',
    dueDate: '2025-08-10',
    deadline: '2025-08-30'
  },
  {
    id: '2',
    controlId: 'FIN-2',
    title: 'Access rights reviewed quarterly',
    description: 'Quarterly review of user access rights and permissions.',
    type: 'FINANCE',
    status: 'NEEDS_ADDITIONAL_INFO',
    progress: 50,
    owner: 'Owner Name',
    tester: 'Tester Name',
    dueDate: '2025-08-12',
    deadline: '2025-08-22'
  },
  {
    id: '3',
    controlId: 'ITGC-1',
    title: 'IT password policy enforced',
    description: 'Password complexity and rotation policies are enforced.',
    type: 'ITGC',
    status: 'COMPLETE',
    progress: 100,
    owner: 'IT Owner',
    tester: 'IT Tester',
    dueDate: '2025-08-01',
    deadline: '2025-08-11'
  }
];

const mockEvidence = [
  { id: '1', fileName: 'Bank statement for July 2025', type: 'received' },
  { id: '2', fileName: 'Reconciliation worksheet signed off by controller', type: 'received' }
];

const mockPendingItems = [
  { id: '1', item: 'Upload reviewer comments', type: 'pending' },
  { id: '2', item: 'Verification by audit tester', type: 'pending' }
];

const STATUS_COLORS = {
  'REQUEST_SENT': 'bg-gray-100 text-gray-700',
  'IN_PROGRESS': 'bg-blue-100 text-blue-700',
  'INCOMPLETE_EVIDENCE': 'bg-yellow-100 text-yellow-700',
  'EVIDENCE_RECEIVED': 'bg-blue-100 text-blue-700',
  'NEEDS_ADDITIONAL_INFO': 'bg-orange-100 text-orange-700',
  'EVIDENCE_VERIFIED': 'bg-blue-100 text-blue-700',
  'PASS': 'bg-green-100 text-green-700',
  'COMPLETE': 'bg-green-100 text-green-700'
};

const STATUS_LABELS = {
  'REQUEST_SENT': 'Request Sent',
  'IN_PROGRESS': 'In Progress',
  'INCOMPLETE_EVIDENCE': 'Incomplete Evidence',
  'EVIDENCE_RECEIVED': 'Evidence Received',
  'NEEDS_ADDITIONAL_INFO': 'Needs Additional Info',
  'EVIDENCE_VERIFIED': 'Evidence Verified',
  'PASS': 'Pass',
  'COMPLETE': 'Complete'
};

function getProgressColor(progress) {
  if (progress === 100) return 'bg-green-500';
  if (progress >= 60) return 'bg-blue-500';
  if (progress >= 40) return 'bg-yellow-500';
  return 'bg-gray-300';
}

// Main Dashboard Component - FIXED CARDS
function AuditDashboard({ onAuditSelect }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Aldridge Advisors - Active Client Audits
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockAudits.map((audit) => (
            <div 
              key={audit.id} 
              className="bg-white rounded-lg p-6 shadow-sm border cursor-pointer hover:shadow-md transition-shadow relative h-52"
              onClick={() => onAuditSelect(audit)}
            >
              <h3 className="font-semibold text-lg mb-4">{audit.clientName}</h3>
              
              <div className="space-y-2 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Relationship Owner: </span>
                  <span className="text-sm font-medium">{audit.relationshipOwner}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Audit Owner: </span>
                  <span className="text-sm font-medium">{audit.auditOwner}</span>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">{audit.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(audit.progress)}`}
                    style={{ width: `${audit.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Control Dashboard Component - FIXED CARDS
function ControlDashboard({ selectedAudit, onControlSelect }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {selectedAudit.clientName} Audit Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockControls.map((control) => (
            <div 
              key={control.id} 
              className="bg-white rounded-lg p-6 shadow-sm border cursor-pointer hover:shadow-md transition-shadow relative h-72"
              onClick={() => onControlSelect(control)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{control.controlId}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[control.status]}`}>
                  {STATUS_LABELS[control.status]}
                </span>
              </div>
              
              <h4 className="font-medium mb-2">{control.title}</h4>
              
              <div className="space-y-2 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Owner: </span>
                  <span className="font-medium">{control.owner}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tester: </span>
                  <span className="font-medium">{control.tester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due: {control.dueDate}</span>
                  <span className="text-gray-600">Deadline: {control.deadline}</span>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">{control.progress}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(control.progress)}`}
                    style={{ width: `${control.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Control Detail Component
function ControlDetail({ control, onBack, onMarkVerified }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back to Controls
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Control Detail – {control.controlId}
        </h1>
        
        <div className="bg-white rounded-lg p-8 shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">{control.title}</h2>
          <p className="text-gray-600 mb-6">{control.description}</p>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Owner: </span>
                <span className="font-medium">{control.owner}</span>
              </div>
              <div>
                <span className="text-gray-600">Due Date: </span>
                <span className="font-medium">{control.dueDate}</span>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[control.status]}`}>
                  Status: {STATUS_LABELS[control.status]}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">Tester: </span>
                <span className="font-medium">{control.tester}</span>
              </div>
              <div>
                <span className="text-gray-600">Deadline: </span>
                <span className="font-medium">{control.deadline}</span>
              </div>
              <div>
                <span className="text-gray-600">Progress: </span>
                <span className="font-medium">{control.progress}%</span>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Evidence Received</h3>
            <ul className="space-y-2">
              {mockEvidence.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-4 w-4 text-green-600" />
                  {item.fileName}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Pending Items</h3>
            <ul className="space-y-2">
              {mockPendingItems.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {item.item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              Control execution appears timely, but evidence package lacks annotations explaining reconciling items.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={onMarkVerified}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark as Verified
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Component - FIXED
function Navigation({ currentView, user, selectedAudit, onViewChange, onLogout }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-900">Pegasus Audit Platform</h1>
          <div className="flex gap-4">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            {!user.isClient && selectedAudit && (
              <button
                onClick={() => onViewChange('controls')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'controls' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {selectedAudit.clientName} Controls
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-gray-500">({user.organization})</span>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// Login Component
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password === 'demo123') {
      const demoUser = email.includes('client') 
        ? { ...mockUser, isClient: true, organization: 'Acme Corp', role: 'CONTROL_OWNER' }
        : mockUser;
      onLogin(demoUser);
    } else {
      alert('Use any email and password "demo123"');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Pegasus Audit Platform</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p className="font-medium">Demo Credentials:</p>
          <p>Auditor: any email + password "demo123"</p>
          <p>Client: include "client" in email + password "demo123"</p>
        </div>
      </div>
    </div>
  );
}

// Main App Component - FIXED NAVIGATION
export default function PegasusAuditPlatform() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedControl, setSelectedControl] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
  
  const handleLogin = (userData) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setSelectedControl(null);
    setSelectedAudit(null);
  };
  
  const handleAuditSelect = (audit) => {
    setSelectedAudit(audit);
    setSelectedControl(null);
    setCurrentView('controls');
  };
  
  const handleControlSelect = (control) => {
    setSelectedControl(control);
    setCurrentView('control-detail');
  };
  
  const handleMarkVerified = () => {
    alert('Control marked as verified!');
    setCurrentView('controls');
    setSelectedControl(null);
  };
  
  const handleViewChange = (view) => {
    if (view === 'dashboard') {
      setSelectedAudit(null);
      setSelectedControl(null);
    }
    setCurrentView(view);
  };
  
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView}
        user={user}
        selectedAudit={selectedAudit}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />
      
      {currentView === 'dashboard' && (
        <AuditDashboard onAuditSelect={handleAuditSelect} />
      )}
      
      {currentView === 'controls' && selectedAudit && (
        <ControlDashboard
          selectedAudit={selectedAudit}
          onControlSelect={handleControlSelect}
        />
      )}
      
      {currentView === 'control-detail' && selectedControl && (
        <ControlDetail
          control={selectedControl}
          onBack={() => {
            setCurrentView('controls');
            setSelectedControl(null);
          }}
          onMarkVerified={handleMarkVerified}
        />
      )}
    </div>
  );
}