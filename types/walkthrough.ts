// types/walkthrough.ts

export interface WalkthroughSession {
  id: string;
  auditId: string;
  application: string; // Unique application name from Column G
  relatedTopics: string[]; // All topics/controls covered in this walkthrough
  scheduledDate?: Date;
  scheduledTime?: string; // "10:00 AM - 11:30 AM" or "2:00 PM - 4:00 PM"
  duration: '1_hour' | '2_hour'; // Standard blocks
  status: 'not_scheduled' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendees: WalkthroughAttendee[];
  location?: string; // "Conference Room A", "Teams Meeting", etc.
  meetingLink?: string; // For virtual meetings
  notes?: string; // Optional for future recording feature
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalkthroughAttendee {
  id: string;
  name: string;
  email: string;
  role: 'auditor' | 'client_lead' | 'application_owner' | 'other';
  required: boolean; // Is this person required for the walkthrough?
}

export interface WalkthroughSchedule {
  auditId: string;
  walkthroughWeek: {
    startDate: Date; // Monday of first week
    endDate: Date; // Friday of first week
  };
  sessions: WalkthroughSession[];
  totalApplications: number;
  scheduledCount: number;
  completedCount: number;
}

// For the audit creation/setup
export interface AuditWalkthroughSetup {
  auditStartDate: Date;
  auditEndDate: Date;
  walkthroughWeekStart: Date; // Auto-calculated as first Monday
  walkthroughWeekEnd: Date; // Auto-calculated as first Friday
  extractedApplications: string[]; // Unique apps from Excel Column G
  clientITGCLead?: {
    name: string;
    email: string;
  };
}

// Status tracking
export type WalkthroughStatus = 'not_scheduled' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export const WALKTHROUGH_STATUS_LABELS: Record<WalkthroughStatus, string> = {
  'not_scheduled': 'Not Scheduled',
  'scheduled': 'Scheduled',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

export const WALKTHROUGH_STATUS_COLORS: Record<WalkthroughStatus, string> = {
  'not_scheduled': 'bg-gray-100 text-gray-800',
  'scheduled': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
};

// Application extraction from Excel
export interface ApplicationExtraction {
  application: string;
  relatedTopics: string[];
  count: number;
}

// Utility functions
export const getWalkthroughWeek = (auditStartDate: Date): { start: Date; end: Date } => {
  const start = new Date(auditStartDate);
  // Ensure we start on a Monday
  const dayOfWeek = start.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : 1 - dayOfWeek; // 0 = Sunday
  start.setDate(start.getDate() + daysToMonday);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 4); // Friday
  
  return { start, end };
};

export const formatWalkthroughDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const getSchedulingProgress = (sessions: WalkthroughSession[]) => {
  const total = sessions.length;
  const scheduled = sessions.filter(s => s.status !== 'not_scheduled').length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  
  return {
    total,
    scheduled,
    completed,
    scheduledPercentage: total > 0 ? Math.round((scheduled / total) * 100) : 0,
    completedPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};