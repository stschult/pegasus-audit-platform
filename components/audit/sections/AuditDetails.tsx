// File: components/audit/sections/AuditDetails.tsx
'use client';

import React, { useState } from 'react';
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

interface AuditDetailsProps {
  currentModule: string;
  user: { userType: string } | null;
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
  user
}) => {
  // Editable audit details state
  const [isEditingAuditDetails, setIsEditingAuditDetails] = useState(false);
  const [auditDetails, setAuditDetails] = useState<AuditDetail>({
    company: 'Fluidigm',
    website: 'pegasuslabs.xyz',
    auditType: 'SOC 2 Finance and ITGC',
    startDate: '8.1.2025',
    endDate: '10.1.2025',
    auditFirm: {
      name: 'Pegasus',
      contacts: [
        { role: 'Principle', name: 'Tom Cruise', email: 'tom@audit.com' },
        { role: 'Lead Finance', name: 'Brad Pitt', email: 'brad@audit.com' },
        { role: 'Lead ITGC', name: 'Erik Schultz', email: 'erik@audit.com' }
      ]
    },
    client: {
      name: 'Fluidigm',
      contacts: [
        { role: 'Principle', name: 'Batman', email: 'batman@fluidigm.com' },
        { role: 'Lead Finance', name: 'Superman', email: 'superman@fluidigm.com' },
        { role: 'Lead ITGC', name: 'Robin', email: 'robin@fluidigm.com' }
      ]
    }
  });

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Audit Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Audit Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">Company</div>
                  {isEditingAuditDetails ? (
                    <input
                      type="text"
                      value={auditDetails.company}
                      onChange={(e) => updateAuditDetail('company', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-700">{auditDetails.company}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">Website</div>
                  {isEditingAuditDetails ? (
                    <input
                      type="text"
                      value={auditDetails.website}
                      onChange={(e) => updateAuditDetail('website', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <a 
                      href={`https://${auditDetails.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {auditDetails.website}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">Audit Type</div>
                  {isEditingAuditDetails ? (
                    <input
                      type="text"
                      value={auditDetails.auditType}
                      onChange={(e) => updateAuditDetail('auditType', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-700">{auditDetails.auditType}</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">Audit Period</div>
                  {isEditingAuditDetails ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={auditDetails.startDate}
                        onChange={(e) => updateAuditDetail('startDate', e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Start Date"
                      />
                      <input
                        type="text"
                        value={auditDetails.endDate}
                        onChange={(e) => updateAuditDetail('endDate', e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="End Date"
                      />
                    </div>
                  ) : (
                    <div className="text-gray-700">{auditDetails.startDate} - {auditDetails.endDate}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Team Contacts */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Team Contacts
            </h3>
            
            {/* Audit Firm Team */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">
                  {isEditingAuditDetails ? (
                    <input
                      type="text"
                      value={auditDetails.auditFirm.name}
                      onChange={(e) => setAuditDetails(prev => ({
                        ...prev,
                        auditFirm: { ...prev.auditFirm, name: e.target.value }
                      }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    `${auditDetails.auditFirm.name} (Audit Firm)`
                  )}
                </h4>
              </div>
              <div className="space-y-3">
                {auditDetails.auditFirm.contacts.map((contact, index) => (
                  <div key={index} className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-gray-50">
                    <div className="space-y-2">
                      {isEditingAuditDetails ? (
                        <>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => updateAuditFirmContact(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={contact.role}
                            onChange={(e) => updateAuditFirmContact(index, 'role', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Role"
                          />
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateAuditFirmContact(index, 'email', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Email"
                          />
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-600">{contact.role}</div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
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

            {/* Client Team */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-900">
                  {isEditingAuditDetails ? (
                    <input
                      type="text"
                      value={auditDetails.client.name}
                      onChange={(e) => setAuditDetails(prev => ({
                        ...prev,
                        client: { ...prev.client, name: e.target.value }
                      }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    `${auditDetails.client.name} (Client)`
                  )}
                </h4>
              </div>
              <div className="space-y-3">
                {auditDetails.client.contacts.map((contact, index) => (
                  <div key={index} className="p-4 rounded-lg border-l-4 border-l-green-500 bg-gray-50">
                    <div className="space-y-2">
                      {isEditingAuditDetails ? (
                        <>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => updateClientContact(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={contact.role}
                            onChange={(e) => updateClientContact(index, 'role', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Role"
                          />
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateClientContact(index, 'email', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Email"
                          />
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-600">{contact.role}</div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
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
      </div>
    </div>
  );
};

export default AuditDetails;