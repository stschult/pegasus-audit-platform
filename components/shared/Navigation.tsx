// components/shared/Navigation.tsx
'use client';

import React from 'react';
import { User, LogOut } from 'lucide-react';
import { User as UserType, Audit } from '../../types';

interface NavigationProps {
  currentView: string;
  user: UserType;
  selectedAudit: Audit | null;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Navigation({
  currentView,
  user,
  selectedAudit,
  onViewChange,
  onLogout
}: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onViewChange('dashboard')}
            >
              {/* Your Actual Pegasus Logo */}
              <div className="w-10 h-10 relative">
                <img 
                  src="/pegasus-logo.png" 
                  alt="Pegasus Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Brand Text */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pegasus</h1>
                <p className="text-xs text-gray-500">Audit Platform</p>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => onViewChange('dashboard')}
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </button>
            {selectedAudit && (
              <>
                <span>/</span>
                <span className="font-medium text-gray-900">{selectedAudit.clientName}</span>
                {currentView === 'audit-setup' && (
                  <>
                    <span>/</span>
                    <span className="text-blue-600">Audit Setup</span>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.organization}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}