import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Mail, Phone, Globe, FileText } from "lucide-react";

export const BasicInformation: React.FC = () => {
  const { organization } = useAuth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Organization Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            value={organization.name}
            className="input w-full"
            placeholder="Enter organization name"
          />
        </div>

        {/* Legal Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Legal Business Name
          </label>
          <input
            type="text"
            value={organization.legal_name || ""}
            className="input w-full"
            placeholder="Enter legal business name"
          />
        </div>

        {/* Tax ID */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Tax ID / EIN
          </label>
          <input
            type="text"
            value={organization.tax_id || ""}
            className="input w-full"
            placeholder="Enter tax ID"
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Business Type
          </label>
          <select
            value={organization.settings?.business_type || ""}
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

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            value={organization.contact_email || ""}
            className="input w-full"
            placeholder="Enter contact email"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            value={organization.contact_phone || ""}
            className="input w-full"
            placeholder="Enter contact phone"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Website
          </label>
          <input
            type="url"
            value={organization.website || ""}
            className="input w-full"
            placeholder="Enter website URL"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Default Timezone
          </label>
          <select
            value={organization.settings?.default_timezone || ""}
            className="input w-full"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
};
