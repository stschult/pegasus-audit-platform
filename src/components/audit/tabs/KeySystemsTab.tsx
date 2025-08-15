// File: src/components/audit/tabs/KeySystemsTab.tsx - UPDATED WITH AUDITCARD
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2,
  Plus,
  Edit,
  Database,
  Globe,
  CreditCard,
  Users,
  BarChart3,
  Server,
  Briefcase,
  StickyNote,
  Save,
  X,
  Eye
} from 'lucide-react';
import AuditCard from '../shared/AuditCard';

// Simple KeySystem interface
interface KeySystem {
  id: string;
  name: string;
  description: string;
  category: string;
  keyReportsCount: number;
  owner: string;
  notes: string;
  isDefault: boolean;
}

interface User {
  userType: 'auditor' | 'client';
}

interface KeySystemsTabProps {
  user: User | null;
  extractedSystems: KeySystem[];
}

const KeySystemsTab: React.FC<KeySystemsTabProps> = ({ user, extractedSystems }) => {
  console.log('👀 PROPS:', { extractedSystems, length: extractedSystems?.length });
  
  const [systems, setSystems] = useState<KeySystem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  useEffect(() => {
    console.log('🔍 KeySystemsTab useEffect:', { extractedSystems, length: extractedSystems?.length });
    if (extractedSystems && extractedSystems.length > 0) {
      console.log('✅ Setting systems from extracted data:', extractedSystems);
      setSystems(extractedSystems);
    } else {
      console.log('⚠️ No extracted systems, using empty array');
      setSystems([]);
    }
  }, [extractedSystems]);

  const getSystemIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'erp system': return Database;
      case 'trading platform': return BarChart3;
      case 'business system': return Briefcase;
      case 'infrastructure': return Server;
      case 'hr/finance system': return Users;
      case 'analytics platform': return BarChart3;
      case 'payment system': return CreditCard;
      default: return Building2;
    }
  };

  // Map system categories to our 4 standard themes
  const getSystemTheme = (category: string): 'blue' | 'green' | 'purple' | 'orange' => {
    switch (category.toLowerCase()) {
      case 'erp system': return 'blue';
      case 'trading platform': return 'orange';
      case 'business system': return 'green';
      case 'infrastructure': return 'purple';
      case 'hr/finance system': return 'green';
      case 'analytics platform': return 'purple';
      case 'payment system': return 'blue';
      default: return 'blue';
    }
  };

  // Create a risk level based on reports count (more reports = higher importance)
  const getSystemRiskLevel = (reportsCount: number): string => {
    if (reportsCount >= 5) return 'high';
    if (reportsCount >= 2) return 'medium';
    return 'low';
  };

  // Standard getRiskLevelColor function like other tabs
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle system card click - opens detail view (preserves existing functionality)
  const handleSystemClick = (system: KeySystem) => {
    console.log('🔧 System clicked:', system.name);
    // Could open a detail modal here or navigate to system detail view
    // For now, just log the click
  };

  // Get action button for system (auditors can edit notes, view details)
  const getSystemActionButton = (system: KeySystem) => {
    if (user?.userType === 'auditor' && system.notes && system.notes.length > 0) {
      return {
        text: 'View Details',
        icon: Eye,
        onClick: () => handleSystemClick(system)
      };
    }
    return null;
  };

  const handleAddSystem = (systemData: Omit<KeySystem, 'id' | 'isDefault'>) => {
    const newSystem: KeySystem = {
      ...systemData,
      id: `system-${Date.now()}`,
      isDefault: false
    };
    setSystems(prev => [...prev, newSystem]);
    setIsAddModalOpen(false);
  };

  const handleEditNotes = (systemId: string, currentNotes: string) => {
    setEditingNotes(systemId);
    setTempNotes(currentNotes);
  };

  const handleSaveNotes = (systemId: string) => {
    setSystems(prev => prev.map(system => 
      system.id === systemId 
        ? { ...system, notes: tempNotes }
        : system
    ));
    setEditingNotes(null);
    setTempNotes('');
  };

  const handleCancelNotes = () => {
    setEditingNotes(null);
    setTempNotes('');
  };

  const handleDeleteSystem = (systemId: string) => {
    const system = systems.find(s => s.id === systemId);
    if (system && !system.isDefault) {
      const confirmed = confirm(`Are you sure you want to delete "${system.name}"? This action cannot be undone.`);
      if (confirmed) {
        setSystems(prev => prev.filter(s => s.id !== systemId));
      }
    }
  };

  // Simple Add Modal Component (inline) - PRESERVED
  const AddSystemModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      category: 'Business System',
      keyReportsCount: 0,
      owner: '',
      notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddSystem(formData);
      setFormData({
        name: '',
        description: '',
        category: 'Business System',
        keyReportsCount: 0,
        owner: '',
        notes: ''
      });
    };

    if (!isAddModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Add New System</h3>
            <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">System Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="ERP System">ERP System</option>
                <option value="Trading Platform">Trading Platform</option>
                <option value="Business System">Business System</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="HR/Finance System">HR/Finance System</option>
                <option value="Analytics Platform">Analytics Platform</option>
                <option value="Payment System">Payment System</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Add System
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - PRESERVED */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Key Systems ({systems.length})</h2>
          <p className="text-sm text-gray-600 mt-1">
            Main IT systems and applications used in business operations
            {(extractedSystems?.length || 0) > 0 && (
              <span className="ml-2 text-green-600">
                • {extractedSystems?.length || 0} systems extracted from Excel data
              </span>
            )}
          </p>
        </div>
        {user?.userType === 'auditor' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New System
          </button>
        )}
      </div>

      {/* Systems Grid - NOW USING AUDITCARD */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systems.map((system) => {
          const Icon = getSystemIcon(system.category);
          const theme = getSystemTheme(system.category);
          const riskLevel = getSystemRiskLevel(system.keyReportsCount);
          const actionButton = getSystemActionButton(system);
          
          return (
            <AuditCard
              key={system.id}
              id={system.id}
              title={system.name}
              subtitle={system.category}
              description={system.description || 'IT system used in business operations'}
              theme={theme}
              icon={Icon}
              statusInfo={!actionButton ? {
                status: `${system.keyReportsCount} Reports`,
                colorClass: 'bg-gray-100 text-gray-700'
              } : undefined}
              actionButton={actionButton}
              needsAction={false} // Systems don't typically need urgent action
              riskLevel={riskLevel}
              bottomLeftText={system.owner || 'No Owner Assigned'}
              onClick={() => handleSystemClick(system)}
              getRiskLevelColor={getRiskLevelColor}
            />
          );
        })}
      </div>

      {/* Empty State - PRESERVED */}
      {systems.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Key Systems Found</h3>
          <p className="text-gray-600 mb-4">
            {(extractedSystems?.length || 0) === 0 
              ? "Upload an Excel file with Key Reports data to automatically extract systems"
              : "Start by adding your organization's key IT systems and applications"
            }
          </p>
          {user?.userType === 'auditor' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First System
            </button>
          )}
        </div>
      )}

      {/* Add System Modal - PRESERVED */}
      <AddSystemModal />

      {/* Notes Editing Modal - COULD BE ADDED HERE FOR CLICK DETAIL VIEW */}
      {editingNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Edit System Notes
              </h3>
              <button onClick={handleCancelNotes} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Add notes about this system..."
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelNotes}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveNotes(editingNotes!)}
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeySystemsTab;