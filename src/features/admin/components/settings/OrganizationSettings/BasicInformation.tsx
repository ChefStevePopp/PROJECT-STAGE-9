import React from 'react';
import { Building2 } from 'lucide-react';
import type { Organization } from '@/types/organization';

interface BasicInformationProps {
  organization: Organization;
  onChange: (updates: Partial<Organization>) => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  organization,
  onChange
}) => {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-lg font-medium text-white">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            value={organization.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="input w-full"
            placeholder="Enter organization name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Legal Name
          </label>
          <input
            type="text"
            value={organization.legal_name || ''}
            onChange={(e) => onChange({ legal_name: e.target.value })}
            className="input w-full"
            placeholder="Enter legal business name"
          />
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
            Contact Email
          </label>
          <input
            type="email"
            value={organization.contact_email || ''}
            onChange={(e) => onChange({ contact_email: e.target.value })}
            className="input w-full"
            placeholder="contact@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Contact Phone
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