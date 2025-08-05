// components/audit/EvidenceModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  MessageCircle,
  Calendar,
  FileText,
  User,
  Send,
  Filter,
  Search
} from 'lucide-react';
import { 
  EvidenceRequest, 
  EvidenceSubmission, 
  GeneratedSample,
  ClarificationRequest 
} from '../../types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  controlId: string;
  controlDescription: string;
  evidenceRequests: EvidenceRequest[];
  evidenceSubmissions: EvidenceSubmission[];
  samples: GeneratedSample[];
  onUpdateRequest: (requestId: string, updates: Partial<EvidenceRequest>) => void;
  onReviewSubmission: (submissionId: string, status: EvidenceSubmission['status'], notes?: string) => void;
  onRequestClarification: (requestId: string, question: string) => void;
}

type TabType = 'overview' | 'requests' | 'submissions' | 'communication';

export default function EvidenceModal({
  isOpen,
  onClose,
  controlId,
  controlDescription,
  evidenceRequests = [],
  evidenceSubmissions = [],
  samples = [],
  onUpdateRequest,
  onReviewSubmission,
  onRequestClarification
}: EvidenceModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedRequest, setSelectedRequest] = useState<EvidenceRequest | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<EvidenceSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setSelectedRequest(null);
      setSelectedSubmission(null);
      setReviewNotes('');
      setClarificationQuestion('');
    }
  }, [isOpen]);

  // Calculate overview statistics
  const getOverviewStats = () => {
    const requests = evidenceRequests || [];
    const submissions = evidenceSubmissions || [];
    
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'approved').length;
    const pendingRequests = requests.filter(r => 
      ['sent', 'acknowledged', 'in_progress'].includes(r.status)
    ).length;
    const totalSubmissions = submissions.length;
    const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
    const pendingReview = submissions.filter(s => s.status === 'under_review').length;
    
    return {
      totalRequests,
      completedRequests,
      pendingRequests,
      totalSubmissions,
      approvedSubmissions,
      pendingReview,
      completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0
    };
  };

  // Filter submissions based on search and status
  const getFilteredSubmissions = () => {
    const submissions = evidenceSubmissions || [];
    let filtered = submissions;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Handle submission review
  const handleReviewSubmission = (submission: EvidenceSubmission, approved: boolean) => {
    const status = approved ? 'approved' : 'rejected';
    onReviewSubmission(submission.id, status, reviewNotes);
    setSelectedSubmission(null);
    setReviewNotes('');
  };

  // Handle clarification request
  const handleSendClarification = () => {
    if (!selectedRequest || !clarificationQuestion.trim()) return;
    
    onRequestClarification(selectedRequest.id, clarificationQuestion);
    setClarificationQuestion('');
  };

  // Get status color class
  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'acknowledged': 'bg-purple-100 text-purple-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'submitted': 'bg-green-100 text-green-800',
      'under_review': 'bg-orange-100 text-orange-800',
      'approved': 'bg-green-200 text-green-900',
      'requires_clarification': 'bg-red-100 text-red-800',
      'uploaded': 'bg-blue-100 text-blue-800',
      'rejected': 'bg-red-100 text-red-800',
      'requires_resubmission': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const stats = getOverviewStats();
  const filteredSubmissions = getFilteredSubmissions();
  const requests = evidenceRequests || [];
  const submissions = evidenceSubmissions || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Evidence Management</h2>
            <p className="text-sm text-gray-600 mt-1">{controlDescription}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'requests', label: `Requests (${requests.length})`, icon: Send },
              { id: 'submissions', label: `Submissions (${submissions.length})`, icon: Upload },
              { id: 'communication', label: 'Communication', icon: MessageCircle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
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

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Send className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
                      <div className="text-sm text-blue-800">Total Requests</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.completedRequests}</div>
                      <div className="text-sm text-green-800">Completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</div>
                      <div className="text-sm text-yellow-800">Pending Review</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
                      <div className="text-sm text-purple-800">Completion Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Evidence Collection Progress</h3>
                  <span className="text-sm text-gray-600">
                    {stats.completedRequests} of {stats.totalRequests} requests completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {submissions.length > 0 ? (
                    submissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{submission.fileName}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(submission.uploadedAt).toLocaleDateString()} by {submission.uploadedBy}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No evidence submissions yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Evidence Requests</h3>
                <div className="flex space-x-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="sent">Sent</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{request.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{request.instructions}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      {request.samplingDetails && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Sampling Details</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Methodology:</span>
                              <span className="ml-2 font-medium">{request.samplingDetails.methodology}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Sample Size:</span>
                              <span className="ml-2 font-medium">{request.samplingDetails.sampleSize}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <span className="text-gray-600 text-sm">Required Dates:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {request.samplingDetails.selectedDates.map((date, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {date}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                          <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                          <span>Priority: {request.priority.toUpperCase()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Send className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No evidence requests yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Evidence Submissions</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="uploaded">Uploaded</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {filteredSubmissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            File Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Sample Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Uploaded
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredSubmissions.map((submission) => (
                          <tr key={submission.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{submission.fileName}</div>
                                  <div className="text-sm text-gray-500">{submission.fileSize} bytes</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {submission.sampleDate ? (
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{submission.sampleDate}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">General</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              <div>
                                <div>{new Date(submission.uploadedAt).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-400">by {submission.uploadedBy}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                {submission.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Eye size={16} />
                                </button>
                                <button className="text-green-600 hover:text-green-800">
                                  <Download size={16} />
                                </button>
                                {submission.status === 'uploaded' && (
                                  <button
                                    onClick={() => setSelectedSubmission(submission)}
                                    className="text-purple-600 hover:text-purple-800"
                                  >
                                    Review
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No evidence submissions yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Communication</h3>
                
                {selectedRequest && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Request Clarification</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Send a clarification request to the client for: {selectedRequest.title}
                    </p>
                    <div className="mt-3">
                      <textarea
                        value={clarificationQuestion}
                        onChange={(e) => setClarificationQuestion(e.target.value)}
                        placeholder="What additional information do you need from the client?"
                        rows={3}
                        className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="px-3 py-2 text-blue-600 hover:text-blue-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSendClarification}
                          disabled={!clarificationQuestion.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          Send Clarification
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Communication History */}
                <div className="space-y-4">
                  {requests.map((request) => 
                    request.clarificationRequests?.map((clarification) => (
                      <div key={clarification.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Clarification Request</p>
                            <p className="text-sm text-gray-600 mt-1">{clarification.question}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Requested on {new Date(clarification.requestedAt).toLocaleDateString()} by {clarification.requestedBy}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            clarification.status === 'answered' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {clarification.status.toUpperCase()}
                          </span>
                        </div>
                        {clarification.response && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">{clarification.response}</p>
                            <p className="text-xs text-green-600 mt-1">
                              Answered on {new Date(clarification.respondedAt!).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {requests.every(r => !r.clarificationRequests || r.clarificationRequests.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No communication history yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Evidence</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">File: {selectedSubmission.fileName}</p>
                <p className="text-sm text-gray-600">Sample Date: {selectedSubmission.sampleDate || 'General'}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your review comments..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewSubmission(selectedSubmission, false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReviewSubmission(selectedSubmission, true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="text-sm text-gray-500">
            {stats.totalSubmissions} submissions • {stats.approvedSubmissions} approved • {stats.pendingReview} pending review
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}