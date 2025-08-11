// File: src/utils/audit/walkthroughHandlers.ts

import { ExtractedKeyReport } from '../../components/audit/types';
import { WalkthroughSession, WalkthroughAttendee, ApplicationExtraction, getWalkthroughWeek } from '../../components/audit/types/walkthrough';

/**
 * Extract unique applications from key reports for walkthrough scheduling
 */
export const extractWalkthroughApplicationsFromKeyReports = (
  keyReports: ExtractedKeyReport[], 
  auditId: string, 
  userId: string
): WalkthroughSession[] => {
  console.log('🔧 extractWalkthroughApplicationsFromKeyReports called with:', keyReports);
  
  if (!keyReports || keyReports.length === 0) {
    console.log('❌ No key reports provided');
    return [];
  }

  // Extract unique applications and their related topics
  const applicationMap = new Map<string, string[]>();
  
  keyReports.forEach((report, index) => {
    // Look for application name in various possible fields
    const application = report.name || 
                       report.reportName || 
                       report.source || 
                       report.reportType || 
                       `Application ${index + 1}`;
    
    const topic = report.description || report.name || 'General Control';
    
    if (applicationMap.has(application)) {
      // Add topic if not already included
      const existingTopics = applicationMap.get(application)!;
      if (!existingTopics.includes(topic)) {
        existingTopics.push(topic);
      }
    } else {
      applicationMap.set(application, [topic]);
    }
  });

  // Convert to WalkthroughSession objects
  const walkthroughSessions: WalkthroughSession[] = [];
  let sessionIndex = 0;

  applicationMap.forEach((topics, application) => {
    const session: WalkthroughSession = {
      id: `walkthrough-${auditId}-${sessionIndex++}`,
      auditId,
      application,
      relatedTopics: topics,
      status: 'not_scheduled',
      duration: topics.length > 3 ? '2_hour' : '1_hour', // More topics = longer session
      attendees: [
        {
          id: `attendee-${userId}`,
          name: 'Auditor',
          email: '',
          role: 'auditor',
          required: true
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    walkthroughSessions.push(session);
  });

  console.log(`✅ Extracted ${walkthroughSessions.length} walkthrough sessions from ${keyReports.length} key reports`);
  
  walkthroughSessions.forEach(session => {
    console.log(`📋 ${session.application}: ${session.relatedTopics.length} topics, ${session.duration}`);
  });

  return walkthroughSessions;
};

/**
 * Generate walkthrough requests/schedule from applications
 */
export const generateWalkthroughRequestsFromApplications = (
  applications: WalkthroughSession[], 
  auditId: string, 
  userId: string
): WalkthroughSession[] => {
  console.log('🔧 generateWalkthroughRequestsFromApplications called with:', applications);
  
  if (!applications || applications.length === 0) {
    console.log('❌ No applications provided');
    return [];
  }

  // For now, requests are the same as applications since we're using WalkthroughSession
  // In a real implementation, you might create separate request objects
  const requests = applications.map(app => ({
    ...app,
    id: `request-${app.id}`,
    updatedAt: new Date()
  }));

  console.log(`✅ Generated ${requests.length} walkthrough requests`);
  
  return requests;
};

/**
 * Get summary of extracted applications
 */
export const getWalkthroughApplicationsSummary = (applications: WalkthroughSession[]) => {
  const total = applications.length;
  const scheduled = applications.filter(app => app.status !== 'not_scheduled').length;
  const completed = applications.filter(app => app.status === 'completed').length;
  
  const oneHourSessions = applications.filter(app => app.duration === '1_hour').length;
  const twoHourSessions = applications.filter(app => app.duration === '2_hour').length;
  
  return {
    total,
    scheduled,
    completed,
    oneHourSessions,
    twoHourSessions,
    scheduledPercentage: total > 0 ? Math.round((scheduled / total) * 100) : 0,
    completedPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

/**
 * Debug function to log walkthrough data
 */
export const debugWalkthroughData = () => {
  console.log('🔍 Debugging walkthrough localStorage...');
  
  const applicationsData = localStorage.getItem('audit_walkthrough_applications');
  const requestsData = localStorage.getItem('audit_walkthrough_requests');
  
  console.log('Applications in storage:', applicationsData ? JSON.parse(applicationsData).length : 0);
  console.log('Requests in storage:', requestsData ? JSON.parse(requestsData).length : 0);
  
  if (applicationsData) {
    const apps = JSON.parse(applicationsData);
    apps.forEach((app: WalkthroughSession, index: number) => {
      console.log(`${index + 1}. ${app.application} (${app.relatedTopics.length} topics, ${app.duration})`);
    });
  }
};

// Export types for compatibility
export type WalkthroughApplication = WalkthroughSession;
export type WalkthroughRequest = WalkthroughSession;