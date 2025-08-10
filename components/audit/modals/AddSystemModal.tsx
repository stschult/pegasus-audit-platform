// components/audit/modals/AddSystemModal.tsx
'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus,
  Building2,
  Database,
  Globe,
  CreditCard,
  Users,
  BarChart3,
  Server,
  Briefcase
} from 'lucide-react';

// System data interface
interface SystemData {
  name: string;
  description: string;
  category: string;
  keyReportsCount: number;
  owner: string;
  notes: string;
}

// Component props
interface AddSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSystem: (systemData: SystemData) => void;
}

const AddSystemModal: React.FC<AddSystemModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddSystem 
}) => {
  const [systemData, setSystemData] = useState<SystemData>({
    name: '',
    description: '',
    category: 'Business System',
    keyReportsCount: 0,
    owner: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // System categories with icons
  const systemCategories = [
    { value: 'ERP System', label: 'ERP System', icon: Database },
    { value: 'Trading Platform', label: 'Trading Platform', icon: BarChart3 },
    { value: 'Business System', label: 'Business System', icon: Briefcase },
    { value: 'Infrastructure', label: 'Infrastructure', icon: Server },
    { value: 'HR/Finance System', label: 'HR/Finance System', icon: Users },
    { value: 'Analytics Platform', label: 'Analytics Platform', icon: BarChart3 },
    { value: 'Payment System', label: 'Payment System', icon: CreditCard },
    { value: 'Security System', label: 'Security System', icon: Building2 },
    { value: 'Communication System', label: 'Communication System', icon: Globe },
    { value: 'Other', label: 'Other', icon: Building2 }
  ];

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!systemData.name.trim()) {
      newErrors.name = 'System name is required';
    }

    if (!systemData.description.trim()) {
      newErrors.description = 'System description is required';
    }

    if (!systemData.owner.trim()) {
      newErrors.owner = 'System owner is required';
    }

    if (systemData.keyReportsCount < 0) {
      newErrors.keyReportsCount = 'Key reports count cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onAddSystem(systemData);
    
    // Reset form
    setSystemData({
      name: '',
      description: '',
      category: 'Business System',
      keyReportsCount: 0,
      owner: '',
      notes: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    setSystemData({
      name: '',
      description: '',
      category: 'Business System',
      keyReportsCount: 0,
      owner: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Key System</h2>
              <p className="text-sm text-gray-600 mt-1">Add a new IT system to your audit scope</p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* System Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Name *
            </label>
            <input
              type="text"
              value={systemData.name}
              onChange={(e) => setSystemData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Active Directory, Salesforce, Oracle EBS"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* System Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Category
            </label>
            <select
              value={systemData.category}
              onChange={(e) => setSystemData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {systemCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Description *
            </label>
            <textarea
              value={systemData.description}
              onChange={(e) => setSystemData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the system's purpose, functionality, and role in business operations..."
              rows={3}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Owner and Key Reports Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Owner *
              </label>
              <input
                type="text"
                value={systemData.owner}
                onChange={(e) => setSystemData(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="e.g., IT Operations Team"
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.owner ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.owner && <p className="text-red-600 text-sm mt-1">{errors.owner}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Reports Count
              </label>
              <input
                type="number"
                min="0"
                value={systemData.keyReportsCount}
                onChange={(e) => setSystemData(prev => ({ ...prev, keyReportsCount: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.keyReportsCount ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.keyReportsCount && <p className="text-red-600 text-sm mt-1">{errors.keyReportsCount}</p>}
            </div>
          </div>

          {/* Initial Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Notes (Optional)
            </label>
            <textarea
              value={systemData.notes}
              onChange={(e) => setSystemData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information or notes about this system..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Selected Category Preview */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {(() => {
                const selectedCategory = systemCategories.find(cat => cat.value === systemData.category);
                const IconComponent = selectedCategory?.icon || Building2;
                return (
                  <>
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <IconComponent className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">
                        {systemData.name || 'New System'} - {systemData.category}
                      </p>
                      <p className="text-sm text-amber-700">
                        {systemData.description || 'System description will appear here'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add System
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSystemModal;