// components/client/ClientUploadPortal.tsx
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Download,
  Search,
  Filter,
  Plus,
  Paperclip,
  Send,
  User,
  Building2,
  Shield,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';

// Import types and utilities
import { SampleRequest, UploadedFile, Comment, ClientUploadPortalProps } from '../../types/client';
import { 
  getControlKeyConcept, 
  formatFileSize, 
  getStatusColor, 
  getRiskColor, 
  calculateDashboardStats,
  getDaysDifference,
  isOverdue 
} from '../../lib/client/utils';

export const ClientUploadPortal: React.FC<ClientUploadPortalProps> = ({
  clientId,
  auditId,
  clientName
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'calendar'>('dashboard');
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>(generateMockData());
  const [selectedRequest, setSelectedRequest] = useState<SampleRequest | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newComment, setNewComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (!selectedRequest) return;
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, [selectedRequest]);

  const handleFileUpload = (files: File[]) => {
    if (!selectedRequest) return;

    const newFiles: UploadedFile[] = files.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      uploadedBy: clientName
    }));

    setSampleRequests(prev => 
      prev.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              uploadedFiles: [...req.uploadedFiles, ...newFiles],
              status: 'evidence_uploaded' as const,
              completionPercentage: Math.min(100, req.completionPercentage + 20)
            }
          : req
      )
    );

    setSelectedRequest(prev => prev ? {
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      status: 'evidence_uploaded' as const,
      completionPercentage: Math.min(100, prev.completionPercentage + 20)
    } : null);
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !selectedRequest) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: clientName,
      authorRole: 'client',
      message: newComment,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setSampleRequests(prev =>
      prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, comments: [...req.comments, comment] }
          : req
      )
    );

    setSelectedRequest(prev => prev ? {
      ...prev,
      comments: [...prev.comments, comment]
    } : null);

    setNewComment('');
  };

  // Filter and Search Logic
  const filteredRequests = sampleRequests.filter(req => {
    const matchesSearch = req.controlTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Dashboard Statistics
  const stats = calculateDashboardStats(sampleRequests);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pegasus Audit Portal</h1>
                <p className="text-sm text-gray-600">{clientName} - Audit Evidence Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Audit Period: Q3 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'requests', label: 'Evidence Requests', icon: FileText },
              { key: 'calendar', label: 'Due Dates', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Total Requests', value: stats.totalRequests, icon: FileText, color: 'blue' },
                { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'green' },
                { label: 'Pending', value: stats.pending, icon: Clock, color: 'yellow' },
                { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'red' },
                { label: 'Avg. Completion', value: `${stats.avgCompletion}%`, icon: TrendingUp, color: 'purple' },
                { label: 'High Priority', value: stats.highPriority, icon: Shield, color: 'orange' }
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md bg-${color}-100`}>
                      <Icon className={`h-6 w-6 text-${color}-600`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{label}</p>
                      <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Priority Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Priority Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {sampleRequests
                    .filter(r => r.priority === 'urgent' || isOverdue(r.dueDate, r.status))
                    .slice(0, 5)
                    .map(request => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900">{request.controlTitle}</p>
                            <p className="text-sm text-gray-600">Due: {new Date(request.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setActiveTab('requests');
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                        >
                          Upload Evidence
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="evidence_uploaded">Evidence Uploaded</option>
                    <option value="under_review">Under Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requests List */}
            <div className="grid gap-6">
              {filteredRequests.map(request => (
                <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.controlTitle}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(request.riskRating)}`}>
                            {request.riskRating} Risk
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{request.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(request.dueDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Activity className="h-4 w-4 mr-1" />
                            {request.frequency}
                          </span>
                          <span className="flex items-center">
                            <Paperclip className="h-4 w-4 mr-1" />
                            {request.uploadedFiles.length} files
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{request.completionPercentage}% Complete</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${request.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                        >
                          Manage Evidence
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Due Dates</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {sampleRequests
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map(request => {
                    const daysDiff = getDaysDifference(request.dueDate);
                    const requestIsOverdue = isOverdue(request.dueDate, request.status);
                    
                    return (
                      <div key={request.id} className={`p-4 rounded-lg border ${requestIsOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{request.controlTitle}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                              <span className={requestIsOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                {requestIsOverdue ? `${Math.abs(daysDiff)} days overdue` : `${daysDiff} days remaining`}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                                {request.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setActiveTab('requests');
                            }}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              requestIsOverdue 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {requestIsOverdue ? 'Upload Now' : 'Manage'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Evidence Upload Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedRequest.controlTitle}</h2>
                <p className="text-sm text-gray-600">{selectedRequest.controlType} - {selectedRequest.riskRating} Risk</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                {/* Request Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Request Details</h3>
                  <p className="text-gray-700 mb-3">{selectedRequest.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Due Date:</span>
                      <span className="ml-2 text-gray-900">{new Date(selectedRequest.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Frequency:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.frequency}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Progress:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.completionPercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Required Evidence */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Required Evidence</h3>
                  <ul className="space-y-2">
                    {selectedRequest.requiredEvidence.map((evidence, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* File Upload Area */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Upload Evidence</h3>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop files here or click to upload
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Support for PDF, Excel, Word, images, and other document formats
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                    >
                      Choose Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                    />
                  </div>
                </div>

                {/* Uploaded Files */}
                {selectedRequest.uploadedFiles.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Uploaded Files</h3>
                    <div className="space-y-2">
                      {selectedRequest.uploadedFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Communication</h3>
                  <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                    {selectedRequest.comments.map(comment => (
                      <div key={comment.id} className={`flex space-x-3 ${comment.authorRole === 'client' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          comment.authorRole === 'client' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs font-medium">{comment.author}</span>
                            <span className="text-xs opacity-75">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* New Comment Input */}
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                    />
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Last updated: {new Date(selectedRequest.createdDate).toLocaleDateString()}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle save/submit logic here
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock Data Generator - matching your ITGC patterns
function generateMockData(): SampleRequest[] {
  const sampleData: SampleRequest[] = [
    {
      id: 'CTRL-ACC-001-2024-Q3-1',
      controlId: 'ACC-001',
      controlTitle: 'User Access Review',
      controlType: 'Access Management',
      riskRating: 'High',
      frequency: 'Quarterly',
      description: 'Quarterly review of user access permissions across all systems to ensure appropriate access levels and remove terminated user accounts.',
      dueDate: '2024-09-15',
      status: 'pending',
      priority: 'high',
      requiredEvidence: [
        'User access report from Active Directory',
        'Terminated employee list from HR',
        'Access review sign-off documentation',
        'Remediation actions taken'
      ],
      uploadedFiles: [],
      comments: [
        {
          id: 'c1',
          author: 'Sarah Johnson',
          authorRole: 'auditor',
          message: 'Please ensure the access report includes all privileged accounts.',
          timestamp: '2024-08-15T10:30:00Z',
          isRead: true
        }
      ],
      assignedTo: 'IT Security Team',
      createdDate: '2024-08-01T09:00:00Z',
      completionPercentage: 25
    },
    {
      id: 'CTRL-CHG-002-2024-Q3-1',
      controlId: 'CHG-002',
      controlTitle: 'Change Management Process',
      controlType: 'Change Management',
      riskRating: 'Medium',
      frequency: 'Monthly',
      description: 'Monthly review of all system changes to ensure proper approval, testing, and documentation procedures were followed.',
      dueDate: '2024-09-30',
      status: 'evidence_uploaded',
      priority: 'medium',
      requiredEvidence: [
        'Change request forms',
        'Approval documentation',
        'Testing evidence',
        'Rollback procedures'
      ],
      uploadedFiles: [
        {
          id: 'f1',
          name: 'Change_Log_August_2024.xlsx',
          size: 1024000,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadDate: '2024-08-20T14:30:00Z',
          uploadedBy: 'Tech Corp'
        }
      ],
      comments: [],
      assignedTo: 'Development Team',
      createdDate: '2024-08-01T09:00:00Z',
      completionPercentage: 60
    },
    {
      id: 'CTRL-BAK-003-2024-Q3-1',
      controlId: 'BAK-003',
      controlTitle: 'Data Backup & Recovery',
      controlType: 'Data Backup',
      riskRating: 'High',
      frequency: 'Weekly',
      description: 'Weekly verification of data backup processes and periodic testing of recovery procedures to ensure business continuity.',
      dueDate: '2024-08-25',
      status: 'under_review',
      priority: 'urgent',
      requiredEvidence: [
        'Backup success logs',
        'Recovery test results',
        'RTO/RPO compliance reports',
        'Offsite storage verification'
      ],
      uploadedFiles: [
        {
          id: 'f2',
          name: 'Backup_Test_Results.pdf',
          size: 2048000,
          type: 'application/pdf',
          uploadDate: '2024-08-22T16:45:00Z',
          uploadedBy: 'Tech Corp'
        },
        {
          id: 'f3',
          name: 'Recovery_Procedures.docx',
          size: 512000,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploadDate: '2024-08-22T16:47:00Z',
          uploadedBy: 'Tech Corp'
        }
      ],
      comments: [
        {
          id: 'c2',
          author: 'Tech Corp',
          authorRole: 'client',
          message: 'Recovery test completed successfully on 8/20. All systems restored within RTO.',
          timestamp: '2024-08-22T16:50:00Z',
          isRead: false
        }
      ],
      assignedTo: 'Infrastructure Team',
      createdDate: '2024-08-01T09:00:00Z',
      completionPercentage: 90
    },
    {
      id: 'CTRL-MON-004-2024-Q3-1',
      controlId: 'MON-004',
      controlTitle: 'System Monitoring',
      controlType: 'System Monitoring',
      riskRating: 'Medium',
      frequency: 'Daily',
      description: 'Daily monitoring of system performance, security events, and anomaly detection to ensure operational stability.',
      dueDate: '2024-09-10',
      status: 'reviewed',
      priority: 'medium',
      requiredEvidence: [
        'System monitoring dashboards',
        'Alert notifications log',
        'Incident response records',
        'Performance metrics reports'
      ],
      uploadedFiles: [
        {
          id: 'f4',
          name: 'Monitoring_Dashboard_August.png',
          size: 3072000,
          type: 'image/png',
          uploadDate: '2024-08-28T11:20:00Z',
          uploadedBy: 'Tech Corp'
        }
      ],
      comments: [
        {
          id: 'c3',
          author: 'Michael Chen',
          authorRole: 'auditor',
          message: 'Evidence looks good. Please provide the incident response documentation as well.',
          timestamp: '2024-08-29T09:15:00Z',
          isRead: true
        }
      ],
      assignedTo: 'Operations Team',
      createdDate: '2024-08-01T09:00:00Z',
      completionPercentage: 75
    },
    {
      id: 'CTRL-PHY-005-2024-Q3-1',
      controlId: 'PHY-005',
      controlTitle: 'Physical Security',
      controlType: 'Physical Security',
      riskRating: 'Low',
      frequency: 'Monthly',
      description: 'Monthly review of physical access controls, visitor logs, and security camera footage to ensure facility security.',
      dueDate: '2024-10-01',
      status: 'approved',
      priority: 'low',
      requiredEvidence: [
        'Access card logs',
        'Visitor registration records',
        'Security camera footage review',
        'Physical security checklist'
      ],
      uploadedFiles: [
        {
          id: 'f5',
          name: 'Physical_Security_Report_August.pdf',
          size: 1536000,
          type: 'application/pdf',
          uploadDate: '2024-08-25T13:30:00Z',
          uploadedBy: 'Tech Corp'
        }
      ],
      comments: [
        {
          id: 'c4',
          author: 'Lisa Wong',
          authorRole: 'auditor',
          message: 'All physical security controls are operating effectively. Approved.',
          timestamp: '2024-08-30T15:45:00Z',
          isRead: true
        }
      ],
      assignedTo: 'Facilities Team',
      createdDate: '2024-08-01T09:00:00Z',
      completionPercentage: 100
    }
  ];

  return sampleData;
}

export default ClientUploadPortal;