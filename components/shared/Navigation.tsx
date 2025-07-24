// components/shared/Navigation.tsx
'use client';

import React from 'react';
import { User } from 'lucide-react';
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Pegasus Audit Platform</span>
            </div>
            
            {/* Only show navigation items when NOT on dashboard */}
            {currentView !== 'dashboard' && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={() => onViewChange('dashboard')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </button>
                
                {/* Only show audit name and modules when in audit-setup view */}
                {selectedAudit && currentView === 'audit-setup' && (
                  <>
                    <span>/</span>
                    <span className="font-medium text-gray-900">{selectedAudit.clientName}</span>
                    <span>/</span>
                    <span>Modules</span>
                  </>
                )}
                
                {/* Show other view names */}
                {currentView === 'create-audit' && (
                  <>
                    <span>/</span>
                    <span>Create New Audit</span>
                  </>
                )}
                
                {selectedAudit && currentView === 'controls' && (
                  <>
                    <span>/</span>
                    <span className="font-medium text-gray-900">{selectedAudit.clientName}</span>
                    <span>/</span>
                    <span>Controls</span>
                  </>
                )}
                
                {selectedAudit && currentView === 'control-detail' && (
                  <>
                    <span>/</span>
                    <span className="font-medium text-gray-900">{selectedAudit.clientName}</span>
                    <span>/</span>
                    <span>Controls</span>
                    <span>/</span>
                    <span>Detail</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {!user.isClient && selectedAudit && currentView === 'audit-setup' && (
              <button
                onClick={() => onViewChange('audit-setup')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'audit-setup'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Audit Setup
              </button>
            )}
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.organization}</p>
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}