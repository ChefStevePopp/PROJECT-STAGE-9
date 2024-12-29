import React from 'react';
import { Store } from 'lucide-react';
import type { Organization } from '@/types/organization';
import { INDUSTRY_SEGMENTS, CUISINE_TYPES, REVENUE_CENTERS, DELIVERY_PROVIDERS } from './constants';

interface IndustryDetailsProps {
  organization: Organization;
  onChange: (updates: Partial<Organization>) => void;
}

export const IndustryDetails: React.FC<IndustryDetailsProps> = ({
  organization,
  onChange
}) => {
  const updateSettings = (key: string, value: any) => {
    onChange({
      settings: {
        ...organization.settings,
        [key]: value
      }
    });
  };

  const handleRevenueCenter = (center: string, checked: boolean) => {
    const currentCenters = organization.settings?.revenue_centers || [];
    const updatedCenters = checked
      ? [...currentCenters, center]
      : currentCenters.filter(c => c !== center);
    
    updateSettings('revenue_centers', updatedCenters);
  };

  const handleDeliveryProvider = (provider: string, checked: boolean) => {
    const currentProviders = organization.settings?.delivery_providers || [];
    const updatedProviders = checked
      ? [...currentProviders, provider]
      : currentProviders.filter(p => p !== provider);
    
    updateSettings('delivery_providers', updatedProviders);
  };

  const handleCuisineType = (cuisine: string, checked: boolean) => {
    const currentCuisines = organization.settings?.cuisine_types || [];
    const updatedCuisines = checked
      ? [...currentCuisines, cuisine]
      : currentCuisines.filter(c => c !== cuisine);
    
    updateSettings('cuisine_types', updatedCuisines);
  };

  return (
    <div className="card p-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono mb-4">
        src/features/admin/components/settings/OrganizationSettings/IndustryDetails.tsx
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
          <Store className="w-5 h-5 text-green-400" />
        </div>
        <h2 className="text-lg font-medium text-white">Industry Details</h2>
      </div>

      <div className="space-y-6">
        {/* Industry Segment */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Industry Segment
          </label>
          <select
            value={organization.settings?.industry_segment || ''}
            onChange={(e) => updateSettings('industry_segment', e.target.value)}
            className="input w-full"
          >
            <option value="">Select Industry Segment</option>
            {INDUSTRY_SEGMENTS.map(segment => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>
          {organization.settings?.industry_segment === 'Other' && (
            <input
              type="text"
              value={organization.settings?.industry_segment_other || ''}
              onChange={(e) => updateSettings('industry_segment_other', e.target.value)}
              className="input w-full mt-2"
              placeholder="Enter industry segment"
            />
          )}
        </div>

        {/* Cuisine Types */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Cuisine Type(s)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CUISINE_TYPES.map(cuisine => (
              <label key={cuisine} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(organization.settings?.cuisine_types || []).includes(cuisine)}
                  onChange={(e) => handleCuisineType(cuisine, e.target.checked)}
                  className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500"
                />
                <span className="text-sm text-gray-300">{cuisine}</span>
              </label>
            ))}
          </div>
          {(organization.settings?.cuisine_types || []).includes('Other') && (
            <input
              type="text"
              value={organization.settings?.cuisine_types_other || ''}
              onChange={(e) => updateSettings('cuisine_types_other', e.target.value)}
              className="input w-full mt-2"
              placeholder="Enter cuisine type"
            />
          )}
        </div>

        {/* Revenue Centers */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Revenue Centers
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {REVENUE_CENTERS.map(center => (
              <label key={center} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(organization.settings?.revenue_centers || []).includes(center)}
                  onChange={(e) => handleRevenueCenter(center, e.target.checked)}
                  className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500"
                />
                <span className="text-sm text-gray-300">{center}</span>
              </label>
            ))}
          </div>
          {(organization.settings?.revenue_centers || []).includes('Other') && (
            <input
              type="text"
              value={organization.settings?.revenue_centers_other || ''}
              onChange={(e) => updateSettings('revenue_centers_other', e.target.value)}
              className="input w-full mt-2"
              placeholder="Enter revenue center"
            />
          )}
        </div>

        {/* Delivery Providers - Only show if Delivery is selected */}
        {(organization.settings?.revenue_centers || []).includes('Delivery') && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Delivery Providers
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {DELIVERY_PROVIDERS.map(provider => (
                <label key={provider} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(organization.settings?.delivery_providers || []).includes(provider)}
                    onChange={(e) => handleDeliveryProvider(provider, e.target.checked)}
                    className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500"
                  />
                  <span className="text-sm text-gray-300">{provider}</span>
                </label>
              ))}
            </div>
            {(organization.settings?.delivery_providers || []).includes('Other') && (
              <input
                type="text"
                value={organization.settings?.delivery_providers_other || ''}
                onChange={(e) => updateSettings('delivery_providers_other', e.target.value)}
                className="input w-full mt-2"
                placeholder="Enter delivery provider"
              />
            )}
          </div>
        )}

        {/* Primary Revenue Center */}
        {(organization.settings?.revenue_centers || []).length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Primary Revenue Center
            </label>
            <select
              value={organization.settings?.primary_revenue_center || ''}
              onChange={(e) => updateSettings('primary_revenue_center', e.target.value)}
              className="input w-full"
            >
              <option value="">Select Primary Revenue Center</option>
              {(organization.settings?.revenue_centers || []).map(center => (
                <option key={center} value={center}>{center}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};