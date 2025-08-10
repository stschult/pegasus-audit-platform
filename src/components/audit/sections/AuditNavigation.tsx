// File: src/components/audit/sections/AuditNavigation.tsx
'use client';

import React from 'react';
import { 
  Home, 
  CheckCircle, 
  FileText, 
  Settings, 
  Eye, 
  Building2, 
  AlertTriangle 
} from 'lucide-react';
import { ExcelData } from '../types';
import { getKeySystemsCount } from '../utils/keySystemsExtractor';

interface AuditNavigationProps {
  currentModule: string;
  onModuleChange: (moduleId: string) => void;
  currentData: ExcelData | null;
  walkthroughApplications: any[];
}

const AUDIT_MODULES = [
  { id: 'overview', name: 'Overview', icon: Home },
  { id: 'itgcs', name: 'ITGCs', icon: CheckCircle },
  { id: 'key-reports', name: 'Key Reports', icon: FileText },
  { id: 'itacs', name: 'ITACs', icon: Settings },
  { id: 'walkthroughs', name: 'Walkthroughs', icon: Eye },
  { id: 'key-systems', name: 'Key Systems', icon: Building2 },
  { id: 'findings-log', name: 'Findings Log', icon: AlertTriangle }
];

const AuditNavigation: React.FC<AuditNavigationProps> = ({
  currentModule,
  onModuleChange,
  currentData,
  walkthroughApplications
}) => {
  const getModuleIcon = (moduleId: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'overview': Home,
      'itgcs': CheckCircle,
      'key-reports': FileText,
      'itacs': Settings,
      'walkthroughs': Eye,
      'key-systems': Building2,
      'findings-log': AlertTriangle
    };
    return iconMap[moduleId] || CheckCircle;
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {AUDIT_MODULES.map((module) => {
            const isActive = currentModule === module.id;
            const Icon = getModuleIcon(module.id);
            
            // Data-driven counting logic
            let itemCount = 0;
            if (module.id === 'itgcs') itemCount = currentData?.controls?.length || 0;
            else if (module.id === 'itacs') itemCount = currentData?.itacs?.length || 0;
            else if (module.id === 'key-reports') itemCount = currentData?.keyReports?.length || 0;
            else if (module.id === 'walkthroughs') itemCount = walkthroughApplications?.length || 0;
            else if (module.id === 'key-systems') {
              itemCount = currentData?.keyReports ? getKeySystemsCount(currentData.keyReports) : 0;
            }
            
            return (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{module.name}</span>
                {itemCount > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {itemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuditNavigation;