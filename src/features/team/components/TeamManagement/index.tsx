import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Upload, FileSpreadsheet, Settings, Save, Trash2, RefreshCw, ArrowUpDown } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';
import { EditTeamMemberModal } from '../EditTeamMemberModal';
import { ImportTeamModal } from '../ImportTeamModal';
import { CreateTeamMemberModal } from '../CreateTeamMemberModal';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { TeamMemberData } from '../../types';
import toast from 'react-hot-toast';

type SortConfig = {
  key: keyof TeamMemberData | '';
  direction: 'asc' | 'desc';
};

export const TeamManagement: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [importType, setImportType] = useState<'7shifts' | 'excel' | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  
  const { 
    members, 
    importTeam, 
    fetchTeamMembers, 
    clearTeam, 
    saveTeam, 
    isLoading,
    error,
    deleteMember
  } = useTeamStore();

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        await fetchTeamMembers();
      } catch (error) {
        // Error handling is done in the store
      }
    };
    loadTeamMembers();
  }, [fetchTeamMembers]);

  const handleSort = (key: keyof TeamMemberData) => {
    setSortConfig(current => ({
      key,
      direction: 
        current.key === key && current.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const handleImport = async (data: any[]) => {
    try {
      await importTeam(data);
      setIsImportModalOpen(false);
      setImportType(null);
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleClearData = async () => {
    try {
      await clearTeam();
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleSaveData = async () => {
    try {
      await saveTeam();
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteMember(id);
      } catch (error) {
        toast.error('Failed to delete team member');
      }
    }
  };

  // Filter and sort members
  const sortedAndFilteredMembers = React.useMemo(() => {
    let filtered = members.filter(member => {
      const matchesSearch = (
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      const matchesRole = roleFilter === 'all' || member.roles.includes(roleFilter);

      return matchesSearch && matchesRole;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle array values (like roles, departments)
        if (Array.isArray(aValue)) aValue = aValue.join(', ');
        if (Array.isArray(bValue)) bValue = bValue.join(', ');

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [members, searchTerm, roleFilter, sortConfig]);

  // Get unique roles for filtering
  const roles = Array.from(new Set(members.flatMap(m => m.roles))).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => fetchTeamMembers()}
            className="btn-ghost text-primary-400"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const SortIcon = ({ column }: { column: keyof TeamMemberData }) => (
    <ArrowUpDown 
      className={`w-4 h-4 inline-block ml-1 cursor-pointer transition-colors
        ${sortConfig.key === column ? 'text-primary-400' : 'text-gray-400'}`}
      onClick={() => handleSort(column)}
    />
  );

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/team/components/TeamManagement/index.tsx
      </div>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-gray-400">Manage your team members and import data from various sources</p>
        </div>
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
          <div className="relative group">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="btn-primary"
            >
              <Upload className="w-5 h-5 mr-2" />
              Import Team Data
            </button>
            <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => {
                  setImportType('7shifts');
                  setIsImportModalOpen(true);
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                From 7shifts
              </button>
              <button
                onClick={() => {
                  setImportType('excel');
                  setIsImportModalOpen(true);
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                From Excel
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Team Member
          </button>
        </div>
      </header>

      {/* Import Instructions Card */}
      {members.length === 0 && (
        <div className="card p-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-primary-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-white">Import Your Team Data</h2>
              <p className="text-gray-400">
                Get started by importing your team data. You can:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1">
                <li>Connect with 7shifts to automatically sync your team data</li>
                <li>Import from Excel using our template format</li>
                <li>Manually add team members one by one</li>
              </ul>
              <div className="flex gap-4 mt-4">
                <Link 
                  to={ROUTES.ADMIN.SETTINGS} 
                  className="text-primary-400 hover:text-primary-300 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configure 7shifts Integration
                </Link>
                <a 
                  href="/team-template.xlsx" 
                  download 
                  className="text-primary-400 hover:text-primary-300 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Excel Template
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <tr className="text-left text-gray-400">
                <th className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-700 w-[300px]">
                  Name <SortIcon column="firstName" />
                </th>
                <th className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-700 w-[200px]">
                  Punch ID <SortIcon column="punchId" />
                </th>
                <th className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-700 w-[250px]">
                  Roles
                </th>
                <th className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-700 w-[250px]">
                  Departments
                </th>
                <th className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-700 w-[250px]">
                  Contact <SortIcon column="email" />
                </th>
                <th className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-700 w-[150px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="px-4 py-4">
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
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-400">
                      {member.punchId || 'Not Set'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2 max-h-[60px] overflow-hidden relative">
                      {member.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm whitespace-nowrap"
                        >
                          {role}
                        </span>
                      ))}
                      {member.roles.length > 2 && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-800/95" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2 max-h-[60px] overflow-hidden relative">
                      {member.departments.map((dept, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 rounded-full text-sm text-gray-300 whitespace-nowrap"
                        >
                          {dept}
                        </span>
                      ))}
                      {member.departments.length > 2 && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-800/95" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-300">{member.email}</p>
                      <p className="text-sm text-gray-300">{member.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="btn-ghost px-3 py-1.5 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
                        className="btn-ghost px-2 py-1.5 text-sm text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedAndFilteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No team members found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImportTeamModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportType(null);
        }}
        onImport={handleImport}
      />

      <CreateTeamMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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