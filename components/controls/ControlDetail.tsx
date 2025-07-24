// components/controls/ControlDetail.tsx
'use client';

import React from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Control } from '../../types';
import { getRiskRatingColor } from '../../lib/utils';

interface ControlDetailProps {
  selectedControl: Control;
  onBack: () => void;
}

export default function ControlDetail({ selectedControl, onBack }: ControlDetailProps) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedControl.name}</h1>
          <p className="text-gray-600 mt-2">{selectedControl.controlFamily}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-6">{selectedControl.description}</p>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Rating</label>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskRatingColor(selectedControl.riskRating)}`}>
                {selectedControl.riskRating}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Control Owner</label>
              <p className="text-gray-900">{selectedControl.owner}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <p className="text-gray-900">{selectedControl.frequency}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedControl.status}
                onChange={(e) => {
                  // Update control status logic would go here
                  console.log('Status update:', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Testing Notes</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add testing notes and observations..."
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Evidence & Documentation</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Upload evidence files</p>
            <input type="file" multiple className="hidden" />
            <button className="mt-2 text-blue-600 hover:text-blue-700">
              Choose Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}