// components/audit/WalkthroughTab.tsx
import React, { useState } from 'react';
import { Eye, Clock, User, Building, AlertCircle, Calendar, CheckCircle } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  owner: string;
  category: string;
}

interface WalkthroughTabProps {
  applications: Application[];
  onWalkthroughClick: (application: Application) => void;
}

const WalkthroughTab: React.FC<WalkthroughTabProps> = ({ 
  applications, 
  onWalkthroughClick 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(applications.map(app => app.category))];
  
  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesRisk = selectedRiskLevel === 'all' || app.riskLevel === selectedRiskLevel;
    
    return matchesSearch && matchesCategory && matchesRisk;
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'financial systems':
      case 'financial': return Building;
      case 'hr systems':
      case 'human resources': return User;
      case 'operations': return Clock;
      default: return Building;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Walkthroughs ({applications.length})
        </h2>
        <div className="text-sm text-gray-500">
          Process documentation and system walkthroughs
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>

        {/* Risk Level Filter */}
        <select
          value={selectedRiskLevel}
          onChange={(e) => setSelectedRiskLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
      </div>

      {/* Application Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredApplications.map((application) => {
          const CategoryIcon = getCategoryIcon(application.category);
          
          return (
            <div
              key={application.id}
              onClick={() => onWalkthroughClick(application)}
              className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <CategoryIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {application.name}
                    </h3>
                    <p className="text-sm text-gray-500">{application.category}</p>
                  </div>
                </div>
                
                {/* Risk Badge */}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(application.riskLevel)}`}>
                  {application.riskLevel.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {application.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{application.owner}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700">
                  <Eye className="h-4 w-4" />
                  <span>Schedule</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' || selectedRiskLevel !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No applications available for walkthrough scheduling'
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {filteredApplications.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Applications</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{filteredApplications.length}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Est. Time</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {Math.ceil(filteredApplications.length * 1.5)}h
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Ready to Schedule</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{filteredApplications.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkthroughTab;