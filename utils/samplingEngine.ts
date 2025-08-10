// utils/samplingEngine.ts - FIXED VERSION with correct TypeScript types

// ✅ Import the correct types from your main types file
import { SamplingConfig, GeneratedSample, QuarterDefinition } from '../types';

export class SamplingEngine {
  // ✅ FIXED: shouldSampleControl to properly detect when sampling is needed
  static shouldSampleControl(controlData: any): boolean {
    const frequency = controlData['Control frequency'] || controlData['frequency'] || 'Annually';
    console.log(`🔍 Checking if sampling required for frequency: ${frequency}`);
    
    const freq = frequency.toLowerCase().trim();
    
    // These frequencies DO require sampling
    const samplingRequired = [
      'annually', 'annual', 'yearly',
      'quarterly', 'quarter',
      'monthly', 'month',
      'weekly', 'week',
      'daily', 'day',
      'bi-weekly', 'biweekly',
      'semi-annually', 'semi-annual'
    ];
    
    // These frequencies do NOT require sampling
    const noSamplingRequired = [
      'continuous', 'ongoing', 'real-time',
      'as needed', 'ad hoc', 'event-driven',
      'one-time', 'single event'
    ];
    
    const requiresSampling = samplingRequired.some(term => freq.includes(term));
    const noSampling = noSamplingRequired.some(term => freq.includes(term));
    
    if (noSampling) {
      console.log(`❌ No sampling required for frequency: ${frequency}`);
      return false;
    }
    
    if (requiresSampling) {
      console.log(`✅ Sampling required for frequency: ${frequency}`);
      return true;
    }
    
    // Default: if unsure, require sampling
    console.log(`✅ Default: Sampling required for frequency: ${frequency}`);
    return true;
  }

  // ✅ FIXED: calculateSampleSizeFromFrequency with proper sample counts
  static calculateSampleSizeFromFrequency(controlData: any, auditMonths: number = 12): number {
    const frequency = controlData['Control frequency'] || controlData['frequency'] || 'Annually';
    const riskRating = controlData['PwC risk rating (H/M/L)'] || controlData['riskRating'] || 'M';
    
    console.log(`📊 Calculating sample size for frequency: ${frequency}, risk: ${riskRating}`);
    
    const freq = frequency.toLowerCase().trim();
    let baseSampleSize = 1;
    
    // Determine base sample size based on frequency
    if (freq.includes('annual')) {
      baseSampleSize = 1; // 1 sample per year
    } else if (freq.includes('quarter')) {
      baseSampleSize = 4; // 1 sample per quarter
    } else if (freq.includes('month')) {
      baseSampleSize = 6; // 1 sample every other month
    } else if (freq.includes('week')) {
      baseSampleSize = 8; // ~2 samples per quarter
    } else if (freq.includes('daily')) {
      baseSampleSize = 12; // ~1 sample per month
    } else if (freq.includes('bi-week') || freq.includes('semi')) {
      baseSampleSize = freq.includes('annual') ? 2 : 6; // 2 per year or 6 per year
    } else {
      baseSampleSize = 4; // Default quarterly sampling
    }
    
    // Adjust based on risk rating
    const riskMultiplier = riskRating.toUpperCase() === 'H' ? 1.5 : 
                          riskRating.toUpperCase() === 'L' ? 0.5 : 1;
    
    const finalSampleSize = Math.max(1, Math.round(baseSampleSize * riskMultiplier));
    
    console.log(`📊 Calculated sample size: ${finalSampleSize} (base: ${baseSampleSize}, risk multiplier: ${riskMultiplier})`);
    return finalSampleSize;
  }

  // ✅ FIXED: getSamplingMethodology
  static getSamplingMethodology(controlData: any): 'random' | 'systematic' | 'judgmental' {
    const riskRating = controlData['PwC risk rating (H/M/L)'] || controlData['riskRating'] || 'M';
    
    const risk = riskRating.toUpperCase();
    
    if (risk === 'H') return 'judgmental';
    if (risk === 'M') return 'systematic';
    return 'random'; // Low risk
  }

  // ✅ FIXED: generateSamples function with correct return type
  static generateSamples(config: SamplingConfig): GeneratedSample[] {
    console.log('🎯 Starting sample generation for config:', config.id);
    console.log('📊 Config details:', {
      sampleSize: config.sampleSize,
      methodology: config.methodology,
      startDate: config.timePeriod.startDate,
      endDate: config.timePeriod.endDate,
      quarters: config.timePeriod.quarters?.length || 0
    });
    
    if (config.sampleSize === 0) {
      console.log('⚠️ Sample size is 0, returning empty array');
      return [];
    }
    
    const samples: GeneratedSample[] = [];
    const startDate = new Date(config.timePeriod.startDate);
    const endDate = new Date(config.timePeriod.endDate);
    
    // Generate samples across the entire audit period
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`📅 Audit period: ${totalDays} days`);
    
    for (let i = 0; i < config.sampleSize; i++) {
      let sampleDate: Date;
      
      if (config.methodology === 'random') {
        // Random sampling
        const randomDays = Math.floor(Math.random() * totalDays);
        sampleDate = new Date(startDate);
        sampleDate.setDate(startDate.getDate() + randomDays);
      } else if (config.methodology === 'systematic') {
        // Systematic sampling - evenly distributed
        const interval = totalDays / (config.sampleSize + 1);
        sampleDate = new Date(startDate);
        sampleDate.setDate(startDate.getDate() + Math.floor((i + 1) * interval));
      } else {
        // Judgmental sampling - focus on key periods
        const interval = totalDays / config.sampleSize;
        sampleDate = new Date(startDate);
        sampleDate.setDate(startDate.getDate() + Math.floor(i * interval) + Math.floor(interval / 2));
      }
      
      // Ensure sample date is within bounds
      if (sampleDate > endDate) sampleDate = new Date(endDate);
      if (sampleDate < startDate) sampleDate = new Date(startDate);
      
      // Determine which quarter this sample falls into
      const quarterName = SamplingEngine.getQuarterForDate(sampleDate);
      
      const sample: GeneratedSample = {
        id: `${config.id}-sample-${i + 1}`,
        samplingConfigId: config.id,
        sampleDate: sampleDate.toISOString().split('T')[0],
        sampleIndex: i + 1,
        status: 'pending',
        quarterName,
        isWeekend: sampleDate.getDay() === 0 || sampleDate.getDay() === 6,
        isHoliday: false // Can be enhanced with actual holiday detection
      };
      
      samples.push(sample);
      console.log(`✅ Generated sample ${i + 1}: ${sample.sampleDate} (${quarterName})`);
    }
    
    console.log(`🎉 Generated ${samples.length} samples successfully`);
    return samples;
  }

  // ✅ HELPER: Get quarter name for a date
  static getQuarterForDate(date: Date): string {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    
    if (month <= 3) return `Q1 ${year}`;
    if (month <= 6) return `Q2 ${year}`;
    if (month <= 9) return `Q3 ${year}`;
    return `Q4 ${year}`;
  }

  // ✅ FIXED: createCalendarQuarters function (this was missing)
  static createCalendarQuarters(startDate: string, endDate: string): QuarterDefinition[] {
    console.log(`🗓️ Creating calendar quarters for date range: ${startDate} to ${endDate}`);
    
    const start = new Date(startDate);
    const year = start.getFullYear();
    
    // Create standard quarters
    const quarters: QuarterDefinition[] = [
      {
        id: `Q1-${year}`,
        name: `Q1 ${year}`,
        startDate: `${year}-01-01`,
        endDate: `${year}-03-31`,
        samplesRequired: 1
      },
      {
        id: `Q2-${year}`,
        name: `Q2 ${year}`,
        startDate: `${year}-04-01`,
        endDate: `${year}-06-30`,
        samplesRequired: 1
      },
      {
        id: `Q3-${year}`,
        name: `Q3 ${year}`,
        startDate: `${year}-07-01`,
        endDate: `${year}-09-30`,
        samplesRequired: 1
      },
      {
        id: `Q4-${year}`,
        name: `Q4 ${year}`,
        startDate: `${year}-10-01`,
        endDate: `${year}-12-31`,
        samplesRequired: 1
      }
    ];
    
    console.log(`✅ Created ${quarters.length} quarters`);
    return quarters;
  }

  // ✅ FIXED: createTimePeriodsFromFrequency with correct return type
  static createTimePeriodsFromFrequency(
    controlData: any,
    startDate: string,
    endDate: string
  ): QuarterDefinition[] {
    return SamplingEngine.createCalendarQuarters(startDate, endDate);
  }
}

// ✅ FIXED: createSamplingConfigFromControlData with correct types
export const createSamplingConfigFromControlData = (
  controlId: string,
  controlData: any,
  auditStartDate: string,
  auditEndDate: string
): SamplingConfig | null => {
  console.log(`🚀 Creating sampling config for control: ${controlId}`);
  console.log(`📊 Control data:`, controlData);
  
  // Check if sampling is required
  const requiresSampling = SamplingEngine.shouldSampleControl(controlData);
  
  if (!requiresSampling) {
    console.log(`❌ No sampling required for control: ${controlId}`);
    return null;
  }
  
  // Calculate sample size and methodology
  const sampleSize = SamplingEngine.calculateSampleSizeFromFrequency(controlData, 12);
  const methodology = SamplingEngine.getSamplingMethodology(controlData);
  
  // Create time periods
  const quarters = SamplingEngine.createTimePeriodsFromFrequency(
    controlData,
    auditStartDate,
    auditEndDate
  );
  
  const config: SamplingConfig = {
    id: `sampling-${controlId}-${Date.now()}`,
    controlId,
    sampleSize,
    methodology,
    timePeriod: {
      type: 'calendar_quarters', // ✅ FIXED: Use correct literal type
      startDate: auditStartDate,
      endDate: auditEndDate,
      quarters
    },
    minimumInterval: methodology === 'judgmental' ? 7 : 1,
    seed: Math.floor(Math.random() * 10000), // ✅ FIXED: Always provide seed
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    status: 'draft',
    notes: `Auto-generated for ${controlData['Control frequency']} frequency, ${controlData['PwC risk rating (H/M/L)']} risk rating`
  };
  
  console.log(`✅ Created sampling config:`, {
    id: config.id,
    sampleSize: config.sampleSize,
    methodology: config.methodology,
    quarters: config.timePeriod.quarters?.length
  });
  
  return config;
};

// ✅ REMOVED: Don't export samplingUtils (it was causing import errors)
// ✅ REMOVED: Don't redefine types here - use the ones from your main types file