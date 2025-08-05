// components/audit/SamplingModal.tsx - FIXED TYPE ERRORS
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Calculator, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Target,
  Download,
  Upload,
  Shuffle,
  BarChart3,
  Clock,
  User,
  FileText,
  Send
} from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';
import { SamplingConfig, GeneratedSample, EvidenceRequest } from '../../types';

interface SamplingModalProps {
  isOpen: boolean;
  onClose: () => void;
  controlId: string;
  controlDescription: string;
  auditPeriod: {
    startDate: Date;
    endDate: Date;
  };
  onSave: () => void;
  onApprove: () => void;
  onCreateEvidenceRequest: () => void;
}

type TabType = 'configuration' | 'generation' | 'review' | 'evidence';

export default function SamplingModal({
  isOpen,
  onClose,
  controlId,
  controlDescription,
  auditPeriod,
  onSave,
  onApprove,
  onCreateEvidenceRequest
}: SamplingModalProps) {
  const { 
    samplingConfigs, 
    generatedSamples,
    handleSamplingConfigSave,
    handleGenerateSamples,
    handleApproveSamples,
    handleCreateEvidenceRequest, // FIXED: Now properly updates status
    user
  } = useAppState();
  
  const [activeTab, setActiveTab] = useState<TabType>('configuration');
  const [populationSize, setPopulationSize] = useState(365);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<SamplingConfig>({
    id: '',
    controlId: '',
    sampleSize: 25,
    methodology: 'random',
    timePeriod: {
      type: 'calendar_quarters',
      startDate: '',
      endDate: '',
      quarters: []
    },
    minimumInterval: 1,
    seed: Math.floor(Math.random() * 10000),
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    status: 'draft',
    notes: ''
  });

  // Get persisted samples for this control's config - NO LOCAL STATE!
  const currentConfig = samplingConfigs.find(c => c.controlId === controlId);
  const currentSamples = currentConfig ? generatedSamples.filter(s => s.samplingConfigId === currentConfig.id) : [];

  // Initialize with default configuration
  useEffect(() => {
    if (isOpen && controlId) {
      const existingConfig = samplingConfigs.find(c => c.controlId === controlId);
      if (existingConfig) {
        // Ensure sample size is never 0
        const safeConfig = {
          ...existingConfig,
          sampleSize: existingConfig.sampleSize > 0 ? existingConfig.sampleSize : 25
        };
        setConfig(safeConfig);
        setPopulationSize(365);
      } else {
        // Set default configuration
        const defaultConfig: SamplingConfig = {
          id: `sampling-${controlId}-${Date.now()}`,
          controlId,
          sampleSize: 25, // Always default to 25
          methodology: 'random',
          timePeriod: {
            type: 'calendar_quarters',
            startDate: auditPeriod.startDate.toISOString().split('T')[0],
            endDate: auditPeriod.endDate.toISOString().split('T')[0],
            quarters: []
          },
          minimumInterval: 1,
          seed: Math.floor(Math.random() * 10000),
          createdAt: new Date().toISOString(),
          createdBy: user?.email || 'system',
          status: 'draft',
          notes: 'Default sampling configuration'
        };
        setConfig(defaultConfig);
        setPopulationSize(365);
      }
    }
  }, [isOpen, controlId, samplingConfigs, user?.email, auditPeriod]);

  // Reset to configuration tab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab('configuration');
    }
  }, [isOpen]);

  // Validation function
  const validateConfiguration = () => {
    const errors: string[] = [];
    
    // Ensure sample size is always at least 1
    const safeSampleSize = Math.max(1, config.sampleSize || 25);
    
    if (safeSampleSize <= 0) {
      errors.push('Sample size must be greater than 0.');
    }
    
    if (safeSampleSize > populationSize) {
      errors.push('Sample size cannot exceed population size.');
    }
    
    return errors;
  };

  // Generate sample dates locally
  const generateSamplesLocally = (sampleSize: number, populationSize: number, methodology: string): GeneratedSample[] => {
    const samples: GeneratedSample[] = [];
    const startDate = auditPeriod.startDate;
    const endDate = auditPeriod.endDate;
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let selectedDays: number[] = [];
    
    switch (methodology) {
      case 'random':
        // Random sampling
        while (selectedDays.length < sampleSize) {
          const randomDay = Math.floor(Math.random() * totalDays);
          if (!selectedDays.includes(randomDay)) {
            selectedDays.push(randomDay);
          }
        }
        break;
        
      case 'systematic':
        // Systematic sampling
        const interval = Math.floor(totalDays / sampleSize);
        const startPoint = Math.floor(Math.random() * interval);
        for (let i = 0; i < sampleSize; i++) {
          const day = (startPoint + (i * interval)) % totalDays;
          selectedDays.push(day);
        }
        break;
        
      default:
        // Default to random
        while (selectedDays.length < sampleSize) {
          const randomDay = Math.floor(Math.random() * totalDays);
          if (!selectedDays.includes(randomDay)) {
            selectedDays.push(randomDay);
          }
        }
    }
    
    // Convert days to actual dates
    selectedDays.sort((a, b) => a - b);
    
    selectedDays.forEach((dayOffset, index) => {
      const sampleDate = new Date(startDate);
      sampleDate.setDate(startDate.getDate() + dayOffset);
      
      samples.push({
        id: `sample-${config.id}-${index + 1}`,
        samplingConfigId: config.id,
        quarterId: undefined,
        customPeriodId: undefined,
        sampleDate: sampleDate.toISOString().split('T')[0],
        sampleIndex: index + 1,
        quarterName: `Q${Math.floor((sampleDate.getMonth() / 3)) + 1} ${sampleDate.getFullYear()}`,
        isWeekend: sampleDate.getDay() === 0 || sampleDate.getDay() === 6,
        isHoliday: false,
        status: 'pending',
        notes: `Generated using ${methodology} methodology`
      });
    });
    
    return samples;
  };

  // Generate sample dates
  const handleGenerateSamplesClick = async () => {
    setIsGenerating(true);
    
    try {
      // Ensure sample size is at least 1
      const safeSampleSize = Math.max(1, config.sampleSize || 25);
      const safeConfig = { ...config, sampleSize: safeSampleSize };
      
      const errors = validateConfiguration();
      if (errors.length > 0) {
        alert('Configuration errors:\n' + errors.join('\n'));
        return;
      }
      
      // Save configuration first
      const configToSave: SamplingConfig = {
        ...safeConfig,
        status: 'generated'
      };
      
      handleSamplingConfigSave(configToSave);
      setConfig(configToSave);
      
      // Generate samples locally using the safe sample size
      const samples = generateSamplesLocally(safeSampleSize, populationSize, safeConfig.methodology);
      
      // Use the handleGenerateSamples from useAppState
      handleGenerateSamples(configToSave, samples);
      
      setActiveTab('generation');
      
    } catch (error) {
      console.error('Error generating samples:', error);
      alert('Failed to generate samples. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // UPDATED: Handle approve samples
  const handleApproveSamplesClick = () => {
    if (currentConfig) {
      handleApproveSamples(currentConfig.id);
      setActiveTab('evidence');
    }
  };

  // FIXED: Handle evidence request creation with proper persistence and delayed close
  const handleCreateEvidenceRequestClick = () => {
    if (!currentConfig || currentSamples.length === 0) {
      alert('No samples available to create evidence request.');
      return;
    }

    // Create evidence request object - FIXED: Only use properties that exist in EvidenceRequest type
    const evidenceRequest: EvidenceRequest = {
      id: `evidence-req-${controlId}-${Date.now()}`,
      controlId: controlId,
      samplingConfigId: currentConfig.id,
      type: 'sampling',
      status: 'sent',
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'auditor',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
      title: `Evidence Request - ${controlDescription}`,
      samplingDetails: {
        methodology: currentConfig.methodology,
        sampleSize: currentSamples.length,
        selectedDates: currentSamples.map(sample => sample.sampleDate),
        populationDescription: `Audit period: ${auditPeriod.startDate.toISOString().split('T')[0]} to ${auditPeriod.endDate.toISOString().split('T')[0]}`,
        samplingRationale: `${currentConfig.methodology} sampling methodology selected for ${controlDescription}`
      },
      instructions: `For each sample date, please provide:
        1. Supporting documentation showing the control was performed
        2. Evidence of proper authorization/approval where applicable
        3. System-generated reports or logs as available
        4. Any additional documentation demonstrating control effectiveness`,
      priority: currentConfig.methodology === 'judgmental' ? 'high' : 'medium'
    };

    // FIXED: Use the handleCreateEvidenceRequest from useAppState to persist and update status
    handleCreateEvidenceRequest(evidenceRequest);
    
    console.log('✅ Evidence request created and status updated to "sent"');
    
    // Call the callback
    onCreateEvidenceRequest();
    
    // ✅ FIXED: Add small delay before closing to allow React state to propagate
    setTimeout(() => {
      onClose();
    }, 100);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get methodology description
  const getMethodologyDescription = (methodology: string) => {
    const descriptions = {
      random: 'Randomly selects samples from the entire population with equal probability',
      systematic: 'Selects every nth item from the population based on a calculated interval',
      judgmental: 'Uses professional judgment to select samples based on risk assessment'
    };
    return descriptions[methodology as keyof typeof descriptions] || '';
  };

  if (!isOpen) return null;

  const validationErrors = validateConfiguration();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Audit Sampling</h2>
            <p className="text-sm text-gray-600 mt-1">{controlDescription}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'configuration', label: 'Configuration', icon: Settings },
              { id: 'generation', label: 'Sample Generation', icon: Calculator },
              { id: 'review', label: 'Review & Approve', icon: CheckCircle },
              { id: 'evidence', label: 'Evidence Request', icon: Send }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'configuration' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Configuration Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Sampling Parameters */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sampling Parameters</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Methodology
                        </label>
                        <select
                          value={config.methodology}
                          onChange={(e) => setConfig({
                            ...config,
                            methodology: e.target.value as 'random' | 'systematic' | 'judgmental'
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="random">Random Sampling</option>
                          <option value="systematic">Systematic Sampling</option>
                          <option value="judgmental">Judgmental Sampling</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {getMethodologyDescription(config.methodology)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sample Size
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={populationSize}
                            value={Math.max(1, config.sampleSize || 25)}
                            onChange={(e) => setConfig({
                              ...config,
                              sampleSize: Math.max(1, parseInt(e.target.value) || 25)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Population Size
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={populationSize}
                            onChange={(e) => {
                              const newPopSize = Math.max(1, parseInt(e.target.value) || 365);
                              setPopulationSize(newPopSize);
                              setConfig({
                                ...config,
                                sampleSize: Math.min(config.sampleSize || 25, newPopSize)
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Validation */}
                <div className="space-y-6">
                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-red-900 mb-4">
                        <AlertCircle className="inline w-5 h-5 mr-2" />
                        Configuration Issues
                      </h3>
                      <ul className="space-y-2">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-sm text-red-800 flex items-start">
                            <span className="w-2 h-2 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Audit Period Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      <Calendar className="inline w-5 h-5 mr-2" />
                      Audit Period
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span className="font-medium">{auditPeriod.startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End Date:</span>
                        <span className="font-medium">{auditPeriod.endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span>Total Days:</span>
                        <span className="font-medium">{populationSize}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateSamplesClick}
                  disabled={validationErrors.length > 0 || isGenerating}
                  className={`px-6 py-2 text-white rounded-md transition-colors ${
                    validationErrors.length > 0 || isGenerating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Shuffle className="inline w-4 h-4 mr-2" />
                      Generate Samples
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'generation' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Generation Results Header */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    <Target className="inline w-5 h-5 mr-2" />
                    Generated Samples
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Methodology: <strong>{config.methodology}</strong></span>
                    <span>Sample Size: <strong>{currentSamples.length}</strong></span>
                    <span>Population: <strong>{populationSize}</strong></span>
                  </div>
                </div>
                
                {currentSamples.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{currentSamples.length}</div>
                      <div className="text-sm text-blue-800">Total Samples</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-sm text-green-800">Confidence Level</div>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">5%</div>
                      <div className="text-sm text-purple-800">Tolerable Error</div>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {((currentSamples.length / populationSize) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-orange-800">Coverage</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample List */}
              {currentSamples.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">Sample Dates</h4>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Download className="inline w-4 h-4 mr-1" />
                        Export CSV
                      </button>
                      <button
                        onClick={handleGenerateSamplesClick}
                        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                      >
                        <Shuffle className="inline w-4 h-4 mr-1" />
                        Regenerate
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-4">
                      {currentSamples.map((sample, index) => (
                        <div
                          key={sample.id}
                          className="p-3 bg-gray-50 rounded-md text-center hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(sample.sampleDate)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Sample #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Samples Generated</h3>
                  <p className="text-gray-600 mb-4">
                    Configure your sampling parameters and generate samples to continue.
                  </p>
                  <button
                    onClick={() => setActiveTab('configuration')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Back to Configuration
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {currentSamples.length > 0 && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setActiveTab('configuration')}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back to Configuration
                  </button>
                  <button
                    onClick={() => setActiveTab('review')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Review & Approve
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'review' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Review Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <CheckCircle className="inline w-5 h-5 mr-2" />
                  Sampling Review
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Configuration Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Methodology:</span>
                        <span className="font-medium capitalize">{config.methodology} Sampling</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sample Size:</span>
                        <span className="font-medium">{currentSamples.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Population Size:</span>
                        <span className="font-medium">{populationSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence Level:</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tolerable Error:</span>
                        <span className="font-medium">5%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Statistical Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coverage Percentage:</span>
                        <span className="font-medium">
                          {((currentSamples.length / populationSize) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sample Adequacy:</span>
                        <span className="font-medium text-green-600">Adequate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Sample Dates Preview</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {currentSamples.slice(0, 20).map((sample, index) => (
                    <div key={sample.id} className="p-2 bg-gray-50 rounded text-center text-sm">
                      {formatDate(sample.sampleDate)}
                    </div>
                  ))}
                  {currentSamples.length > 20 && (
                    <div className="p-2 bg-gray-100 rounded text-center text-sm text-gray-500">
                      +{currentSamples.length - 20} more...
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Actions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Approval & Next Steps</h4>
                <p className="text-gray-600 mb-4">
                  Review the sampling configuration and generated dates above. Once approved, 
                  you can create evidence requests for the selected sample dates.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setActiveTab('generation')}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back to Samples
                  </button>
                  <button
                    onClick={handleApproveSamplesClick}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="inline w-4 h-4 mr-2" />
                    Approve Samples
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Evidence Request Creation */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <Send className="inline w-5 h-5 mr-2" />
                  Create Evidence Request
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Generate formal evidence requests for the approved sample dates. 
                  These requests will be sent to the appropriate personnel for evidence collection.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Request Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Control ID:</span>
                        <span className="font-medium">{controlId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sample Dates:</span>
                        <span className="font-medium">{currentSamples.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Request Type:</span>
                        <span className="font-medium">Sample-based Evidence</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className="font-medium">Medium</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Evidence Requirements</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Documentation for each selected date</li>
                      <li>• Supporting transaction records</li>
                      <li>• Approval evidence where applicable</li>
                      <li>• System-generated reports</li>
                      <li>• Management review documentation</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setActiveTab('review')}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back to Review
                  </button>
                  <button
                    onClick={handleCreateEvidenceRequestClick}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Send className="inline w-4 h-4 mr-2" />
                    Create Evidence Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="text-sm text-gray-500">
            {currentSamples.length > 0 
              ? `${currentSamples.length} samples generated • ${config.methodology} methodology`
              : 'Configure sampling parameters to generate samples'
            }
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}