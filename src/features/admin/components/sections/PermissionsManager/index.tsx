import React, { useState, useEffect } from 'react';
import { Shield, Users, Lock, Info, Save, RefreshCw, Plus } from 'lucide-react';
import { KITCHEN_ROLES, type KitchenRole } from '@/config/kitchen-roles';
import { useUserLevel } from '@/hooks/useUserLevel';
import { useTeamStore } from '@/stores/teamStore';
import { PermissionGrid } from './PermissionGrid';
import { TeamMemberList } from './TeamMemberList';
import { AssignMembersModal } from './AssignMembersModal';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import toast from 'react-hot-toast';

export const PermissionsManager: React.FC = () => {
  const [activeRole, setActiveRole] = useState<KitchenRole>('owner');
  const [isSaving, setIsSaving] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { userLevel, canManageUsers } = useUserLevel();
  const { members, isLoading, error, fetchTeamMembers } = useTeamStore();

  // Diagnostic Text
  const diagnosticPath = "src/features/admin/components/sections/PermissionsManager/index.tsx";

  // Fetch team members on mount
  useEffect(() => {
    fetchTeamMembers().catch(error => {
      console.error('Error fetching team members:', error);
    });
  }, [fetchTeamMembers]);

  const features = [
    { 
      id: 'inventory', 
      label: 'Inventory Management',
      description: 'Access to inventory and stock management'
    },
    { 
      id: 'recipes', 
      label: 'Recipe Management',
      description: 'Access to recipes and preparation instructions'
    },
    { 
      id: 'production', 
      label: 'Production Board',
      description: 'Access to daily production planning'
    },
    { 
      id: 'reports', 
      label: 'Reports & Analytics',
      description: 'Access to business reporting and analytics'
    },
    { 
      id: 'settings', 
      label: 'System Settings',
      description: 'Access to system configuration'
    },
    { 
      id: 'team', 
      label: 'User Management',
      description: 'Access to user and permission management'
    }
  ];

  // Get role assignments
  const roleAssignments = Object.entries(KITCHEN_ROLES).reduce((acc, [role]) => {
    acc[role as KitchenRole] = members.filter(m => m.kitchenRole === role).length;
    return acc;
  }, {} as Record<KitchenRole, number>);

  const handleSave = async () => {
    if (!canManageUsers) {
      toast.error('You do not have permission to modify roles');
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        members
          .filter(m => m.kitchenRole !== undefined)
          .map(member => 
            useTeamStore.getState().updateMember(member.id, {
              kitchenRole: member.kitchenRole
            })
          )
      );
      toast.success('Permissions saved successfully');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchTeamMembers} />;
  }

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        {diagnosticPath}
      </div>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kitchen Role Management</h1>
          <p className="text-gray-400">Configure kitchen roles and permissions</p>
        </div>
        {canManageUsers && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Kitchen Roles</p>
              <p className="text-2xl font-bold text-white">{Object.keys(KITCHEN_ROLES).length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Staff</p>
              <p className="text-2xl font-bold text-white">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Features</p>
              <p className="text-2xl font-bold text-white">{features.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2">
        {Object.entries(KITCHEN_ROLES).map(([role, config], index) => {
          const colors = [
            'primary',
            'green',
            'amber',
            'rose',
            'purple'
          ];
          const colorClass = colors[index % colors.length];
          
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role as KitchenRole)}
              className={`tab ${colorClass} ${activeRole === role ? 'active' : ''}`}
            >
              <Shield className={`w-5 h-5 ${
                activeRole === role ? `text-${colorClass}-400` : 'text-current'
              }`} />
              <span>{config.label}</span>
              {roleAssignments[role as KitchenRole] > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700">
                  {roleAssignments[role as KitchenRole]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Team Members List */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Team Members</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {roleAssignments[activeRole]} {roleAssignments[activeRole] === 1 ? 'member' : 'members'}
            </span>
            {canManageUsers && (
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="btn-ghost text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign Members
              </button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <TeamMemberList members={members} role={activeRole} />
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="card p-6">
        <PermissionGrid
          activeRole={activeRole}
          features={features}
          isEditable={canManageUsers}
        />
      </div>

      {!canManageUsers && (
        <div className="bg-yellow-500/10 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Access Notice</p>
            <p className="text-sm text-gray-300 mt-1">
              Only kitchen administrators can modify user roles. Contact your system administrator to request changes.
            </p>
          </div>
        </div>
      )}

      {/* Assign Members Modal */}
      <AssignMembersModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        role={activeRole}
      />
    </div>
  );
};