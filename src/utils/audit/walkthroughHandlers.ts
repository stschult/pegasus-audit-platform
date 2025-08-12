// File: src/utils/audit/walkthroughHandlers.ts

import { ExtractedKeyReport } from '../../components/audit/types';
import { WalkthroughSession, WalkthroughAttendee, ApplicationExtraction, getWalkthroughWeek } from '../../components/audit/types/walkthrough';

/**
 * Extract unique applications from key reports for walkthrough scheduling
 * Groups by application + business owner combinations
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

  // Group by application + business owner combinations
  interface WalkthroughGroup {
    application: string;
    businessOwner: string;
    reports: ExtractedKeyReport[];
    topics: string[];
  }

  const groupMap = new Map<string, WalkthroughGroup>();
  
  keyReports.forEach((report, index) => {
    // Extract application name from various possible fields
    const application = report.application || 
                       report.name || 
                       report.reportName || 
                       report.source || 
                       report.reportType || 
                       `Application ${index + 1}`;
    
    // Extract business owner - this is key for proper grouping
    const businessOwner = (report as any).businessOwner || 
                         report.owner || 
                         (report as any).dataSource || 
                         'Unknown Owner';
    
    // Create unique key for this app+owner combination
    const groupKey = `${application}::${businessOwner}`;
    
    // Extract topic/description
    const topic = report.description || 
                  report.name || 
                  report.reportName || 
                  'General Control';
    
    if (groupMap.has(groupKey)) {
      // Add to existing group
      const group = groupMap.get(groupKey)!;
      group.reports.push(report);
      
      // Add topic if not already included
      if (!group.topics.includes(topic)) {
        group.topics.push(topic);
      }
    } else {
      // Create new group
      groupMap.set(groupKey, {
        application,
        businessOwner,
        reports: [report],
        topics: [topic]
      });
    }
  });

  // Convert to WalkthroughSession objects
  const walkthroughSessions: WalkthroughSession[] = [];
  let sessionIndex = 0;

  groupMap.forEach((group, groupKey) => {
    const session: WalkthroughSession = {
      id: `walkthrough-${auditId}-${sessionIndex++}`,
      auditId,
      application: group.application,
      // Add UI-compatible fields
      name: group.application,
      owner: group.businessOwner,
      description: group.topics.join('\n\n'),
      riskLevel: 'medium', // Default risk level
      category: 'Application Walkthrough',
      relatedTopics: group.topics,
      status: 'not_scheduled',
      duration: group.topics.length > 3 ? '2_hour' : '1_hour', // More topics = longer session
      attendees: [
        {
          id: `attendee-${userId}`,
          name: 'Auditor',
          email: '',
          role: 'auditor',
          required: true
        },
        {
          id: `attendee-${group.businessOwner.replace(/\s+/g, '-').toLowerCase()}`,
          name: group.businessOwner,
          email: '',
          role: 'application_owner',
          required: true
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    } as any; // Type assertion to allow extra fields
    
    walkthroughSessions.push(session);
  });

  console.log(`✅ Extracted ${walkthroughSessions.length} walkthrough sessions from ${keyReports.length} key reports`);
  
  // Enhanced logging to show grouping
  walkthroughSessions.forEach(session => {
    const ownerName = session.attendees.find(a => a.role === 'application_owner')?.name || 'Unknown';
    console.log(`📋 ${session.application} (${ownerName}): ${session.relatedTopics.length} topics, ${session.duration}`);
  });

  // Debug: Show grouping summary
  console.log('🔍 Grouping Summary:');
  groupMap.forEach((group, key) => {
    console.log(`  📊 ${group.application} + ${group.businessOwner}: ${group.reports.length} reports, ${group.topics.length} unique topics`);
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
      const ownerName = app.attendees?.find(a => a.role === 'application_owner')?.name || 'Unknown';
      console.log(`${index + 1}. ${app.application} (${ownerName}) - ${app.relatedTopics.length} topics, ${app.duration}`);
    });
  }
};

// Export types for compatibility
export type WalkthroughApplication = WalkthroughSession;
export type WalkthroughRequest = WalkthroughSession;