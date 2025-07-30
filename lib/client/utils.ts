// lib/client/utils.ts

import { SampleRequest, DashboardStats } from '../types/client';

// Enhanced title extraction matching your getKeyConcept function
export const getControlKeyConcept = (description: string): string => {
  const concepts = {
    'backup': 'Data Backup & Recovery',
    'access': 'Access Control',
    'password': 'Password Management', 
    'change': 'Change Management',
    'physical': 'Physical Security',
    'network': 'Network Security',
    'monitoring': 'System Monitoring',
    'incident': 'Incident Response',
    'configuration': 'Configuration Management',
    'vulnerability': 'Vulnerability Management'
  };

  const lowerDesc = description.toLowerCase();
  for (const [key, title] of Object.entries(concepts)) {
    if (lowerDesc.includes(key)) {
      return title;
    }
  }
  return description.split(' ').slice(0, 4).join(' ');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusColor = (status: string): string => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'evidence_uploaded': 'bg-blue-100 text-blue-800 border-blue-200',
    'under_review': 'bg-purple-100 text-purple-800 border-purple-200',
    'reviewed': 'bg-orange-100 text-orange-800 border-orange-200',
    'approved': 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getRiskColor = (risk: string): string => {
  const colors = {
    'High': 'text-red-600 bg-red-50 border-red-200',
    'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'Low': 'text-green-600 bg-green-50 border-green-200'
  };
  return colors[risk as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
};

export const calculateDashboardStats = (requests: SampleRequest[]): DashboardStats => {
  return {
    totalRequests: requests.length,
    completed: requests.filter(r => r.status === 'approved').length,
    pending: requests.filter(r => r.status === 'pending').length,
    overdue: requests.filter(r => new Date(r.dueDate) < new Date() && r.status !== 'approved').length,
    avgCompletion: Math.round(requests.reduce((acc, r) => acc + r.completionPercentage, 0) / requests.length),
    highPriority: requests.filter(r => r.priority === 'urgent' || r.priority === 'high').length
  };
};

export const getDaysDifference = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dateString: string, status: string): boolean => {
  return new Date(dateString) < new Date() && status !== 'approved';
};
