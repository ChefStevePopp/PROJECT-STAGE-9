import React, { useState } from 'react';
import { Save, RefreshCw, Globe, Bell, Shield, Database, Link, Building2, MapPin, Clock, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { IntegrationsTab } from './IntegrationsTab';
import toast from 'react-hot-toast';

export const ConfigurationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('organization');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Organization Details
    organizationName: '',
    legalName: '',
    taxId: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    
    // Location Details
    address: '',
    healthCertNumber: '',
    seatingCapacity: '',
    storeNumber: '',
    
    // Operating Information
    businessType: 'restaurant',
    cuisineType: '',
    timezone: 'UTC-5',
    hoursFormat: '12h',
    
    // Additional Settings
    currency: 'CAD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    multiUnit: false
  });

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'operating', label: 'Operating', icon: Clock },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.organizationName,
          legal_name: formData.legalName,
          tax_id: formData.taxId,
          website: formData.website,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          settings: {
            business_type: formData.businessType,
            cuisine_type: formData.cuisineType,
            default_timezone: formData.timezone,
            hours_format: formData.hoursFormat,
            currency: formData.currency,
            date_format: formData.dateFormat,
            time_format: formData.timeFormat,
            multi_unit: formData.multiUnit,
            primary_address: formData.address,
            health_certificate_number: formData.healthCertNumber,
            seating_capacity: formData.seatingCapacity,
            store_number: formData.storeNumber
          }
        })
        .eq('id', user?.user_metadata?.organizationId);

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    // Reset form to initial values
    setFormData({
      organizationName: '',
      legalName: '',
      taxId: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      healthCertNumber: '',
      seatingCapacity: '',
      storeNumber: '',
      businessType: 'restaurant',
      cuisineType: '',
      timezone: 'UTC-5',
      hoursFormat: '12h',
      currency: 'CAD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      multiUnit: false
    });
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-white mb-2">Organization Settings</h1>
          <p className="text-gray-400">Manage your organization details and preferences</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-ghost">
            <RefreshCw className="w-5 h-5 mr-2" />
            Reset
          </button>
          <button onClick={handleSaveChanges} className="btn-primary">
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </div>
      </header>

      <div className="flex gap-6">
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 card p-6">
          {activeTab === 'organization' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Organization Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                      className="input w-full"
                      placeholder="Enter organization name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                      className="input w-full"
                      placeholder="Enter legal business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Tax ID/Business Number
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                      className="input w-full"
                      placeholder="Enter tax ID or business number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="input w-full"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="input w-full"
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        className="input w-full"
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Location Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Primary Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="input w-full"
                      placeholder="Enter primary business address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Health Certificate Number
                    </label>
                    <input
                      type="text"
                      value={formData.healthCertNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, healthCertNumber: e.target.value }))}
                      className="input w-full"
                      placeholder="Enter health certificate number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Seating Capacity
                      </label>
                      <input
                        type="number"
                        value={formData.seatingCapacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, seatingCapacity: e.target.value }))}
                        className="input w-full"
                        placeholder="Enter seating capacity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Store Number
                      </label>
                      <input
                        type="text"
                        value={formData.storeNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, storeNumber: e.target.value }))}
                        className="input w-full"
                        placeholder="Enter store number (if applicable)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operating' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Operating Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Business Type
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
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
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Cuisine Type
                      </label>
                      <input
                        type="text"
                        value={formData.cuisineType}
                        onChange={(e) => setFormData(prev => ({ ...prev, cuisineType: e.target.value }))}
                        className="input w-full"
                        placeholder="Enter primary cuisine type"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Default Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                        className="input w-full"
                      >
                        <option value="UTC-8">Pacific Time</option>
                        <option value="UTC-7">Mountain Time</option>
                        <option value="UTC-6">Central Time</option>
                        <option value="UTC-5">Eastern Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Hours Format
                      </label>
                      <select
                        value={formData.hoursFormat}
                        onChange={(e) => setFormData(prev => ({ ...prev, hoursFormat: e.target.value }))}
                        className="input w-full"
                      >
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && <IntegrationsTab />}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-400">Notify when items are running low</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Password Requirements
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500" defaultChecked />
                      <span className="ml-2 text-gray-300">Require uppercase letters</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Backup & Restore</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Automatic Backups</h4>
                  <p className="text-sm text-gray-400 mb-4">Configure automatic backup schedule</p>
                  <select className="input w-full">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};