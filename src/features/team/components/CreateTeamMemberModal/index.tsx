import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTeamStore } from '../../stores/teamStore';
import { AvatarCustomizer } from '@/features/shared/components';
import toast from 'react-hot-toast';

interface CreateTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTeamMemberModal: React.FC<CreateTeamMemberModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
    departments: [] as string[],
    roles: [] as string[],
    locations: [] as string[]
  });

  const { addMember } = useTeamStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMember({
        ...formData,
        id: `team-${Date.now()}`,
        lastUpdated: new Date().toISOString()
      });
      toast.success('Team member added successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to add team member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Add Team Member</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Profile Picture</h3>
            <AvatarCustomizer
              currentAvatar={formData.avatar}
              onSelect={(avatarUrl) => setFormData(prev => ({ ...prev, avatar: avatarUrl }))}
            />
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
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
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Contact Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Work Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Departments
              </label>
              <input
                type="text"
                value={formData.departments.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  departments: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                }))}
                className="input w-full"
                placeholder="Enter departments (comma-separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Roles
              </label>
              <input
                type="text"
                value={formData.roles.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  roles: e.target.value.split(',').map(r => r.trim()).filter(Boolean)
                }))}
                className="input w-full"
                placeholder="Enter roles (comma-separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Locations
              </label>
              <input
                type="text"
                value={formData.locations.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  locations: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                }))}
                className="input w-full"
                placeholder="Enter locations (comma-separated)"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Add Team Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamMemberModal;