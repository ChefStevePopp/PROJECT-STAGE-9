import React, { useState } from "react";
import { X, User, Shield, Building2, Bell, UserCircle } from "lucide-react";
import { useTeamStore } from "@/stores/teamStore";
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { RolesTab } from "./tabs/RolesTab";
import { DepartmentsTab } from "./tabs/DepartmentsTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { AvatarTab } from "./tabs/AvatarTab";
import type { TeamMember } from "../../types";

interface EditTeamMemberModalProps {
  member: TeamMember;
  isOpen?: boolean;
  onClose?: () => void;
}

type TabId = "basic" | "roles" | "departments" | "notifications" | "avatar";

const TABS = [
  { id: "basic", label: "Basic Info", icon: User, color: "primary" },
  { id: "roles", label: "Roles", icon: Shield, color: "green" },
  { id: "departments", label: "Departments", icon: Building2, color: "amber" },
  { id: "notifications", label: "Notifications", icon: Bell, color: "rose" },
  { id: "avatar", label: "Avatar", icon: UserCircle, color: "purple" },
] as const;

export const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({
  member,
  isOpen = false,
  onClose,
}) => {
  const { updateTeamMember } = useTeamStore();
  const [formData, setFormData] = useState<TeamMember>(member);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updates: Partial<TeamMember> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        email: formData.email,
        phone: formData.phone || null,
        punch_id: formData.punch_id || null,
        avatar_url: formData.avatar_url,
        roles: formData.roles || [],
        departments: formData.departments || [],
        locations: formData.locations || [],
        notification_preferences: formData.notification_preferences,
      };

      await updateTeamMember(member.id, updates);
      onClose?.();
    } catch (error) {
      console.error("Error updating team member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {formData.first_name} {formData.last_name}
              </h2>
              <p className="text-gray-400">
                {formData.kitchen_role || "No role assigned"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium
                  ${
                    activeTab === tab.id
                      ? `bg-gray-800 text-${tab.color}-400`
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className={`absolute -top-px left-0 right-0 h-0.5 rounded-full bg-${tab.color}-500`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit}>
            <div className="card p-6">
              {activeTab === "basic" && (
                <BasicInfoTab formData={formData} setFormData={setFormData} />
              )}
              {activeTab === "roles" && (
                <RolesTab formData={formData} setFormData={setFormData} />
              )}
              {activeTab === "departments" && (
                <DepartmentsTab formData={formData} setFormData={setFormData} />
              )}
              {activeTab === "notifications" && (
                <NotificationsTab
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              {activeTab === "avatar" && (
                <AvatarTab formData={formData} setFormData={setFormData} />
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost text-sm px-6"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-sm px-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
