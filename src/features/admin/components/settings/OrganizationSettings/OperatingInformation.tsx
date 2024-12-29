import React from 'react';
import { Clock } from 'lucide-react';
import type { Organization } from '@/types/organization';
import { TIME_ZONES } from '@/shared/constants';

interface OperatingInformationProps {
  organization: Organization;
  onChange: (updates: Partial<Organization>) => void;
}

export const OperatingInformation: React.FC<OperatingInformationProps> = ({
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

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-lg font-medium text-white">Operating Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Business Type
          </label>
          <select
            value={organization.settings?.business_type || 'restaurant'}
            onChange={(e) => updateSettings('business_type', e.target.value)}
            className="input w-full"
          >
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Café</option>
            <option value="bar">Bar</option>
            <option value="food_truck">Food Truck</option>
            <option value="catering">Catering</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Cuisine Type
          </label>
          <input
            type="text"
            value={organization.settings?.cuisine_type || ''}
            onChange={(e) => updateSettings('cuisine_type', e.target.value)}
            className="input w-full"
            placeholder="Enter primary cuisine type"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Default Timezone
          </label>
          <select
            value={organization.settings?.default_timezone || 'UTC-5'}
            onChange={(e) => updateSettings('default_timezone', e.target.value)}
            className="input w-full"
          >
            {TIME_ZONES.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Operating Hours Format
          </label>
          <select
            value={organization.settings?.hours_format || '12h'}
            onChange={(e) => updateSettings('hours_format', e.target.value)}
            className="input w-full"
          >
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
      </div>
    </div>
  );
};