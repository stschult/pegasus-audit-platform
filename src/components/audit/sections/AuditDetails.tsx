// File: components/audit/sections/AuditDetails.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Settings, 
  CheckCircle, 
  X, 
  Building2, 
  Globe, 
  Calendar, 
  Users, 
  Mail 
} from 'lucide-react';
import { Audit } from '../types';

interface AuditDetailsProps {
  currentModule: string;
  user: { userType: string } | null;
  selectedAudit?: any;  // Made optional to bypass type issues
}

interface AuditDetail {
  company: string;
  website: string;
  auditType: string;
  startDate: string;
  endDate: string;
  auditFirm: {
    name: string;
    contacts: Array<{
      role: string;
      name: string;
      email: string;
    }>;
  };
  client: {
    name: string;
    contacts: Array<{
      role: string;
      name: string;
      email: string;
    }>;
  };
}

const AuditDetails: React.FC<AuditDetailsProps> = ({
  currentModule,
  user,
  selectedAudit  // Add this parameter
}) => {
  // Editable audit details state
  const [isEditingAuditDetails, setIsEditingAuditDetails] = useState(false);
  const [auditDetails, setAuditDetails] = useState<AuditDetail>({
    company: selectedAudit?.companyName || 'Unknown Company',
    website: selectedAudit?.website || '',
    auditType: selectedAudit?.auditType || 'Unknown Type',
    startDate: selectedAudit?.startDate || '',
    endDate: selectedAudit?.endDate || '',
    auditFirm: {
      name: 'Pegasus',
      contacts: [
        { role: 'Principle', name: selectedAudit?.auditLead || 'Tom Cruise', email: 'tom@audit.com' },
        { role: 'Lead Finance', name: 'Brad Pitt', email: 'brad@audit.com' },
        { role: 'Lead ITGC', name: 'Erik Schultz', email: 'erik@audit.com' }
      ]
    },
    client: {
      name: selectedAudit?.companyName || 'Unknown Company',
      contacts: [
        { role: 'Principle', name: selectedAudit?.clientLead || 'Batman', email: 'batman@fluidigm.com' },
        { role: 'Lead Finance', name: 'Superman', email: 'superman@fluidigm.com' },
        { role: 'Lead ITGC', name: 'Robin', email: 'robin@fluidigm.com' }
      ]
    }
  });

  // ✅ FIX: Update audit details when selectedAudit changes
  useEffect(() => {
    if (selectedAudit) {
      setAuditDetails({
        company: selectedAudit.companyName || 'Unknown Company',
        website: selectedAudit.website || '',
        auditType: selectedAudit.auditType || 'Unknown Type',
        startDate: selectedAudit.startDate || '',
        endDate: selectedAudit.endDate || '',
        auditFirm: {
          name: 'Pegasus',
          contacts: [
            { role: 'Principle', name: selectedAudit.auditLead || 'Tom Cruise', email: 'tom@audit.com' },
            { role: 'Lead Finance', name: 'Brad Pitt', email: 'brad@audit.com' },
            { role: 'Lead ITGC', name: 'Erik Schultz', email: 'erik@audit.com' }
          ]
        },
        client: {
          name: selectedAudit.companyName || 'Unknown Company',
          contacts: [
            { role: 'Principle', name: selectedAudit.clientLead || 'Batman', email: 'batman@fluidigm.com' },
            { role: 'Lead Finance', name: 'Superman', email: 'superman@fluidigm.com' },
            { role: 'Lead ITGC', name: 'Robin', email: 'robin@fluidigm.com' }
          ]
        }
      });
    }
  }, [selectedAudit]);

  // Only show on Overview tab for auditors
  if (currentModule !== 'overview' || user?.userType === 'client') {
    return null;
  }

  const handleSaveAuditDetails = () => {
    console.log('Saving audit details:', auditDetails);
    setIsEditingAuditDetails(false);
  };

  const handleCancelEditAuditDetails = () => {
    setIsEditingAuditDetails(false);
  };

  const updateAuditDetail = (field: string, value: string) => {
    setAuditDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateAuditFirmContact = (index: number, field: string, value: string) => {
    setAuditDetails(prev => ({
      ...prev,
      auditFirm: {
        ...prev.auditFirm,
        contacts: prev.auditFirm.contacts.map((contact, i) => 
          i === index ? { ...contact, [field]: value } : contact
        )
      }
    }));
  };

  const updateClientContact = (index: number, field: string, value: string) => {
    setAuditDetails(prev => ({
      ...prev,
      client: {
        ...prev.client,
        contacts: prev.client.contacts.map((contact, i) => 
          i === index ? { ...contact, [field]: value } : contact
        )
      }
    }));
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Audit Details
        </h2>
        <div className="flex items-center gap-2">
          {!isEditingAuditDetails ? (
            <button
              onClick={() => setIsEditingAuditDetails(true)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Details
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAuditDetails}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancelEditAuditDetails}
                className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Audit Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Audit Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-white mb-2">Company</div>
                {isEditingAuditDetails ? (
                  <input
                    type="text"
                    value={auditDetails.company}
                    onChange={(e) => updateAuditDetail('company', e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  />
                ) : (
                  <div className="text-gray-300">{auditDetails.company}</div>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-white mb-2">Website</div>
                {isEditingAuditDetails ? (
                  <input
                    type="text"
                    value={auditDetails.website}
                    onChange={(e) => updateAuditDetail('website', e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  />
                ) : (
                  <a 
                    href={`https://${auditDetails.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {auditDetails.website}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-white mb-2">Audit Type</div>
                {isEditingAuditDetails ? (
                  <input
                    type="text"
                    value={auditDetails.auditType}
                    onChange={(e) => updateAuditDetail('auditType', e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  />
                ) : (
                  <div className="text-gray-300">{auditDetails.auditType}</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-white mb-2">Audit Period</div>
                {isEditingAuditDetails ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={auditDetails.startDate}
                      onChange={(e) => updateAuditDetail('startDate', e.target.value)}
                      className="p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                      placeholder="Start Date"
                    />
                    <input
                      type="text"
                      value={auditDetails.endDate}
                      onChange={(e) => updateAuditDetail('endDate', e.target.value)}
                      className="p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                      placeholder="End Date"
                    />
                  </div>
                ) : (
                  <div className="text-gray-300">{auditDetails.startDate} - {auditDetails.endDate}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Audit Firm Contacts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-400">
              {isEditingAuditDetails ? (
                <input
                  type="text"
                  value={auditDetails.auditFirm.name}
                  onChange={(e) => setAuditDetails(prev => ({
                    ...prev,
                    auditFirm: { ...prev.auditFirm, name: e.target.value }
                  }))}
                  className="px-2 py-1 border border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-blue-400"
                />
              ) : (
                `${auditDetails.auditFirm.name} (Audit Firm)`
              )}
            </h3>
          </div>
          <div className="space-y-3">
            {auditDetails.auditFirm.contacts.map((contact, index) => (
              <div key={index} className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-gray-700">
                <div className="space-y-2">
                  {isEditingAuditDetails ? (
                    <>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateAuditFirmContact(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-600 text-white"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => updateAuditFirmContact(index, 'role', e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-600 text-white"
                        placeholder="Role"
                      />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateAuditFirmContact(index, 'email', e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-600 text-white"
                        placeholder="Email"
                      />
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-white">{contact.name}</div>
                      <div className="text-sm text-gray-300">{contact.role}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${contact.email}`} className="hover:text-blue-400">
                            {contact.email}
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Client Firm Contacts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">
              {isEditingAuditDetails ? (
                <input
                  type="text"
                  value={auditDetails.client.name}
                  onChange={(e) => setAuditDetails(prev => ({
                    ...prev,
                    client: { ...prev.client, name: e.target.value }
                  }))}
                  className="px-2 py-1 border border-gray-600 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-green-400"
                />
              ) : (
                `${auditDetails.client.name} (Client)`
              )}
            </h3>
          </div>
          <div className="space-y-3">
            {auditDetails.client.contacts.map((contact, index) => (
              <div key={index} className="p-4 rounded-lg border-l-4 border-l-green-500 bg-gray-700">
                <div className="space-y-2">
                  {isEditingAuditDetails ? (
                    <>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateClientContact(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-600 text-white"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => updateClientContact(index, 'role', e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-600 text-white"
                        placeholder="Role"
                      />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateClientContact(index, 'email', e.target.value)}
                        className="w-full p-2 border border-gray-600 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-600 text-white"
                        placeholder="Email"
                      />
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-white">{contact.name}</div>
                      <div className="text-sm text-gray-300">{contact.role}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${contact.email}`} className="hover:text-green-400">
                            {contact.email}
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDetails;