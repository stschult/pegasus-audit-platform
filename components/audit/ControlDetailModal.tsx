// components/audit/ControlDetailModal.tsx
// Enhanced ITGC control detail modal with evidence management and comprehensive fields
'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Eye, Download, AlertCircle, CheckCircle, Clock, User, FileText, Target } from 'lucide-react';
import SamplingTab from './SamplingTab';

export interface Control {
  id: string;
  name?: string;  // Keep compatibility with your existing structure
  title?: string; // New field
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

  // Update edited control when prop changes
  useEffect(() => {
    if (control) {
      setEditedControl({ ...control });
      setIsChanged(false);
    }
  }, [control]);

  if (!isOpen || !editedControl) return null;

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
    switch (rating) {
      case 'H': return 'text-red-600 bg-red-100';
      case 'M': return 'text-yellow-600 bg-yellow-100';
      case 'L': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskRatingLabel = (rating?: string) => {
    switch (rating) {
      case 'H': return 'High';
      case 'M': return 'Medium';
      case 'L': return 'Low';
      default: return 'Unknown';
    }
  };

  // Get display title (backwards compatible) - extract key concept
  const getKeyConcept = (description: string) => {
    if (!description) return 'Control Details';
    
    // Common ITGC key concepts to look for
    const keyTerms = [
      { terms: ['backup', 'back-up', 'back up'], concept: 'Data Backup & Recovery' },
      { terms: ['password', 'complexity'], concept: 'Password Management' },
      { terms: ['access', 'user account', 'privileged access'], concept: 'Access Control' },
      { terms: ['change management', 'change control', 'program changes'], concept: 'Change Management' },
      { terms: ['security patch', 'patching'], concept: 'Security Patching' },
      { terms: ['monitoring', 'log review'], concept: 'System Monitoring' },
      { terms: ['firewall', 'network'], concept: 'Network Security' },
      { terms: ['antivirus', 'malware'], concept: 'Malware Protection' },
      { terms: ['data encryption', 'encryption'], concept: 'Data Encryption' },
      { terms: ['vulnerability', 'scan'], concept: 'Vulnerability Management' },
      { terms: ['incident', 'response'], concept: 'Incident Response' },
      { terms: ['recoverability', 'recovery'], concept: 'Data Recovery' },
      { terms: ['segregation', 'separation'], concept: 'Segregation of Duties' },
      { terms: ['physical access', 'servers'], concept: 'Physical Security' },
      { terms: ['testing', 'program changes'], concept: 'Change Testing' },
      { terms: ['approval', 'production'], concept: 'Change Approval' },
      { terms: ['user acceptance testing'], concept: 'User Testing' },
      { terms: ['data conversion'], concept: 'Data Migration' },
      { terms: ['systems implementation'], concept: 'System Implementation' },
      { terms: ['termination', 'disabled'], concept: 'User Termination' },
      { terms: ['contractor', 'expiration'], concept: 'Contractor Access' },
      { terms: ['unique', 'user id'], concept: 'User Identification' }
    ];
    
    const lowerDesc = description.toLowerCase();
    
    for (const keyTerm of keyTerms) {
      for (const term of keyTerm.terms) {
        if (lowerDesc.includes(term)) {
          return keyTerm.concept;
        }
      }
    }
    
    // If no key terms found, use first few words
    const words = description.split(' ');
    return words.length > 4 ? words.slice(0, 4).join(' ') + '...' : description;
  };

  // Try multiple possible field names for the description
  const controlDescription = editedControl['control description'] || 
                            editedControl.description || 
                            editedControl.name || 
                            'No description available';
  
  const displayTitle = editedControl.title || getKeyConcept(controlDescription);

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'evidence', label: 'Evidence', icon: Upload },
    { id: 'sampling', label: 'Sampling', icon: Target },
    { id: 'notes', label: 'Notes', icon: Clock }
  ];

  return (
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
              {editedControl.riskRating && (
                <span className={`px-2 py-1 rounded text-xs ${getRiskRatingColor(editedControl.riskRating)}`}>
                  {getRiskRatingLabel(editedControl.riskRating)} Risk
                </span>
              )}
              {editedControl.frequency && (
                <span>{editedControl.frequency}</span>
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
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
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
                    onChange={(e) => handleInputChange('control description', e.target.value)}
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

          {activeTab === 'evidence' && (
            <div className="max-w-3xl mx-auto">
              {/* Evidence Upload */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence Management</h3>
                
                <div className="mb-6">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, XLS, Images (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleEvidenceUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>

                {/* Evidence List */}
                {evidenceList.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
                    {evidenceList.map((evidence) => (
                      <div key={evidence.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                        <div className="flex items-center flex-1">
                          <Eye className="w-4 h-4 text-gray-400 mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{evidence.name}</p>
                            <p className="text-xs text-gray-500">{evidence.uploadDate} • {evidence.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {evidence.url && (
                            <a
                              href={evidence.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Eye size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sampling' && (
            <SamplingTab 
              control={{
                id: editedControl.id || `ctrl-${Date.now()}`,
                description: controlDescription,
                riskRating: editedControl.riskRating || editedControl['pwc risk rating (h/m/l)'] || 'L',
                frequency: editedControl.frequency || editedControl['control frequency'] || 'monthly'
              }}
              auditPeriod={auditPeriod}
            />
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
            {activeTab === 'sampling' && (
              <div className="flex items-center space-x-2 ml-4">
                <Target className="w-4 h-4" />
                <span>Risk-based audit sampling</span>
              </div>
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
  );
}