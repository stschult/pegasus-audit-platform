// components/audit/SamplingTab.tsx - COMPLETELY CLEAN (NO DEBUG)
import { useState, useEffect } from 'react';
import { Download, RefreshCw, Settings, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';
import { AuditSamplingEngine } from '../../lib/sampling-engine';
import { SamplingConfig, SamplingResult, SampleDate } from '../../types/sampling';

interface SamplingTabProps {
  control: {
    id: any;
    description: any;
    riskRating: any;
    frequency: any;
  };
  auditPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

export default function SamplingTab({ control, auditPeriod }: SamplingTabProps) {
  const [config, setConfig] = useState<SamplingConfig>({
    controlId: control?.id || 'CTRL-001',
    controlFrequency: control?.frequency || 'monthly',
    riskLevel: mapRiskLevel(control?.riskRating) || 'low',
    auditPeriod: {
      startDate: auditPeriod?.startDate || new Date('2024-01-01'),
      endDate: auditPeriod?.endDate || new Date('2024-12-31')
    }
  });

  // Helper function to map risk ratings to valid risk levels
  function mapRiskLevel(riskRating: any): 'low' | 'moderate' | 'high' {
    if (!riskRating) return 'low';
    
    const rating = String(riskRating).toLowerCase();
    if (rating.includes('high')) return 'high';
    if (rating.includes('moderate') || rating.includes('medium')) return 'moderate';
    return 'low'; // default fallback
  }

  // Update config when props change
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      controlId: control?.id || prev.controlId,
      controlFrequency: control?.frequency || prev.controlFrequency,
      riskLevel: mapRiskLevel(control?.riskRating) || prev.riskLevel,
      auditPeriod: {
        startDate: auditPeriod?.startDate || prev.auditPeriod.startDate,
        endDate: auditPeriod?.endDate || prev.auditPeriod.endDate
      }
    }));
  }, [control, auditPeriod]);

  const [result, setResult] = useState<SamplingResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSamples = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const samplingResult = AuditSamplingEngine.generateSamples(config);
      setResult(samplingResult);
    } catch (error) {
      console.error('Error generating samples:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSampleStatus = (sampleId: string, newStatus: SampleDate['status']) => {
    if (!result) return;
    
    const updatedPeriods = result.periods.map(period => ({
      ...period,
      samples: period.samples.map(sample => 
        sample.id === sampleId 
          ? { ...sample, status: newStatus }
          : sample
      )
    }));
    
    setResult({
      ...result,
      periods: updatedPeriods
    });
  };

  const exportToCSV = () => {
    if (!result) return;
    
    const csvContent = AuditSamplingEngine.exportToCSV(result);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-samples-${config.controlId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: SampleDate['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'evidence_uploaded': return <Upload className="h-4 w-4 text-blue-500" />;
      case 'reviewed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'exception': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadgeClass = (status: SampleDate['status']) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending': return `${base} bg-yellow-100 text-yellow-800`;
      case 'evidence_uploaded': return `${base} bg-blue-100 text-blue-800`;
      case 'reviewed': return `${base} bg-green-100 text-green-800`;
      case 'exception': return `${base} bg-red-100 text-red-800`;
    }
  };

  const getProgressStats = () => {
    if (!result) return { completed: 0, total: 0, percentage: 0 };
    
    const allSamples = result.periods.flatMap(p => p.samples);
    const completed = allSamples.filter(s => s.status === 'reviewed').length;
    const total = allSamples.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const stats = getProgressStats();
  const allSamples = result ? result.periods.flatMap(p => p.samples) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Sampling</h2>
          <p className="text-gray-600">Generate risk-based samples for audit testing</p>
        </div>
        
        {result && (
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Configuration Panel */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Sampling Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Control ID
            </label>
            <input
              type="text"
              value={config.controlId}
              onChange={(e) => setConfig(prev => ({ ...prev, controlId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Control Frequency
            </label>
            <select
              value={config.controlFrequency}
              onChange={(e) => setConfig(prev => ({ ...prev, controlFrequency: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level
            </label>
            <select
              value={config.riskLevel}
              onChange={(e) => setConfig(prev => ({ ...prev, riskLevel: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={config.auditPeriod.startDate.toISOString().split('T')[0]}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                auditPeriod: { 
                  ...prev.auditPeriod, 
                  startDate: new Date(e.target.value) 
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={config.auditPeriod.endDate.toISOString().split('T')[0]}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                auditPeriod: { 
                  ...prev.auditPeriod, 
                  endDate: new Date(e.target.value) 
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Samples per Quarter
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.samplesPerQuarter || ''}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                samplesPerQuarter: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="Auto (risk-based)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={generateSamples}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Samples'}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{result.totalSamples}</div>
              <div className="text-sm text-gray-600">Total Samples</div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{result.periods.length}</div>
              <div className="text-sm text-gray-600">Quarters</div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{stats.percentage}%</div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Testing Progress</h3>
              <span className="text-sm text-gray-600">{stats.completed} of {stats.total} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Samples Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Generated Samples</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sample ID
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allSamples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sample.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sample.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sample.quarter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sample.status)}
                          <span className={getStatusBadgeClass(sample.status)}>
                            {sample.status.charAt(0).toUpperCase() + sample.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={sample.status}
                          onChange={(e) => updateSampleStatus(sample.id, e.target.value as SampleDate['status'])}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="evidence_uploaded">Evidence Uploaded</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="exception">Exception</option>
                        </select>
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