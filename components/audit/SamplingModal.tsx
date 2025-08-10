// components/audit/SamplingModal.tsx - FIXED import/export issue

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
  Send,
  Info
} from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';
import { SamplingConfig, GeneratedSample, EvidenceRequest } from '../../types';
import { 
  createSamplingConfigFromControlData, 
  SamplingEngine
} from '../../utils/samplingEngine';

interface SamplingModalProps {
  isOpen: boolean;
  onClose: () => void;
  controlId: string;
  controlDescription: string;
  auditPeriod: {
    startDate: Date;
    endDate: Date;
  };
  generatedSamples: GeneratedSample[];
  onSave: () => void;
  onApprove: () => void;
  onCreateEvidenceRequest: () => void;
  controlData?: {
    'Control frequency': string;
    'PwC risk rating (H/M/L)': string;
    [key: string]: any;
  };
}

type TabType = 'configuration' | 'generation' | 'review' | 'evidence';

interface FrequencyInfo {
  frequency: string;
  samplesPerYear: number;
  requiresSampling: boolean;
  description: string;
}

// Frequency information for display - matches Excel data exactly
const FREQUENCY_DISPLAY_INFO: FrequencyInfo[] = [
  { frequency: 'Annually', samplesPerYear: 1, requiresSampling: true, description: 'One sample per year' },
  { frequency: 'Quarterly', samplesPerYear: 4, requiresSampling: true, description: 'One sample per quarter' },
  { frequency: 'Monthly', samplesPerYear: 6, requiresSampling: true, description: 'Sample every other month' },
  { frequency: 'Weekly', samplesPerYear: 8, requiresSampling: true, description: 'Sample ~2 per quarter' },
  { frequency: 'Daily', samplesPerYear: 12, requiresSampling: true, description: 'Sample ~1 per month' },
  { frequency: 'Bi-weekly', samplesPerYear: 6, requiresSampling: true, description: 'Sample every other month' },
  { frequency: 'Semi-annually', samplesPerYear: 2, requiresSampling: true, description: 'Two samples per year' },
  { frequency: 'Continuous', samplesPerYear: 0, requiresSampling: false, description: 'No sampling - ongoing monitoring' },
  { frequency: 'As needed', samplesPerYear: 0, requiresSampling: false, description: 'No sampling - event-driven' },
  { frequency: 'One-time', samplesPerYear: 0, requiresSampling: false, description: 'No sampling - single event' },
  { frequency: 'Ad hoc', samplesPerYear: 0, requiresSampling: false, description: 'No sampling - irregular basis' }
];

export default function SamplingModal({
  isOpen,
  onClose,
  controlId,
  controlDescription,
  auditPeriod,
  onSave,
  onApprove,
  onCreateEvidenceRequest,
  controlData
}: SamplingModalProps) {
  const { 
    samplingConfigs, 
    generatedSamples,
    handleSamplingConfigSave,
    handleGenerateSamples,
    handleApproveSamples,
    handleCreateEvidenceRequest,
    user
  } = useAppState();
  
  const [activeTab, setActiveTab] = useState<TabType>('configuration');
  const [populationSize, setPopulationSize] = useState(365);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showManualOverride, setShowManualOverride] = useState(false);
  
  const [excelControlData, setExcelControlData] = useState(controlData || {
    'Control frequency': 'Annually',
    'PwC risk rating (H/M/L)': 'M'
  });
  
  const [config, setConfig] = useState<SamplingConfig>({
    id: '',
    controlId: '',
    sampleSize: 1,
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

  // Get persisted samples for this control's config
  //const currentConfig = samplingConfigs.find(c => c.controlId === controlId);
  //const currentSamples = currentConfig ? generatedSamples.filter(s => s.samplingConfigId === currentConfig.id) : [];
// Get persisted samples for this control's config - FIXED: Find ALL configs
const controlConfigs = samplingConfigs.filter(c => c.controlId === controlId);
const configIds = controlConfigs.map(c => c.id);
const currentSamples = generatedSamples.filter(s => configIds.includes(s.samplingConfigId));
const currentConfig = controlConfigs.length > 0 ? controlConfigs[controlConfigs.length - 1] : null;

// 🔍 DEBUG: Add this line
console.log('🔍 SamplingModal Debug:', { controlId, controlConfigs: controlConfigs.length, configIds, currentSamples: currentSamples.length, generatedSamples: generatedSamples.length });



  // Calculate frequency-based configuration
  const calculateFrequencyBasedConfig = (controlData: any) => {
    const requiresSampling = SamplingEngine.shouldSampleControl(controlData);
    
    if (!requiresSampling) {
      return {
        sampleSize: 0,
        methodology: 'random' as const,
        requiresSampling: false,
        notes: `No sampling required for frequency: ${controlData['Control frequency']}`
      };
    }

    const sampleSize = SamplingEngine.calculateSampleSizeFromFrequency(controlData, 12);
    const methodology = SamplingEngine.getSamplingMethodology(controlData);
    
    const result = {
      sampleSize,
      methodology,
      requiresSampling: true,
      notes: `Frequency-based sampling: ${controlData['Control frequency']} (${sampleSize} samples), Risk: ${controlData['PwC risk rating (H/M/L)']} (${methodology} methodology)`
    };
    
    return result;
  };

  // Get frequency information for display
  const getFrequencyInfo = (frequency: string): FrequencyInfo | null => {
    return FREQUENCY_DISPLAY_INFO.find(f => 
      f.frequency.toLowerCase() === frequency.toLowerCase()
    ) || null;
  };

  // Initialize configuration
  useEffect(() => {
    if (isOpen && controlId) {
      const existingConfig = samplingConfigs.find(c => c.controlId === controlId);
      if (existingConfig) {
        setConfig(existingConfig);
        setPopulationSize(365);
      } else {
        const frequencyConfig = calculateFrequencyBasedConfig(excelControlData);
        
        const auditStartDate = auditPeriod.startDate.toISOString().split('T')[0];
        const auditEndDate = auditPeriod.endDate.toISOString().split('T')[0];
        
        const quarters = frequencyConfig.requiresSampling ? 
          SamplingEngine.createTimePeriodsFromFrequency(excelControlData, auditStartDate, auditEndDate) : 
          [];

        const defaultConfig: SamplingConfig = {
          id: `sampling-${controlId}-${Date.now()}`,
          controlId,
          sampleSize: frequencyConfig.sampleSize,
          methodology: frequencyConfig.methodology,
          timePeriod: {
            type: 'calendar_quarters',
            startDate: auditStartDate,
            endDate: auditEndDate,
            quarters
          },
          minimumInterval: frequencyConfig.methodology === 'judgmental' ? 7 : 1,
          seed: Math.floor(Math.random() * 10000),
          createdAt: new Date().toISOString(),
          createdBy: user?.email || 'system',
          status: 'draft',
          notes: frequencyConfig.notes
        };
        
        setConfig(defaultConfig);
        setPopulationSize(365);
      }
    }
  }, [isOpen, controlId, samplingConfigs, user?.email, auditPeriod, excelControlData]);

  // Reset to appropriate tab when opening
  useEffect(() => {
    if (isOpen) {
      // Auto-navigate to generation tab if samples exist
      if (currentSamples.length > 0) {
        // Check if samples are approved
        if (currentConfig?.status === 'approved') {
          setActiveTab('review'); // Show approved samples
        } else {
          setActiveTab('generation'); // Show samples for review
        }
      } else {
        setActiveTab('configuration'); // Show configuration
      }
    }
  }, [isOpen, currentSamples.length, currentConfig?.status]);

  // Handle Excel data changes with proper recalculation
  const handleExcelDataChange = (field: string, value: string) => {
    const updatedData = { ...excelControlData, [field]: value };
    setExcelControlData(updatedData);
    
    const frequencyConfig = calculateFrequencyBasedConfig(updatedData);
    
    setConfig(prev => ({
      ...prev,
      sampleSize: frequencyConfig.sampleSize,
      methodology: frequencyConfig.methodology,
      notes: frequencyConfig.notes
    }));
  };

  // Validation function
  const validateConfiguration = () => {
    const errors: string[] = [];
    
    if (!SamplingEngine.shouldSampleControl(excelControlData)) {
      return [];
    }
    
    if (config.sampleSize <= 0) {
      errors.push('Sample size must be greater than 0.');
    }
    
    if (config.sampleSize > populationSize) {
      errors.push('Sample size cannot exceed population size.');
    }
    
    return errors;
  };

  // Generate samples with enhanced error handling
  const handleGenerateSamplesClick = async () => {
    setIsGenerating(true);
    
    try {
      const requiresSampling = SamplingEngine.shouldSampleControl(excelControlData);
      
      if (!requiresSampling) {
        alert(`This control does not require sampling based on its frequency: "${excelControlData['Control frequency']}"`);
        return;
      }
      
      const errors = validateConfiguration();
      if (errors.length > 0) {
        alert('Configuration errors:\n' + errors.join('\n'));
        return;
      }
      
      const engineConfig = createSamplingConfigFromControlData(
        controlId,
        excelControlData,
        auditPeriod.startDate.toISOString().split('T')[0],
        auditPeriod.endDate.toISOString().split('T')[0]
      );
      
      if (!engineConfig) {
        alert('Unable to create sampling configuration for this control.');
        return;
      }
      
      const configToSave: SamplingConfig = {
        ...engineConfig,
        status: 'generated'
      };
      
      handleSamplingConfigSave(configToSave);
      setConfig(configToSave);
      
      const samples = SamplingEngine.generateSamples(configToSave);
      
      handleGenerateSamples(configToSave, samples);
      
      console.log('✅ Sample generation completed successfully');
      setActiveTab('generation');
      
    } catch (error) {
      console.error('❌ Error generating samples:', error);
      alert('Failed to generate samples. Please check the console for details and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle approve samples
  const handleApproveSamplesClick = () => {
    if (currentConfig) {
      handleApproveSamples(currentConfig.id);
      setActiveTab('evidence');
    }
  };

  // Handle evidence request creation
  const handleCreateEvidenceRequestClick = () => {
    if (!currentConfig || currentSamples.length === 0) {
      alert('No samples available to create evidence request.');
      return;
    }

    const evidenceRequest: EvidenceRequest = {
      id: `evidence-req-${controlId}-${Date.now()}`,
      controlId: controlId,
      samplingConfigId: currentConfig.id,
      type: 'sampling',
      status: 'sent',
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'auditor',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      title: `Evidence Request - ${controlDescription}`,
      samplingDetails: {
        methodology: currentConfig.methodology,
        sampleSize: currentSamples.length,
        selectedDates: currentSamples.map(sample => sample.sampleDate),
        populationDescription: `Audit period: ${auditPeriod.startDate.toISOString().split('T')[0]} to ${auditPeriod.endDate.toISOString().split('T')[0]}`,
        samplingRationale: `${currentConfig.methodology} sampling methodology selected based on control frequency: ${excelControlData['Control frequency']} and risk rating: ${excelControlData['PwC risk rating (H/M/L)']}`
      },
      instructions: `For each sample date, please provide:
        1. Supporting documentation showing the control was performed
        2. Evidence of proper authorization/approval where applicable
        3. System-generated reports or logs as available
        4. Any additional documentation demonstrating control effectiveness`,
      priority: currentConfig.methodology === 'judgmental' ? 'high' : 'medium'
    };

    handleCreateEvidenceRequest(evidenceRequest);
    onCreateEvidenceRequest();
    
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
  const frequencyInfo = getFrequencyInfo(excelControlData['Control frequency']);
  const requiresSampling = SamplingEngine.shouldSampleControl(excelControlData);

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
              {/* Excel Control Data Section */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">
                  <FileText className="inline w-5 h-5 mr-2" />
                  Control Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Control Frequency (Excel Column F)
                    </label>
                    <select
                      value={excelControlData['Control frequency']}
                      onChange={(e) => handleExcelDataChange('Control frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {FREQUENCY_DISPLAY_INFO.map(freq => (
                        <option key={freq.frequency} value={freq.frequency}>
                          {freq.frequency}
                        </option>
                      ))}
                    </select>
                    {frequencyInfo && (
                      <p className="text-xs text-blue-700 mt-1">
                        {frequencyInfo.description} • {frequencyInfo.samplesPerYear} samples/year
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      PwC Risk Rating (Excel Column E)
                    </label>
                    <select
                      value={excelControlData['PwC risk rating (H/M/L)']}
                      onChange={(e) => handleExcelDataChange('PwC risk rating (H/M/L)', e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="H">High (H)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Low (L)</option>
                    </select>
                    <p className="text-xs text-blue-700 mt-1">
                      Risk determines sampling methodology: H=Judgmental, M=Systematic, L=Random
                    </p>
                  </div>
                </div>

                {/* Sampling Requirements Alert */}
                {!requiresSampling && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md">
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        No Sampling Required
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Controls with frequency "{excelControlData['Control frequency']}" do not require sample-based testing.
                      These are typically continuous monitoring or event-driven controls.
                    </p>
                  </div>
                )}
              </div>

              {requiresSampling && (
                <>
                  {/* Configuration Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Calculated Parameters */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Calculated Sampling Parameters
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Methodology (Auto-Selected)
                            </label>
                            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                              {config.methodology.charAt(0).toUpperCase() + config.methodology.slice(1)} Sampling
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {getMethodologyDescription(config.methodology)}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sample Size (Calculated)
                              </label>
                              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 font-medium">
                                {config.sampleSize}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Population Size
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={populationSize}
                                onChange={(e) => setPopulationSize(Math.max(1, parseInt(e.target.value) || 365))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Validation & Info */}
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
                </>
              )}

              {/* No Sampling Required Actions */}
              {!requiresSampling && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="inline w-4 h-4 mr-2" />
                    Acknowledge - No Sampling Required
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Other tabs - generation, review, evidence */}
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
                    <span>Frequency: <strong>{excelControlData['Control frequency']}</strong></span>
                    <span>Methodology: <strong>{config.methodology}</strong></span>
                    <span>Sample Size: <strong>{currentSamples.length}</strong></span>
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
                      <button 
                        onClick={() => {/* Export functionality */}}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
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

              {/* Action Buttons - Review workflow */}
              {currentSamples.length > 0 && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setActiveTab('configuration')}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Regenerate Samples
                  </button>
                  <button
                    onClick={handleApproveSamplesClick}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="inline w-4 h-4 mr-2" />
                    Approve Samples
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
                  Sampling Review - Approved
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Configuration Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Control Frequency:</span>
                        <span className="font-medium">{excelControlData['Control frequency']}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risk Rating:</span>
                        <span className="font-medium">{excelControlData['PwC risk rating (H/M/L)']}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Methodology:</span>
                        <span className="font-medium capitalize">{config.methodology} Sampling</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sample Size:</span>
                        <span className="font-medium">{currentSamples.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">✅ Approved</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Next Steps</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>✅ Samples have been approved by the auditor</p>
                      <p>📋 Ready to create evidence requests</p>
                      <p>📧 Evidence requests will be sent to the client</p>
                      <p>📁 Client can then upload required evidence</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Request Creation */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Create Evidence Request</h4>
                <p className="text-gray-600 mb-4">
                  Create formal evidence requests for the approved sample dates. 
                  These will be sent to the client for evidence collection.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setActiveTab('generation')}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back to Samples
                  </button>
                  <button
                    onClick={handleCreateEvidenceRequestClick}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Send className="inline w-4 h-4 mr-2" />
                    Send Evidence Request to Client
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Evidence Request Sent!</h3>
                <p className="text-gray-600 mb-4">
                  The evidence request has been sent to the client. They can now upload the required evidence for the sample dates.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="text-sm text-gray-500">
            {!requiresSampling 
              ? `Control frequency: ${excelControlData['Control frequency']} • No sampling required`
              : currentSamples.length > 0 
                ? `${currentSamples.length} samples generated • ${config.methodology} methodology • Frequency: ${excelControlData['Control frequency']}`
                : `Control frequency: ${excelControlData['Control frequency']} • Risk: ${excelControlData['PwC risk rating (H/M/L)']} • Configure sampling parameters`
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