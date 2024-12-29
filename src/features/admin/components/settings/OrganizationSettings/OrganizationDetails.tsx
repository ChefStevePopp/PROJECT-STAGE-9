import React from 'react';
import { Building2 } from 'lucide-react';
import type { Organization } from '@/types/organization';

interface OrganizationDetailsProps {
  organization: Organization;
  onChange: (updates: Partial<Organization>) => void;
}

export const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({
  organization,
  onChange
}) => {
  return (
    <div className="card p-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono mb-4">
        src/features/admin/components/settings/OrganizationSettings/OrganizationDetails.tsx
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-lg font-medium text-white">Organization Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Business Operating Name
          </label>
          <input
            type="text"
            value={organization.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="input w-full"
            placeholder="Enter business operating name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Business Legal Name
          </label>
          <input
            type="text"
            value={organization.legal_name || ''}
            onChange={(e) => onChange({ legal_name: e.target.value })}
            className="input w-full"
            placeholder="Enter legal business name"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Organization Address
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={organization.settings?.street_address || ''}
              onChange={(e) => onChange({
                settings: {
                  ...organization.settings,
                  street_address: e.target.value
                }
              })}
              className="input w-full"
              placeholder="Street Address"
            />
            <input
              type="text"
              value={organization.settings?.city || ''}
              onChange={(e) => onChange({
                settings: {
                  ...organization.settings,
                  city: e.target.value
                }
              })}
              className="input w-full"
              placeholder="City"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={organization.settings?.state || ''}
                onChange={(e) => onChange({
                  settings: {
                    ...organization.settings,
                    state: e.target.value
                  }
                })}
                className="input w-full"
                placeholder="State/Province"
              />
              <input
                type="text"
                value={organization.settings?.postal_code || ''}
                onChange={(e) => onChange({
                  settings: {
                    ...organization.settings,
                    postal_code: e.target.value
                  }
                })}
                className="input w-full"
                placeholder="Postal Code"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Tax ID/Business Number
          </label>
          <input
            type="text"
            value={organization.tax_id || ''}
            onChange={(e) => onChange({ tax_id: e.target.value })}
            className="input w-full"
            placeholder="Enter tax ID or business number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Website
          </label>
          <input
            type="url"
            value={organization.website || ''}
            onChange={(e) => onChange({ website: e.target.value })}
            className="input w-full"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Organization Email
          </label>
          <input
            type="email"
            value={organization.contact_email || ''}
            onChange={(e) => onChange({ contact_email: e.target.value })}
            className="input w-full"
            placeholder="organization@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Accounting Email
          </label>
          <input
            type="email"
            value={organization.settings?.accounting_email || ''}
            onChange={(e) => onChange({
              settings: {
                ...organization.settings,
                accounting_email: e.target.value
              }
            })}
            className="input w-full"
            placeholder="accounting@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Organization Phone
          </label>
          <input
            type="tel"
            value={organization.contact_phone || ''}
            onChange={(e) => onChange({ contact_phone: e.target.value })}
            className="input w-full"
            placeholder="(555) 555-5555"
          />
        </div>
      </div>
    </div>
  );
};