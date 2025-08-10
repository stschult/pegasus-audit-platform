// hooks/useWalkthroughs.ts
import { useState, useEffect } from 'react';
import { 
  WalkthroughApplication,
  WalkthroughRequest,
  WalkthroughSession,
  WalkthroughProgress,
  WalkthroughTimeline,
  WALKTHROUGH_STORAGE_KEYS,
  WALKTHROUGH_STATUSES,
  getResponsibleParty,
  ExcelData,
  Audit,
  User
} from '../types';

import { 
  extractWalkthroughApplicationsFromKeyReports,
  generateWalkthroughRequestsFromApplications
} from '../utils/walkthroughExtraction';

// Storage helpers
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Saved ${key} to storage`);
  } catch (error) {
    console.error(`❌ Failed to save ${key}:`, error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      console.log(`📋 Loaded ${key} from storage:`, data);
      return data;
    }
  } catch (error) {
    console.error(`❌ Failed to load ${key}:`, error);
  }
  return defaultValue;
};

export const useWalkthroughs = (user: User | null, selectedAudit: Audit | null) => {
  // ✅ Walkthrough state management
  const [walkthroughApplications, setWalkthroughApplications] = useState<WalkthroughApplication[]>([]);
  const [walkthroughRequests, setWalkthroughRequests] = useState<WalkthroughRequest[]>([]);
  const [walkthroughSessions, setWalkthroughSessions] = useState<WalkthroughSession[]>([]);

  // ✅ Load walkthrough data from localStorage on mount
  useEffect(() => {
    setWalkthroughApplications(loadFromStorage(WALKTHROUGH_STORAGE_KEYS.APPLICATIONS, []));
    setWalkthroughRequests(loadFromStorage(WALKTHROUGH_STORAGE_KEYS.REQUESTS, []));
    setWalkthroughSessions(loadFromStorage(WALKTHROUGH_STORAGE_KEYS.SESSIONS, []));
  }, []);

  // ✅ Auto-save walkthrough data to localStorage
  useEffect(() => {
    if (walkthroughApplications.length > 0) {
      saveToStorage(WALKTHROUGH_STORAGE_KEYS.APPLICATIONS, walkthroughApplications);
    }
  }, [walkthroughApplications]);

  useEffect(() => {
    if (walkthroughRequests.length > 0) {
      saveToStorage(WALKTHROUGH_STORAGE_KEYS.REQUESTS, walkthroughRequests);
    }
  }, [walkthroughRequests]);

  useEffect(() => {
    if (walkthroughSessions.length > 0) {
      saveToStorage(WALKTHROUGH_STORAGE_KEYS.SESSIONS, walkthroughSessions);
    }
  }, [walkthroughSessions]);

  // ===================================================================
  // ✅ WALKTHROUGH DATA EXTRACTION
  // ===================================================================
  const handleExtractWalkthroughsFromKeyReports = (excelData: ExcelData, audit: Audit) => {
    try {
      console.log('🚶‍♂️ Starting walkthrough extraction from Key Reports...');
      
      if (!excelData.keyReports || excelData.keyReports.length === 0) {
        console.warn('No key reports data found for walkthrough extraction');
        return;
      }
      
      // Extract applications from key reports data
      const applications = extractWalkthroughApplicationsFromKeyReports(
        excelData.keyReports,
        audit.id,
        user?.email || 'system'
      );
      
      // Generate initial requests (all in 'draft' status)
      const requests = generateWalkthroughRequestsFromApplications(
        applications,
        audit.id,
        user?.email || 'system'
      );
      
      // 🔧 FIX: Replace instead of accumulate (like ITGCs, ITACs, Key Reports)
      setWalkthroughApplications(applications);  // Replace, don't accumulate
      setWalkthroughRequests(requests);         // Replace, don't accumulate
      
      // Update audit metadata
      audit.walkthroughsExtracted = true;
      audit.totalWalkthroughs = applications.length;
      
      console.log(`✅ Walkthrough extraction completed: ${applications.length} applications, ${requests.length} requests`);
      
    } catch (error) {
      console.error('❌ Error extracting walkthroughs from key reports:', error);
    }
  };

  // ===================================================================
  // ✅ WALKTHROUGH REQUEST MANAGEMENT
  // ===================================================================
  const handleCreateWalkthroughRequest = (requestData: Partial<WalkthroughRequest> & {
    applicationId: string;
    applicationName: string;
    businessOwner: string;
  }) => {
    const newRequest: WalkthroughRequest = {
      id: `walkthrough-req-${Date.now()}`,
      auditId: selectedAudit?.id || '',
      applicationId: requestData.applicationId,
      applicationName: requestData.applicationName,
      businessOwner: requestData.businessOwner,
      requestType: 'walkthrough',
      status: WALKTHROUGH_STATUSES.DRAFT,
      currentResponsibleParty: 'auditor',
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'system',
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: user?.email || 'system',
      estimatedDuration: 60, // Default 1 hour
      criticality: 'standard',
      relatedReports: [],
      ...requestData
    };
    
    setWalkthroughRequests(prev => [...prev, newRequest]);
    console.log('✅ Created walkthrough request:', newRequest.id);
  };

  const handleUpdateWalkthroughRequest = (requestId: string, updates: Partial<WalkthroughRequest>) => {
    setWalkthroughRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            ...updates, 
            lastUpdatedAt: new Date().toISOString(),
            lastUpdatedBy: user?.email || 'system',
            currentResponsibleParty: updates.status ? getResponsibleParty(updates.status) : req.currentResponsibleParty
          }
        : req
    ));
    console.log('✅ Updated walkthrough request:', requestId);
  };

  const handleSendWalkthroughRequests = (requestIds: string[]) => {
    const updates = {
      status: WALKTHROUGH_STATUSES.SENT,
      sentAt: new Date().toISOString()
    };
    
    requestIds.forEach(id => {
      handleUpdateWalkthroughRequest(id, updates);
    });
    
    console.log(`✅ Sent ${requestIds.length} walkthrough requests to client`);
  };

  // ===================================================================
  // ✅ CLIENT SCHEDULING FUNCTIONS
  // ===================================================================
  const handleScheduleWalkthrough = (requestId: string, schedulingData: any) => {
    const updates = {
      status: WALKTHROUGH_STATUSES.SCHEDULED,
      scheduledAt: new Date().toISOString(),
      schedulingData: {
        scheduledDate: schedulingData.date,
        scheduledTime: schedulingData.time,
        location: schedulingData.location,
        attendees: schedulingData.attendees,
        notes: schedulingData.notes,
        clientContact: user?.email || 'client'
      }
    };
    
    handleUpdateWalkthroughRequest(requestId, updates);
    console.log(`✅ Scheduled walkthrough ${requestId}:`, schedulingData);
  };

  const handleCompleteWalkthrough = (requestId: string, completionData: any) => {
    const updates = {
      status: WALKTHROUGH_STATUSES.COMPLETED,
      completedAt: new Date().toISOString()
    };
    
    handleUpdateWalkthroughRequest(requestId, updates);
    
    // Create session record
    const request = walkthroughRequests.find(r => r.id === requestId);
    if (request && completionData) {
      const session: WalkthroughSession = {
        id: `session-${requestId}-${Date.now()}`,
        requestId,
        applicationName: request.applicationName,
        businessOwner: request.businessOwner,
        actualDate: completionData.date,
        actualTime: completionData.time,
        actualDuration: completionData.duration || request.estimatedDuration,
        location: completionData.location,
        attendees: completionData.attendees || [],
        status: 'completed',
        completedDate: new Date().toISOString(),
        completedBy: user?.email || 'auditor',
        sessionNotes: completionData.notes,
        followUpRequired: completionData.followUpRequired || false,
        followUpNotes: completionData.followUpNotes
      };
      
      setWalkthroughSessions(prev => [...prev, session]);
    }
    
    console.log(`✅ Completed walkthrough ${requestId}:`, completionData);
  };

  // ===================================================================
  // ✅ BULK OPERATIONS
  // ===================================================================
  const handleBulkWalkthroughAction = (
    requestIds: string[],
    action: 'send' | 'schedule' | 'complete',
    batchData?: any
  ) => {
    switch (action) {
      case 'send':
        handleSendWalkthroughRequests(requestIds);
        break;
        
      case 'schedule':
        // For bulk scheduling, apply same scheduling data to all
        if (batchData) {
          requestIds.forEach(id => handleScheduleWalkthrough(id, batchData));
        }
        break;
        
      case 'complete':
        // For bulk completion
        if (batchData) {
          requestIds.forEach(id => handleCompleteWalkthrough(id, batchData));
        }
        break;
    }
  };

  const groupWalkthroughsByApplication = () => {
    return walkthroughRequests.reduce((groups, request) => {
      const app = request.applicationName;
      if (!groups[app]) groups[app] = [];
      groups[app].push(request);
      return groups;
    }, {} as Record<string, WalkthroughRequest[]>);
  };

  // ===================================================================
  // ✅ STATUS AND PROGRESS TRACKING
  // ===================================================================
  const getWalkthroughStatusForApplication = (applicationId: string): string => {
    const requests = walkthroughRequests.filter(r => r.applicationId === applicationId);
    
    if (requests.length === 0) return 'not_started';
    
    const statuses = requests.map(r => r.status);
    
    if (statuses.every(s => s === WALKTHROUGH_STATUSES.COMPLETED)) return 'completed';
    if (statuses.every(s => [WALKTHROUGH_STATUSES.SCHEDULED, WALKTHROUGH_STATUSES.COMPLETED].includes(s as any))) return 'scheduled';
    if (statuses.some(s => [WALKTHROUGH_STATUSES.SENT, WALKTHROUGH_STATUSES.SCHEDULED, WALKTHROUGH_STATUSES.COMPLETED].includes(s as any))) return 'in_progress';
    
    return 'draft';
  };

  //const getWalkthroughRequestsForAudit = (): WalkthroughRequest[] => {
   // return walkthroughRequests.filter(r => r.auditId === selectedAudit?.id);
//  };

const getWalkthroughRequestsForAudit = (): WalkthroughRequest[] => {
  console.log('🔍 DEBUG - getWalkthroughRequestsForAudit called');
  console.log('🔍 selectedAudit?.id:', selectedAudit?.id);
  console.log('🔍 Total walkthroughRequests:', walkthroughRequests.length);
  console.log('🔍 Walkthrough auditIds:', walkthroughRequests.map(r => r.auditId));
  
  const filtered = walkthroughRequests.filter(r => r.auditId === selectedAudit?.id);
  console.log('🔍 Filtered walkthroughs for current audit:', filtered.length);
  
  return filtered;
};
  const getWalkthroughProgress = (): WalkthroughProgress => {
    const auditRequests = getWalkthroughRequestsForAudit();
    const total = auditRequests.length;
    
    if (total === 0) {
      return {
        auditId: selectedAudit?.id || '',
        total: 0,
        draft: 0,
        sent: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        percentComplete: 0,
        percentScheduled: 0,
        inProgress: 0,
        urgentCount: 0,
        isFirstWeek: true,
        daysUntilDeadline: 7,
        isOverdue: false,
        isUrgent: false
      };
    }
    
    const statusCounts = auditRequests.reduce((counts, request) => {
      counts[request.status] = (counts[request.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const completed = statusCounts[WALKTHROUGH_STATUSES.COMPLETED] || 0;
    const scheduled = statusCounts[WALKTHROUGH_STATUSES.SCHEDULED] || 0;
    const sent = statusCounts[WALKTHROUGH_STATUSES.SENT] || 0;
    const draft = statusCounts[WALKTHROUGH_STATUSES.DRAFT] || 0;
    const cancelled = statusCounts[WALKTHROUGH_STATUSES.CANCELLED] || 0;
    
    // Timeline calculations
    const auditStart = selectedAudit?.createdAt ? new Date(selectedAudit.createdAt) : new Date();
    const firstWeekEnd = new Date(auditStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((firstWeekEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    const isOverdue = daysUntilDeadline < 0;
    const isUrgent = daysUntilDeadline <= 2 && daysUntilDeadline >= 0;
    const isFirstWeek = daysUntilDeadline > 0;
    
    // Urgent items need immediate attention
    const urgentCount = isFirstWeek || isOverdue ? (draft + sent) : 0;
    
    return {
      auditId: selectedAudit?.id || '',
      total,
      draft,
      sent, 
      scheduled,
      completed,
      cancelled,
      percentComplete: Math.round((completed / total) * 100),
      percentScheduled: Math.round(((scheduled + completed) / total) * 100),
      inProgress: scheduled,
      urgentCount,
      isFirstWeek,
      daysUntilDeadline: Math.max(0, daysUntilDeadline),
      isOverdue,
      isUrgent
    };
  };

  const getWalkthroughTimeline = (): WalkthroughTimeline => {
    const auditStart = selectedAudit?.createdAt || new Date().toISOString();
    const startDate = new Date(auditStart);
    const firstWeekEnd = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const daysRemaining = Math.ceil((firstWeekEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const isOverdue = daysRemaining < 0;
    const isUrgent = daysRemaining <= 2 && daysRemaining >= 0;
    
    const auditRequests = getWalkthroughRequestsForAudit();
    const allSent = auditRequests.length > 0 && auditRequests.every(r => 
      r.status !== WALKTHROUGH_STATUSES.DRAFT
    );
    const allScheduled = auditRequests.length > 0 && auditRequests.every(r => 
      [WALKTHROUGH_STATUSES.SCHEDULED, WALKTHROUGH_STATUSES.COMPLETED].includes(r.status as any)
    );
    const allCompleted = auditRequests.length > 0 && auditRequests.every(r => 
      r.status === WALKTHROUGH_STATUSES.COMPLETED
    );
    
    return {
      auditStartDate: auditStart,
      firstWeekDeadline: firstWeekEnd.toISOString(),
      daysRemaining: Math.max(0, daysRemaining),
      isOverdue,
      isUrgent,
      milestones: {
        allSent,
        allScheduled,
        allCompleted,
        // Could add specific dates when milestones were reached
      }
    };
  };

  // ===================================================================
  // ✅ REFRESH FUNCTION
  // ===================================================================
  const refreshWalkthroughState = () => {
    console.log('🔄 Refreshing walkthrough state from localStorage...');
    setWalkthroughApplications(loadFromStorage(WALKTHROUGH_STORAGE_KEYS.APPLICATIONS, []));
    setWalkthroughRequests(loadFromStorage(WALKTHROUGH_STORAGE_KEYS.REQUESTS, []));
    setWalkthroughSessions(loadFromStorage(WALKTHROUGH_STORAGE_KEYS.SESSIONS, []));
  };

  return {
    // State
    walkthroughApplications,
    walkthroughRequests,
    walkthroughSessions,
    
    // Data extraction
    handleExtractWalkthroughsFromKeyReports,
    
    // Request management
    handleCreateWalkthroughRequest,
    handleUpdateWalkthroughRequest,
    handleSendWalkthroughRequests,
    
    // Scheduling & completion
    handleScheduleWalkthrough,
    handleCompleteWalkthrough,
    
    // Bulk operations
    handleBulkWalkthroughAction,
    groupWalkthroughsByApplication,
    
    // Status & progress
    getWalkthroughStatusForApplication,
    getWalkthroughRequestsForAudit,
    getWalkthroughProgress,
    getWalkthroughTimeline,
    
    // Utilities
    refreshWalkthroughState
  };
};