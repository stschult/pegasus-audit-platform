import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface WalkthroughManagementProps {
  schedule: any;
  onSessionUpdate: (session: any) => void;
}

const WalkthroughManagement = ({ schedule, onSessionUpdate }: WalkthroughManagementProps) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScheduleSession = (session: any) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleSaveSession = (updatedSession: any) => {
    onSessionUpdate(updatedSession);
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'not_scheduled': 'bg-gray-100 text-gray-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      'not_scheduled': 'Not Scheduled',
      'scheduled': 'Scheduled',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgress = () => {
    const total = schedule.sessions.length;
    const scheduled = schedule.sessions.filter((s: any) => s.status !== 'not_scheduled').length;
    const completed = schedule.sessions.filter((s: any) => s.status === 'completed').length;
    
    return {
      total,
      scheduled,
      completed,
      scheduledPercentage: total > 0 ? Math.round((scheduled / total) * 100) : 0,
      completedPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const progress = getProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Walkthrough Schedule</h2>
            <p className="text-gray-600 mt-1">
              Week of {formatDate(schedule.walkthroughWeek.startDate)} - {formatDate(schedule.walkthroughWeek.endDate)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-2xl font-bold text-gray-900">{progress.completed}/{progress.total}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Scheduling Progress</span>
            <span>{progress.scheduledPercentage}% scheduled</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                 style={{ width: `${progress.scheduledPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid gap-4">
        {schedule.sessions.map((session: any) => (
          <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(session.status)}
                  <h3 className="text-lg font-medium text-gray-900">{session.application}</h3>
                  {getStatusBadge(session.status)}
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Topics to Cover:</strong> {session.relatedTopics.join(', ')}
                </div>
                
                {session.scheduledDate && session.scheduledTime && (
                  <div className="flex items-center gap-4 text-sm text-gray-700 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(session.scheduledDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.scheduledTime}
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {session.location}
                      </div>
                    )}
                  </div>
                )}
                
                {session.attendees && session.attendees.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {session.attendees.map((a: any) => a.name).join(', ')}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                {session.status === 'not_scheduled' && (
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    onClick={() => handleScheduleSession(session)}
                  >
                    Schedule
                  </button>
                )}
                {session.status === 'scheduled' && (
                  <button 
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    onClick={() => handleScheduleSession(session)}
                  >
                    Edit
                  </button>
                )}
                {session.status === 'completed' && (
                  <div className="text-xs text-green-600 font-medium">
                    ✓ Completed {session.completedDate && formatDate(session.completedDate)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-900">{progress.total}</div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-900">{progress.scheduled}</div>
          <div className="text-sm text-blue-700">Scheduled</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-900">{progress.completed}</div>
          <div className="text-sm text-green-700">Completed</div>
        </div>
      </div>

      {/* Client Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">For Client ITGC Lead:</h4>
        <p className="text-sm text-blue-800">
          Please coordinate with your application owners to schedule these walkthrough sessions during the week of{' '}
          {formatDate(schedule.walkthroughWeek.startDate)} - {formatDate(schedule.walkthroughWeek.endDate)}.
          Each session should be 1-2 hours and include the relevant application owners who can walk through the processes and controls.
        </p>
      </div>
    </div>
  );
};

export default WalkthroughManagement;