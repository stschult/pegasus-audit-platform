// lib/walkthrough-utils.ts

import * as XLSX from 'xlsx';
import { WalkthroughSession, WalkthroughSchedule, getWalkthroughWeek } from '@/types/walkthrough';

export interface ApplicationExtraction {
  application: string;
  relatedTopics: string[];
  count: number;
}

/**
 * Extract unique applications from Excel Column G with their related topics
 */
export const extractApplicationsFromExcel = async (file: File): Promise<ApplicationExtraction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Find Column G (index 6) - Application column
        const applications = new Map<string, Set<string>>();
        
        // Skip header row, start from row 1
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          const application = row[6]?.toString().trim();
          const topic = row[1]?.toString().trim() || 'Unnamed Topic'; // Assuming Column B has topic/control name
          
          if (application && application !== '') {
            if (!applications.has(application)) {
              applications.set(application, new Set());
            }
            applications.get(application)!.add(topic);
          }
        }
        
        // Convert to array format
        const result: ApplicationExtraction[] = Array.from(applications.entries()).map(([app, topics]) => ({
          application: app,
          relatedTopics: Array.from(topics),
          count: topics.size
        }));
        
        resolve(result.sort((a, b) => a.application.localeCompare(b.application)));
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Create initial walkthrough sessions from extracted applications
 */
export const createWalkthroughSessions = (
  auditId: string,
  applications: ApplicationExtraction[]
): WalkthroughSession[] => {
  return applications.map((app, index) => ({
    id: `wt-${auditId}-${index + 1}`,
    auditId,
    application: app.application,
    relatedTopics: app.relatedTopics,
    duration: app.relatedTopics.length > 3 ? '2_hour' : '1_hour', // Auto-suggest duration based on topic count
    status: 'not_scheduled' as const,
    attendees: [], // Will be populated by client ITGC lead
    createdAt: new Date(),
    updatedAt: new Date(),
    description: `Walkthrough session for ${app.application}`  // ADD THIS LINE
  }));
};

/**
 * Initialize walkthrough schedule for a new audit
 */
export const initializeWalkthroughSchedule = (
  auditId: string,
  auditStartDate: Date,
  applications: ApplicationExtraction[]
): WalkthroughSchedule => {
  const walkthroughWeek = getWalkthroughWeek(auditStartDate);
  const sessions = createWalkthroughSessions(auditId, applications);
  
  return {
    auditId,
    walkthroughWeek: {
      startDate: walkthroughWeek.start,
      endDate: walkthroughWeek.end
    },
    sessions,
    totalApplications: applications.length,
    scheduledCount: 0,
    completedCount: 0
  };
};

/**
 * Validate walkthrough scheduling conflicts
 */
export const validateWalkthroughSchedule = (
  sessions: WalkthroughSession[],
  newSession: Partial<WalkthroughSession>
): { isValid: boolean; conflicts: string[] } => {
  const conflicts: string[] = [];
  
  if (!newSession.scheduledDate || !newSession.scheduledTime) {
    return { isValid: true, conflicts: [] };
  }
  
  const newDate = newSession.scheduledDate;
  const newTime = newSession.scheduledTime;
  
  // Check for scheduling conflicts
  sessions.forEach(session => {
    if (
      session.id !== newSession.id &&
      session.scheduledDate &&
      session.scheduledTime &&
      session.status !== 'cancelled'
    ) {
      if (
        session.scheduledDate.toDateString() === newDate.toDateString() &&
        session.scheduledTime === newTime
      ) {
        conflicts.push(`Conflict with ${session.application} at ${newTime}`);
      }
    }
  });
  
  return {
    isValid: conflicts.length === 0,
    conflicts
  };
};

/**
 * Generate suggested time slots for walkthrough week
 */
export const generateTimeSlots = (): string[] => {
  return [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    // 2-hour blocks
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM'
  ];
};

/**
 * Format walkthrough summary for client notification
 */
export const formatWalkthroughSummary = (schedule: WalkthroughSchedule): string => {
  const { walkthroughWeek, sessions } = schedule;
  
  let summary = `Walkthrough Schedule (${walkthroughWeek.startDate.toLocaleDateString()} - ${walkthroughWeek.endDate.toLocaleDateString()})\n\n`;
  summary += `Applications to Cover (${sessions.length} total):\n\n`;
  
  sessions.forEach((session, index) => {
    summary += `${index + 1}. ${session.application}\n`;
    summary += `   Topics: ${session.relatedTopics.join(', ')}\n`;
    summary += `   Suggested Duration: ${session.duration.replace('_', ' ')}\n\n`;
  });
  
  summary += 'Please coordinate with your application owners to schedule these walkthroughs during the specified week.';
  
  return summary;
};