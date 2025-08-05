// utils/samplingEngine.ts - FIXED: Correct Excel column mapping (F=frequency, E=risk)
import { 
  SamplingConfig, 
  GeneratedSample, 
  TimePeriod, 
  QuarterDefinition,
  CustomTimePeriod
} from '../types';

// FIXED: Interface for Excel control data with correct column mapping
interface ControlData {
  'Control frequency': string;          // Column F in Excel
  'PwC risk rating (H/M/L)': string;    // Column E in Excel
  [key: string]: any;
}

// Seeded random number generator for reproducible results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Holiday detection (basic US holidays)
const US_HOLIDAYS_2025 = [
  '2025-01-01', // New Year's Day
  '2025-01-20', // MLK Day
  '2025-02-17', // Presidents Day
  '2025-05-26', // Memorial Day
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-10-13', // Columbus Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving
  '2025-12-25'  // Christmas
];

// FIXED: Frequency-based sample calculation - matches Excel frequencies exactly
interface FrequencySampleMapping {
  frequency: string;
  samplesPerYear: number;
  requiresSampling: boolean;
  description: string;
}

// UPDATED: Based on actual Excel data analysis
const FREQUENCY_SAMPLE_MAPPINGS: FrequencySampleMapping[] = [
  { frequency: 'Annually', samplesPerYear: 1, requiresSampling: true, description: '1 sample per year' },
  { frequency: 'Quarterly', samplesPerYear: 4, requiresSampling: true, description: '1 sample per quarter' },
  { frequency: 'Weekly', samplesPerYear: 8, requiresSampling: true, description: '~2 samples per quarter' },
  { frequency: 'As needed', samplesPerYear: 0, requiresSampling: false, description: 'No sampling - event-driven' },
  { frequency: 'Continuous', samplesPerYear: 0, requiresSampling: false, description: 'No sampling - ongoing monitoring' },
  // Additional frequencies for completeness
  { frequency: 'Annual', samplesPerYear: 1, requiresSampling: true, description: '1 sample per year' },
  { frequency: 'Monthly', samplesPerYear: 6, requiresSampling: true, description: 'Sample every other month' },
  { frequency: 'Daily', samplesPerYear: 12, requiresSampling: true, description: 'Sample ~1 per month' },
  { frequency: 'Bi-weekly', samplesPerYear: 6, requiresSampling: true, description: 'Sample every other month' },
  { frequency: 'Semi-annually', samplesPerYear: 2, requiresSampling: true, description: 'Two samples per year' },
  { frequency: 'One-time', samplesPerYear: 0, requiresSampling: false, description: 'No sampling - single event' },
  { frequency: 'Ad hoc', samplesPerYear: 0, requiresSampling: false, description: 'No sampling - irregular basis' }
];

// Core sampling engine class
export class SamplingEngine {
  
  /**
   * FIXED: Determine if a control requires sampling based on Excel frequency data
   */
  static shouldSampleControl(controlData: ControlData): boolean {
    const frequency = controlData['Control frequency']?.trim();
    
    if (!frequency) {
      console.warn('❌ No frequency found in control data, defaulting to no sampling');
      return false;
    }

    const mapping = FREQUENCY_SAMPLE_MAPPINGS.find(m => 
      m.frequency.toLowerCase() === frequency.toLowerCase()
    );

    if (!mapping) {
      console.warn(`⚠️ Unknown frequency "${frequency}", defaulting to sampling required`);
      return true; // Default to sampling for unknown frequencies
    }

    console.log(`✅ Frequency "${frequency}" → ${mapping.requiresSampling ? 'Sampling required' : 'No sampling needed'}`);
    return mapping.requiresSampling;
  }

  /**
   * FIXED: Calculate sample size based on Excel frequency data instead of keywords
   */
  static calculateSampleSizeFromFrequency(
    controlData: ControlData,
    auditPeriodMonths: number = 12
  ): number {
    const frequency = controlData['Control frequency']?.trim();
    const riskRating = controlData['PwC risk rating (H/M/L)']?.trim();
    
    console.log(`🔍 Calculating samples for frequency: "${frequency}", risk: "${riskRating}"`);
    
    if (!frequency) {
      console.warn('❌ No frequency found, defaulting to 1 sample');
      return 1;
    }

    // Find frequency mapping
    const mapping = FREQUENCY_SAMPLE_MAPPINGS.find(m => 
      m.frequency.toLowerCase() === frequency.toLowerCase()
    );

    if (!mapping) {
      console.warn(`⚠️ Unknown frequency "${frequency}", defaulting to 2 samples`);
      return 2;
    }

    if (!mapping.requiresSampling) {
      console.log(`✅ "${frequency}" requires no sampling → 0 samples`);
      return 0; // No samples needed for continuous/as needed controls
    }

    // Calculate base samples for the audit period
    let baseSamples = Math.ceil((mapping.samplesPerYear * auditPeriodMonths) / 12);
    
    // Ensure minimum of 1 sample for controls that require sampling
    baseSamples = Math.max(1, baseSamples);

    // MINOR risk adjustment (not the primary factor)
    const originalSamples = baseSamples;
    if (riskRating === 'H' && baseSamples > 0) {
      baseSamples = Math.min(baseSamples + 1, 15); // Cap at 15 samples max
    } else if (riskRating === 'L' && baseSamples > 1) {
      baseSamples = Math.max(1, baseSamples - 1); // Reduce by 1 but keep minimum of 1
    }

    console.log(`📊 Frequency: "${frequency}" (${mapping.samplesPerYear}/year) + Risk: "${riskRating}" → ${originalSamples} base → ${baseSamples} final samples`);
    return baseSamples;
  }

  /**
   * FIXED: Get sampling methodology based on risk level (not frequency)
   */
  static getSamplingMethodology(controlData: ControlData): 'random' | 'systematic' | 'judgmental' {
    const riskRating = controlData['PwC risk rating (H/M/L)']?.trim();
    
    let methodology: 'random' | 'systematic' | 'judgmental';
    
    switch (riskRating) {
      case 'H':
        methodology = 'judgmental'; // High risk = judgmental selection
        break;
      case 'M':
        methodology = 'systematic';  // Medium risk = systematic selection
        break;
      case 'L':
      default:
        methodology = 'random';     // Low risk = random selection
        break;
    }
    
    console.log(`🎯 Risk "${riskRating}" → ${methodology} sampling methodology`);
    return methodology;
  }

  /**
   * Generate samples based on sampling configuration
   */
  static generateSamples(config: SamplingConfig): GeneratedSample[] {
    console.log(`🎲 Generating ${config.sampleSize} samples using ${config.methodology} methodology`);
    
    const rng = new SeededRandom(config.seed || Date.now());

    switch (config.methodology) {
      case 'random':
        return this.generateRandomSamples(config, rng);
      case 'systematic':
        return this.generateSystematicSamples(config, rng);
      case 'judgmental':
        return this.generateJudgmentalSamples(config, rng);
      default:
        throw new Error(`Unsupported sampling methodology: ${config.methodology}`);
    }
  }

  /**
   * Generate random samples within time periods
   */
  private static generateRandomSamples(config: SamplingConfig, rng: SeededRandom): GeneratedSample[] {
    const samples: GeneratedSample[] = [];
    let sampleIndex = 1;

    if (config.timePeriod.type === 'calendar_quarters' && config.timePeriod.quarters) {
      // Generate samples for each quarter
      for (const quarter of config.timePeriod.quarters) {
        const quarterSamples = this.generateRandomSamplesForPeriod(
          config,
          quarter.startDate,
          quarter.endDate,
          quarter.samplesRequired,
          rng,
          sampleIndex,
          quarter.id,
          quarter.name
        );
        samples.push(...quarterSamples);
        sampleIndex += quarterSamples.length;
      }
    } else if (config.customPeriods) {
      // Generate samples for custom periods
      for (const period of config.customPeriods) {
        const periodSamples = this.generateRandomSamplesForPeriod(
          config,
          period.startDate,
          period.endDate,
          period.samplesRequired,
          rng,
          sampleIndex,
          period.id,
          period.name
        );
        samples.push(...periodSamples);
        sampleIndex += periodSamples.length;
      }
    } else {
      // Generate samples for entire period
      const totalSamples = this.generateRandomSamplesForPeriod(
        config,
        config.timePeriod.startDate,
        config.timePeriod.endDate,
        config.sampleSize,
        rng,
        sampleIndex
      );
      samples.push(...totalSamples);
    }

    console.log(`✅ Generated ${samples.length} random samples`);
    return samples;
  }

  /**
   * Generate random samples for a specific time period
   */
  private static generateRandomSamplesForPeriod(
    config: SamplingConfig,
    startDate: string,
    endDate: string,
    sampleCount: number,
    rng: SeededRandom,
    startIndex: number,
    periodId?: string,
    periodName?: string
  ): GeneratedSample[] {
    const samples: GeneratedSample[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const selectedDays = new Set<number>();
    const attempts = sampleCount * 10; // Prevent infinite loops
    
    for (let attempt = 0; attempt < attempts && selectedDays.size < sampleCount; attempt++) {
      const randomDay = rng.nextInt(0, totalDays);
      
      if (selectedDays.has(randomDay)) continue;
      
      const sampleDate = new Date(start);
      sampleDate.setDate(sampleDate.getDate() + randomDay);
      
      // Check minimum interval constraint
      if (config.minimumInterval > 0) {
        const tooClose = Array.from(selectedDays).some(existingDay => {
          const diff = Math.abs(randomDay - existingDay);
          return diff < config.minimumInterval;
        });
        if (tooClose) continue;
      }
      
      // Skip weekends if it's a business control
      const dayOfWeek = sampleDate.getDay();
      if (this.shouldSkipWeekend(config.controlId) && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }
      
      selectedDays.add(randomDay);
      
      const sample: GeneratedSample = {
        id: `sample-${config.id}-${startIndex + selectedDays.size - 1}`,
        samplingConfigId: config.id,
        quarterId: periodId,
        sampleDate: sampleDate.toISOString().split('T')[0],
        sampleIndex: startIndex + selectedDays.size - 1,
        quarterName: periodName,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday: US_HOLIDAYS_2025.includes(sampleDate.toISOString().split('T')[0]),
        status: 'pending'
      };
      
      samples.push(sample);
    }
    
    // Sort samples by date
    return samples.sort((a, b) => a.sampleDate.localeCompare(b.sampleDate));
  }

  /**
   * Generate systematic samples (every nth item)
   */
  private static generateSystematicSamples(config: SamplingConfig, rng: SeededRandom): GeneratedSample[] {
    const samples: GeneratedSample[] = [];
    
    if (config.timePeriod.quarters) {
      let sampleIndex = 1;
      
      for (const quarter of config.timePeriod.quarters) {
        const start = new Date(quarter.startDate);
        const end = new Date(quarter.endDate);
        const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        if (quarter.samplesRequired <= 0) continue;
        
        const interval = Math.floor(totalDays / quarter.samplesRequired);
        const randomStart = rng.nextInt(0, interval - 1);
        
        for (let i = 0; i < quarter.samplesRequired; i++) {
          const dayOffset = randomStart + (i * interval);
          
          if (dayOffset >= totalDays) break;
          
          const sampleDate = new Date(start);
          sampleDate.setDate(sampleDate.getDate() + dayOffset);
          
          const sample: GeneratedSample = {
            id: `sample-${config.id}-${sampleIndex}`,
            samplingConfigId: config.id,
            quarterId: quarter.id,
            sampleDate: sampleDate.toISOString().split('T')[0],
            sampleIndex: sampleIndex,
            quarterName: quarter.name,
            isWeekend: sampleDate.getDay() === 0 || sampleDate.getDay() === 6,
            isHoliday: US_HOLIDAYS_2025.includes(sampleDate.toISOString().split('T')[0]),
            status: 'pending'
          };
          
          samples.push(sample);
          sampleIndex++;
        }
      }
    }
    
    console.log(`✅ Generated ${samples.length} systematic samples`);
    return samples.sort((a, b) => a.sampleDate.localeCompare(b.sampleDate));
  }

  /**
   * Generate judgmental samples (risk-based selection)
   */
  private static generateJudgmentalSamples(config: SamplingConfig, rng: SeededRandom): GeneratedSample[] {
    // For judgmental sampling, we bias towards:
    // 1. Month-end dates (higher risk)
    // 2. Beginning/end of quarters
    // 3. Random dates to ensure coverage
    
    const samples: GeneratedSample[] = [];
    
    if (config.timePeriod.quarters) {
      let sampleIndex = 1;
      
      for (const quarter of config.timePeriod.quarters) {
        const quarterSamples = this.generateJudgmentalSamplesForQuarter(
          config,
          quarter,
          rng,
          sampleIndex
        );
        samples.push(...quarterSamples);
        sampleIndex += quarterSamples.length;
      }
    }
    
    console.log(`✅ Generated ${samples.length} judgmental samples`);
    return samples.sort((a, b) => a.sampleDate.localeCompare(b.sampleDate));
  }

  /**
   * Generate judgmental samples for a specific quarter
   */
  private static generateJudgmentalSamplesForQuarter(
    config: SamplingConfig,
    quarter: QuarterDefinition,
    rng: SeededRandom,
    startIndex: number
  ): GeneratedSample[] {
    const samples: GeneratedSample[] = [];
    const start = new Date(quarter.startDate);
    const end = new Date(quarter.endDate);
    
    // Get month-end dates in the quarter
    const monthEndDates = this.getMonthEndDatesInPeriod(start, end);
    
    // Get quarter boundary dates
    const quarterBoundaryDates = [
      start,
      new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000)), // First week
      new Date(end.getTime() - (7 * 24 * 60 * 60 * 1000)),   // Last week
      end
    ];
    
    const riskDates = [...monthEndDates, ...quarterBoundaryDates]
      .filter((date, index, arr) => 
        arr.findIndex(d => d.toISOString().split('T')[0] === date.toISOString().split('T')[0]) === index
      )
      .sort((a, b) => a.getTime() - b.getTime());
    
    // Select samples with bias towards risk dates
    const selectedDates: Date[] = [];
    
    // Always include some high-risk dates
    const riskSamples = Math.min(Math.ceil(quarter.samplesRequired * 0.6), riskDates.length);
    for (let i = 0; i < riskSamples; i++) {
      const randomRiskDate = riskDates[rng.nextInt(0, riskDates.length - 1)];
      if (!selectedDates.some(d => d.toISOString().split('T')[0] === randomRiskDate.toISOString().split('T')[0])) {
        selectedDates.push(randomRiskDate);
      }
    }
    
    // Fill remaining with random dates
    const remainingSamples = quarter.samplesRequired - selectedDates.length;
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < remainingSamples * 10 && selectedDates.length < quarter.samplesRequired; i++) {
      const randomDay = rng.nextInt(0, totalDays);
      const randomDate = new Date(start);
      randomDate.setDate(randomDate.getDate() + randomDay);
      
      const dateString = randomDate.toISOString().split('T')[0];
      if (!selectedDates.some(d => d.toISOString().split('T')[0] === dateString)) {
        selectedDates.push(randomDate);
      }
    }
    
    // Convert to samples
    selectedDates.sort((a, b) => a.getTime() - b.getTime());
    
    selectedDates.forEach((date, index) => {
      const sample: GeneratedSample = {
        id: `sample-${config.id}-${startIndex + index}`,
        samplingConfigId: config.id,
        quarterId: quarter.id,
        sampleDate: date.toISOString().split('T')[0],
        sampleIndex: startIndex + index,
        quarterName: quarter.name,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday: US_HOLIDAYS_2025.includes(date.toISOString().split('T')[0]),
        status: 'pending'
      };
      samples.push(sample);
    });
    
    return samples;
  }

  /**
   * FIXED: Create appropriate time periods based on control frequency
   */
  static createTimePeriodsFromFrequency(
    controlData: ControlData,
    auditStartDate: string,
    auditEndDate: string
  ): QuarterDefinition[] {
    const frequency = controlData['Control frequency']?.trim();
    const sampleSize = this.calculateSampleSizeFromFrequency(controlData);
    
    console.log(`🗓️ Creating time periods for frequency: "${frequency}", sample size: ${sampleSize}`);
    
    if (sampleSize === 0) {
      console.log(`✅ No time periods needed for non-sampling control`);
      return []; // No time periods needed for non-sampling controls
    }

    // For most frequencies, use calendar quarters but adjust sample distribution
    const quarters = this.createCalendarQuarters(auditStartDate, auditEndDate);
    
    // Distribute samples across quarters based on frequency
    const totalQuarters = quarters.length;
    let samplesDistributed = 0;
    
    const result = quarters.map((quarter, index) => {
      // For the last quarter, assign remaining samples
      if (index === totalQuarters - 1) {
        const remainingSamples = sampleSize - samplesDistributed;
        samplesDistributed += remainingSamples;
        return {
          ...quarter,
          samplesRequired: remainingSamples
        };
      } else {
        // Distribute evenly across other quarters
        const samplesForQuarter = Math.floor(sampleSize / totalQuarters);
        samplesDistributed += samplesForQuarter;
        return {
          ...quarter,
          samplesRequired: samplesForQuarter
        };
      }
    });
    
    console.log(`📊 Distributed ${sampleSize} samples across ${totalQuarters} quarters:`, 
      result.map(q => `${q.name}: ${q.samplesRequired}`).join(', '));
    
    return result;
  }

  /**
   * Create default calendar quarters for a given year
   */
  static createCalendarQuarters(startDate: string, endDate: string): QuarterDefinition[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const year = start.getFullYear();
    
    const quarters: QuarterDefinition[] = [
      {
        id: `q1-${year}`,
        name: `Q1 ${year}`,
        startDate: `${year}-01-01`,
        endDate: `${year}-03-31`,
        samplesRequired: 0 // Will be set by createTimePeriodsFromFrequency
      },
      {
        id: `q2-${year}`,
        name: `Q2 ${year}`,
        startDate: `${year}-04-01`,
        endDate: `${year}-06-30`,
        samplesRequired: 0
      },
      {
        id: `q3-${year}`,
        name: `Q3 ${year}`,
        startDate: `${year}-07-01`,
        endDate: `${year}-09-30`,
        samplesRequired: 0
      },
      {
        id: `q4-${year}`,
        name: `Q4 ${year}`,
        startDate: `${year}-10-01`,
        endDate: `${year}-12-31`,
        samplesRequired: 0
      }
    ];
    
    // Filter quarters that overlap with the audit period
    const filteredQuarters = quarters.filter(quarter => {
      const qStart = new Date(quarter.startDate);
      const qEnd = new Date(quarter.endDate);
      return qStart <= end && qEnd >= start;
    });
    
    console.log(`📅 Created ${filteredQuarters.length} calendar quarters for audit period ${startDate} to ${endDate}`);
    return filteredQuarters;
  }

  /**
   * Create fiscal quarters based on fiscal year start
   */
  static createFiscalQuarters(
    startDate: string, 
    endDate: string, 
    fiscalYearStart: number = 1 // 1 = January, 4 = April, 7 = July, 10 = October
  ): QuarterDefinition[] {
    const start = new Date(startDate);
    const year = start.getFullYear();
    
    const quarters: QuarterDefinition[] = [];
    
    for (let q = 0; q < 4; q++) {
      const quarterStart = new Date(year, fiscalYearStart - 1 + (q * 3), 1);
      const quarterEnd = new Date(year, fiscalYearStart - 1 + (q * 3) + 3, 0); // Last day of the month
      
      quarters.push({
        id: `fq${q + 1}-${year}`,
        name: `FQ${q + 1} ${year}`,
        startDate: quarterStart.toISOString().split('T')[0],
        endDate: quarterEnd.toISOString().split('T')[0],
        samplesRequired: 0
      });
    }
    
    return quarters;
  }

  /**
   * Validate sampling configuration
   */
  static validateSamplingConfig(config: SamplingConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.controlId) {
      errors.push('Control ID is required');
    }
    
    if (config.sampleSize < 0) {
      errors.push('Sample size cannot be negative');
    }
    
    if (!config.timePeriod.startDate || !config.timePeriod.endDate) {
      errors.push('Time period start and end dates are required');
    }
    
    if (new Date(config.timePeriod.startDate) >= new Date(config.timePeriod.endDate)) {
      errors.push('Start date must be before end date');
    }
    
    if (config.minimumInterval < 0) {
      errors.push('Minimum interval cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper methods
  private static shouldSkipWeekend(controlId: string): boolean {
    // For now, assume all controls should skip weekends
    // This could be made configurable per control type
    return true;
  }

  private static getMonthEndDatesInPeriod(start: Date, end: Date): Date[] {
    const monthEndDates: Date[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    
    while (current <= end) {
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      if (monthEnd >= start && monthEnd <= end) {
        monthEndDates.push(new Date(monthEnd));
      }
      current.setMonth(current.getMonth() + 1);
    }
    
    return monthEndDates;
  }
}

/**
 * FIXED: Export utility functions with new frequency-based logic
 */
export const samplingUtils = {
  generateSamples: SamplingEngine.generateSamples,
  shouldSampleControl: SamplingEngine.shouldSampleControl,
  calculateSampleSizeFromFrequency: SamplingEngine.calculateSampleSizeFromFrequency,
  getSamplingMethodology: SamplingEngine.getSamplingMethodology,
  createTimePeriodsFromFrequency: SamplingEngine.createTimePeriodsFromFrequency,
  createCalendarQuarters: SamplingEngine.createCalendarQuarters,
  createFiscalQuarters: SamplingEngine.createFiscalQuarters,
  validateConfig: SamplingEngine.validateSamplingConfig
};

/**
 * FIXED: Main function to create sampling configuration from Excel control data
 */
export function createSamplingConfigFromControlData(
  controlId: string,
  controlData: ControlData,
  auditStartDate: string,
  auditEndDate: string
): SamplingConfig | null {
  
  console.log(`🚀 Creating sampling config for control ${controlId}:`, controlData);
  
  // Check if sampling is required
  if (!SamplingEngine.shouldSampleControl(controlData)) {
    console.log(`✅ Control ${controlId} does not require sampling (frequency: ${controlData['Control frequency']})`);
    return null;
  }

  // Calculate sample size based on frequency
  const sampleSize = SamplingEngine.calculateSampleSizeFromFrequency(controlData);
  
  // Get appropriate methodology based on risk
  const methodology = SamplingEngine.getSamplingMethodology(controlData);
  
  // Create time periods based on frequency
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
      type: 'calendar_quarters',
      startDate: auditStartDate,
      endDate: auditEndDate,
      quarters
    },
    minimumInterval: methodology === 'judgmental' ? 7 : 1, // More spacing for judgmental
    seed: Math.floor(Math.random() * 10000),
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    status: 'draft',
    notes: `Auto-generated based on frequency: ${controlData['Control frequency']}, Risk: ${controlData['PwC risk rating (H/M/L)']}`
  };

  console.log(`✅ Created sampling config:`, {
    controlId,
    sampleSize,
    methodology,
    quarters: quarters.length,
    notes: config.notes
  });

  return config;
}