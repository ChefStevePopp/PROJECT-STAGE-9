import React, { useState } from 'react';
import { Save, Building2, Store, MapPin, Settings, FileCheck } from 'lucide-react';
import { OrganizationDetails } from './OrganizationDetails';
import { IndustryDetails } from './IndustryDetails';
import { LocationDetails } from './LocationDetails';
import { AdditionalSettings } from './AdditionalSettings';
import { BoardOfHealth } from './BoardOfHealth';
import { useOrganizationSettings } from './useOrganizationSettings';
import { LoadingLogo } from '@/features/shared/components';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

export const OrganizationSettings: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId } = useAuth();
  const { 
    isLoading, 
    isSaving,
    handleSave,
    organization,
    updateOrganization
  } = useOrganizationSettings();

  const [activeTab, setActiveTab] = useState<'organization' | 'industry' | 'location' | 'health' | 'additional'>('organization');

  // Redirect if no organization
  React.useEffect(() => {
    if (!organizationId && !isLoading) {
      toast.error('No organization found');
      navigate(ROUTES.KITCHEN.DASHBOARD);
    }
  }, [organizationId, isLoading, navigate]);

  const tabs = [
    {
      id: 'organization' as const,
      label: 'Organization',
      icon: Building2,
      color: 'primary'
    },
    {
      id: 'industry' as const,
      label: 'Industry',
      icon: Store,
      color: 'green'
    },
    {
      id: 'location' as const,
      label: 'Location',
      icon: MapPin,
      color: 'amber'
    },
    {
      id: 'health' as const,
      label: 'Board of Health',
      icon: FileCheck,
      color: 'rose'
    },
    {
      id: 'additional' as const,
      label: 'Additional Settings',
      icon: Settings,
      color: 'purple'
    }
  ] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingLogo message="Loading organization settings..." />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No organization settings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/settings/OrganizationSettings/index.tsx
      </div>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-white mb-2">Organization Settings</h1>
          <p className="text-gray-400">Manage your organization details and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${tab.color} ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon className={`w-5 h-5 ${
              activeTab === tab.id ? `text-${tab.color}-400` : 'text-current'
            }`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'organization' && (
          <OrganizationDetails
            organization={organization}
            onChange={updateOrganization}
          />
        )}
        {activeTab === 'industry' && (
          <IndustryDetails
            organization={organization}
            onChange={updateOrganization}
          />
        )}
        {activeTab === 'location' && (
          <LocationDetails
            organization={organization}
            onChange={updateOrganization}
          />
        )}
        {activeTab === 'health' && (
          <BoardOfHealth
            organization={organization}
            onChange={updateOrganization}
          />
        )}
        {activeTab === 'additional' && (
          <AdditionalSettings
            organization={organization}
            onChange={updateOrganization}
          />
        )}
      </div>
    </div>
  );
};