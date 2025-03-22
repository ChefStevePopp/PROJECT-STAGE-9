import React, { useState } from "react";
import {
  X,
  User,
  Shield,
  Award,
  Bell,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { useTeamStore } from "@/stores/teamStore";
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { RolesTab } from "./tabs/RolesTab";
import { CertificationsTab } from "./tabs/CertificationsTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { AvatarTab } from "./tabs/AvatarTab";
import { PermissionsTab } from "./tabs/PermissionsTab";
import type { TeamMember } from "../../types";

interface EditTeamMemberModalProps {
  member: TeamMember;
  isOpen?: boolean;
  onClose?: () => void;
}

type TabId =
  | "basic"
  | "roles"
  | "permissions"
  | "certifications"
  | "notifications"
  | "avatar";

const TABS = [
  { id: "basic", label: "Basic Info", icon: User, color: "primary" },
  { id: "roles", label: "Roles", icon: Briefcase, color: "green" },
  { id: "permissions", label: "Permissions", icon: Shield, color: "amber" },
  { id: "certifications", label: "Certifications", icon: Award, color: "rose" },
  { id: "notifications", label: "Notifications", icon: Bell, color: "purple" },
  { id: "avatar", label: "Avatar", icon: UserCircle, color: "lime" },
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
        kitchen_role: formData.kitchen_role,
        kitchen_stations: formData.kitchen_stations || [],
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
      <div className="bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 bg-[#1a1f2b] shadow-lg rounded-lg py-[2] p-4">
            <div className="flex items-center gap-4">
              {formData.avatar_url ? (
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-600">
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                  <User className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {formData.first_name} {formData.last_name}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-700/50 px-3 py-1 rounded-lg">
                <Shield className="w-4 h-4 text-amber-500 mr-2" />
                <span className="text-gray-200 text-sm font-medium">
                  Role:{" "}
                </span>
                <span className="text-gray-300 text-sm ml-1">
                  {formData.kitchen_role || "No role assigned"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${tab.color} ${activeTab === tab.id ? "active" : ""}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
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
              {activeTab === "permissions" && (
                <PermissionsTab formData={formData} setFormData={setFormData} />
              )}
              {activeTab === "certifications" && (
                <CertificationsTab
                  formData={formData}
                  setFormData={setFormData}
                />
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
