import React, { useState, useCallback } from 'react';
import { X, Search, UserPlus, RefreshCw } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';
import type { KitchenRole } from '@/config/kitchen-roles';
import type { TeamMemberData } from '@/features/team/types';
import toast from 'react-hot-toast';

interface AssignMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: KitchenRole;
  onAssign: () => Promise<void>;
}

export const AssignMembersModal: React.FC<AssignMembersModalProps> = ({
  isOpen,
  onClose,
  role,
  onAssign
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningMemberId, setAssigningMemberId] = useState<string | null>(null);
  const { members, updateMember } = useTeamStore();

  // Filter out members who already have this role
  const availableMembers = members.filter(m => m.kitchenRole !== role);

  // Filter members based on search
  const filteredMembers = availableMembers.filter(member => 
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = useCallback(async (member: TeamMemberData) => {
    setAssigningMemberId(member.id);
    try {
      await updateMember(member.id, { kitchenRole: role });
      await onAssign();
      toast.success(`${member.firstName} ${member.lastName} assigned as ${role}`);
      onClose();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    } finally {
      setAssigningMemberId(null);
    }
  }, [role, updateMember, onAssign, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Assign Team Members</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-auto">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
              autoFocus
            />
          </div>

          {/* Members List */}
          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? (
                  <p>No team members match your search</p>
                ) : (
                  <p>No team members available to assign</p>
                )}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-white font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(member)}
                    disabled={assigningMemberId === member.id}
                    className="btn-ghost text-sm text-primary-400 hover:text-primary-300 disabled:opacity-50"
                  >
                    {assigningMemberId === member.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign Role
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
