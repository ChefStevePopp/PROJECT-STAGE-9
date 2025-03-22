import React from "react";
import { Award, Plus, Trash2 } from "lucide-react";
import type { TeamMember } from "../../../types";

interface CertificationsTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

export const CertificationsTab: React.FC<CertificationsTabProps> = ({
  formData,
  setFormData,
}) => {
  // This is a placeholder component for future implementation
  // We'll add the actual functionality when needed

  return (
    <div className="space-y-6">
      {/* Certifications Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-medium text-gray-300">
              Certifications
            </h3>
          </div>
          <button
            type="button"
            className="text-rose-400 hover:text-rose-300 p-1 hover:bg-gray-800 rounded transition-colors"
            disabled
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 bg-gray-800/50 rounded-lg text-center">
          <p className="text-gray-400 text-sm">
            Certifications and awards functionality coming soon. This will allow
            you to track food safety certifications, awards, and other
            achievements for team members.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-rose-500/10 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-rose-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-rose-400">
              About Certifications & Awards
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              Track food safety certifications, awards, and other achievements
              for team members. You'll be able to set expiration dates for
              certifications and receive notifications when they're about to
              expire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
