// components/audit/modals/ClientSchedulingModal.tsx
'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  UserPlus 
} from 'lucide-react';

// Application interface
interface Application {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

// Attendee interface
interface Attendee {
  name: string;
  email: string;
  role: string;
}

// Scheduling data interface
interface SchedulingData {
  date: string;
  time: string;
  location: string;
  locationDetails: string;
  attendees: Attendee[];
  notes: string;
  duration: number;
}

// Component props
interface ClientSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  onSchedule: (schedulingData: SchedulingData) => void;
}

const ClientSchedulingModal: React.FC<ClientSchedulingModalProps> = ({ 
  isOpen, 
  onClose, 
  application, 
  onSchedule 
}) => {
  const [schedulingData, setSchedulingData] = useState<SchedulingData>({
    date: '',
    time: '',
    location: 'Video Conference',
    locationDetails: '',
    attendees: [{ name: '', email: '', role: '' }],
    notes: '',
    duration: 60
  });

  const handleSubmit = () => {
    if (!schedulingData.date || !schedulingData.time) {
      alert('Please select a date and time for the walkthrough.');
      return;
    }

    onSchedule({
      ...schedulingData,
      attendees: schedulingData.attendees.filter(a => a.name && a.email)
    });
    onClose();
  };

  const addAttendee = () => {
    setSchedulingData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { name: '', email: '', role: '' }]
    }));
  };

  const updateAttendee = (index: number, field: string, value: string) => {
    setSchedulingData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => 
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }));
  };

  const removeAttendee = (index: number) => {
    setSchedulingData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Walkthrough</h2>
              <p className="text-sm text-gray-600 mt-1">{application.name} - {application.owner}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDays className="h-4 w-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={schedulingData.date}
                onChange={(e) => setSchedulingData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                value={schedulingData.time}
                onChange={(e) => setSchedulingData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <select
              value={schedulingData.duration}
              onChange={(e) => setSchedulingData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </label>
            <select
              value={schedulingData.location}
              onChange={(e) => setSchedulingData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            >
              <option value="Video Conference">Video Conference</option>
              <option value="Client Office">Client Office</option>
              <option value="Auditor Office">Auditor Office</option>
              <option value="Other">Other</option>
            </select>
            {(schedulingData.location === 'Other' || schedulingData.location === 'Client Office') && (
              <input
                type="text"
                placeholder="Enter location details..."
                value={schedulingData.locationDetails}
                onChange={(e) => setSchedulingData(prev => ({ ...prev, locationDetails: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <Users className="h-4 w-4 inline mr-1" />
                Attendees
              </label>
              <button
                onClick={addAttendee}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Add Attendee
              </button>
            </div>
            <div className="space-y-3">
              {schedulingData.attendees.map((attendee, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border border-gray-200 rounded-md">
                  <input
                    type="text"
                    placeholder="Name"
                    value={attendee.name}
                    onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={attendee.email}
                    onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={attendee.role}
                    onChange={(e) => updateAttendee(index, 'role', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeAttendee(index)}
                    className="text-red-600 hover:text-red-800 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={schedulingData.notes}
              onChange={(e) => setSchedulingData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about the walkthrough..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Schedule Walkthrough
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientSchedulingModal;