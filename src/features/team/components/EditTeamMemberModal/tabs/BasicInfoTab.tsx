import React from "react";
import { User, Mail, Phone, Hash } from "lucide-react";
import type { TeamMember } from "../../../types";

interface BasicInfoTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            <User className="w-4 h-4 inline-block mr-1.5 opacity-70" />
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
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            <User className="w-4 h-4 inline-block mr-1.5 opacity-70" />
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
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <User className="w-4 h-4 inline-block mr-1.5 opacity-70" />
          Preferred Name
        </label>
        <input
          type="text"
          value={formData.display_name || ""}
          onChange={(e) =>
            setFormData({ ...formData, display_name: e.target.value })
          }
          className="input w-full"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <Mail className="w-4 h-4 inline-block mr-1.5 opacity-70" />
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <Phone className="w-4 h-4 inline-block mr-1.5 opacity-70" />
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone || ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="input w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          <Hash className="w-4 h-4 inline-block mr-1.5 opacity-70" />
          Employee ID
        </label>
        <input
          type="text"
          value={formData.punch_id || ""}
          onChange={(e) =>
            setFormData({ ...formData, punch_id: e.target.value })
          }
          className="input w-full"
          placeholder="Optional"
        />
      </div>
    </div>
  );
};
