// File: src/components/audit/shared/AuditCard.tsx
'use client';

import React from 'react';

// Props interface for the shared AuditCard component
interface AuditCardProps {
  // Core identification and content
  id: string;
  title: string;
  subtitle: string;
  description: string;
  
  // Styling and theming
  theme: 'blue' | 'green' | 'purple' | 'orange';
  icon: React.ComponentType<{ className?: string }>;
  
  // Status and action handling (conditional)
  statusInfo?: {
    status: string;
    colorClass: string;
  };
  actionButton?: {
    text: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: (e: React.MouseEvent) => void;
  };
  needsAction: boolean; // Determines red border
  
  // Risk level and bottom information
  riskLevel: string;
  bottomLeftText: string;
  
  // Event handlers
  onClick: () => void;
  getRiskLevelColor: (riskLevel: string) => string;
}

const AuditCard: React.FC<AuditCardProps> = ({
  id,
  title,
  subtitle,
  description,
  theme,
  icon: Icon,
  statusInfo,
  actionButton,
  needsAction,
  riskLevel,
  bottomLeftText,
  onClick,
  getRiskLevelColor
}) => {

  // Theme-based styling configurations
  const themeStyles = {
    blue: {
      card: 'bg-blue-50 hover:bg-blue-100',
      icon: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
    },
    green: {
      card: 'bg-green-50 hover:bg-green-100',
      icon: 'bg-green-100 text-green-600 group-hover:bg-green-200'
    },
    purple: {
      card: 'bg-purple-50 hover:bg-purple-100',
      icon: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
    },
    orange: {
      card: 'bg-orange-50 hover:bg-orange-100',
      icon: 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
    }
  };

  const currentTheme = themeStyles[theme];
  
  // Border styling based on needsAction
  const borderClass = needsAction ? 'border-2 border-red-400' : 'border border-gray-200';

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    actionButton?.onClick(e);
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${currentTheme.card} 
        ${borderClass} 
        rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all group overflow-hidden
      `}
    >
      {/* Top Row: Icon + Title/Subtitle + Action Button/Status */}
      <div className="flex items-start justify-between mb-4">
        {/* Left side: Icon + Title/Subtitle */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${currentTheme.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 transition-colors truncate">
              {title}
            </h3>
            <p className="text-sm text-gray-700 truncate">{subtitle}</p>
          </div>
        </div>
        
        {/* Right side: Action Button OR Status Badge */}
        <div className="flex-shrink-0 ml-3">
          {actionButton ? (
            <button
              onClick={handleActionClick}
              className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition-colors"
            >
              <actionButton.icon className="h-3 w-3 mr-1" />
              {actionButton.text}
            </button>
          ) : statusInfo ? (
            <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.colorClass}`}>
              {statusInfo.status}
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
        {description}
      </p>
      
      {/* Bottom Row: Category/Owner + Risk Badge */}
      <div className="flex items-center justify-between text-sm">
        {/* Bottom Left: Category/Owner */}
        <div className="text-gray-700 truncate flex-1">
          {bottomLeftText}
        </div>
        
        {/* Bottom Right: Risk Badge */}
        <div className="flex-shrink-0 ml-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getRiskLevelColor(riskLevel)}`}>
            {riskLevel.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuditCard;