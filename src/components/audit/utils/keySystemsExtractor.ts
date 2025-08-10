// File: utils/keySystemsExtractor.ts
export interface KeySystem {
  id: string;
  name: string;
  description: string;
  category: string;
  keyReportsCount: number;
  owner: string;
  notes: string;
  isDefault: boolean;
}

interface ExtractedKeyReport {
  id: string;
  name?: string;
  application?: string;
  reportType?: string;
  description?: string;
  frequency?: string;
  owner?: string;
}

export const extractKeySystemsFromData = (keyReports: ExtractedKeyReport[]): KeySystem[] => {
  console.log('🔧 extractKeySystemsFromData called with:', keyReports);
  
  if (!keyReports || keyReports.length === 0) {
    console.log('⚠️ No keyReports provided');
    return [];
  }

  // Count reports per application
  const applicationCounts = new Map<string, number>();
  
  keyReports.forEach(report => {
    if (report.application && report.application.trim()) {
      const appName = report.application.trim();
      applicationCounts.set(appName, (applicationCounts.get(appName) || 0) + 1);
    }
  });

  console.log('📊 Application counts:', Object.fromEntries(applicationCounts));

  // Convert to KeySystem objects
  const systems: KeySystem[] = [];
  
  applicationCounts.forEach((count, applicationName) => {
    const system: KeySystem = {
      id: generateSystemId(applicationName),
      name: applicationName,
      description: getSystemDescription(applicationName),
      category: getSystemCategory(applicationName),
      keyReportsCount: count,
      owner: getSystemOwner(applicationName),
      notes: '',
      isDefault: true
    };
    
    systems.push(system);
  });

  // Sort by report count (highest first) then by name
  const sortedSystems = systems.sort((a, b) => {
    if (b.keyReportsCount !== a.keyReportsCount) {
      return b.keyReportsCount - a.keyReportsCount;
    }
    return a.name.localeCompare(b.name);
  });

  console.log('✅ Extracted systems:', sortedSystems);
  return sortedSystems;
};

const generateSystemId = (applicationName: string): string => {
  return applicationName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const getSystemCategory = (applicationName: string): string => {
  const categoryMap: { [key: string]: string } = {
    'AX': 'ERP System',
    'Express Options': 'Trading Platform',
    'Expandable': 'Business System',
    'VM': 'Infrastructure',
    'Workday': 'HR/Finance System',
    'Clearwater': 'Analytics Platform',
    'EasyPay': 'Payment System'
  };

  return categoryMap[applicationName] || 'Business System';
};

const getSystemDescription = (applicationName: string): string => {
  const descriptionMap: { [key: string]: string } = {
    'AX': 'Enterprise Resource Planning (ERP) system for financial and operational management',
    'Express Options': 'Trading platform for options and derivatives processing',
    'Expandable': 'Scalable business management system for operations and workflow',
    'VM': 'Virtual Machine infrastructure for application hosting and deployment',
    'Workday': 'Human Resources and Financial Management cloud platform',
    'Clearwater': 'Analytics and reporting platform for business intelligence',
    'EasyPay': 'Payment processing system for customer transactions'
  };

  return descriptionMap[applicationName] || `${applicationName} business application system`;
};

const getSystemOwner = (applicationName: string): string => {
  const ownerMap: { [key: string]: string } = {
    'AX': 'IT Operations Team',
    'Express Options': 'Trading Technology Team',
    'Expandable': 'Business Operations Team',
    'VM': 'Infrastructure Team',
    'Workday': 'HR Technology Team',
    'Clearwater': 'Data Analytics Team',
    'EasyPay': 'Payment Processing Team'
  };

  return ownerMap[applicationName] || 'IT Operations Team';
};

export const getKeySystemsCount = (keyReports: ExtractedKeyReport[]): number => {
  if (!keyReports || keyReports.length === 0) {
    return 0;
  }

  const uniqueApplications = new Set<string>();
  
  keyReports.forEach(report => {
    if (report.application && report.application.trim()) {
      uniqueApplications.add(report.application.trim());
    }
  });

  return uniqueApplications.size;
};