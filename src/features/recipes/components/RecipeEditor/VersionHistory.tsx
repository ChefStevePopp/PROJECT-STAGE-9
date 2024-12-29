import React, { useState } from 'react';
import { 
  History, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw,
  User,
  Clock,
  FileText
} from 'lucide-react';
import type { Recipe, RecipeVersion } from '../../types/recipe';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface VersionHistoryProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ recipe, onChange }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<RecipeVersion | null>(null);

  const handleCreateVersion = async () => {
    const changes = prompt('Please describe the changes made in this version:');
    if (!changes) return;

    const newVersion: RecipeVersion = {
      id: `version-${Date.now()}`,
      version: `${recipe.versions.length + 1}.0`,
      createdAt: new Date().toISOString(),
      createdBy: recipe.modifiedBy,
      changes: [changes]
    };

    onChange({
      versions: [...recipe.versions, newVersion],
      version: newVersion.version
    });

    toast.success('New version created successfully');
  };

  const handleApproveVersion = async (version: RecipeVersion) => {
    setSelectedVersion(version);
    setIsApproving(true);
  };

  const submitApproval = async () => {
    if (!selectedVersion) return;

    try {
      const updatedVersion = {
        ...selectedVersion,
        approved: {
          by: recipe.modifiedBy,
          at: new Date().toISOString(),
          notes: approvalNotes
        }
      };

      onChange({
        versions: recipe.versions.map(v =>
          v.id === selectedVersion.id ? updatedVersion : v
        )
      });

      setIsApproving(false);
      setApprovalNotes('');
      setSelectedVersion(null);
      toast.success('Version approved successfully');
    } catch (error) {
      console.error('Error approving version:', error);
      toast.error('Failed to approve version');
    }
  };

  const handleRevertToVersion = async (version: RecipeVersion) => {
    if (!window.confirm('Are you sure you want to revert to this version? This action cannot be undone.')) {
      return;
    }

    try {
      // Create new version for the revert
      const revertVersion: RecipeVersion = {
        id: `version-${Date.now()}`,
        version: `${recipe.versions.length + 1}.0`,
        createdAt: new Date().toISOString(),
        createdBy: recipe.modifiedBy,
        changes: [`Reverted to version ${version.version}`],
        revertedFrom: version.id
      };

      onChange({
        versions: [...recipe.versions, revertVersion],
        version: revertVersion.version
      });

      toast.success(`Successfully reverted to version ${version.version}`);
    } catch (error) {
      console.error('Error reverting version:', error);
      toast.error('Failed to revert version');
    }
  };

  return (
    <div className="space-y-6">
      {/* Version History Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Version History</h3>
            <p className="text-sm text-gray-400">Current Version: {recipe.version}</p>
          </div>
        </div>
        <button
          onClick={handleCreateVersion}
          className="btn-primary"
        >
          Create New Version
        </button>
      </div>

      {/* Version List */}
      <div className="space-y-4">
        {recipe.versions.map((version) => (
          <div
            key={version.id}
            className={`bg-gray-800/50 rounded-lg p-4 ${
              version.approved ? 'border border-green-500/20' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-medium text-white">
                    Version {version.version}
                  </h4>
                  {version.approved && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Approved
                    </span>
                  )}
                  {version.revertedFrom && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      Revert
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {version.createdBy}
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-300">Changes:</h5>
                  <ul className="space-y-1">
                    {version.changes.map((change, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                        <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>

                {version.approved && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-300">
                          Approved by {version.approved.by} on {format(new Date(version.approved.at), 'MMM d, yyyy')}
                        </p>
                        {version.approved.notes && (
                          <p className="text-sm text-gray-400 mt-1">
                            {version.approved.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!version.approved && (
                  <button
                    onClick={() => handleApproveVersion(version)}
                    className="btn-ghost text-green-400 hover:text-green-300"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleRevertToVersion(version)}
                  className="btn-ghost text-blue-400 hover:text-blue-300"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Modal */}
      {isApproving && selectedVersion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">
                Approve Version {selectedVersion.version}
              </h3>
              <button
                onClick={() => {
                  setIsApproving(false);
                  setApprovalNotes('');
                  setSelectedVersion(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Approval Notes
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="input w-full h-32"
                  placeholder="Enter any notes or comments about this approval..."
                />
              </div>

              <div className="bg-yellow-500/10 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 font-medium">Important Notice</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Approving a version indicates that it has been reviewed and meets all quality standards.
                      This action will be logged and cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsApproving(false);
                    setApprovalNotes('');
                    setSelectedVersion(null);
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApproval}
                  className="btn-primary"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};