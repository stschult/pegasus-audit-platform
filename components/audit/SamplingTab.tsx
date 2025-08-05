// components/audit/SamplingTab.tsx - With Debug Logs
import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Settings, CheckCircle, Clock, AlertCircle, Upload, Target, Calendar, BarChart3 } from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';
import { SamplingEngine } from '../../utils/samplingEngine';
import { SamplingConfig, GeneratedSample, QuarterDefinition } from '../../types';

interface SamplingTabProps {
  control: {
    id: string;
    description: string;
    riskRating: string;
    frequency: string;
  };
  auditPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

export default function SamplingTab({ control, auditPeriod }: SamplingTabProps) {
  const {
    getSamplingDataForControl,
    getSamplingStatusForControl,
    handleSamplingConfigSave,
    handleGenerateSamples,
    handleApproveSamples,
    user
  } = useAppState();

  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localConfig, setLocalConfig] = useState<SamplingConfig | null>(null);

  // Get current sampling data
  const samplingData = getSamplingDataForControl(control.id);
  const samplingStatus = getSamplingStatusForControl(control.id);
  
  // 🔍 DEBUG LOGS - Add these to identify the issue
  console.log('🔍 SamplingTab DEBUG - control.id:', control.id);
  console.log('🔍 SamplingTab DEBUG - control object:', control);
  console.log('🔍 SamplingTab DEBUG - samplingData:', samplingData);
  console.log('🔍 SamplingTab DEBUG - samplingData.config:', samplingData.config);
  console.log('🔍 SamplingTab DEBUG - samplingData.classification:', samplingData.classification);
  console.log('🔍 SamplingTab DEBUG - samplingData.samples:', samplingData.samples);
  console.log('🔍 SamplingTab DEBUG - samplingStatus:', samplingStatus);
  console.log('🔍 SamplingTab DEBUG - localConfig:', localConfig);
  
  // Initialize local config from existing or create new
  useEffect(() => {
    console.log('🔍 SamplingTab useEffect triggered - samplingData.config:', samplingData.config);
    console.log('🔍 SamplingTab useEffect triggered - localConfig:', localConfig);
    console.log('🔍 SamplingTab useEffect triggered - samplingData.classification:', samplingData.classification);
    
    if (samplingData.config && !localConfig) {
      console.log('✅ Setting localConfig from existing samplingData.config');
      setLocalConfig(samplingData.config);
    } else if (!samplingData.config && !localConfig && samplingData.classification?.requiresSampling) {
      console.log('✅ Creating new default config');
      // Create default config based on classification
      const defaultQuarters = SamplingEngine.createCalendarQuarters(
        auditPeriod.startDate.toISOString().split('T')[0],
        auditPeriod.endDate.toISOString().split('T')[0]
      );
      
      const suggestedSampleSize = samplingData.classification?.suggestedSampleSize || 2;
      
      const newConfig: SamplingConfig = {
        id: `config-${control.id}-${Date.now()}`,
        controlId: control.id,
        sampleSize: suggestedSampleSize * defaultQuarters.length,
        methodology: samplingData.classification?.suggestedMethodology || 'random',
        timePeriod: {
          type: 'calendar_quarters',
          startDate: auditPeriod.startDate.toISOString().split('T')[0],
          endDate: auditPeriod.endDate.toISOString().split('T')[0],
          quarters: defaultQuarters.map(q => ({
            ...q,
            samplesRequired: suggestedSampleSize
          }))
        },
        minimumInterval: samplingData.classification?.frequency === 'daily' ? 7 : 1,
        seed: Math.floor(Math.random() * 10000),
        createdAt: new Date().toISOString(),
        createdBy: user?.email || 'unknown',
        status: 'draft',
        notes: `Auto-generated for ${samplingData.classification?.riskLevel} risk ${samplingData.classification?.controlType} control`
      };
      
      console.log('✅ Created new config:', newConfig);
      setLocalConfig(newConfig);
    } else {
      console.log('⚠️ No action taken in useEffect');
      console.log('   - samplingData.config exists:', !!samplingData.config);
      console.log('   - localConfig exists:', !!localConfig);
      console.log('   - requiresSampling:', samplingData.classification?.requiresSampling);
    }
  }, [samplingData, localConfig, control.id, auditPeriod, user?.email]);

  // Handle save configuration
  const handleSaveConfig = () => {
    if (localConfig) {
      handleSamplingConfigSave(localConfig);
      setEditMode(false);
    }
  };

  // Handle generate samples
  const handleGenerate = async () => {
    if (!localConfig) return;
    
    setIsGenerating(true);
    try {
      // Generate samples using the sampling engine
      const samples = SamplingEngine.generateSamples(localConfig);
      
      // Save samples to state
      handleGenerateSamples(localConfig, samples);
      
      // Update local config status
      setLocalConfig(prev => prev ? { ...prev, status: 'generated' } : null);
    } catch (error) {
      console.error('Error generating samples:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle approve samples
  const handleApprove = () => {
    if (localConfig) {
      handleApproveSamples(localConfig.id);
      setLocalConfig(prev => prev ? { ...prev, status: 'approved' } : null);
    }
  };

  // Export samples to CSV
  const exportToCSV = () => {
    if (!samplingData.samples.length) return;
    
    const csvHeaders = ['Sample ID', 'Control ID', 'Quarter', 'Sample Date', 'Status', 'Is Weekend', 'Is Holiday'];
    const csvRows = samplingData.samples.map(sample => [
      sample.id,
      sample.samplingConfigId,
      sample.quarterName || 'N/A',
      sample.sampleDate,
      sample.status,
      sample.isWeekend ? 'Yes' : 'No',
      sample.isHoliday ? 'Yes' : 'No'
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samples-${control.id}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get status info for display
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_applicable':
        return { color: 'gray', text: 'No Sampling Required', icon: CheckCircle };
      case 'needs_configuration':
        return { color: 'yellow', text: 'Needs Configuration', icon: Settings };
      case 'draft':
        return { color: 'blue', text: 'Draft Configuration', icon: Settings };
      case 'pending_approval':
        return { color: 'orange', text: 'Pending Approval', icon: Clock };
      case 'approved':
        return { color: 'green', text: 'Approved', icon: CheckCircle };
      case 'sent_to_client':
        return { color: 'purple', text: 'Sent to Client', icon: Upload };
      case 'completed':
        return { color: 'green', text: 'Completed', icon: CheckCircle };
      default:
        return { color: 'gray', text: 'Unknown', icon: AlertCircle };
    }
  };

  const statusInfo = getStatusInfo(samplingStatus);
  const StatusIcon = statusInfo.icon;

  // DEBUG: Log before each conditional render
  console.log('🔍 About to check conditional renders...');
  console.log('   - samplingStatus:', samplingStatus);
  console.log('   - localConfig:', localConfig);

  // If control doesn't require sampling
  if (samplingStatus === 'not_applicable') {
    console.log('🔍 Rendering: not_applicable');
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Population Testing</h3>
        <p className="text-gray-600 max-w-md">
          This control requires full population testing rather than sampling. 
          All instances should be tested during the audit period.
        </p>
      </div>
    );
  }

  // If no config exists and sampling is required
  if (!localConfig) {
    console.log('🔍 Rendering: No sampling configured (no localConfig)');
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Sampling</h3>
        <p className="text-gray-600 max-w-md mb-6">
          Set up risk-based audit sampling for this control based on the classification and audit requirements.
        </p>
        <button
          onClick={() => setEditMode(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configure Sampling
        </button>
      </div>
    );
  }

  console.log('🔍 Rendering: Full sampling interface');
  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${statusInfo.color}-100 rounded-full flex items-center justify-center`}>
            <StatusIcon className={`w-5 h-5 text-${statusInfo.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sampling Configuration</h3>
            <p className={`text-sm text-${statusInfo.color}-600 font-medium`}>{statusInfo.text}</p>
          </div>
        </div>
        
        {samplingData.samples.length > 0 && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Configuration Panel */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">Configuration Details</h4>
          {!editMode && localConfig?.status === 'draft' && (
            <button
              onClick={() => setEditMode(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit Configuration
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sample Size</label>
            {editMode ? (
              <input
                type="number"
                min="1"
                max="20"
                value={localConfig?.sampleSize || ''}
                onChange={(e) => setLocalConfig(prev => prev ? {
                  ...prev,
                  sampleSize: parseInt(e.target.value) || 0
                } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                {localConfig?.sampleSize} samples
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Methodology</label>
            {editMode ? (
              <select
                value={localConfig?.methodology || 'random'}
                onChange={(e) => setLocalConfig(prev => prev ? {
                  ...prev,
                  methodology: e.target.value as 'random' | 'systematic' | 'judgmental'
                } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="random">Random Sampling</option>
                <option value="systematic">Systematic Sampling</option>
                <option value="judgmental">Judgmental Sampling</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 capitalize">
                {localConfig?.methodology} sampling
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Assessment</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 capitalize">
              {samplingData.classification?.riskLevel} risk
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audit Period</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
              {localConfig?.timePeriod.startDate} to {localConfig?.timePeriod.endDate}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quarters</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
              {localConfig?.timePeriod.quarters?.length || 0} quarters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Interval</label>
            {editMode ? (
              <input
                type="number"
                min="0"
                max="30"
                value={localConfig?.minimumInterval || ''}
                onChange={(e) => setLocalConfig(prev => prev ? {
                  ...prev,
                  minimumInterval: parseInt(e.target.value) || 0
                } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                {localConfig?.minimumInterval} days
              </div>
            )}
          </div>
        </div>

        {editMode && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Configuration
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {localConfig?.status === 'draft' && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Samples'}
          </button>
        )}

        {localConfig?.status === 'generated' && samplingData.samples.length > 0 && (
          <button
            onClick={handleApprove}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Approve Samples
          </button>
        )}
      </div>

      {/* Generated Samples */}
      {samplingData.samples.length > 0 && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{samplingData.samples.length}</div>
                  <div className="text-sm text-gray-600">Total Samples</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {localConfig?.timePeriod.quarters?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Quarters</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {samplingData.samples.filter(s => s.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((samplingData.samples.filter(s => s.status === 'approved').length / samplingData.samples.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Samples Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Generated Samples</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sample
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quarter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {samplingData.samples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{sample.sampleIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sample.sampleDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sample.quarterName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sample.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          sample.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sample.status.charAt(0).toUpperCase() + sample.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sample.isWeekend && <span className="mr-2 text-orange-600">Weekend</span>}
                        {sample.isHoliday && <span className="text-red-600">Holiday</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}