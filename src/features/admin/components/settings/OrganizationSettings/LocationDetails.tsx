import React, { useState } from 'react';
import { MapPin, Users, Clock } from 'lucide-react';
import type { Organization } from '@/types/organization';
import { OperatingHours } from './OperatingHours';

interface LocationDetailsProps {
  organization: Organization;
  onChange: (updates: Partial<Organization>) => void;
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({
  organization,
  onChange
}) => {
  const [activeHoursTab, setActiveHoursTab] = useState<'business' | 'team'>('business');

  const updateSettings = (key: string, value: any) => {
    onChange({
      settings: {
        ...organization.settings,
        [key]: value
      }
    });
  };

  // Show patio season input if patio seating > 0
  const showPatioSeason = (organization.settings?.patio_seating || 0) > 0;

  return (
    <div className="card p-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono mb-4">
        src/features/admin/components/settings/OrganizationSettings/LocationDetails.tsx
      </div>

      {/* Location Details Section */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-medium text-white">Location Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={organization.settings?.street_address || ''}
              onChange={(e) => updateSettings('street_address', e.target.value)}
              className="input w-full"
              placeholder="Street Address"
            />
            <input
              type="text"
              value={organization.settings?.city || ''}
              onChange={(e) => updateSettings('city', e.target.value)}
              className="input w-full"
              placeholder="City"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={organization.settings?.state || ''}
                onChange={(e) => updateSettings('state', e.target.value)}
                className="input w-full"
                placeholder="State/Province"
              />
              <input
                type="text"
                value={organization.settings?.postal_code || ''}
                onChange={(e) => updateSettings('postal_code', e.target.value)}
                className="input w-full"
                placeholder="Postal Code"
              />
            </div>
          </div>
        </div>

        {/* Seating Capacity Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-medium text-white">Seating Capacity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Bar Seating
              </label>
              <input
                type="number"
                value={organization.settings?.bar_seating || ''}
                onChange={(e) => updateSettings('bar_seating', parseInt(e.target.value) || 0)}
                className="input w-full"
                placeholder="Enter bar seating capacity"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Dining Room
              </label>
              <input
                type="number"
                value={organization.settings?.dining_room_seating || ''}
                onChange={(e) => updateSettings('dining_room_seating', parseInt(e.target.value) || 0)}
                className="input w-full"
                placeholder="Enter dining room capacity"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Patio Seating
              </label>
              <input
                type="number"
                value={organization.settings?.patio_seating || ''}
                onChange={(e) => updateSettings('patio_seating', parseInt(e.target.value) || 0)}
                className="input w-full"
                placeholder="Enter patio seating capacity"
                min="0"
              />
            </div>
          </div>

          <div className="mt-4 bg-amber-500/10 rounded-lg p-4">
            <p className="text-sm text-amber-400">
              Total Capacity: {
                (parseInt(organization.settings?.bar_seating) || 0) +
                (parseInt(organization.settings?.dining_room_seating) || 0) +
                (parseInt(organization.settings?.patio_seating) || 0)
              } seats
            </p>
          </div>

          {/* Patio Season Input */}
          {showPatioSeason && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Patio Season Duration (weeks)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={organization.settings?.patio_season_weeks || ''}
                  onChange={(e) => updateSettings('patio_season_weeks', parseInt(e.target.value) || 0)}
                  className="input w-32"
                  placeholder="Enter weeks"
                  min="0"
                  max="52"
                />
                <span className="text-gray-400">weeks per year</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter the typical duration of your patio season in weeks
              </p>
            </div>
          )}
        </div>

        {/* Hours Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-medium text-white">Location Hours</h2>
          </div>

          {/* Hours Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveHoursTab('business')}
              className={`tab amber ${activeHoursTab === 'business' ? 'active' : ''}`}
            >
              <Clock className="w-5 h-5" />
              Business Hours
            </button>
            <button
              onClick={() => setActiveHoursTab('team')}
              className={`tab amber ${activeHoursTab === 'team' ? 'active' : ''}`}
            >
              <Users className="w-5 h-5" />
              Team Hours
            </button>
          </div>

          {/* Hours Content */}
          {activeHoursTab === 'business' ? (
            <OperatingHours
              schedule={organization.settings?.operating_schedule || {}}
              onChange={(schedule) => updateSettings('operating_schedule', schedule)}
            />
          ) : (
            <OperatingHours
              schedule={organization.settings?.team_schedule || {}}
              onChange={(schedule) => updateSettings('team_schedule', schedule)}
            />
          )}
        </div>
      </div>
    </div>
  );
};