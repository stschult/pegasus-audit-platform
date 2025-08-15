// File: components/audit/modals/CompanyDetailsModal.tsx - Company Information Modal
'use client';

import React, { useState, useEffect } from 'react';
import { X, Building, Globe, Mail, User, Phone, MapPin, Calendar, Save } from 'lucide-react';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: {
    id: string;
    companyName: string;
    clientId: string;
    website?: string;
    clientLead?: string;
    auditLead?: string;
    auditType: string;
    riskAssessment: string;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
  };
  user: {
    userType: 'auditor' | 'client';
  } | null;
  currentData?: {
    controls?: any[];
    keyReports?: any[];
    itacs?: any[];
  } | null;
  walkthroughApplications?: any[];
}

interface ContactInfo {
  financeLeadEmail: string;
  itLeadEmail: string;
  auditContactEmail: string;
  mainPhone: string;
  address: string;
  notes: string;
}

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  isOpen,
  onClose,
  audit,
  user
}) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    financeLeadEmail: '',
    itLeadEmail: '',
    auditContactEmail: '',
    mainPhone: '',
    address: '',
    notes: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved contact info on open
  useEffect(() => {
    if (isOpen) {
      const savedInfo = localStorage.getItem(`company_details_${audit.clientId}`);
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          setContactInfo(parsed);
        } catch (error) {
          console.error('Error loading saved company details:', error);
        }
      }
      setIsEditing(false);
      setHasChanges(false);
    }
  }, [isOpen, audit.clientId]);

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(`company_details_${audit.clientId}`, JSON.stringify(contactInfo));
      setIsEditing(false);
      setHasChanges(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
      successMessage.textContent = '✅ Company details saved successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving company details:', error);
      alert('❌ Failed to save company details. Please try again.');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    
    // Reload saved data
    const savedInfo = localStorage.getItem(`company_details_${audit.clientId}`);
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setContactInfo(parsed);
      } catch (error) {
        console.error('Error reloading company details:', error);
      }
    }
    
    setIsEditing(false);
    setHasChanges(false);
  };

  const formatAuditDate = (dateString: string): string => {
    try {
      let date: Date;
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString);
      } else if (dateString.includes('.')) {
        const parts = dateString.split('.');
        if (parts.length === 3) {
          const month = parseInt(parts[0]) - 1;
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          date = new Date(year, month, day);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{audit.companyName}</h2>
              <p className="text-sm text-gray-600">{audit.clientId} • {audit.auditType}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user?.userType === 'auditor' && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Details
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Audit Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                  Audit Information
                </h3>
                
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                      <p className="text-sm text-gray-900">{formatAuditDate(audit.startDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                      <p className="text-sm text-gray-900">{formatAuditDate(audit.endDate)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Audit Type</label>
                      <p className="text-sm text-gray-900">{audit.auditType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Risk Assessment</label>
                      <p className="text-sm text-gray-900">{audit.riskAssessment}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        audit.status === 'active' ? 'bg-green-100 text-green-800' :
                        audit.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                      <p className="text-sm text-gray-900">{formatAuditDate(audit.createdAt)}</p>
                    </div>
                  </div>

                  {audit.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Website</label>
                      <a 
                        href={audit.website.startsWith('http') ? audit.website : `https://${audit.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        {audit.website}
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    {audit.clientLead && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Client Lead</label>
                        <p className="text-sm text-gray-900">{audit.clientLead}</p>
                      </div>
                    )}
                    {audit.auditLead && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Audit Lead</label>
                        <p className="text-sm text-gray-900">{audit.auditLead}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-600" />
                  Contact Information
                  {user?.userType === 'client' && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-auto px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Update Info
                    </button>
                  )}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Finance Lead Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={contactInfo.financeLeadEmail}
                        onChange={(e) => handleInputChange('financeLeadEmail', e.target.value)}
                        placeholder="finance.lead@company.com"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        {contactInfo.financeLeadEmail || 'Not provided'}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Primary contact for financial questions</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      IT Lead Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={contactInfo.itLeadEmail}
                        onChange={(e) => handleInputChange('itLeadEmail', e.target.value)}
                        placeholder="it.lead@company.com"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        {contactInfo.itLeadEmail || 'Not provided'}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Primary contact for technical questions</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Audit Point of Contact
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={contactInfo.auditContactEmail}
                        onChange={(e) => handleInputChange('auditContactEmail', e.target.value)}
                        placeholder="audit.contact@company.com"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        {contactInfo.auditContactEmail || 'Not provided'}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Main coordinator for audit activities</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Main Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={contactInfo.mainPhone}
                          onChange={(e) => handleInputChange('mainPhone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {contactInfo.mainPhone || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Company Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={contactInfo.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main St, City, State 12345"
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
                        {contactInfo.address || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Additional Notes
                    </label>
                    {isEditing ? (
                      <textarea
                        value={contactInfo.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any additional notes or special instructions..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
                        {contactInfo.notes || 'No additional notes'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All fields are optional and saved locally
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Contact Information
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetailsModal;