import React, { useState } from "react";
import { X } from "lucide-react";
import { useTeamStore } from "@/stores/teamStore";
import { AvatarCustomizer } from "@/features/shared/components";
import { RoleSelector } from "../RoleSelector";
import type { TeamMember } from "../../types";
import toast from "react-hot-toast";

interface TeamMemberModalProps {
  member?: TeamMember; // If provided, we're in edit mode
  isOpen?: boolean;
  onClose?: () => void;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  member,
  isOpen = false,
  onClose,
}) => {
  const { createTeamMember, updateTeamMember } = useTeamStore();
  const [formData, setFormData] = useState<Partial<TeamMember>>(
    member || {
      first_name: "",
      last_name: "",
      email: "",
      role: "team_member",
      status: "active",
    },
  );

  const isEditMode = !!member;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && member) {
        await updateTeamMember(member.id, formData);
        toast.success("Team member updated successfully");
      } else {
        await createTeamMember(formData as Omit<TeamMember, "id">);
        toast.success("Team member added successfully");
      }
      onClose?.();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} team member:`,
        error,
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} team member`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isEditMode ? "Edit" : "Add"} Team Member
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <AvatarCustomizer
                value={formData.avatar_url}
                onChange={(url) =>
                  setFormData({ ...formData, avatar_url: url })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date?.split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="input w-full"
              />
            </div>
          </div>

          {/* Right Column - Role & Additional Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Role & Permissions
              </label>
              <RoleSelector
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Kitchen Role
              </label>
              <input
                type="text"
                value={formData.kitchen_role}
                onChange={(e) =>
                  setFormData({ ...formData, kitchen_role: e.target.value })
                }
                className="input w-full"
                placeholder="e.g., Line Cook, Prep Cook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Station
              </label>
              <input
                type="text"
                value={formData.station}
                onChange={(e) =>
                  setFormData({ ...formData, station: e.target.value })
                }
                className="input w-full"
                placeholder="e.g., Grill, Prep"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="input w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="col-span-2 flex justify-end gap-2 mt-6 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm">
              {isEditMode ? "Save Changes" : "Add Team Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
