// File: components/audit/modals/WalkthroughCompletionModal.tsx - FIXED: Null reference error
'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, Clock, MapPin, Users, FileText, AlertTriangle } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

interface WalkthroughRequest {
  id: string;
  auditId: string;
  applicationId: string;
  applicationName: string;
  businessOwner: string;
  requestType: 'walkthrough';
  status: string;
  currentResponsibleParty: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  relatedReports: any[];
  estimatedDuration: number;
  criticality: string;
  schedulingData?: {
    scheduledDate: string;
    scheduledTime: string;
    location: string;
    attendees: string[];
    notes: string;
    clientContact: string;
  };
}

interface WalkthroughCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  request: WalkthroughRequest | null;
  onComplete: (completionData: any) => void;
}

const WalkthroughCompletionModal: React.FC<WalkthroughCompletionModalProps> = ({
  isOpen,
  onClose,
  application,
  request,
  onComplete
}) => {
  const [completionData, setCompletionData] = useState({
    date: '',
    time: '',
    duration: 60,
    location: '',
    attendees: [] as string[],
    notes: '',
    followUpRequired: false,
    followUpNotes: ''
  });

  const [currentAttendee, setCurrentAttendee] = useState('');

  // FIXED: Add null check for request before accessing properties
  useEffect(() => {
    if (isOpen && request && request.schedulingData) {
      // Pre-populate with scheduled data if available
      setCompletionData(prev => ({
        ...prev,
        date: request.schedulingData?.scheduledDate || '',
        time: request.schedulingData?.scheduledTime || '',
        location: request.schedulingData?.location || '',
        attendees: request.schedulingData?.attendees || [],
        duration: request.estimatedDuration || 60
      }));
    } else if (isOpen && request) {
      // FIXED: Handle case where request exists but schedulingData is null
      setCompletionData(prev => ({
        ...prev,
        date: '',
        time: '',
        location: '',
        attendees: [],
        duration: request.estimatedDuration || 60
      }));
    } else if (isOpen) {
      // FIXED: Handle case where request is null
      setCompletionData({
        date: '',
        time: '',
        duration: 60,
        location: '',
        attendees: [],
        notes: '',
        followUpRequired: false,
        followUpNotes: ''
      });
    }
  }, [isOpen, request]);

  // FIXED: Add early return if request is null
  if (!isOpen || !request) return null;

  const handleAddAttendee = () => {
    if (currentAttendee.trim() && !completionData.attendees.includes(currentAttendee.trim())) {
      setCompletionData(prev => ({
        ...prev,
        attendees: [...prev.attendees, currentAttendee.trim()]
      }));
      setCurrentAttendee('');
    }
  };

  const handleRemoveAttendee = (attendee: string) => {
    setCompletionData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== attendee)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!completionData.date || !completionData.time) {
      alert('Please fill in the completion date and time.');
      return;
    }

    onComplete(completionData);
  };

  const handleClose = () => {
    setCompletionData({
      date: '',
      time: '',
      duration: 60,
      location: '',
      attendees: [],
      notes: '',
      followUpRequired: false,
      followUpNotes: ''
    });
    setCurrentAttendee('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Complete Walkthrough</h2>
              <p className="text-sm text-gray-600">{application?.name || 'Unknown Application'}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Scheduled Information */}
          {request.schedulingData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Originally Scheduled</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Date:</span> {request.schedulingData.scheduledDate}
                </div>
                <div>
                  <span className="text-blue-700">Time:</span> {request.schedulingData.scheduledTime}
                </div>
                <div className="col-span-2">
                  <span className="text-blue-700">Location:</span> {request.schedulingData.location}
                </div>
              </div>
            </div>
          )}

          {/* Actual Completion Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Actual Completion Date *
              </label>
              <input
                type="date"
                value={completionData.date}
                onChange={(e) => setCompletionData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Actual Start Time *
              </label>
              <input
                type="time"
                value={completionData.time}
                onChange={(e) => setCompletionData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Actual Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={completionData.duration}
                onChange={(e) => setCompletionData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Actual Location
              </label>
              <input
                type="text"
                value={completionData.location}
                onChange={(e) => setCompletionData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Conference room, office, video call..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Actual Attendees
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentAttendee}
                onChange={(e) => setCurrentAttendee(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAttendee();
                  }
                }}
                placeholder="Enter attendee name and press Enter"
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddAttendee}
                className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add
              </button>
            </div>
            {completionData.attendees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {completionData.attendees.map((attendee, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {attendee}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee)}
                      className="hover:text-green-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Session Summary & Notes
            </label>
            <textarea
              value={completionData.notes}
              onChange={(e) => setCompletionData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Document what was covered, key findings, process insights, control observations, etc."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Follow-up Required */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={completionData.followUpRequired}
                onChange={(e) => setCompletionData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700 flex items-center">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Follow-up Required
              </label>
            </div>
            
            {completionData.followUpRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Details
                </label>
                <textarea
                  value={completionData.followUpNotes}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, followUpNotes: e.target.value }))}
                  placeholder="Describe what follow-up actions are needed, who should handle them, and when..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Mark as Completed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkthroughCompletionModal;