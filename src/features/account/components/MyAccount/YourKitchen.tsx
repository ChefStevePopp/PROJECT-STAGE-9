import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AvatarCustomizer } from '@/features/shared/components';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export const YourKitchen: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.firstName || '',
    lastName: user?.user_metadata?.lastName || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    avatar: user?.user_metadata?.avatar || '',
    punchId: user?.user_metadata?.punchId || '',
    pronouns: user?.user_metadata?.pronouns || '',
    language: user?.user_metadata?.language || 'English'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          avatar: formData.avatar,
          punchId: formData.punchId,
          pronouns: formData.pronouns,
          language: formData.language
        }
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Profile Picture</h3>
        <AvatarCustomizer
          currentAvatar={formData.avatar}
          onSelect={(avatarUrl) => setFormData(prev => ({ ...prev, avatar: avatarUrl }))}
        />
      </div>

      {/* Personal Information */}
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="input w-full bg-gray-700 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Contact support to change your email address
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="input w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Punch ID
            </label>
            <input
              type="text"
              value={formData.punchId}
              onChange={(e) => setFormData(prev => ({ ...prev, punchId: e.target.value }))}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Pronouns
            </label>
            <select
              value={formData.pronouns}
              onChange={(e) => setFormData(prev => ({ ...prev, pronouns: e.target.value }))}
              className="input w-full"
            >
              <option value="">Prefer not to say</option>
              <option value="he/him">He/Him</option>
              <option value="she/her">She/Her</option>
              <option value="they/them">They/Them</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
            className="input w-full"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};