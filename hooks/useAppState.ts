// hooks/useAppState.ts - FIXED: Now uses frequency-based sampling engine instead of hardcoded logic
import { useState, useEffect } from 'react';
import { 
  AuditFormData, 
  ExcelData, 
  Audit, 
  UploadedFile,
  SamplingConfig,
  GeneratedSample,
  EvidenceRequest,
  EvidenceSubmission,
  ControlClassification,
  SamplingAuditLog
} from '../types';
import { createSamplingConfigFromControlData, SamplingEngine } from '../utils/samplingEngine';

type ViewType = 'login' | 'dashboard' | 'create-audit' | 'audit-setup';

// localStorage keys
const STORAGE_KEYS = {
  SAMPLING_CONFIGS: 'audit_sampling_configs',
  GENERATED_SAMPLES: 'audit_generated_samples',
  EVIDENCE_REQUESTS: 'audit_evidence_requests',
  EVIDENCE_SUBMISSIONS: 'audit_evidence_submissions',
  CONTROL_CLASSIFICATIONS: 'audit_control_classifications',
  SAMPLING_AUDIT_LOGS: 'audit_sampling_logs',
  CURRENT_AUDIT: 'current_audit_data'
};

// Helper functions for localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Saved ${key} to localStorage:`, data.length || Object.keys(data).length);
  } catch (error) {
    console.error(`❌ Failed to save ${key} to localStorage:`, error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log(`📂 Loaded ${key} from localStorage:`, parsed.length || Object.keys(parsed).length);
      return parsed;
    }
  } catch (error) {
    console.error(`❌ Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

const clearStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Cleared ${key} from localStorage`);
  });
};

// 🔧 HELPER FUNCTIONS - Type-safe normalization functions
function normalizeRiskLevel(riskLevel?: string): 'high' | 'medium' | 'low' {
  if (!riskLevel) return 'medium';
  const normalized = riskLevel.toLowerCase();
  if (normalized === 'h' || normalized === 'high') return 'high';
  if (normalized === 'l' || normalized === 'low') return 'low';
  return 'medium';
}

function normalizeFrequency(frequency?: string): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'adhoc' {
  if (!frequency) return 'monthly';
  const normalized = frequency.toLowerCase().trim();
  
  // Map Excel frequency values to our type system
  if (normalized === 'annually' || normalized === 'annual') return 'annually';
  if (normalized === 'quarterly') return 'quarterly';
  if (normalized === 'monthly') return 'monthly';
  if (normalized === 'weekly') return 'weekly';
  if (normalized === 'daily') return 'daily';
  if (normalized === 'as needed' || normalized === 'adhoc' || normalized === 'ad hoc') return 'adhoc';
  if (normalized === 'continuous') return 'adhoc'; // Map continuous to adhoc for type compatibility
  
  // Default fallback
  console.warn(`Unknown frequency "${frequency}", defaulting to monthly`);
  return 'monthly';
}

function determineControlType(description?: string): 'automated' | 'manual' | 'hybrid' {
  if (!description) return 'hybrid';
  const desc = description.toLowerCase();
  
  const automatedKeywords = ['automated', 'system', 'application', 'scheduled'];
  const manualKeywords = ['manual', 'review', 'approval', 'inspection', 'verification'];
  
  const isAutomated = automatedKeywords.some(keyword => desc.includes(keyword));
  const isManual = manualKeywords.some(keyword => desc.includes(keyword));
  
  if (isAutomated && !isManual) return 'automated';
  if (isManual && !isAutomated) return 'manual';
  return 'hybrid';
}

export const useAppState = () => {
  // Existing state
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [extractedData, setExtractedData] = useState<ExcelData | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentModule, setCurrentModule] = useState('overview');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // NEW: Sampling state management with localStorage persistence
  const [samplingConfigs, setSamplingConfigs] = useState<SamplingConfig[]>([]);
  const [generatedSamples, setGeneratedSamples] = useState<GeneratedSample[]>([]);
  const [evidenceRequests, setEvidenceRequests] = useState<EvidenceRequest[]>([]);
  const [evidenceSubmissions, setEvidenceSubmissions] = useState<EvidenceSubmission[]>([]);
  const [controlClassifications, setControlClassifications] = useState<ControlClassification[]>([]);
  const [samplingAuditLogs, setSamplingAuditLogs] = useState<SamplingAuditLog[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    console.log('🔄 Loading sampling data from localStorage...');
    
    setSamplingConfigs(loadFromStorage(STORAGE_KEYS.SAMPLING_CONFIGS, []));
    setGeneratedSamples(loadFromStorage(STORAGE_KEYS.GENERATED_SAMPLES, []));
    setEvidenceRequests(loadFromStorage(STORAGE_KEYS.EVIDENCE_REQUESTS, []));
    setEvidenceSubmissions(loadFromStorage(STORAGE_KEYS.EVIDENCE_SUBMISSIONS, []));
    setControlClassifications(loadFromStorage(STORAGE_KEYS.CONTROL_CLASSIFICATIONS, []));
    setSamplingAuditLogs(loadFromStorage(STORAGE_KEYS.SAMPLING_AUDIT_LOGS, []));
    
    // Load current audit if exists
    const currentAuditData = loadFromStorage(STORAGE_KEYS.CURRENT_AUDIT, null);
    if (currentAuditData) {
      setSelectedAudit(currentAuditData.audit);
      setExtractedData(currentAuditData.extractedData);
      console.log('📋 Restored current audit session');
    }
  }, []);

  // Auto-save sampling data to localStorage whenever it changes
  useEffect(() => {
    if (samplingConfigs.length > 0) {
      saveToStorage(STORAGE_KEYS.SAMPLING_CONFIGS, samplingConfigs);
    }
  }, [samplingConfigs]);

  useEffect(() => {
    if (generatedSamples.length > 0) {
      saveToStorage(STORAGE_KEYS.GENERATED_SAMPLES, generatedSamples);
    }
  }, [generatedSamples]);

  useEffect(() => {
    if (evidenceRequests.length > 0) {
      saveToStorage(STORAGE_KEYS.EVIDENCE_REQUESTS, evidenceRequests);
    }
  }, [evidenceRequests]);

  useEffect(() => {
    if (evidenceSubmissions.length > 0) {
      saveToStorage(STORAGE_KEYS.EVIDENCE_SUBMISSIONS, evidenceSubmissions);
    }
  }, [evidenceSubmissions]);

  useEffect(() => {
    if (controlClassifications.length > 0) {
      saveToStorage(STORAGE_KEYS.CONTROL_CLASSIFICATIONS, controlClassifications);
    }
  }, [controlClassifications]);

  useEffect(() => {
    if (samplingAuditLogs.length > 0) {
      saveToStorage(STORAGE_KEYS.SAMPLING_AUDIT_LOGS, samplingAuditLogs);
    }
  }, [samplingAuditLogs]);

  // Save current audit session
  useEffect(() => {
    if (selectedAudit) {
      saveToStorage(STORAGE_KEYS.CURRENT_AUDIT, {
        audit: selectedAudit,
        extractedData
      });
    }
  }, [selectedAudit, extractedData]);

  // Existing handlers
  const handleLogin = (email: string, password: string) => {
    if (email && password) {
      setUser({ name: email.split('@')[0], email });
      setCurrentView('dashboard');
    } else {
      alert('Please enter email and password');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setSelectedAudit(null);
    setExtractedData(null);
    setUploadedFiles([]);
    setCurrentModule('overview');
    
    // Clear sampling state and localStorage
    setSamplingConfigs([]);
    setGeneratedSamples([]);
    setEvidenceRequests([]);
    setEvidenceSubmissions([]);
    setControlClassifications([]);
    setSamplingAuditLogs([]);
    clearStorage();
  };

  const handleAuditSubmit = (formData: AuditFormData, excelData?: ExcelData) => {
    console.log('🎉 Audit submitted successfully:', {
      formData,
      excelData: excelData ? {
        controls: excelData.controls.length,
        itacs: excelData.itacs.length,
        keyReports: excelData.keyReports.length,
        applications: excelData.applications?.length || 0
      } : null
    });

    const newAudit: Audit = {
      id: `audit-${Date.now()}`,
      clientName: formData.companyName,
      clientId: formData.clientId || `CLIENT-${Date.now()}`,
      website: formData.website || '',
      relationshipOwner: formData.clientLead || 'Unknown',
      auditOwner: formData.auditLead || 'Unknown',
      progress: 0,
      companyName: formData.companyName,
      auditType: formData.auditType,
      riskAssessment: 'Medium',
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'planning',
      createdAt: new Date().toISOString(),
      clientLead: formData.clientLead,
      auditLead: formData.auditLead
    };

    if (excelData) {
      console.log('📊 Storing extracted Excel data:', excelData);
      setExtractedData(excelData);
      
      // FIXED: Use new frequency-based auto-classification
      handleAutoClassifyControlsWithFrequencyEngine(excelData, newAudit);
    }

    setSelectedAudit(newAudit);
    setCurrentView('audit-setup');
    console.log(`✅ Audit created successfully for ${formData.companyName}!`);
  };

  const handleFileUpload = (fileList: FileList) => {
    const files = Array.from(fileList);
    console.log('📁 Files uploaded:', files.map(f => f.name));
    
    const newUploadedFiles: UploadedFile[] = files.map(file => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      status: 'completed'
    }));

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
  };

  // Navigation handlers
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedAudit(null);
    setExtractedData(null);
    setUploadedFiles([]);
    setCurrentModule('overview');
    // Don't clear sampling data - keep it in localStorage
  };

  const handleCreateNewAudit = () => {
    setCurrentView('create-audit');
  };

  const handleContinueAudit = () => {
    setCurrentView('audit-setup');
  };

  // 🔧 FIXED: NEW frequency-based auto-classification using samplingEngine
  const handleAutoClassifyControlsWithFrequencyEngine = (excelData: ExcelData, audit: Audit) => {
    console.log('🚀 Auto-classifying controls using NEW frequency-based engine...');
    console.log('🔍 Current samplingConfigs length:', samplingConfigs.length);
    console.log('🔍 Current samplingConfigs:', samplingConfigs.map(c => c.controlId));
    
    const classifications: ControlClassification[] = [];
    const newSamplingConfigs: SamplingConfig[] = [];
    
    // Process ITGCs
    excelData.controls.forEach(control => {
      console.log(`🔍 Processing control: ${control.id}`);
      
      // FIXED: Create ControlData object from Excel row data
      const controlData = {
        'Control frequency': control.frequency || 'Monthly', // Column F
        'PwC risk rating (H/M/L)': control.riskLevel || 'M', // Column E
        // Include any other properties that might be needed
        ...control
      };
      
      // Use frequency-based engine to determine if sampling is required
      const requiresSampling = SamplingEngine.shouldSampleControl(controlData);
      
      // Create classification using new engine
      const classification: ControlClassification = {
        controlId: control.id,
        requiresSampling,
        riskLevel: normalizeRiskLevel(control.riskLevel),
        controlType: determineControlType(control.description),
        frequency: normalizeFrequency(control.frequency),
        confidence: 0.95, // High confidence with frequency-based classification
        detectedKeywords: [], // Not needed with frequency-based approach
        suggestedSampleSize: requiresSampling ? SamplingEngine.calculateSampleSizeFromFrequency(controlData) : 0,
        suggestedMethodology: SamplingEngine.getSamplingMethodology(controlData),
        classifiedAt: new Date().toISOString()
      };
      
      classifications.push(classification);
      
      console.log(`🔍 Control ${control.id} - requiresSampling: ${classification.requiresSampling}, sampleSize: ${classification.suggestedSampleSize}`);
      
      // FIXED: Check current state, not localStorage
      if (classification.requiresSampling) {
        const existingConfig = samplingConfigs.find(c => c.controlId === control.id);
        console.log(`🔍 Control ${control.id} - existingConfig found: ${!!existingConfig}`);
        
        if (!existingConfig) {
          console.log(`✅ Creating new frequency-based config for control: ${control.id}`);
          
          // FIXED: Use new frequency-based engine
          const samplingConfig = createSamplingConfigFromControlData(
            control.id,
            controlData,
            audit.startDate,
            audit.endDate
          );
          
          if (samplingConfig) {
            // Override system values with user context
            samplingConfig.createdBy = user?.email || 'system';
            newSamplingConfigs.push(samplingConfig);
            console.log(`🎯 Created config: ${samplingConfig.sampleSize} samples using ${samplingConfig.methodology} methodology`);
          } else {
            console.log(`⚠️ No sampling config created for ${control.id} - control doesn't require sampling`);
          }
        } else {
          console.log(`⚠️ Skipping ${control.id} - config already exists`);
        }
      } else {
        console.log(`⚠️ Skipping ${control.id} - no sampling required (frequency: ${control.frequency})`);
      }
    });

    // Process ITACs with same logic
    excelData.itacs.forEach(itac => {
      console.log(`🔍 Processing ITAC: ${itac.id}`);
      
      // FIXED: Create ControlData object from Excel row data
      const controlData = {
        'Control frequency': itac.frequency || 'Monthly', // Column F
        'PwC risk rating (H/M/L)': itac.riskLevel || 'M', // Column E
        // Include any other properties that might be needed
        ...itac
      };
      
      // Use frequency-based engine to determine if sampling is required
      const requiresSampling = SamplingEngine.shouldSampleControl(controlData);
      
      // Create classification using new engine
      const classification: ControlClassification = {
        controlId: itac.id,
        requiresSampling,
        riskLevel: normalizeRiskLevel(itac.riskLevel),
        controlType: determineControlType(itac.description || itac.controlName || ''),
        frequency: normalizeFrequency(itac.frequency),
        confidence: 0.95, // High confidence with frequency-based classification
        detectedKeywords: [], // Not needed with frequency-based approach
        suggestedSampleSize: requiresSampling ? SamplingEngine.calculateSampleSizeFromFrequency(controlData) : 0,
        suggestedMethodology: SamplingEngine.getSamplingMethodology(controlData),
        classifiedAt: new Date().toISOString()
      };
      
      classifications.push(classification);
      
      console.log(`🔍 ITAC ${itac.id} - requiresSampling: ${classification.requiresSampling}, sampleSize: ${classification.suggestedSampleSize}`);
      
      // FIXED: Check current state, not localStorage
      if (classification.requiresSampling) {
        const existingConfig = samplingConfigs.find(c => c.controlId === itac.id);
        console.log(`🔍 ITAC ${itac.id} - existingConfig found: ${!!existingConfig}`);
        
        if (!existingConfig) {
          console.log(`✅ Creating new frequency-based config for ITAC: ${itac.id}`);
          
          // FIXED: Use new frequency-based engine
          const samplingConfig = createSamplingConfigFromControlData(
            itac.id,
            controlData,
            audit.startDate,
            audit.endDate
          );
          
          if (samplingConfig) {
            // Override system values with user context
            samplingConfig.createdBy = user?.email || 'system';
            newSamplingConfigs.push(samplingConfig);
            console.log(`🎯 Created config: ${samplingConfig.sampleSize} samples using ${samplingConfig.methodology} methodology`);
          } else {
            console.log(`⚠️ No sampling config created for ${itac.id} - control doesn't require sampling`);
          }
        } else {
          console.log(`⚠️ Skipping ${itac.id} - config already exists`);
        }
      } else {
        console.log(`⚠️ Skipping ${itac.id} - no sampling required (frequency: ${itac.frequency})`);
      }
    });

    console.log(`🔍 Final results using NEW frequency-based engine:`);
    console.log(`   - Classifications created: ${classifications.length}`);
    console.log(`   - New configs to create: ${newSamplingConfigs.length}`);
    console.log(`   - New config control IDs: ${newSamplingConfigs.map(c => c.controlId)}`);
    console.log(`   - Sample sizes: ${newSamplingConfigs.map(c => `${c.controlId}:${c.sampleSize}`).join(', ')}`);

    // Update state - replace existing classifications, only add new configs
    setControlClassifications(classifications);
    if (newSamplingConfigs.length > 0) {
      setSamplingConfigs(prev => [...prev, ...newSamplingConfigs]);
    }
    
    // Log the classification and config creation
    const auditLog: SamplingAuditLog = {
      id: `log-${Date.now()}`,
      samplingConfigId: 'auto-classification-frequency-based',
      action: 'created',
      performedBy: user?.email || 'system',
      performedAt: new Date().toISOString(),
      details: `Auto-classified ${classifications.length} controls using frequency-based engine and created ${newSamplingConfigs.length} sampling configurations`
    };
    setSamplingAuditLogs(prev => [...prev, auditLog]);

    console.log(`✅ Auto-classified ${classifications.length} controls using NEW frequency-based engine`);
    console.log(`✅ Created ${newSamplingConfigs.length} sampling configurations with proper frequency-based sample sizes`);
  };

  // Create or update sampling configuration
  const handleSamplingConfigSave = (config: SamplingConfig) => {
    console.log('💾 Saving sampling configuration:', config.id);
    
    setSamplingConfigs(prev => {
      const existingIndex = prev.findIndex(c => c.id === config.id);
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev];
        updated[existingIndex] = config;
        return updated;
      } else {
        // Add new
        return [...prev, config];
      }
    });

    // Log the action
    const auditLog: SamplingAuditLog = {
      id: `log-${Date.now()}`,
      samplingConfigId: config.id,
      action: config.status === 'draft' ? 'created' : 'modified',
      performedBy: user?.email || 'unknown',
      performedAt: new Date().toISOString(),
      details: `Sampling configuration ${config.status === 'draft' ? 'created' : 'updated'} for control ${config.controlId}`
    };
    setSamplingAuditLogs(prev => [...prev, auditLog]);

    console.log(`✅ Sampling configuration saved: ${config.id}`);
  };

  // Generate samples for a sampling configuration
  const handleGenerateSamples = (samplingConfig: SamplingConfig, samples: GeneratedSample[]) => {
    console.log('🎯 Generating samples:', samples.length);
    
    // Remove existing samples for this config
    setGeneratedSamples(prev => prev.filter(s => s.samplingConfigId !== samplingConfig.id));
    
    // Add new samples
    setGeneratedSamples(prev => [...prev, ...samples]);

    // Update config status
    setSamplingConfigs(prev => prev.map(config => 
      config.id === samplingConfig.id 
        ? { ...config, status: 'generated' }
        : config
    ));

    // Log the generation
    const auditLog: SamplingAuditLog = {
      id: `log-${Date.now()}`,
      samplingConfigId: samplingConfig.id,
      action: 'regenerated',
      performedBy: user?.email || 'unknown',
      performedAt: new Date().toISOString(),
      details: `Generated ${samples.length} samples using ${samplingConfig.methodology} methodology`
    };
    setSamplingAuditLogs(prev => [...prev, auditLog]);

    console.log(`✅ Generated ${samples.length} samples for ${samplingConfig.id}`);
  };

  // NEW: Approve samples (auditor workflow)
  const handleApproveSamples = (samplingConfigId: string) => {
    console.log('✅ Approving samples for config:', samplingConfigId);
    
    // Update config status
    setSamplingConfigs(prev => prev.map(config => 
      config.id === samplingConfigId 
        ? { ...config, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: user?.email || 'unknown' }
        : config
    ));

    // Update all samples for this config
    setGeneratedSamples(prev => prev.map(sample => 
      sample.samplingConfigId === samplingConfigId 
        ? { ...sample, status: 'approved' }
        : sample
    ));

    // Log the approval
    const auditLog: SamplingAuditLog = {
      id: `log-${Date.now()}`,
      samplingConfigId,
      action: 'approved',
      performedBy: user?.email || 'unknown',
      performedAt: new Date().toISOString(),
      details: 'Sample selection approved by auditor'
    };
    setSamplingAuditLogs(prev => [...prev, auditLog]);

    console.log(`✅ Samples approved for ${samplingConfigId}`);
  };

  // UPDATED: Create evidence request with status change - FIXED: Pass current state for immediate checks
  const handleCreateEvidenceRequest = (request: EvidenceRequest) => {
    console.log('📤 Creating evidence request:', request.id);
    
    // Update state with new request FIRST
    const updatedRequests = [...evidenceRequests, request];
    setEvidenceRequests(updatedRequests);
    console.log('🔍 AFTER SETTING STATE - evidenceRequests length:', updatedRequests.length);

    // FIXED: Update sampling config status from 'approved' to 'sent'
    if (request.samplingConfigId) {
      setSamplingConfigs(prev => prev.map(config => 
        config.id === request.samplingConfigId 
          ? { ...config, status: 'sent' }
          : config
      ));

      // Log the action
      const auditLog: SamplingAuditLog = {
        id: `log-${Date.now()}`,
        samplingConfigId: request.samplingConfigId,
        action: 'sent',
        performedBy: user?.email || 'unknown',
        performedAt: new Date().toISOString(),
        details: `Evidence request sent to client with ${request.samplingDetails?.selectedDates.length || 0} sample dates`
      };
      setSamplingAuditLogs(prev => [...prev, auditLog]);
    }

    console.log(`✅ Evidence request created: ${request.id}`);
    
    // FIXED: Return status using the UPDATED React state instead of stale localStorage
    const newStatus = getSamplingStatusForControl(request.controlId, updatedRequests);
    console.log(`🔍 Current status (with updated data): ${newStatus}`);
  };

  // Update evidence request status
  const handleUpdateEvidenceRequest = (requestId: string, updates: Partial<EvidenceRequest>) => {
    console.log('📝 Updating evidence request:', requestId);
    
    setEvidenceRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, ...updates } : req
    ));
  };

  // Handle evidence submission (from client)
  const handleEvidenceSubmission = (submission: EvidenceSubmission) => {
    console.log('📥 Handling evidence submission:', submission.id);
    
    setEvidenceSubmissions(prev => [...prev, submission]);

    // Update evidence request status
    setEvidenceRequests(prev => prev.map(req => 
      req.id === submission.evidenceRequestId 
        ? { ...req, status: 'submitted', submittedAt: submission.uploadedAt }
        : req
    ));

    // Log evidence received
    const request = evidenceRequests.find(r => r.id === submission.evidenceRequestId);
    if (request?.samplingConfigId) {
      const auditLog: SamplingAuditLog = {
        id: `log-${Date.now()}`,
        samplingConfigId: request.samplingConfigId,
        action: 'evidence_received',
        performedBy: submission.uploadedBy,
        performedAt: submission.uploadedAt,
        details: `Evidence submitted: ${submission.fileName} for ${submission.sampleDate || 'general evidence'}`
      };
      setSamplingAuditLogs(prev => [...prev, auditLog]);
    }

    console.log(`✅ Evidence submission processed: ${submission.id}`);
  };

  // 🔧 FIXED: Get sampling data for a specific control - PRIORITIZE React state over localStorage
  const getSamplingDataForControl = (controlId: string, currentRequests?: EvidenceRequest[], currentSubmissions?: EvidenceSubmission[]) => {
    console.log('🔍 DEBUG: getSamplingDataForControl called for:', controlId);
    
    const config = samplingConfigs.find(c => c.controlId === controlId);
    const samples = generatedSamples.filter(s => s.samplingConfigId === config?.id);
    const classification = controlClassifications.find(c => c.controlId === controlId);
    
    // PRIORITIZE current React state over localStorage
    let requestsToUse = currentRequests;
    if (!requestsToUse || requestsToUse.length === 0) {
      console.log('🔍 DEBUG: No current requests provided, falling back to localStorage');
      requestsToUse = loadFromStorage(STORAGE_KEYS.EVIDENCE_REQUESTS, []);
    } else {
      console.log('🔍 DEBUG: Using provided React state requests, length:', requestsToUse.length);
    }
    
    let submissionsToUse = currentSubmissions;
    if (!submissionsToUse || submissionsToUse.length === 0) {
      submissionsToUse = loadFromStorage(STORAGE_KEYS.EVIDENCE_SUBMISSIONS, []);
    }
    
    const requests = requestsToUse.filter(r => r.controlId === controlId);
    const submissions = submissionsToUse.filter(s => 
      requests.some(r => r.id === s.evidenceRequestId)
    );

    return {
      config,
      samples,
      classification,
      requests,
      submissions,
      requiresSampling: classification?.requiresSampling || false,
      hasConfig: !!config,
      hasApprovedSamples: samples.filter(s => s.status === 'approved').length > 0,
      sampleCount: samples.filter(s => s.status === 'approved').length,
      evidenceRequests: requests
    };
  };

  // Get evidence status for a control - FIXED: PRIORITIZE React state over localStorage
  const getEvidenceStatusForControl = (controlId: string, currentRequests?: EvidenceRequest[], currentSubmissions?: EvidenceSubmission[]) => {
    console.log('🔍 DEBUG: Checking evidence status for', controlId);
    
    // PRIORITIZE current React state over localStorage
    let requestsToUse = currentRequests;
    if (!requestsToUse || requestsToUse.length === 0) {
      console.log('🔍 DEBUG: No current evidence data provided, falling back to localStorage');
      requestsToUse = loadFromStorage(STORAGE_KEYS.EVIDENCE_REQUESTS, []);
    }
    
    console.log('🔍 DEBUG: evidenceRequests array length:', requestsToUse.length);
    const requestsForControl = requestsToUse.filter(req => req.controlId === controlId);
    console.log('🔍 DEBUG: evidenceRequests for this control:', requestsForControl);
    
    if (requestsForControl.length === 0) {
      return 'not_requested';
    }
    
    const { submissions } = getSamplingDataForControl(controlId, currentRequests, currentSubmissions);
    
    const totalRequested = requestsForControl.reduce((sum, req) => 
      sum + (req.samplingDetails?.selectedDates.length || 1), 0
    );
    const totalSubmitted = submissions.filter(s => s.status !== 'rejected').length;
    
    if (totalSubmitted === 0) return 'pending';
    if (totalSubmitted < totalRequested) return 'partial';
    return 'complete';
  };

  // 🔧 FIXED: New status workflow implementation - EVIDENCE REQUESTS TAKE PRIORITY
  const getSamplingStatusForControl = (controlId: string, currentRequests?: EvidenceRequest[], currentSubmissions?: EvidenceSubmission[]): string => {
    console.log(`🔍 DEBUG: Checking status for ${controlId}`);
    
    // PRIORITIZE current React state over localStorage
    let requestsToUse = currentRequests;
    if (!requestsToUse || requestsToUse.length === 0) {
      console.log(`🔍 DEBUG: No current requests provided, falling back to localStorage`);
      requestsToUse = loadFromStorage(STORAGE_KEYS.EVIDENCE_REQUESTS, []);
    } else {
      console.log(`🔍 DEBUG: Using provided React state requests, length:`, requestsToUse.length);
    }
    
    console.log(`🔍 DEBUG: evidenceRequests array length:`, requestsToUse.length);
    const controlRequests = requestsToUse.filter(req => req.controlId === controlId);
    console.log(`🔍 DEBUG: evidenceRequests for this control:`, controlRequests);

    // 🔧 FIX 1: Check for evidence requests FIRST (highest priority)
    if (controlRequests.length > 0) {
      console.log(`✅ DEBUG: Found evidence request for ${controlId}, status: Evidence Request Sent`);
      return 'Evidence Request Sent';
    }

    // Get sampling data only if NO evidence requests exist
    const samplingData = getSamplingDataForControl(controlId, currentRequests, currentSubmissions);
    
    // 🔧 FIX 2: Only check sampling status if NO evidence requests exist
    if (!samplingData.requiresSampling) {
      console.log(`✅ DEBUG: ${controlId} does not require sampling, status: No Sampling Required`);
      return 'No Sampling Required';
    }

    if (!samplingData.hasConfig) {
      console.log(`✅ DEBUG: ${controlId} needs sampling config, status: Needs Sampling`);
      return 'Needs Sampling';
    }

    if (!samplingData.hasApprovedSamples) {
      console.log(`✅ DEBUG: ${controlId} has config but no approved samples, status: Sampling Configured`);
      return 'Sampling Configured';
    }

    // Should not reach here if evidence request exists, but fallback
    console.log(`✅ DEBUG: ${controlId} ready for evidence request, status: Ready for Evidence Request`);
    return 'Ready for Evidence Request';
  };

  // ✅ NEW: Force refresh all state from localStorage - THIS IS THE FIX FOR THE STATE SYNC ISSUE
  const refreshState = () => {
    console.log('🔄 Refreshing all state from localStorage...');
    
    // Reload all sampling data from localStorage
    setSamplingConfigs(loadFromStorage(STORAGE_KEYS.SAMPLING_CONFIGS, []));
    setGeneratedSamples(loadFromStorage(STORAGE_KEYS.GENERATED_SAMPLES, []));
    setEvidenceRequests(loadFromStorage(STORAGE_KEYS.EVIDENCE_REQUESTS, []));
    setEvidenceSubmissions(loadFromStorage(STORAGE_KEYS.EVIDENCE_SUBMISSIONS, []));
    setControlClassifications(loadFromStorage(STORAGE_KEYS.CONTROL_CLASSIFICATIONS, []));
    setSamplingAuditLogs(loadFromStorage(STORAGE_KEYS.SAMPLING_AUDIT_LOGS, []));
    
    // Also reload current audit if exists
    const currentAuditData = loadFromStorage(STORAGE_KEYS.CURRENT_AUDIT, null);
    if (currentAuditData) {
      setSelectedAudit(currentAuditData.audit);
      setExtractedData(currentAuditData.extractedData);
    }
    
    console.log('✅ State refresh complete');
  };

  return {
    // Existing state
    currentView,
    selectedAudit,
    extractedData,
    uploadedFiles,
    currentModule,
    user,
    
    // NEW: Sampling state
    samplingConfigs,
    generatedSamples,
    evidenceRequests,
    evidenceSubmissions,
    controlClassifications,
    samplingAuditLogs,
    
    // Existing actions
    handleLogin,
    handleLogout,
    handleAuditSubmit,
    handleFileUpload,
    handleBackToDashboard,
    handleCreateNewAudit,
    handleContinueAudit,
    setCurrentModule,
    
    // NEW: Sampling actions - Using frequency-based engine
    handleAutoClassifyControls: handleAutoClassifyControlsWithFrequencyEngine,
    handleSamplingConfigSave,
    handleGenerateSamples,
    handleApproveSamples,
    handleCreateEvidenceRequest,
    handleUpdateEvidenceRequest,
    handleEvidenceSubmission,
    getSamplingDataForControl,
    getEvidenceStatusForControl,
    getSamplingStatusForControl,
    
    // ✅ NEW: State refresh function - THE KEY FIX FOR STATE SYNCHRONIZATION
    refreshState
  };
};