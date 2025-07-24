// components/controls/ControlsView.tsx
'use client';

import React from 'react';
import { ArrowLeft, Search, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Audit, Control } from '../../types';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { getRiskRatingColor } from '../../lib/utils';

interface ControlsViewProps {
  selectedAudit: Audit;
  controls: Control[];
  searchTerm: string;
  selectedStatus: string;
  selectedRisk: string;
  onSearchChange: (term: string) => void;
  onStatusChange: (status: string) => void;
  onRiskChange: (risk: string) => void;
  onControlSelect: (control: Control) => void;
  onBack: () => void;
}

export default function ControlsView({
  selectedAudit,
  controls,
  searchTerm,
  selectedStatus,
  selectedRisk,
  onSearchChange,
  onStatusChange,
  onRiskChange,
  onControlSelect,
  onBack
}: ControlsViewProps) {
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
          <h1 className="text-3xl font-bold text-gray-900">{selectedAudit.clientName} - Controls</h1>
          <p className="text-gray-600 mt-2">Review and test audit controls</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="walkthrough">Walkthrough</option>
              <option value="design_review">Design Review</option>
              <option value="testing">Testing</option>
              <option value="evidence_review">Evidence Review</option>
              <option value="management_review">Management Review</option>
              <option value="deficiency_review">Deficiency Review</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={selectedRisk}
              onChange={(e) => onRiskChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {controls.map((control) => (
          <div
            key={control.id}
            onClick={() => onControlSelect(control)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${STATUS_COLORS[control.status]}`}>
                  {control.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {(control.status === 'testing' || control.status === 'evidence_review') && <Clock className="h-5 w-5 text-yellow-600" />}
                  {control.status === 'not-started' && <AlertCircle className="h-5 w-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{control.name}</h3>
                  <p className="text-sm text-gray-500">{control.controlFamily}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskRatingColor(control.riskRating)}`}>
                {control.riskRating}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{control.description}</p>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[control.status]}`}>
                {STATUS_LABELS[control.status]}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}