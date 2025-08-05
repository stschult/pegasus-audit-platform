// components/audit/ControlDetailModal.tsx - FIXED TO PASS REACT STATE
// Enhanced ITGC control detail modal with NEW sampling modal system
'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Eye, Download, AlertCircle, CheckCircle, Clock, User, FileText, Target, Calendar } from 'lucide-react';
import SamplingModal from './SamplingModal';
import EvidenceModal from './EvidenceModal';
import { useAppState } from '../../hooks/useAppState';

export interface Control {
  id: string;
  name?: string;
  title?: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'needs-attention';
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  controlNumber?: string;
  location?: string;
  riskRating?: 'H' | 'M' | 'L';
  frequency?: string;
  type?: 'Preventive' | 'Detective';
  refNumber?: number;
  enhancedTitle?: string;
  enhancedDescription?: string;
}

interface Evidence {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  url?: string;
}

interface ControlDetailModalProps {
  control: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateControl: (controlId: string, updates: any) => void;
  onEvidenceUpload: (controlId: string, files: File[]) => void;
  auditPeriod?: {
    startDate: Date;
    endDate: Date;
  };
}

export default function ControlDetailModal({
  control,
  isOpen,
  onClose,
  onUpdateControl,
  onEvidenceUpload,
  auditPeriod = {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31')
  }
}: ControlDetailModalProps) {
  const [editedControl, setEditedControl] = useState<any>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [notes, setNotes] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'sampling' | 'notes'>('details');

  // NEW: Modal states for the new system
  const [samplingModalOpen, setSamplingModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  // ✅ FIXED: Get both status function AND current React state
  const { 
    getSamplingStatusForControl,
    evidenceRequests,
    evidenceSubmissions
  } = useAppState();

  // Update edited control when prop changes
  useEffect(() => {
    if (control) {
      setEditedControl({ 
        ...control,
        enhancedTitle: control.enhancedTitle || control.title || control.name,
        enhancedDescription: control.enhancedDescription || control.description
      });
      setIsChanged(false);
    }
  }, [control]);

  if (!isOpen || !editedControl) return null;

  // ✅ FIXED: Pass current React state to avoid localStorage fallback
  const currentSamplingStatus = getSamplingStatusForControl(
    editedControl.id, 
    evidenceRequests, 
    evidenceSubmissions
  );

  const handleInputChange = (field: string, value: any) => {
    setEditedControl((prev: any) => prev ? { ...prev, [field]: value } : null);
    setIsChanged(true);
  };

  const handleSave = () => {
    if (editedControl) {
      onUpdateControl(editedControl.id, editedControl);
      setIsChanged(false);
    }
  };

  const handleEvidenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    onEvidenceUpload(editedControl.id, fileArray);

    fileArray.forEach(file => {
      const newEvidence: Evidence = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        uploadDate: new Date().toLocaleDateString(),
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        url: URL.createObjectURL(file)
      };
      setEvidenceList(prev => [...prev, newEvidence]);
    });
    setIsChanged(true);
  };

  const getRiskRatingColor = (rating?: string) => {
    if (!rating) return 'text-gray-600 bg-gray-100';
    
    const normalizedRating = rating.toLowerCase();
    if (normalizedRating === 'h' || normalizedRating === 'high') return 'text-red-600 bg-red-100';
    if (normalizedRating === 'm' || normalizedRating === 'medium') return 'text-yellow-600 bg-yellow-100';
    if (normalizedRating === 'l' || normalizedRating === 'low') return 'text-green-600 bg-green-100';
    
    return 'text-gray-600 bg-gray-100';
  };

  const getRiskRatingLabel = (rating?: string) => {
    if (!rating) return 'Unknown';
    
    const normalizedRating = rating.toLowerCase();
    if (normalizedRating === 'h' || normalizedRating === 'high') return 'High';
    if (normalizedRating === 'm' || normalizedRating === 'medium') return 'Medium';
    if (normalizedRating === 'l' || normalizedRating === 'low') return 'Low';
    
    return rating;
  };

  const getControlKeyConcept = (control: any) => {
    const description = (control as any)['control description'] || 
                       (control as any)['description'] || 
                       (control as any)['control name'] ||
                       (control as any)['name'] ||
                       control.description || 
                       control.name || 
                       '';
    
    if (!description || description.includes('Description for control') || description.length < 3) {
      const controlFamily = control.controlFamily || '';
      const controlId = control.id || '';
      
      if (controlFamily.toLowerCase().includes('access')) {
        return 'User Access Management Control';
      } else if (controlFamily.toLowerCase().includes('change')) {
        return 'Change Management Control';
      } else if (controlFamily.toLowerCase().includes('backup') || controlFamily.toLowerCase().includes('recovery')) {
        return 'Data Backup & Recovery Control';
      } else if (controlFamily.toLowerCase().includes('security')) {
        return 'Security Management Control';
      } else if (controlFamily.toLowerCase().includes('monitor')) {
        return 'System Monitoring Control';
      } else {
        const idNum = controlId.replace(/[^0-9]/g, '');
        const genericNames = [
          'User Access Provisioning',
          'Password Management',
          'Privileged Access Management', 
          'Change Management Controls',
          'Data Backup & Recovery',
          'Network Security Controls',
          'System Monitoring & Logging',
          'Security Patch Management',
          'Incident Response',
          'Physical Security Controls',
          'Data Encryption Controls',
          'Vulnerability Management',
          'Access Review Controls',
          'Authentication Controls',
          'Authorization Controls'
        ];
        const index = parseInt(idNum) || 1;
        return genericNames[(index - 1) % genericNames.length];
      }
    }
    
    const keyTerms = [
      { terms: ['user access', 'access provision', 'user account creation', 'access request'], concept: 'User Access Provisioning' },
      { terms: ['password', 'complexity', 'password policy'], concept: 'Password Management' },
      { terms: ['privileged access', 'admin access', 'elevated access'], concept: 'Privileged Access Management' },
      { terms: ['change management', 'change control', 'program changes', 'system changes'], concept: 'Change Management Controls' },
      { terms: ['backup', 'back-up', 'back up', 'data backup'], concept: 'Data Backup & Recovery' },
      { terms: ['recoverability', 'recovery', 'disaster recovery', 'business continuity'], concept: 'Disaster Recovery Controls' },
      { terms: ['security patch', 'patching', 'vulnerability patching'], concept: 'Security Patch Management' },
      { terms: ['monitoring', 'log review', 'system monitoring'], concept: 'System Monitoring & Logging' },
      { terms: ['firewall', 'network security', 'network access'], concept: 'Network Security Controls' },
      { terms: ['antivirus', 'malware', 'endpoint protection'], concept: 'Malware Protection' },
      { terms: ['data encryption', 'encryption', 'data protection'], concept: 'Data Encryption Controls' },
      { terms: ['vulnerability', 'scan', 'vulnerability management'], concept: 'Vulnerability Management' },
      { terms: ['incident', 'response', 'incident management'], concept: 'Incident Response' },
      { terms: ['segregation', 'separation', 'duties'], concept: 'Segregation of Duties' },
      { terms: ['physical access', 'servers', 'data center'], concept: 'Physical Security Controls' },
      { terms: ['testing', 'program changes', 'change testing'], concept: 'Change Testing Procedures' },
      { terms: ['approval', 'production', 'change approval'], concept: 'Change Approval Process' },
      { terms: ['user acceptance testing', 'uat'], concept: 'User Acceptance Testing' },
      { terms: ['data conversion', 'data migration'], concept: 'Data Migration Controls' },
      { terms: ['systems implementation', 'system deployment'], concept: 'System Implementation Controls' },
      { terms: ['termination', 'disabled', 'user termination'], concept: 'User Termination Process' },
      { terms: ['contractor', 'expiration', 'vendor access'], concept: 'Third-Party Access Management' },
      { terms: ['unique', 'user id', 'identification'], concept: 'User Identification Controls' },
      { terms: ['review', 'access review', 'periodic review'], concept: 'Access Review Controls' },
      { terms: ['authentication', 'multi-factor', 'mfa'], concept: 'Authentication Controls' },
      { terms: ['authorization', 'role-based', 'rbac'], concept: 'Authorization Controls' }
    ];
    
    const lowerDesc = description.toLowerCase();
    
    for (const keyTerm of keyTerms) {
      for (const term of keyTerm.terms) {
        if (lowerDesc.includes(term)) {
          return keyTerm.concept;
        }
      }
    }
    
    const words = description.split(' ');
    return words.length > 4 ? words.slice(0, 4).join(' ') + '...' : description;
  };

  const displayTitle = editedControl.enhancedTitle || getControlKeyConcept(editedControl);
  const originalDescription = (editedControl as any)['control description'] || editedControl.description || '';
  const controlDescription = originalDescription && !originalDescription.includes('Description for control') 
    ? originalDescription 
    : `Ensures ${displayTitle.toLowerCase()} are properly implemented and monitored within the organization's IT environment.`;

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'evidence', label: 'Evidence', icon: Upload },
    { id: 'sampling', label: 'Sampling', icon: Target },
    { id: 'notes', label: 'Notes', icon: Clock }
  ];

  // Handle tab clicks with status checking
  const handleTabClick = (tabId: string) => {
    if (tabId === 'sampling') {
      // Check if sampling is allowed based on current status
      const disallowedStatuses = ['Evidence Request Sent', 'Partial Evidence Submitted', 'All Evidence Submitted', 'Evidence Approved'];
      if (disallowedStatuses.includes(currentSamplingStatus)) {
        // Show a message instead of opening modal
        alert(`Cannot modify sampling configuration. Current status: ${currentSamplingStatus}`);
        return;
      }
      setSamplingModalOpen(true);
    } else if (tabId === 'evidence') {
      setEvidenceModalOpen(true);
    } else {
      setActiveTab(tabId as any);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{displayTitle}</h2>
              {editedControl.controlNumber && (
                <p className="text-sm text-gray-600 mt-1 truncate">Control #: {editedControl.controlNumber}</p>
              )}
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                {editedControl.location && (
                  <span>{editedControl.location}</span>
                )}
                {(editedControl.riskRating || editedControl['pwc risk rating (h/m/l)']) && (
                  <span className={`px-2 py-1 rounded text-xs ${getRiskRatingColor(editedControl.riskRating || editedControl['pwc risk rating (h/m/l)'])}`}>
                    {getRiskRatingLabel(editedControl.riskRating || editedControl['pwc risk rating (h/m/l)'])} Risk
                  </span>
                )}
                {editedControl.frequency && (
                  <span>{editedControl.frequency}</span>
                )}
                {/* Show current sampling status */}
                {currentSamplingStatus !== 'No Sampling Required' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {currentSamplingStatus}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 flex-shrink-0">
            <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                // Check if sampling tab should be disabled
                const isDisabled = tab.id === 'sampling' && 
                  ['Evidence Request Sent', 'Partial Evidence Submitted', 'All Evidence Submitted', 'Evidence Approved'].includes(currentSamplingStatus);
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    disabled={isDisabled}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : isDisabled 
                        ? 'border-transparent text-gray-300 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {/* Show lock icon for disabled sampling tab */}
                    {isDisabled && <span className="ml-1 text-xs">🔒</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Control Information */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Control Details</h3>
                    
                    <div className="space-y-4">
                      {/* Status and Priority */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select
                            value={editedControl.status || 'not-started'}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="needs-attention">Needs Attention</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                          <select
                            value={editedControl.priority || 'medium'}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      </div>

                      {/* Current fields from your existing structure */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                          <input
                            type="text"
                            value={editedControl.assignee || ''}
                            onChange={(e) => handleInputChange('assignee', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                          <input
                            type="date"
                            value={editedControl.dueDate || ''}
                            onChange={(e) => handleInputChange('dueDate', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={controlDescription}
                      onChange={(e) => {
                        handleInputChange('enhancedDescription', e.target.value);
                        handleInputChange('control description', e.target.value);
                        handleInputChange('description', e.target.value);
                      }}
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Status Overview */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Status Overview</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${editedControl.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">Control Testing Complete</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${evidenceList.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">Evidence Documented</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${notes.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-700">Notes Added</span>
                      </div>
                      {/* Show sampling status */}
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${currentSamplingStatus === 'Evidence Approved' ? 'bg-green-500' : currentSamplingStatus === 'No Sampling Required' ? 'bg-gray-300' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm text-gray-700">Sampling: {currentSamplingStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => handleInputChange('status', 'completed')}
                        className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Mark as Complete
                      </button>
                      <button 
                        onClick={() => handleInputChange('status', 'needs-attention')}  
                        className="w-full text-left p-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                      >
                        Request Additional Evidence
                      </button>
                      <button 
                        onClick={() => handleInputChange('priority', 'high')}
                        className="w-full text-left p-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Flag for Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="max-w-3xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setIsChanged(true);
                    }}
                    rows={8}
                    placeholder="Add any notes about this control..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center text-sm text-gray-500">
              {isChanged && (
                <span className="flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  <span className="hidden sm:inline">Unsaved changes</span>
                  <span className="sm:hidden">Changes</span>
                </span>
              )}
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={onClose}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={!isChanged}
                className={`px-3 sm:px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  isChanged
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Sampling Modal */}
      <SamplingModal
        isOpen={samplingModalOpen}
        onClose={() => setSamplingModalOpen(false)}
        controlId={editedControl.id}
        controlDescription={controlDescription}
        auditPeriod={auditPeriod}
        onSave={() => {
          console.log('Sampling configuration saved');
          setSamplingModalOpen(false);
        }}
        onApprove={() => {
          console.log('Samples approved');
        }}
        onCreateEvidenceRequest={() => {
          console.log('Evidence request created');
          setSamplingModalOpen(false);
          setEvidenceModalOpen(true);
        }}
      />

      {/* FIXED: Evidence Modal with proper props */}
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        controlId={editedControl.id}
        controlDescription={controlDescription}
        evidenceRequests={[]} // TODO: Connect to actual data
        evidenceSubmissions={[]} // TODO: Connect to actual data
        samples={[]} // TODO: Connect to actual data
        onUpdateRequest={(requestId, updates) => {
          console.log('Evidence request updated:', requestId, updates);
        }}
        onReviewSubmission={(submissionId, status, notes) => {
          console.log('Evidence submission reviewed:', submissionId, status, notes);
        }}
        onRequestClarification={(requestId, question) => {
          console.log('Clarification requested:', requestId, question);
        }}
      />
    </>
  );
}