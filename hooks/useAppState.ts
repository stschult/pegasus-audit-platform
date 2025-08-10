// File: hooks/useAppState.ts - REFACTORED: Walkthrough Module Extracted
import { useState, useEffect } from 'react';
import { 
  AuditFormData, 
  ExcelData, 
  Audit, 
  UploadedFile,
  User,
  SamplingConfig,
  GeneratedSample,
  EvidenceRequest,
  EvidenceSubmission,
  ControlClassification,
  SamplingAuditLog
} from '../types';
import { createSamplingConfigFromControlData, SamplingEngine } from '../utils/samplingEngine';
import { useWalkthroughs } from '../hooks/useWalkthroughs';

type ViewType = 'login' | 'dashboard' | 'create-audit' | 'audit-setup';

const STORAGE_KEYS = {
  SAMPLING_CONFIGS: 'audit_sampling_configs',
  GENERATED_SAMPLES: 'audit_generated_samples',
  EVIDENCE_REQUESTS: 'audit_evidence_requests',
  EVIDENCE_SUBMISSIONS: 'audit_evidence_submissions',
  CONTROL_CLASSIFICATIONS: 'audit_control_classifications',
  SAMPLING_AUDIT_LOGS: 'audit_sampling_logs',
  CURRENT_AUDIT: 'current_audit_data',
  STORED_AUDITS: 'stored_audits'
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Saved ${key} to storage`);
  } catch (error) {
    console.error(`❌ Failed to save ${key}:`, error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      console.log(`📋 Loaded ${key} from storage:`, data);
      return data;
    }
  } catch (error) {
    console.error(`❌ Failed to load ${key}:`, error);
  }
  return defaultValue;
};

const clearStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

const extractDomainFromWebsite = (website: string): string => {
  if (!website) return '';
  
  try {
    let domain = website.toLowerCase()
      .replace(/^https?:\/\//, '')     // Remove http:// or https://
      .replace(/^www\./, '')           // Remove www.
      .replace(/\/.*$/, '')            // Remove path after domain
      .trim();
    
    console.log('🌐 extractDomainFromWebsite:', { website, domain });
    return domain;
  } catch (error) {
    console.warn('Failed to extract domain from:', website);
    return '';
  }
};

const extractDomainFromEmail = (email: string): string => {
  try {
    const domain = email.split('@')[1].toLowerCase();
    console.log('📧 extractDomainFromEmail:', { email, domain });
    return domain;
  } catch (error) {
    console.warn('Failed to extract domain from email:', email);
    return '';
  }
};

const findAuditByClientDomain = (clientDomain: string): Audit | null => {
  if (!clientDomain) return null;
  
  try {
    const storedAudits = loadFromStorage(STORAGE_KEYS.STORED_AUDITS, []);
    console.log('🔍 findAuditByClientDomain - searching:', { 
      clientDomain, 
      auditCount: storedAudits.length,
      audits: storedAudits.map((a: Audit) => ({ 
        companyName: a.companyName, 
        clientDomain: a.clientDomain, 
        website: a.website 
      }))
    });
    
    const matchingAudit = storedAudits.find((audit: Audit) => {
      return audit.clientDomain === clientDomain;
    });
    
    if (matchingAudit) {
      console.log('✅ AUTO-MATCH FOUND:', { 
        companyName: matchingAudit.companyName, 
        clientDomain: matchingAudit.clientDomain
      });
      return matchingAudit;
    }
    
    console.log('❌ No audit found for domain:', clientDomain);
    return null;
  } catch (error) {
    console.error('Error finding audit:', error);
    return null;
  }
};

// Helper functions for type-safe normalization
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
  
  if (normalized === 'annually' || normalized === 'annual') return 'annually';
  if (normalized === 'quarterly') return 'quarterly';
  if (normalized === 'monthly') return 'monthly';
  if (normalized === 'weekly') return 'weekly';
  if (normalized === 'daily') return 'daily';
  if (normalized === 'as needed' || normalized === 'adhoc' || normalized === 'ad hoc') return 'adhoc';
  if (normalized === 'continuous') return 'adhoc';
  
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
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [extractedData, setExtractedData] = useState<ExcelData | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentModule, setCurrentModule] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ Sampling state management
  const [samplingConfigs, setSamplingConfigs] = useState<SamplingConfig[]>([]);
  const [generatedSamples, setGeneratedSamples] = useState<GeneratedSample[]>([]);
  const [evidenceRequests, setEvidenceRequests] = useState<EvidenceRequest[]>([]);
  const [evidenceSubmissions, setEvidenceSubmissions] = useState<EvidenceSubmission[]>([]);
  const [controlClassifications, setControlClassifications] = useState<ControlClassification[]>([]);
  const [samplingAuditLogs, setSamplingAuditLogs] = useState<SamplingAuditLog[]>([]);

  // ✅ REFACTORED: Use walkthrough module
  const walkthroughModule = useWalkthroughs(user, selectedAudit);

  // Load all sampling data from localStorage
  useEffect(() => {
    setSamplingConfigs(loadFromStorage(STORAGE_KEYS.SAMPLING_CONFIGS, []));
    setGeneratedSamples(loadFromStorage(STORAGE_KEYS.GENERATED_SAMPLES, []));
    setEvidenceRequests(loadFromStorage(STORAGE_KEYS.EVIDENCE_REQUESTS, []));
    setEvidenceSubmissions(loadFromStorage(STORAGE_KEYS.EVIDENCE_SUBMISSIONS, []));
    setControlClassifications(loadFromStorage(STORAGE_KEYS.CONTROL_CLASSIFICATIONS, []));
    setSamplingAuditLogs(loadFromStorage(STORAGE_KEYS.SAMPLING_AUDIT_LOGS, []));
    
    const currentAuditData = loadFromStorage(STORAGE_KEYS.CURRENT_AUDIT, null);
    if (currentAuditData) {
      setSelectedAudit(currentAuditData.audit);
      setExtractedData(currentAuditData.extractedData);
      console.log('📋 Restored current audit session');
    }
    
    const savedUser = loadFromStorage('current_user', null);
    if (savedUser) {
      console.log('👤 Restoring user session:', savedUser.email);
      setUser(savedUser);
      
      if (savedUser.userType === 'client') {
        console.log('👤 Restored client - checking for auto-match');
        const clientDomain = extractDomainFromEmail(savedUser.email);
        const matchingAudit = findAuditByClientDomain(clientDomain);
        
        if (matchingAudit) {
          console.log('✅ AUTO-MATCH SUCCESS on session restore!');
          setSelectedAudit(matchingAudit);
          if (matchingAudit.extractedData) {
            console.log('📊 Restoring control framework for client');
            setExtractedData(matchingAudit.extractedData);
          }
          setCurrentView('audit-setup');
        } else {
          console.log('⚠️ No auto-match found on session restore - going to dashboard');
          setCurrentView('dashboard');
        }
      } else {
        console.log('👨‍💼 Restored auditor session - going to dashboard');
        setCurrentView('dashboard');
      }
    }
    setIsInitialized(true);
  }, []);

  // Auto-save all sampling data to localStorage
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

  useEffect(() => {
    if (selectedAudit) {
      saveToStorage(STORAGE_KEYS.CURRENT_AUDIT, {
        audit: selectedAudit,
        extractedData
      });
    }
  }, [selectedAudit, extractedData]);

  useEffect(() => {
    console.log('🔄 currentView changed to:', currentView);
  }, [currentView]);

  const handleLogin = (email: string, password: string, userType: 'auditor' | 'client') => {
    console.log('🚀 handleLogin called:', { email, userType });
    
    if (user) {
      console.log('⚠️ User already logged in, ignoring additional login calls');
      return;
    }
    
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const newUser: User = { 
      id: `user-${Date.now()}`,
      name: email.split('@')[0], 
      email,
      organization: userType === 'auditor' ? 'Audit Firm' : 'Client Company',
      role: userType === 'auditor' ? 'Senior Auditor' : 'Client Lead',
      userType,
      isClient: userType === 'client'
    };
    
    console.log('👤 Created user:', newUser);
    setUser(newUser);
    saveToStorage('current_user', newUser);
    
    if (userType === 'client') {
      console.log('👤 Processing client login - checking for auto-match');
      const clientDomain = extractDomainFromEmail(email);
      const matchingAudit = findAuditByClientDomain(clientDomain);
      
      if (matchingAudit) {
        console.log('✅ AUTO-MATCH SUCCESS on fresh login!');
        setSelectedAudit(matchingAudit);
        if (matchingAudit.extractedData) {
          console.log('📊 Loading control framework for client');
          setExtractedData(matchingAudit.extractedData);
        }
        setCurrentView('audit-setup');
      } else {
        console.log('⚠️ No auto-match found on fresh login - going to dashboard');
        setCurrentView('dashboard');
      }
    } else {
      console.log('👨‍💼 Auditor login - going to dashboard');
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logging out and clearing user data only');
    setUser(null);
    setCurrentView('login');
    setSelectedAudit(null);
    setExtractedData(null);
    setUploadedFiles([]);
    setCurrentModule('overview');
    
    localStorage.removeItem('current_user');
  };

  // Enhanced audit submit with auto-classification + walkthrough extraction
  const handleAuditSubmit = (formData: AuditFormData, excelData?: ExcelData) => {
    console.log('🎉 Creating new audit:', formData);
    console.log('📊 Excel data included:', excelData ? {
      controls: excelData.controls.length,
      itacs: excelData.itacs.length,
      keyReports: excelData.keyReports.length
    } : 'None');

    const newAudit: Audit = {
      id: `audit-${Date.now()}`,
      clientName: formData.companyName,
      clientId: formData.clientId || `CLIENT-${Date.now()}`,
      website: formData.website || '',
      clientDomain: extractDomainFromWebsite(formData.website || ''),
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
      auditLead: formData.auditLead,
      extractedData: excelData,
      
      // Initialize walkthrough metadata
      walkthroughsExtracted: false,
      totalWalkthroughs: 0
    };

    const existingAudits = loadFromStorage(STORAGE_KEYS.STORED_AUDITS, []);
    existingAudits.push(newAudit);
    saveToStorage(STORAGE_KEYS.STORED_AUDITS, existingAudits);
    
    console.log(`💾 Stored audit with domain: ${newAudit.clientDomain} for company: ${newAudit.companyName}`);
    console.log(`📊 Audit includes ${excelData ? 'FULL' : 'NO'} control framework`);

    // Auto-classify controls using sampling engine
    if (excelData) {
      setExtractedData(excelData);
      handleAutoClassifyControlsWithFrequencyEngine(excelData, newAudit);
      
      // ✅ REFACTORED: Extract walkthroughs using new module
      walkthroughModule.handleExtractWalkthroughsFromKeyReports(excelData, newAudit);
    }

    setSelectedAudit(newAudit);
    setCurrentView('audit-setup');
  };

  const handleFileUpload = (fileList: FileList) => {
    const files = Array.from(fileList);
    
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

  const handleBackToDashboard = () => {
    console.log('🔙 Going back to dashboard');
    setCurrentView('dashboard');
    setSelectedAudit(null);
    setExtractedData(null);
    setUploadedFiles([]);
    setCurrentModule('overview');
  };

  const handleCreateNewAudit = () => {
    console.log('➕ Creating new audit');
    setCurrentView('create-audit');
  };

  const handleContinueAudit = () => {
    console.log('▶️ Continuing audit');
    setCurrentView('audit-setup');
  };

  const handleClearAll = () => {
    console.log('🧹 Clearing ALL data (including audits)');
    localStorage.clear();
    setUser(null);
    setCurrentView('login');
    setSelectedAudit(null);
    setExtractedData(null);
    setUploadedFiles([]);
    setCurrentModule('overview');
    setSamplingConfigs([]);
    setGeneratedSamples([]);
    setEvidenceRequests([]);
    setEvidenceSubmissions([]);
    setControlClassifications([]);
    setSamplingAuditLogs([]);
  };

  // Auto-classification using frequency-based engine
  const handleAutoClassifyControlsWithFrequencyEngine = (excelData: ExcelData, audit: Audit) => {
    const classifications: ControlClassification[] = [];
    const newSamplingConfigs: SamplingConfig[] = [];
    
    // Process ITGCs
    excelData.controls.forEach(control => {
      const controlData = {
        'Control frequency': control.frequency || 'Monthly',
        'PwC risk rating (H/M/L)': control.riskLevel || 'M',
        ...control
      };
      
      const requiresSampling = SamplingEngine.shouldSampleControl(controlData);
      
      const classification: ControlClassification = {
        controlId: control.id,
        requiresSampling,
        riskLevel: normalizeRiskLevel(control.riskLevel),
        controlType: determineControlType(control.description),
        frequency: normalizeFrequency(control.frequency),
        confidence: 0.95,
        detectedKeywords: [],
        suggestedSampleSize: requiresSampling ? SamplingEngine.calculateSampleSizeFromFrequency(controlData) : 0,
        suggestedMethodology: SamplingEngine.getSamplingMethodology(controlData),
        classifiedAt: new Date().toISOString()
      };
      
      classifications.push(classification);
      
      if (classification.requiresSampling) {
        const existingConfig = samplingConfigs.find(c => c.controlId === control.id);
        
        if (!existingConfig) {
          const samplingConfig = createSamplingConfigFromControlData(
            control.id,
            controlData,
            audit.startDate,
            audit.endDate
          );
          
          if (samplingConfig) {
            samplingConfig.createdBy = user?.email || 'system';
            newSamplingConfigs.push(samplingConfig);
          }
        }
      }
    });

    // Process ITACs with same logic
    excelData.itacs.forEach(itac => {
      const controlData = {
        'Control frequency': itac.frequency || 'Monthly',
        'PwC risk rating (H/M/L)': itac.riskLevel || 'M',
        ...itac
      };
      
      const requiresSampling = SamplingEngine.shouldSampleControl(controlData);
      
      const classification: ControlClassification = {
        controlId: itac.id,
        requiresSampling,
        riskLevel: normalizeRiskLevel(itac.riskLevel),
        controlType: determineControlType(itac.description || itac.controlName || ''),
        frequency: normalizeFrequency(itac.frequency),
        confidence: 0.95,
        detectedKeywords: [],
        suggestedSampleSize: requiresSampling ? SamplingEngine.calculateSampleSizeFromFrequency(controlData) : 0,
        suggestedMethodology: SamplingEngine.getSamplingMethodology(controlData),
        classifiedAt: new Date().toISOString()
      };
      
      classifications.push(classification);
      
      if (classification.requiresSampling) {
        const existingConfig = samplingConfigs.find(c => c.controlId === itac.id);
        
        if (!existingConfig) {
          const samplingConfig = createSamplingConfigFromControlData(
            itac.id,
            controlData,
            audit.startDate,
            audit.endDate
          );
          
          if (samplingConfig) {
            samplingConfig.createdBy = user?.email || 'system';
            newSamplingConfigs.push(samplingConfig);
          }
        }
      }
    });

    // Update state
    setControlClassifications(classifications);
    if (newSamplingConfigs.length > 0) {
      setSamplingConfigs(prev => [...prev, ...newSamplingConfigs]);
    }
    
    const auditLog: SamplingAuditLog = {
      id: `log-${Date.now()}`,
      samplingConfigId: 'auto-classification-frequency-based',
      action: 'created',
      performedBy: user?.email || 'system',
      performedAt: new Date().toISOString(),
      details: `Auto-classified ${classifications.length} controls using frequency-based engine and created ${newSamplingConfigs.length} sampling configurations`
    };
    setSamplingAuditLogs(prev => [...prev, auditLog]);

    console.log(`✅ Auto-classified ${classifications.length} controls using frequency-based engine`);
  };

  // All sampling workflow functions
  const handleSamplingConfigSave = (config: SamplingConfig) => {
    setSamplingConfigs(prev => {
      const existingIndex = prev.findIndex(c => c.id === config.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = config;
        return updated;
      } else {
        return [...prev, config];
      }
    });

    const auditLog: SamplingAuditLog = {
      id: `log-${Date.now()}`,
      samplingConfigId: config.id,
      action: config.status === 'draft' ? 'created' : 'modified',
      performedBy: user?.email || 'unknown',
      performedAt: new Date().toISOString(),
      details: `Sampling configuration ${config.status === 'draft' ? 'created' : 'updated'} for control ${config.controlId}`
    };
    setSamplingAuditLogs(prev => [...prev, auditLog]);
  };

  const handleGenerateSamples = (samplingConfig: SamplingConfig, samples: GeneratedSample[]) => {
    setGeneratedSamples(prev => prev.filter(s => s.samplingConfigId !== samplingConfig.id));
    setGeneratedSamples(prev => [...prev, ...samples]);

    setSamplingConfigs(prev => prev.map(config => 
      config.id === samplingConfig.id 
        ? { ...config, status: 'generated' }
        : config
    ));

    const auditLog: SamplingAuditLog = {
      id: `log-${Date.now()}`,
      samplingConfigId: samplingConfig.id,
      action: 'regenerated',
      performedBy: user?.email || 'unknown',
      performedAt: new Date().toISOString(),
      details: `Generated ${samples.length} samples using ${samplingConfig.methodology} methodology`
    };
    setSamplingAuditLogs(prev => [...prev, auditLog]);
  };

  const handleApproveSamples = (samplingConfigId: string) => {
    setSamplingConfigs(prev => prev.map(config => 
      config.id === samplingConfigId 
        ? { ...config, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: user?.email || 'unknown' }
        : config
    ));

    setGeneratedSamples(prev => prev.map(sample => 
      sample.samplingConfigId === samplingConfigId 
        ? { ...sample, status: 'approved' }
        : sample
    ));

    const auditLog: SamplingAuditLog = {
      id: `log-${Date.now()}`,
      samplingConfigId,
      action: 'approved',
      performedBy: user?.email || 'unknown',
      performedAt: new Date().toISOString(),
      details: 'Sample selection approved by auditor'
    };
    setSamplingAuditLogs(prev => [...prev, auditLog]);
  };

  const handleCreateEvidenceRequest = (request: EvidenceRequest) => {
    const enhancedRequest: EvidenceRequest = {
      ...request,
      currentResponsibleParty: 'client',
      status: 'sent',
      sentAt: new Date().toISOString()
    };

    const updatedRequests = [...evidenceRequests, enhancedRequest];
    setEvidenceRequests(updatedRequests);

    if (enhancedRequest.samplingConfigId) {
      setSamplingConfigs(prev => prev.map(config => 
        config.id === enhancedRequest.samplingConfigId 
          ? { 
              ...config, 
              status: 'sent',
              currentResponsibleParty: 'client'
            }
          : config
      ));

      const auditLog: SamplingAuditLog = {
        id: `log-${Date.now()}`,
        samplingConfigId: enhancedRequest.samplingConfigId,
        action: 'sent',
        performedBy: user?.email || 'unknown',
        performedAt: new Date().toISOString(),
        details: `Evidence request sent to client with ${enhancedRequest.samplingDetails?.selectedDates.length || 0} sample dates. Ball in client's court.`
      };
      setSamplingAuditLogs(prev => [...prev, auditLog]);
    }

    console.log(`✅ Evidence request created with enhanced status tracking: ${enhancedRequest.id}`);
    
    return {
      newStatus: getSamplingStatusForControl(enhancedRequest.controlId, updatedRequests),
      responsibleParty: 'client'
    };
  };

  const handleUpdateEvidenceRequest = (requestId: string, updates: Partial<EvidenceRequest>) => {
    setEvidenceRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedRequest = { ...req, ...updates };
        
        if (updates.status === 'sent') {
          updatedRequest.currentResponsibleParty = 'client';
        } else if (updates.status === 'submitted' || updates.status === 'under_review') {
          updatedRequest.currentResponsibleParty = 'auditor';
        } else if (updates.status === 'requires_clarification') {
          updatedRequest.currentResponsibleParty = 'client';
        } else if (updates.status === 'approved') {
          updatedRequest.currentResponsibleParty = 'completed';
        }
        
        return updatedRequest;
      }
      return req;
    }));
  };

  const handleEvidenceSubmission = (submission: EvidenceSubmission) => {
    const enhancedSubmission: EvidenceSubmission = {
      ...submission,
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.email || 'client'
    };

    const updatedSubmissions = [...evidenceSubmissions, enhancedSubmission];
    setEvidenceSubmissions(updatedSubmissions);

    const relatedRequest = evidenceRequests.find(req => req.id === submission.evidenceRequestId);
    if (relatedRequest) {
      const requestSubmissions = updatedSubmissions.filter(s => s.evidenceRequestId === relatedRequest.id);
      const expectedEvidenceCount = relatedRequest.samplingDetails?.selectedDates.length || 1;
      const submittedCount = requestSubmissions.length;
      
      let newRequestStatus: EvidenceRequest['status'] = 'submitted';
      let newResponsibleParty: 'auditor' | 'client' = 'auditor';
      
      if (submittedCount >= expectedEvidenceCount) {
        newRequestStatus = 'submitted';
        newResponsibleParty = 'auditor';
      } else {
        newRequestStatus = 'in_progress';
        newResponsibleParty = 'client';
      }

      setEvidenceRequests(prev => prev.map(req => 
        req.id === submission.evidenceRequestId 
          ? { 
              ...req, 
              status: newRequestStatus,
              currentResponsibleParty: newResponsibleParty,
              submittedAt: newRequestStatus === 'submitted' ? new Date().toISOString() : req.submittedAt
            }
          : req
      ));

      if (relatedRequest.samplingConfigId && submittedCount >= expectedEvidenceCount) {
        setSamplingConfigs(prev => prev.map(config => 
          config.id === relatedRequest.samplingConfigId 
            ? { 
                ...config, 
                status: 'completed',
                currentResponsibleParty: 'auditor'
              }
            : config
        ));
      }

      const auditLog: SamplingAuditLog = {
        id: `log-${Date.now()}`,
        samplingConfigId: relatedRequest.samplingConfigId || 'general',
        action: 'evidence_received',
        performedBy: submission.uploadedBy,
        performedAt: submission.uploadedAt,
        details: `Evidence submitted: ${submission.fileName} for ${submission.sampleDate || 'general evidence'}. Status: ${submittedCount}/${expectedEvidenceCount} complete. Ball in ${newResponsibleParty}'s court.`
      };
      setSamplingAuditLogs(prev => [...prev, auditLog]);
    }

    console.log(`✅ Evidence submission processed with enhanced status tracking: ${enhancedSubmission.id}`);
    
    return {
      newStatus: relatedRequest ? getSamplingStatusForControl(relatedRequest.controlId, evidenceRequests, updatedSubmissions) : 'unknown',
      responsibleParty: relatedRequest?.currentResponsibleParty || 'auditor'
    };
  };

  const handleApproveEvidence = (submissionId: string, approvalNotes?: string) => {
    const updatedSubmissions = evidenceSubmissions.map(submission =>
      submission.id === submissionId
        ? {
            ...submission,
            status: 'approved' as const,
            reviewNotes: approvalNotes,
            reviewedAt: new Date().toISOString(),
            reviewedBy: user?.email || 'auditor'
          }
        : submission
    );
    
    setEvidenceSubmissions(updatedSubmissions);

    const approvedSubmission = updatedSubmissions.find(s => s.id === submissionId);
    if (approvedSubmission) {
      const relatedRequest = evidenceRequests.find(req => req.id === approvedSubmission.evidenceRequestId);
      
      if (relatedRequest) {
        const requestSubmissions = updatedSubmissions.filter(s => s.evidenceRequestId === relatedRequest.id);
        const allApproved = requestSubmissions.every(s => s.status === 'approved');
        
        if (allApproved && requestSubmissions.length > 0) {
          setEvidenceRequests(prev => prev.map(req =>
            req.id === relatedRequest.id
              ? {
                  ...req,
                  status: 'approved',
                  currentResponsibleParty: 'completed',
                  reviewedAt: new Date().toISOString()
                }
              : req
          ));

          if (relatedRequest.samplingConfigId) {
            setSamplingConfigs(prev => prev.map(config =>
              config.id === relatedRequest.samplingConfigId
                ? {
                    ...config,
                    status: 'completed',
                    currentResponsibleParty: 'completed'
                  }
                : config
            ));
          }

          const auditLog: SamplingAuditLog = {
            id: `log-${Date.now()}`,
            samplingConfigId: relatedRequest.samplingConfigId || 'general',
            action: 'completed',
            performedBy: user?.email || 'auditor',
            performedAt: new Date().toISOString(),
            details: `All evidence approved for control. Workflow complete.`
          };
          setSamplingAuditLogs(prev => [...prev, auditLog]);
        }
      }
    }

    return {
      success: true,
      newStatus: approvedSubmission ? getSamplingStatusForControl(
        evidenceRequests.find(r => r.id === approvedSubmission.evidenceRequestId)?.controlId || '',
        evidenceRequests,
        updatedSubmissions
      ) : 'unknown'
    };
  };

  // Get sampling data for control - handles multiple configs
  const getSamplingDataForControl = (controlId: string, currentRequests?: EvidenceRequest[], currentSubmissions?: EvidenceSubmission[]) => {
    const controlConfigs = samplingConfigs.filter(c => c.controlId === controlId);
    const configIds = controlConfigs.map(c => c.id);
    const samples = generatedSamples.filter(s => configIds.includes(s.samplingConfigId));
    const config = controlConfigs.length > 0 ? controlConfigs[controlConfigs.length - 1] : null;
    
    const classification = controlClassifications.find(c => c.controlId === controlId);
    
    let requestsToUse = currentRequests || evidenceRequests;
    let submissionsToUse = currentSubmissions || evidenceSubmissions;
    
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
      hasConfig: controlConfigs.length > 0,
      hasApprovedSamples: samples.filter(s => s.status === 'approved').length > 0,
      sampleCount: samples.filter(s => s.status === 'approved').length,
      evidenceRequests: requests
    };
  };

  const getEvidenceStatusForControl = (controlId: string, currentRequests?: EvidenceRequest[], currentSubmissions?: EvidenceSubmission[]) => {
    let requestsToUse = currentRequests || evidenceRequests;
    
    const requestsForControl = requestsToUse.filter(req => req.controlId === controlId);
    
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

  const getSamplingStatusForControl = (controlId: string, currentRequests?: EvidenceRequest[], currentSubmissions?: EvidenceSubmission[]): string => {
    let requestsToUse = currentRequests || evidenceRequests;
    let submissionsToUse = currentSubmissions || evidenceSubmissions;
    
    const controlRequests = requestsToUse.filter(req => req.controlId === controlId);

    if (controlRequests.length > 0) {
      const latestRequest = controlRequests[controlRequests.length - 1];
      
      const requestSubmissions = submissionsToUse.filter(s => 
        controlRequests.some(req => req.id === s.evidenceRequestId)
      );
      
      const expectedEvidenceCount = latestRequest.samplingDetails?.selectedDates.length || 1;
      const submittedCount = requestSubmissions.filter(s => s.status !== 'rejected').length;
      const approvedCount = requestSubmissions.filter(s => s.status === 'approved').length;
      
      if (approvedCount === expectedEvidenceCount && expectedEvidenceCount > 0) {
        return 'Evidence Approved';
      } else if (submittedCount === expectedEvidenceCount && expectedEvidenceCount > 0) {
        return 'All Evidence Submitted';
      } else if (submittedCount > 0) {
        return 'Partial Evidence Submitted';
      } else if (latestRequest.status === 'requires_clarification') {
        return 'Evidence Followup Required';
      } else if (latestRequest.status === 'sent') {
        return 'Evidence Request Sent';
      } else {
        return 'Evidence Request Sent';
      }
    }

    const samplingData = getSamplingDataForControl(controlId, currentRequests, currentSubmissions);
    
    if (!samplingData.requiresSampling) {
      return 'No Sampling Required';
    }

    if (!samplingData.hasConfig) {
      return 'Needs Sampling';
    }

    if (!samplingData.hasApprovedSamples) {
      return 'Sampling Configured';
    }

    return 'Ready for Evidence Request';
  };

  const refreshState = () => {
    console.log('🔄 Refreshing all state from localStorage...');
    
    setSamplingConfigs(loadFromStorage(STORAGE_KEYS.SAMPLING_CONFIGS, []));
    setGeneratedSamples(loadFromStorage(STORAGE_KEYS.GENERATED_SAMPLES, []));
    setEvidenceRequests(loadFromStorage(STORAGE_KEYS.EVIDENCE_REQUESTS, []));
    setEvidenceSubmissions(loadFromStorage(STORAGE_KEYS.EVIDENCE_SUBMISSIONS, []));
    setControlClassifications(loadFromStorage(STORAGE_KEYS.CONTROL_CLASSIFICATIONS, []));
    setSamplingAuditLogs(loadFromStorage(STORAGE_KEYS.SAMPLING_AUDIT_LOGS, []));
    
    // ✅ REFACTORED: Refresh walkthrough state
    walkthroughModule.refreshWalkthroughState();
    
    const currentAuditData = loadFromStorage(STORAGE_KEYS.CURRENT_AUDIT, null);
    if (currentAuditData) {
      setSelectedAudit(currentAuditData.audit);
      setExtractedData(currentAuditData.extractedData);
    }
    
    console.log('✅ State refresh complete');
  };

  return {
    currentView,
    selectedAudit,
    extractedData,
    uploadedFiles,
    currentModule,
    user,
    isInitialized,
    
    // Sampling state
    samplingConfigs,
    generatedSamples,
    evidenceRequests,
    evidenceSubmissions,
    controlClassifications,
    samplingAuditLogs,
    
    // ✅ REFACTORED: Walkthrough state from module
    walkthroughApplications: walkthroughModule.walkthroughApplications,
    walkthroughRequests: walkthroughModule.walkthroughRequests,
    walkthroughSessions: walkthroughModule.walkthroughSessions,
    
    handleLogin,
    handleLogout,
    handleAuditSubmit,
    handleFileUpload,
    handleBackToDashboard,
    handleCreateNewAudit,
    handleContinueAudit,
    setCurrentModule,
    handleClearAll,
    
    // Sampling workflow functions
    handleAutoClassifyControls: handleAutoClassifyControlsWithFrequencyEngine,
    handleSamplingConfigSave,
    handleGenerateSamples,
    handleApproveSamples,
    handleCreateEvidenceRequest,
    handleUpdateEvidenceRequest,
    handleEvidenceSubmission,
    handleApproveEvidence,
    getSamplingDataForControl,
    getEvidenceStatusForControl,
    getSamplingStatusForControl,
    refreshState,
    
    // ✅ REFACTORED: Walkthrough functions from module
    handleExtractWalkthroughsFromKeyReports: walkthroughModule.handleExtractWalkthroughsFromKeyReports,
    handleCreateWalkthroughRequest: walkthroughModule.handleCreateWalkthroughRequest,
    handleUpdateWalkthroughRequest: walkthroughModule.handleUpdateWalkthroughRequest,
    handleSendWalkthroughRequests: walkthroughModule.handleSendWalkthroughRequests,
    handleScheduleWalkthrough: walkthroughModule.handleScheduleWalkthrough,
    handleCompleteWalkthrough: walkthroughModule.handleCompleteWalkthrough,
    handleBulkWalkthroughAction: walkthroughModule.handleBulkWalkthroughAction,
    
    // Walkthrough query functions
    getWalkthroughStatusForApplication: walkthroughModule.getWalkthroughStatusForApplication,
    getWalkthroughRequestsForAudit: walkthroughModule.getWalkthroughRequestsForAudit,
    getWalkthroughProgress: walkthroughModule.getWalkthroughProgress,
    getWalkthroughTimeline: walkthroughModule.getWalkthroughTimeline,
    groupWalkthroughsByApplication: walkthroughModule.groupWalkthroughsByApplication,
  };
};