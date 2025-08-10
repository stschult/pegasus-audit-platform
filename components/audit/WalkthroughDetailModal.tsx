// components/audit/WalkthroughDetailModal.tsx
import React, { useState } from 'react';
import { X, Calendar, Clock, User, Building, AlertCircle, FileText, CheckCircle, Users, Video } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

interface WalkthroughDetailModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

// Description parser function
const parseWalkthroughDescription = (description: string) => {
  if (!description) return null;
  
  // Split by double newlines to get sections
  const sections = description.split('\n\n').filter(section => section.trim());
  
  if (sections.length === 0) return null;
  
  // Find the business process line (usually the first or second section)
  const businessProcessSection = sections.find(section => 
    section.includes('Business process walkthrough') || 
    section.includes('walkthrough for') ||
    section.includes('process walkthrough')
  );
  
  // Find numbered sections (sections that start with digits followed by a period)
  const numberedSections = sections.filter(section => 
    /^\d+\./.test(section.trim())
  );
  
  return {
    businessProcess: businessProcessSection?.trim(),
    numberedSections: numberedSections.map(section => section.trim())
  };
};

// Formatted Description Component
const FormattedDescription: React.FC<{ description: string }> = ({ description }) => {
  const parsedDescription = parseWalkthroughDescription(description);
  
  if (!parsedDescription) {
    // Fallback to original rendering if parsing fails
    return (
      <div className="text-gray-600 mb-4 whitespace-pre-line">
        {description}
      </div>
    );
  }
  
  return (
    <div className="text-gray-600 mb-4">
      <div className="font-medium text-gray-700 mb-2">What we will cover:</div>
      
      {parsedDescription.businessProcess && (
        <div className="mb-3">
          {parsedDescription.businessProcess}
        </div>
      )}
      
      {parsedDescription.numberedSections.length > 0 && (
        <div>
          <div className="font-medium text-gray-700 mb-2">Key Control Descriptions:</div>
          <div className="space-y-2">
            {parsedDescription.numberedSections.map((section, index) => (
              <div key={index} className="text-sm">
                {section}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const WalkthroughDetailModal: React.FC<WalkthroughDetailModalProps> = ({
  application,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'documentation'>('overview');
  const [schedulingData, setSchedulingData] = useState({
    date: '',
    time: '',
    duration: '1.5',
    attendees: '',
    location: 'Teams Meeting',
    notes: ''
  });

  if (!isOpen) return null;

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleScheduleSubmit = () => {
    // Here you would typically save the scheduling data
    console.log('Scheduling walkthrough:', { application, schedulingData });
    // Show success message or close modal
    onClose();
  };

  const processSteps = [
    { step: 1, title: 'Pre-walkthrough Preparation', description: 'Review system documentation and prepare questions' },
    { step: 2, title: 'System Overview', description: 'Understand system architecture and business purpose' },
    { step: 3, title: 'Process Walkthrough', description: 'Step through key business processes and controls' },
    { step: 4, title: 'Control Documentation', description: 'Document identified controls and process flows' },
    { step: 5, title: 'Risk Assessment', description: 'Identify potential risks and control gaps' },
    { step: 6, title: 'Follow-up Actions', description: 'Define next steps and additional testing requirements' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{application.name}</h2>
              <p className="text-sm text-gray-600">{application.category} • {application.owner}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskColor(application.riskLevel)}`}>
              {application.riskLevel.toUpperCase()} RISK
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'documentation', label: 'Documentation', icon: CheckCircle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Overview</h3>
                <FormattedDescription description={application.description} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Application Owner</span>
                    </div>
                    <p className="text-gray-900">{application.owner}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Category</span>
                    </div>
                    <p className="text-gray-900">{application.category}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Risk Level</span>
                    </div>
                    <p className="text-gray-900 capitalize">{application.riskLevel}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Walkthrough Process</h3>
                <div className="space-y-4">
                  {processSteps.map((step, index) => (
                    <div key={step.step} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Walkthrough</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={schedulingData.date}
                    onChange={(e) => setSchedulingData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    value={schedulingData.time}
                    onChange={(e) => setSchedulingData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select time</option>
                    <option value="9:00 AM">9:00 AM - 10:30 AM</option>
                    <option value="10:30 AM">10:30 AM - 12:00 PM</option>
                    <option value="1:00 PM">1:00 PM - 2:30 PM</option>
                    <option value="2:30 PM">2:30 PM - 4:00 PM</option>
                    <option value="4:00 PM">4:00 PM - 5:30 PM</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <select
                    value={schedulingData.duration}
                    onChange={(e) => setSchedulingData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 hour</option>
                    <option value="1.5">1.5 hours</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={schedulingData.location}
                    onChange={(e) => setSchedulingData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Teams Meeting">Teams Meeting</option>
                    <option value="Client Office">Client Office</option>
                    <option value="Zoom Meeting">Zoom Meeting</option>
                    <option value="Phone Call">Phone Call</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendees</label>
                <textarea
                  value={schedulingData.attendees}
                  onChange={(e) => setSchedulingData(prev => ({ ...prev, attendees: e.target.value }))}
                  placeholder="List key attendees (application owner, process experts, etc.)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={schedulingData.notes}
                  onChange={(e) => setSchedulingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special requirements, key areas to focus on, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                >
                  Schedule Walkthrough
                </button>
              </div>
            </div>
          )}

          {/* Documentation Tab */}
          {activeTab === 'documentation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Walkthrough Documentation</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Documentation will be available after walkthrough completion</span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Process flows, control documentation, and risk assessments will be captured during the walkthrough session.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Documentation Checklist</h4>
                {[
                  'System architecture overview',
                  'Key business processes mapped',
                  'Control points identified',
                  'Risk areas documented',
                  'Process flow diagrams',
                  'Control testing procedures defined'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-4 h-4 border border-gray-300 rounded"></div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Recording Available</span>
                </div>
                <p className="text-sm text-blue-700">
                  Walkthrough sessions will be recorded (with participant consent) for documentation and review purposes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalkthroughDetailModal;