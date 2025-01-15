import React, { useState } from "react";
import { UserCircle } from "lucide-react";
import { AvatarCustomizer } from "@/features/shared/components";
import type { TeamMember } from "../../../types";

interface AvatarTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

export const AvatarTab: React.FC<AvatarTabProps> = ({
  formData,
  setFormData,
}) => {
  // Keep track of the selected avatar URL in local state
  const [selectedAvatar, setSelectedAvatar] = useState(formData.avatar_url);

  // Update the form data when avatar changes
  const handleAvatarChange = (url: string) => {
    setSelectedAvatar(url);
    setFormData({ ...formData, avatar_url: url });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <UserCircle className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-gray-300">Profile Picture</h3>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        <AvatarCustomizer
          value={selectedAvatar}
          onChange={handleAvatarChange}
          size="large"
        />
        <p className="text-sm text-gray-400 mt-4">
          Click to upload or change profile picture
        </p>
      </div>

      <div className="bg-purple-500/10 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <UserCircle className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-purple-400">
              About Profile Pictures
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              Profile pictures help team members recognize each other easily.
              Click save to apply your changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
