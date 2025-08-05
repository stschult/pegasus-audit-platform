// utils/controlClassification.ts
import { ControlClassification, ExtractedControl, ExtractedITAC } from '../types';

// Enhanced keyword mappings for control classification
const CONTROL_KEYWORDS = {
  // High-risk sampling controls
  highRiskSampling: {
    keywords: [
      'privileged access', 'admin access', 'superuser', 'root access',
      'change management', 'production changes', 'emergency changes',
      'user provisioning', 'account creation', 'access request',
      'password management', 'password reset', 'password policy',
      'user termination', 'access removal', 'account deactivation',
      'incident response', 'security incident', 'breach response',
      'vulnerability management', 'patch management', 'security patch'
    ],
    riskLevel: 'high' as const,
    samplesPerQuarter: 4,
    methodology: 'judgmental' as const
  },

  // Medium-risk sampling controls  
  mediumRiskSampling: {
    keywords: [
      'user access review', 'access certification', 'periodic review',
      'backup verification', 'backup testing', 'recovery testing',
      'job scheduling', 'batch processing', 'automated jobs',
      'physical access', 'badge access', 'facility access',
      'contractor access', 'vendor access', 'third party access',
      'database access', 'application access', 'system access'
    ],
    riskLevel: 'medium' as const,
    samplesPerQuarter: 3,
    methodology: 'random' as const
  },

  // Low-risk sampling controls
  lowRiskSampling: {
    keywords: [
      'system monitoring', 'log monitoring', 'alert monitoring',
      'capacity monitoring', 'performance monitoring',
      'antivirus updates', 'signature updates',
      'system backup', 'data backup', 'file backup',
      'report generation', 'automated reports'
    ],
    riskLevel: 'low' as const,
    samplesPerQuarter: 2,
    methodology: 'random' as const
  },

  // Full population controls (no sampling)
  fullPopulation: {
    keywords: [
      'firewall configuration', 'network configuration', 'router configuration',
      'encryption configuration', 'ssl configuration', 'tls configuration',
      'segregation of duties', 'role assignment', 'authorization matrix',
      'business continuity plan', 'disaster recovery plan', 'continuity planning',
      'capacity planning', 'performance baseline', 'system architecture',
      'data retention policy', 'data classification', 'information classification'
    ],
    riskLevel: 'medium' as const,
    samplesPerQuarter: 0, // Full population
    methodology: 'judgmental' as const
  }
};

// Frequency detection keywords
const FREQUENCY_KEYWORDS = {
  daily: ['daily', 'every day', 'each day', '24 hours', '24-hour', 'continuous'],
  weekly: ['weekly', 'every week', 'each week', '7 days', 'weekly basis'],
  monthly: ['monthly', 'every month', 'each month', '30 days', 'monthly basis'],
  quarterly: ['quarterly', 'every quarter', 'each quarter', '90 days', 'quarterly basis'],
  annually: ['annually', 'yearly', 'every year', 'each year', 'annual basis', '365 days']
};

// Control type detection keywords
const CONTROL_TYPE_KEYWORDS = {
  automated: [
    'automated', 'automatic', 'system-generated', 'application-controlled',
    'system-enforced', 'programmatic', 'scheduled', 'batch', 'real-time',
    'electronic', 'digital', 'software-based', 'tool-based'
  ],
  manual: [
    'manual', 'human', 'person', 'individual', 'staff', 'employee',
    'review', 'approval', 'inspection', 'verification', 'validation',
    'oversight', 'supervision', 'management', 'administrator'
  ]
};

/**
 * Enhanced control classification engine
 */
export class ControlClassificationEngine {
  
  /**
   * Classify a control for sampling requirements
   */
  static classifyControl(
    controlId: string,
    description: string,
    existingRiskLevel?: string,
    controlFamily?: string,
    frequency?: string
  ): ControlClassification {
    const desc = description?.toLowerCase() || '';
    const family = controlFamily?.toLowerCase() || '';
    
    // Detect sampling requirements
    const samplingCategory = this.detectSamplingCategory(desc, family);
    
    // Detect control characteristics
    const detectedFrequency = this.detectFrequency(desc, frequency);
    const controlType = this.detectControlType(desc, family);
    const riskLevel = this.detectRiskLevel(desc, existingRiskLevel, samplingCategory);
    
    // Get detected keywords
    const detectedKeywords = this.getDetectedKeywords(desc, samplingCategory);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(desc, detectedKeywords, samplingCategory);
    
    // Determine suggested parameters
    const suggestedSampleSize = this.getSuggestedSampleSize(riskLevel, controlType, detectedFrequency, samplingCategory);
    const suggestedMethodology = this.getSuggestedMethodology(riskLevel, samplingCategory);
    
    return {
      controlId,
      requiresSampling: samplingCategory !== 'fullPopulation',
      riskLevel,
      controlType,
      frequency: detectedFrequency,
      confidence,
      detectedKeywords,
      suggestedSampleSize,
      suggestedMethodology,
      classifiedAt: new Date().toISOString()
    };
  }

  /**
   * Batch classify multiple controls
   */
  static batchClassifyControls(controls: (ExtractedControl | ExtractedITAC)[]): ControlClassification[] {
    return controls.map(control => {
      const description = 'description' in control ? control.description : 
                         control.controlDescription || control.name || '';
      const riskLevel = control.riskLevel;
      const family = 'controlFamily' in control ? control.controlFamily : 
                    control.system || control.application || '';
      const frequency = control.frequency;
      
      return this.classifyControl(control.id, description, riskLevel, family, frequency);
    });
  }

  /**
   * Re-classify controls with manual overrides
   */
  static reclassifyWithOverrides(
    classification: ControlClassification,
    overrides: Partial<ControlClassification>
  ): ControlClassification {
    const updated = {
      ...classification,
      ...overrides,
      manuallyOverridden: true,
      overriddenAt: new Date().toISOString()
    };

    // Recalculate dependent fields if risk or type changed
    if (overrides.riskLevel || overrides.controlType) {
      updated.suggestedSampleSize = this.getSuggestedSampleSize(
        updated.riskLevel,
        updated.controlType,
        updated.frequency,
        updated.requiresSampling ? 'mediumRiskSampling' : 'fullPopulation'
      );
    }

    return updated;
  }

  // Private helper methods

  private static detectSamplingCategory(description: string, family: string): keyof typeof CONTROL_KEYWORDS {
    const combined = `${description} ${family}`;
    
    // Check each category in order of specificity
    for (const [category, config] of Object.entries(CONTROL_KEYWORDS)) {
      for (const keyword of config.keywords) {
        if (combined.includes(keyword)) {
          return category as keyof typeof CONTROL_KEYWORDS;
        }
      }
    }
    
    // Default to medium risk sampling
    return 'mediumRiskSampling';
  }

  private static detectFrequency(
    description: string, 
    existingFrequency?: string
  ): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'adhoc' {
    
    // First check existing frequency
    if (existingFrequency) {
      const existing = existingFrequency.toLowerCase();
      for (const [freq, keywords] of Object.entries(FREQUENCY_KEYWORDS)) {
        if (keywords.some(keyword => existing.includes(keyword))) {
          return freq as any;
        }
      }
    }
    
    // Then check description
    for (const [freq, keywords] of Object.entries(FREQUENCY_KEYWORDS)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        return freq as any;
      }
    }
    
    // Intelligent defaults based on control type
    if (description.includes('backup') || description.includes('monitoring')) {
      return 'daily';
    }
    if (description.includes('review') || description.includes('access')) {
      return 'quarterly';
    }
    if (description.includes('patch') || description.includes('update')) {
      return 'monthly';
    }
    
    return 'monthly'; // Default
  }

  private static detectControlType(
    description: string, 
    family: string
  ): 'automated' | 'manual' | 'hybrid' {
    const combined = `${description} ${family}`;
    
    const automatedScore = CONTROL_TYPE_KEYWORDS.automated
      .reduce((score, keyword) => score + (combined.includes(keyword) ? 1 : 0), 0);
    
    const manualScore = CONTROL_TYPE_KEYWORDS.manual
      .reduce((score, keyword) => score + (combined.includes(keyword) ? 1 : 0), 0);
    
    if (automatedScore > manualScore && automatedScore > 0) return 'automated';
    if (manualScore > automatedScore && manualScore > 0) return 'manual';
    if (automatedScore > 0 && manualScore > 0) return 'hybrid';
    
    // Default based on description context
    if (description.includes('system') || description.includes('application')) {
      return 'automated';
    }
    
    return 'manual'; // Conservative default
  }

  private static detectRiskLevel(
    description: string,
    existingRiskLevel?: string,
    samplingCategory?: keyof typeof CONTROL_KEYWORDS
  ): 'high' | 'medium' | 'low' {
    
    // First check existing risk level
    if (existingRiskLevel) {
      const risk = existingRiskLevel.toLowerCase();
      if (risk.includes('h') || risk.includes('high')) return 'high';
      if (risk.includes('m') || risk.includes('medium')) return 'medium';
      if (risk.includes('l') || risk.includes('low')) return 'low';
    }
    
    // Use sampling category as indicator
    if (samplingCategory && CONTROL_KEYWORDS[samplingCategory]) {
      return CONTROL_KEYWORDS[samplingCategory].riskLevel;
    }
    
    // Keyword-based detection
    const highRiskKeywords = ['critical', 'privileged', 'admin', 'production', 'sensitive'];
    const lowRiskKeywords = ['monitoring', 'reporting', 'logging', 'backup'];
    
    if (highRiskKeywords.some(keyword => description.includes(keyword))) {
      return 'high';
    }
    
    if (lowRiskKeywords.some(keyword => description.includes(keyword))) {
      return 'low';
    }
    
    return 'medium'; // Default
  }

  private static getDetectedKeywords(
    description: string,
    samplingCategory: keyof typeof CONTROL_KEYWORDS
  ): string[] {
    const keywords = CONTROL_KEYWORDS[samplingCategory]?.keywords || [];
    return keywords.filter(keyword => description.includes(keyword));
  }

  private static calculateConfidence(
    description: string,
    detectedKeywords: string[],
    samplingCategory: keyof typeof CONTROL_KEYWORDS
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on keyword matches
    const keywordRatio = detectedKeywords.length / (CONTROL_KEYWORDS[samplingCategory]?.keywords.length || 1);
    confidence += keywordRatio * 0.3;
    
    // Increase confidence for longer, more detailed descriptions
    if (description.length > 50) confidence += 0.1;
    if (description.length > 100) confidence += 0.1;
    
    // Decrease confidence for very short or generic descriptions
    if (description.length < 20) confidence -= 0.2;
    if (description.includes('control') && description.length < 30) confidence -= 0.1;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private static getSuggestedSampleSize(
    riskLevel: 'high' | 'medium' | 'low',
    controlType: 'automated' | 'manual' | 'hybrid',
    frequency: string,
    samplingCategory: keyof typeof CONTROL_KEYWORDS
  ): number {
    
    // Check if it's a full population control
    if (samplingCategory === 'fullPopulation') {
      return 0; // Indicates full population testing
    }
    
    // Base sample size from category
    let baseSize = CONTROL_KEYWORDS[samplingCategory]?.samplesPerQuarter || 2;
    
    // Adjust for risk level
    const riskMultiplier = riskLevel === 'high' ? 1.5 : riskLevel === 'low' ? 0.8 : 1.0;
    
    // Adjust for control type
    const typeMultiplier = controlType === 'manual' ? 1.3 : controlType === 'automated' ? 0.9 : 1.0;
    
    // Adjust for frequency
    const freqMultiplier = frequency === 'daily' ? 1.0 : 
                          frequency === 'weekly' ? 1.2 : 
                          frequency === 'monthly' ? 1.0 : 0.8;
    
    const calculatedSize = Math.round(baseSize * riskMultiplier * typeMultiplier * freqMultiplier);
    
    // Ensure reasonable bounds
    return Math.max(1, Math.min(12, calculatedSize));
  }

  private static getSuggestedMethodology(
    riskLevel: 'high' | 'medium' | 'low',
    samplingCategory: keyof typeof CONTROL_KEYWORDS
  ): 'random' | 'systematic' | 'judgmental' {
    
    // Use category default
    const categoryDefault = CONTROL_KEYWORDS[samplingCategory]?.methodology;
    if (categoryDefault) return categoryDefault;
    
    // Risk-based defaults
    if (riskLevel === 'high') return 'judgmental';
    if (riskLevel === 'low') return 'systematic';
    
    return 'random'; // Medium risk default
  }
}

/**
 * Utility functions for easy access
 */
export const classificationUtils = {
  classifyControl: ControlClassificationEngine.classifyControl,
  batchClassify: ControlClassificationEngine.batchClassifyControls,
  reclassify: ControlClassificationEngine.reclassifyWithOverrides,
  
  // Helper to get human-readable sampling requirement
  getSamplingDescription: (classification: ControlClassification): string => {
    if (!classification.requiresSampling) {
      return 'Full population testing required - review all instances';
    }
    
    const size = classification.suggestedSampleSize;
    const methodology = classification.suggestedMethodology;
    const frequency = classification.frequency;
    
    return `${size} samples per quarter using ${methodology} sampling (${frequency} control)`;
  },
  
  // Helper to get risk level color for UI
  getRiskLevelColor: (riskLevel: string): string => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
};