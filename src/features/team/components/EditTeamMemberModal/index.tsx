import React, { useState } from 'react';
import { X, Camera, Phone, Mail, MapPin, Building2, Tag } from 'lucide-react';
import { useTeamStore } from '../../stores/teamStore';
import { useAuth } from '@/hooks/useAuth';
import { AvatarCustomizer } from '@/features/shared/components';
import type { TeamMemberData } from '../../types';
import toast from 'react-hot-toast';

interface EditTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMemberData;
}

export const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({ isOpen, onClose, member }) => {
  const { updateMember } = useTeamStore();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    avatar: member.avatar,
    departments: member.departments,
    roles: member.roles,
    locations: member.locations,
    kitchenRole: member.kitchenRole
  });

  const [isAvatarCustomizerOpen, setIsAvatarCustomizerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: avatarUrl }));
    setIsAvatarCustomizerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateMember(member.id, {
        ...formData,
        lastUpdated: new Date().toISOString()
      });

      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          {!isAvatarCustomizerOpen && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          {isAvatarCustomizerOpen ? (
            <div className="space-y-4">
              <AvatarCustomizer
                currentAvatar={formData.avatar}
                onSelect={handleAvatarSelect}
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsAvatarCustomizerOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <img
                      src={formData.avatar}
                      alt={`${formData.firstName} ${formData.lastName}`}
                      className="w-24 h-24 rounded-full bg-gray-800 transition-transform group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAvatarCustomizerOpen(true)}
                      className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-lg transition-transform group-hover:scale-110"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    Click the camera icon to customize your avatar with our fun avatar maker!
                  </div>
                </div>
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
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="input w-full pl-10"
                      placeholder="Email address"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input w-full pl-10"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Work Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <Building2 className="w-4 h-4 inline-block mr-2" />
                      Departments
                    </label>
                    <textarea
                      value={formData.departments.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        departments: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                      }))}
                      className="input w-full min-h-[80px]"
                      placeholder="Enter departments (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <Tag className="w-4 h-4 inline-block mr-2" />
                      Roles
                    </label>
                    <textarea
                      value={formData.roles.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        roles: e.target.value.split(',').map(r => r.trim()).filter(Boolean)
                      }))}
                      className="input w-full min-h-[80px]"
                      placeholder="Enter roles (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <MapPin className="w-4 h-4 inline-block mr-2" />
                      Locations
                    </label>
                    <textarea
                      value={formData.locations.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        locations: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                      }))}
                      className="input w-full min-h-[80px]"
                      placeholder="Enter locations (comma-separated)"
                    />
                  </div>
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
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};