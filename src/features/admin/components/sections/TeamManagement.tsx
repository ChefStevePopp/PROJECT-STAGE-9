import React, { useState } from 'react';
import { Users, Plus, Search, Upload, Trash2, Save } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';
import { EditTeamMemberModal } from '@/features/team/components';
import { ImportTeamModal } from '@/features/team/components';
import type { TeamMemberData } from '@/features/team/types';
import toast from 'react-hot-toast';

export const TeamManagement: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const { members, importTeam, clearTeam, saveTeam } = useTeamStore();

  const handleImport = async (data: any[]) => {
    try {
      await importTeam(data);
      toast.success('Team data imported successfully');
      setIsImportModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to import team data');
      }
    }
  };

  const handleClearData = () => {
    clearTeam();
    toast.success('Team data cleared successfully');
  };

  const handleSaveData = async () => {
    try {
      await saveTeam();
      toast.success('Team data saved successfully');
    } catch (error) {
      toast.error('Failed to save team data');
    }
  };

  // Get unique roles for filtering
  const roles = Array.from(new Set(members.flatMap(m => m.roles))).sort();

  // Filter members based on search and role
  const filteredMembers = members.filter(member => {
    const matchesSearch = (
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchesRole = roleFilter === 'all' || member.roles.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Team Management</h1>
        <div className="flex gap-4">
          <button
            onClick={handleClearData}
            className="btn-ghost text-red-400 hover:text-red-300"
            disabled={members.length === 0}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Clear Data
          </button>
          <button
            onClick={handleSaveData}
            className="btn-ghost text-green-400 hover:text-green-300"
            disabled={members.length === 0}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Data
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-primary"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Team Data
          </button>
        </div>
      </header>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 pl-4">Name</th>
                <th className="pb-3 px-4">Departments</th>
                <th className="pb-3 px-4">Roles</th>
                <th className="pb-3 px-4">Contact</th>
                <th className="pb-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-700">
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-400">
                          ID: {member.punchId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-2">
                      {member.departments.map((dept, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-2">
                      {member.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {member.email && (
                        <p className="text-sm text-gray-300">{member.email}</p>
                      )}
                      {member.phone && (
                        <p className="text-sm text-gray-300">{member.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="btn-ghost px-4 py-2"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ImportTeamModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      {editingMember && (
        <EditTeamMemberModal
          isOpen={true}
          onClose={() => setEditingMember(null)}
          member={editingMember}
        />
      )}
    </div>
  );
};