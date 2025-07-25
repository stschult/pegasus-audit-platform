// components/controls/ControlDetail.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Control } from '../../types';
import { STATUS_LABELS, getRiskRatingColor } from '../../lib/constants';

interface ControlDetailProps {
  control: Control;
  onBack: () => void;
  onStatusUpdate: (controlId: string, newStatus: Control['status']) => void;
}

export default function ControlDetail({ 
  control, 
  onBack, 
  onStatusUpdate 
}: ControlDetailProps) {
  const [selectedStatus, setSelectedStatus] = useState<Control['status']>(control.status);
  const [notes, setNotes] = useState('');

  const handleStatusChange = (newStatus: Control['status']) => {
    setSelectedStatus(newStatus);
    onStatusUpdate(control.id, newStatus);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{control.name}</h1>
          <p className="text-gray-600">{control.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-6">{control.description}</p>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value as Control['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Rating
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskRatingColor(control.riskRating)}`}>
                {control.riskRating}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Family
              </label>
              <p className="text-gray-900">{control.controlFamily}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Updated
              </label>
              <p className="text-gray-900">{control.lastUpdated}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Testing Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add testing notes, observations, or findings..."
          />
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence Upload</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
            <p className="text-sm text-gray-500">Supports: PDF, DOCX, XLSX, PNG, JPG</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
            Save Changes
          </button>
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}