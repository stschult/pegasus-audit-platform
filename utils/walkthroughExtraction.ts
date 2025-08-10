// utils/walkthroughExtraction.ts
import { WalkthroughApplication, WalkthroughRequest, WALKTHROUGH_STATUSES } from '../types';

/**
 * Helper function to determine application criticality
 */
export const getCriticalityByApplication = (applicationName: string): 'critical' | 'important' | 'standard' => {
  const criticalApps = ['AX', 'WORKDAY', 'SAP', 'ORACLE', 'PEOPLESOFT'];
  const importantApps = ['CLEARWATER', 'EXPANDABLE', 'EXPRESS OPTIONS'];
  
  const upperName = applicationName.toUpperCase();
  
  if (criticalApps.some(app => upperName.includes(app))) {
    return 'critical';
  }
  
  if (importantApps.some(app => upperName.includes(app))) {
    return 'important';  
  }
  
  return 'standard';
};

/**
 * Generate unique IDs for walkthrough entities
 */
export const generateWalkthroughApplicationId = (applicationName: string, ownerName: string): string => {
  const cleanApp = applicationName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanOwner = ownerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits for uniqueness
  
  return `walkthrough-app-${cleanApp}-${cleanOwner}-${timestamp}`;
};

export const generateWalkthroughRequestId = (applicationId: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `walkthrough-req-${applicationId.split('-').pop()}-${timestamp}-${random}`;
};

/**
 * Enhanced function to extract walkthrough applications from Key Reports data
 * Creates separate walkthrough for each unique Application + Owner combination
 * ✅ INCLUDES: All Key Control Descriptions for each combination
 */
export const extractWalkthroughApplicationsFromKeyReports = (
  keyReportsData: any[],
  auditId: string,
  createdBy: string
): WalkthroughApplication[] => {
  
  console.log('🚶‍♂️ Extracting walkthrough applications from', keyReportsData.length, 'key reports');
  
  // ✅ CLEAR OLD DATA FIRST
  if (typeof window !== 'undefined') {
    localStorage.removeItem('audit_walkthrough_applications');
    localStorage.removeItem('audit_walkthrough_requests');
    console.log('🧹 Cleared old walkthrough data');
  }
  
  // Map to store unique Application + Owner combinations with collected descriptions
  const applicationMap = new Map<string, {
    app: WalkthroughApplication;
    descriptions: Set<string>;
  }>();
  
  keyReportsData.forEach((report, index) => {
    // Only process reports that have both application and owner
    if (!report.application || !report.owner) {
      console.log(`Skipping report ${index} - missing application (${report.application}) or owner (${report.owner})`);
      return;
    }
    
    // Clean up the data
    const applicationName = report.application.trim();
    const ownerName = report.owner.trim();
    
    // Create unique key for Application + Owner combination
    const uniqueKey = `${applicationName}|||${ownerName}`;
    
    if (!applicationMap.has(uniqueKey)) {
      // Create new walkthrough application with placeholder description
      const walkthroughApp: WalkthroughApplication = {
        id: generateWalkthroughApplicationId(applicationName, ownerName),
        name: applicationName,
        description: '', // Will be built from Key Control Descriptions
        riskLevel: 'high', // Default key systems to high risk
        owner: ownerName,
        category: 'Financial Systems',
        relatedReports: [],
        extractedFromReports: true,
        estimatedDuration: 60, // Default 1 hour
        criticality: getCriticalityByApplication(applicationName),
        createdAt: new Date().toISOString(),
        createdBy,
        auditId
      };
      
      applicationMap.set(uniqueKey, {
        app: walkthroughApp,
        descriptions: new Set<string>()
      });
      
      console.log(`Created walkthrough application: ${applicationName} - ${ownerName}`);
    }
    
    // Get the application entry
    const appEntry = applicationMap.get(uniqueKey)!;
    
    // ✅ ENHANCED: Extract the Key Control Description (Column E)
    const keyControlDescription = report.description || 
                                 report['Key Control Description'] || 
                                 report['control description'] ||
                                 report.keyControlDescription ||
                                 'Business process control';
    
    // Add report reference to the application
    appEntry.app.relatedReports.push({
      reportName: report.name,
      reportType: report.reportType || 'Standard Report',
      frequency: report.frequency || 'As needed',
      keyControlDescription, // Store the actual Column E description
      originalRowIndex: index
    });
    
    // ✅ COLLECT: Key Control Descriptions (avoiding duplicates with Set)
    if (keyControlDescription && 
        keyControlDescription !== 'Business process control' && 
        keyControlDescription.length > 10) { // Filter out very short descriptions
      appEntry.descriptions.add(keyControlDescription);
    }
    
    // Mark the original report as processed for walkthrough
    report.walkthroughGenerated = true;
    report.walkthroughApplicationId = appEntry.app.id;
  });
  
  // ✅ ENHANCED: Build final descriptions from collected Key Control Descriptions
  const extractedApplications = Array.from(applicationMap.values()).map(({ app, descriptions }) => {
    const uniqueDescriptions = Array.from(descriptions);
    
    if (uniqueDescriptions.length > 0) {
      // ✅ FIXED: Build rich description with properly formatted numbered descriptions
      const numberedDescriptions = uniqueDescriptions.map((desc, index) => `${index + 1}. ${desc}`);
      
      app.description = `Business process walkthrough for ${app.name} system with ${app.owner}

Key Control Descriptions:

${numberedDescriptions.join('\n\n')}`;
    } else {
      // Fallback to generic description
      app.description = `Business process walkthrough for ${app.name} system with ${app.owner}`;
    }
    
    return app;
  });
  
  console.log(`✅ Successfully extracted ${extractedApplications.length} walkthrough applications:`);
  extractedApplications.forEach(app => {
    const descriptionCount = (app.description.match(/\d+\./g) || []).length; // Count numbered items
    console.log(`- ${app.name} (${app.owner}): ${app.relatedReports.length} reports, ${descriptionCount} unique descriptions`);
  });
  
  return extractedApplications;
};

/**
 * Generates walkthrough requests from applications
 * Each application becomes one request in 'draft' status
 */
export const generateWalkthroughRequestsFromApplications = (
  applications: WalkthroughApplication[],
  auditId: string,
  createdBy: string
): WalkthroughRequest[] => {
  
  return applications.map(app => ({
    id: generateWalkthroughRequestId(app.id),
    auditId,
    applicationId: app.id,
    applicationName: app.name,
    businessOwner: app.owner,
    requestType: 'walkthrough' as const,
    
    // Initial status
    status: WALKTHROUGH_STATUSES.DRAFT,
    currentResponsibleParty: 'auditor' as const,
    
    // Timestamps
    createdAt: new Date().toISOString(),
    createdBy,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedBy: createdBy,
    
    // Process details from application
    relatedReports: [...app.relatedReports],
    estimatedDuration: app.estimatedDuration,
    criticality: app.criticality
  }));
};