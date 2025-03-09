import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { YourKitchen } from "./YourKitchen";
import { YourCrew } from "./YourCrew";
import { YourStation } from "./YourStation";
import { LoadingLogo } from "@/components/LoadingLogo";
import { supabase } from "@/lib/supabase";

export const MyAccount: React.FC = () => {
  const [activeTab, setActiveTab] = useState("kitchen");
  const { user, organization, organizationId, isLoading, error } = useAuth();
  const [kitchenRole, setKitchenRole] = useState<string | null>(null);

  // Fetch kitchen role
  useEffect(() => {
    const fetchKitchenRole = async () => {
      if (!user?.id || !organizationId) return;

      try {
        const { data, error } = await supabase
          .from("organization_team_members")
          .select("kitchen_role")
          .eq("organization_id", organizationId)
          .eq("email", user.email)
          .single();

        if (!error && data) {
          setKitchenRole(data.kitchen_role);
        } else {
          console.log("No kitchen role found, error:", error);
        }
      } catch (err) {
        console.error("Error fetching kitchen role:", err);
      }
    };

    fetchKitchenRole();
  }, [user?.id, user?.email, organizationId]);

  const tabs = [
    { id: "kitchen", label: "Your Kitchen", color: "primary" },
    { id: "crew", label: "Your Crew", color: "green" },
    { id: "station", label: "Your Station", color: "amber" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingLogo message="Loading account..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg">
        <h2 className="text-lg font-medium">Error Loading Account</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!user || !organization) {
    return (
      <div className="p-4 bg-amber-500/10 text-amber-400 rounded-lg">
        <h2 className="text-lg font-medium">Account Not Available</h2>
        <p className="mt-2">
          Unable to load account information. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
        <p className="text-gray-400">Manage your profile and preferences</p>
      </header>

      {/* Debug Info */}
      <div className="p-4 bg-gray-800/50 rounded-lg text-xs font-mono text-gray-400">
        <div>User ID: {user.id}</div>
        <div>User Email: {user.email}</div>
        <div>Organization ID: {organizationId || "Not set"}</div>
        <div>Organization: {organization?.name || "Not available"}</div>
        <div>Kitchen Role: {kitchenRole || "None"}</div>
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
      <div className="card p-6">
        {activeTab === "kitchen" && <YourKitchen />}
        {activeTab === "crew" && <YourCrew />}
        {activeTab === "station" && <YourStation />}
      </div>
    </div>
  );
};
