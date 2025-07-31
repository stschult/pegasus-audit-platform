// lib/sampling-engine.ts - COMPLETELY CLEAN VERSION (NO DEBUG)
import { SamplingConfig, SamplingResult, SampleDate, SamplePeriod } from '../types/sampling';

export class AuditSamplingEngine {
  private static readonly DEFAULT_SAMPLES_PER_QUARTER = {
    low: { daily: 2, weekly: 3, monthly: 2 },
    moderate: { daily: 3, weekly: 4, monthly: 3 },
    high: { daily: 4, weekly: 5, monthly: 4 }
  };

  private static readonly MIN_INTERVAL_DAYS = {
    daily: 7,    // At least 1 week apart for daily controls
    weekly: 14,  // At least 2 weeks apart for weekly controls
    monthly: 30  // At least 1 month apart for monthly controls
  };

  /**
   * Generate audit samples based on configuration
   */
  static generateSamples(config: SamplingConfig): SamplingResult {
    const seed = config.seed || this.generateSeed();
    const rng = this.createSeededRNG(seed);
    
    const quarters = this.getQuarters(config.auditPeriod);
    
    // Safely get samples per quarter with fallbacks
    const riskLevel = config.riskLevel in this.DEFAULT_SAMPLES_PER_QUARTER 
      ? config.riskLevel 
      : 'low'; // fallback to 'low' if invalid
    
    const frequency = config.controlFrequency in this.DEFAULT_SAMPLES_PER_QUARTER[riskLevel]
      ? config.controlFrequency
      : 'monthly'; // fallback to 'monthly' if invalid
    
    const samplesPerQuarter = config.samplesPerQuarter || 
      this.DEFAULT_SAMPLES_PER_QUARTER[riskLevel][frequency];
    
    const periods: SamplePeriod[] = quarters.map(quarter => ({
      ...quarter,
      samples: this.generateQuarterSamples(
        quarter,
        samplesPerQuarter,
        config,
        rng
      )
    }));

    return {
      controlId: config.controlId,
      generatedAt: new Date(),
      config,
      periods,
      totalSamples: periods.reduce((sum, p) => sum + p.samples.length, 0),
      metadata: {
        seed,
        algorithm: 'time-based-random',
        version: '1.0'
      }
    };
  }

  /**
   * Generate samples for a specific quarter
   */
  private static generateQuarterSamples(
    quarter: { startDate: Date; endDate: Date; quarter: string },
    sampleCount: number,
    config: SamplingConfig,
    rng: () => number
  ): SampleDate[] {
    const availableDates = this.getAvailableDates(
      quarter.startDate,
      quarter.endDate,
      config.controlFrequency
    );

    // Safety check: if no available dates, return empty array
    if (availableDates.length === 0) {
      console.warn(`No available dates for quarter ${quarter.quarter}`);
      return [];
    }

    const minInterval = config.minimumInterval || 
      this.MIN_INTERVAL_DAYS[config.controlFrequency];

    const selectedDates: Date[] = [];
    const maxAttempts = availableDates.length * 2;
    let attempts = 0;

    while (selectedDates.length < sampleCount && attempts < maxAttempts) {
      const randomIndex = Math.floor(rng() * availableDates.length);
      const candidateDate = availableDates[randomIndex];

      // Safety check: ensure candidateDate exists
      if (!candidateDate) {
        attempts++;
        continue;
      }

      // Check minimum interval constraint
      const tooClose = selectedDates.some(existingDate => {
        // Additional safety check for existingDate
        if (!existingDate) return false;
        return Math.abs(candidateDate.getTime() - existingDate.getTime()) < 
          (minInterval * 24 * 60 * 60 * 1000);
      });

      if (!tooClose) {
        selectedDates.push(candidateDate);
      }
      attempts++;
    }

    // Sort dates chronologically
    selectedDates.sort((a, b) => a.getTime() - b.getTime());

    return selectedDates.map((date, index) => ({
      id: `${config.controlId}-${quarter.quarter}-${index + 1}`,
      date,
      quarter: quarter.quarter,
      status: 'pending' as const
    }));
  }

  /**
   * Get available dates based on control frequency
   */
  private static getAvailableDates(
    startDate: Date,
    endDate: Date,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);

    // Safety check: ensure valid date range
    if (!startDate || !endDate || startDate > endDate) {
      console.warn('Invalid date range provided to getAvailableDates');
      return dates;
    }

    while (current <= endDate) {
      // Skip weekends for daily/weekly controls (business days only)
      if (frequency !== 'monthly') {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          dates.push(new Date(current));
        }
      } else {
        dates.push(new Date(current));
      }

      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Split audit period into quarters - MULTI-YEAR SUPPORT
   */
  private static getQuarters(period: { startDate: Date; endDate: Date }) {
    const quarters = [];
    const startYear = period.startDate.getFullYear();
    const endYear = period.endDate.getFullYear();

    // Process each year in the audit period
    for (let year = startYear; year <= endYear; year++) {
      // Define quarter boundaries for this year
      const quarterDefs = [
        { q: 'Q1', start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
        { q: 'Q2', start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
        { q: 'Q3', start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
        { q: 'Q4', start: new Date(year, 9, 1), end: new Date(year, 11, 31) }
      ];

      for (const qDef of quarterDefs) {
        // Calculate the overlap between quarter and audit period
        const quarterStart = qDef.start > period.startDate ? qDef.start : period.startDate;
        const quarterEnd = qDef.end < period.endDate ? qDef.end : period.endDate;

        // Only add quarter if there's overlap
        if (quarterStart <= quarterEnd) {
          const quarterName = `${year}-${qDef.q}`;
          
          quarters.push({
            quarter: quarterName,
            startDate: quarterStart,
            endDate: quarterEnd
          });
        }
      }
    }

    return quarters;
  }

  /**
   * Create seeded random number generator for reproducible results
   */
  private static createSeededRNG(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return function() {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280;
    };
  }

  private static generateSeed(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Export sampling results to various formats
   */
  static exportToCSV(result: SamplingResult): string {
    const headers = ['Quarter', 'Sample ID', 'Date', 'Status', 'Notes'];
    const rows = [headers.join(',')];

    result.periods.forEach(period => {
      period.samples.forEach(sample => {
        rows.push([
          sample.quarter,
          sample.id,
          sample.date.toISOString().split('T')[0],
          sample.status,
          sample.notes || ''
        ].join(','));
      });
    });

    return rows.join('\n');
  }

  /**
   * Validate sampling configuration
   */
  static validateConfig(config: SamplingConfig): string[] {
    const errors: string[] = [];

    if (config.auditPeriod.startDate >= config.auditPeriod.endDate) {
      errors.push('Start date must be before end date');
    }

    if (config.samplesPerQuarter && config.samplesPerQuarter < 1) {
      errors.push('Samples per quarter must be at least 1');
    }

    if (config.minimumInterval && config.minimumInterval < 1) {
      errors.push('Minimum interval must be at least 1 day');
    }

    return errors;
  }
}