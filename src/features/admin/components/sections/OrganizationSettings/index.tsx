import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Building2, MapPin, Users, Globe, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { BasicInformation } from "./BasicInformation";
import { LocationDetails } from "./LocationDetails";
import { OperatingInformation } from "./OperatingInformation";
import { LocalizationSettings } from "./LocalizationSettings";

export const OrganizationSettings: React.FC = () => {
  const { organization, user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    {
      id: "details",
      label: "Basic Information",
      icon: Building2,
      color: "blue",
    },
    { id: "locations", label: "Locations", icon: MapPin, color: "green" },
    { id: "operations", label: "Operations", icon: Clock, color: "amber" },
    {
      id: "settings",
      label: "Localization",
      icon: Globe,
      color: "purple",
    },
  ];

  if (!organization) {
    return (
      <div className="p-4 bg-amber-500/10 text-amber-400 rounded-lg">
        <h2 className="text-lg font-medium">Organization Not Found</h2>
        <p className="mt-2">Unable to load organization settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">
          Organization Settings
        </h1>
        <p className="text-gray-400">
          Manage your organization's configuration and locations
        </p>
      </header>

      {/* Debug Info */}
      <div className="p-4 bg-gray-800/50 rounded-lg text-xs font-mono text-gray-400">
        <div>Organization ID: {organization.id}</div>
        <div>User Role: {user?.user_metadata?.role || "None"}</div>
        <div>
          Multi-Location: {organization.settings?.multi_unit ? "Yes" : "No"}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-3 px-6 py-3 rounded-lg transition-all text-sm font-medium ${
              activeTab === tab.id
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && (
              <div
                className={`absolute -top-px left-0 right-0 h-1 rounded-full bg-${tab.color}-500`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <Card>
        <CardContent>
          {activeTab === "details" && <BasicInformation />}
          {activeTab === "locations" && <LocationDetails />}
          {activeTab === "operations" && <OperatingInformation />}
          {activeTab === "settings" && <LocalizationSettings />}
        </CardContent>
      </Card>
    </div>
  );
};
