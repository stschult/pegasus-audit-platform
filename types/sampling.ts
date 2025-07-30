// types/sampling.ts
export interface SamplingConfig {
  controlId: string;
  controlFrequency: 'daily' | 'weekly' | 'monthly';
  riskLevel: 'low' | 'moderate' | 'high';
  auditPeriod: {
    startDate: Date;
    endDate: Date;
  };
  samplesPerQuarter?: number;
  totalSamples?: number;
  minimumInterval?: number; // days between samples
  seed?: string; // For reproducible results
}

export interface SamplePeriod {
  quarter: string;
  startDate: Date;
  endDate: Date;
  samples: SampleDate[];
}

export interface SampleDate {
  id: string;
  date: Date;
  quarter: string;
  status: 'pending' | 'evidence_uploaded' | 'reviewed' | 'exception';
  evidenceFiles?: string[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface SamplingResult {
  controlId: string;
  generatedAt: Date;
  config: SamplingConfig;
  periods: SamplePeriod[];
  totalSamples: number;
  metadata: {
    seed: string;
    algorithm: string;
    version: string;
  };
}