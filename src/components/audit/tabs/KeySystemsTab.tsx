// File: components/audit/tabs/KeySystemsTab.tsx - FINAL WORKING VERSION
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
  X
} from 'lucide-react';

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

  const getSystemColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'erp system': return 'amber';
      case 'trading platform': return 'orange';
      case 'business system': return 'yellow';
      case 'infrastructure': return 'lime';
      case 'hr/finance system': return 'emerald';
      case 'analytics platform': return 'teal';
      case 'payment system': return 'cyan';
      default: return 'amber';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: any } = {
      amber: {
        bg: 'bg-amber-100',
        icon: 'text-amber-600',
        hover: 'hover:bg-amber-200',
        border: 'border-amber-200',
        hoverBorder: 'hover:border-amber-300',
        text: 'text-amber-700'
      },
      orange: {
        bg: 'bg-orange-100',
        icon: 'text-orange-600',
        hover: 'hover:bg-orange-200',
        border: 'border-orange-200',
        hoverBorder: 'hover:border-orange-300',
        text: 'text-orange-700'
      },
      yellow: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        hover: 'hover:bg-yellow-200',
        border: 'border-yellow-200',
        hoverBorder: 'hover:border-yellow-300',
        text: 'text-yellow-700'
      },
      lime: {
        bg: 'bg-lime-100',
        icon: 'text-lime-600',
        hover: 'hover:bg-lime-200',
        border: 'border-lime-200',
        hoverBorder: 'hover:border-lime-300',
        text: 'text-lime-700'
      },
      emerald: {
        bg: 'bg-emerald-100',
        icon: 'text-emerald-600',
        hover: 'hover:bg-emerald-200',
        border: 'border-emerald-200',
        hoverBorder: 'hover:border-emerald-300',
        text: 'text-emerald-700'
      },
      teal: {
        bg: 'bg-teal-100',
        icon: 'text-teal-600',
        hover: 'hover:bg-teal-200',
        border: 'border-teal-200',
        hoverBorder: 'hover:border-teal-300',
        text: 'text-teal-700'
      },
      cyan: {
        bg: 'bg-cyan-100',
        icon: 'text-cyan-600',
        hover: 'hover:bg-cyan-200',
        border: 'border-cyan-200',
        hoverBorder: 'hover:border-cyan-300',
        text: 'text-cyan-700'
      }
    };
    return colorMap[color] || colorMap.amber;
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

  // Simple Add Modal Component (inline)
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
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center gap-2"
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
      {/* Header */}
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
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New System
          </button>
        )}
      </div>

      {/* Systems Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {systems.map((system) => {
          const Icon = getSystemIcon(system.category);
          const color = getSystemColor(system.category);
          const colors = getColorClasses(color);
          
          return (
            <div
              key={system.id}
              className={`bg-white border-2 rounded-lg p-6 transition-all group ${colors.border} ${colors.hoverBorder} hover:shadow-lg`}
            >
              {/* System Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-3 rounded-lg transition-colors ${colors.bg} ${colors.hover}`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-lg">
                      {system.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{system.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${colors.bg} ${colors.text}`}>
                    {system.keyReportsCount} Reports
                  </span>
                  {!system.isDefault && user?.userType === 'auditor' && (
                    <button
                      onClick={() => handleDeleteSystem(system.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete System"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* System Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {system.description}
              </p>

              {/* Owner */}
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate">{system.owner}</span>
              </div>

              {/* Notes Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <StickyNote className="h-4 w-4" />
                    Notes
                  </label>
                  {user?.userType === 'auditor' && editingNotes !== system.id && (
                    <button
                      onClick={() => handleEditNotes(system.id, system.notes)}
                      className="text-amber-600 hover:text-amber-800 p-1"
                      title="Edit Notes"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                {editingNotes === system.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add notes about this system..."
                      rows={3}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelNotes}
                        className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(system.id)}
                        className="px-3 py-1 text-xs text-white bg-amber-600 rounded hover:bg-amber-700 transition-colors flex items-center gap-1"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[60px]">
                    {system.notes ? (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{system.notes}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        {user?.userType === 'auditor' ? 'Click edit to add notes...' : 'No notes available'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
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
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First System
            </button>
          )}
        </div>
      )}

      {/* Add System Modal */}
      <AddSystemModal />
    </div>
  );
};

export default KeySystemsTab;