import React, { useState } from "react";
import {
  History,
  Clock,
  User,
  FileEdit,
  CheckCircle,
  Archive,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { Recipe } from "../../types/recipe";
import { useAuth } from "@/hooks/useAuth";
import { useUserNameMapping } from "@/hooks/useUserNameMapping";
import toast from "react-hot-toast";

interface VersionHistoryProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

interface VersionEntry {
  version: string;
  date: string;
  changedBy: string;
  notes?: string;
  status: "draft" | "review" | "approved" | "archived";
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  recipe,
  onChange,
}) => {
  const { user } = useAuth();
  const { getUserName } = useUserNameMapping();
  const [showStatusConfirm, setShowStatusConfirm] = useState<string | null>(
    null,
  );
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionType, setVersionType] = useState<"major" | "minor">("minor");
  const [versionNotes, setVersionNotes] = useState("");

  // Parse current version or default to 1.0
  const currentVersion = recipe.version || "1.0";

  // Calculate next version numbers
  const nextMajorVersion = `${parseInt(currentVersion.split(".")[0]) + 1}.0`;
  const nextMinorVersion = `${currentVersion.split(".")[0]}.${parseInt(currentVersion.split(".")[1] || "0") + 1}`;

  // Get version history from recipe or create empty array
  const versionHistory: VersionEntry[] = [
    // Current version (not yet in history)
    {
      version: currentVersion,
      date: recipe.updated_at || new Date().toISOString(),
      changedBy: recipe.modified_by || user?.id || "Unknown",
      status: recipe.status as "draft" | "review" | "approved" | "archived",
    },
    // Previous versions from history
    ...(recipe.versions || []).map((v: any) => ({
      version: v.version,
      date: v.date,
      changedBy: v.changedBy,
      notes: v.notes,
      status: v.status || "archived",
    })),
  ];

  const handleStatusChange = (newStatus: string) => {
    // Show confirmation dialog
    setShowStatusConfirm(newStatus);
  };

  const confirmStatusChange = () => {
    if (!showStatusConfirm) return;

    const statusUpdates: Partial<Recipe> = {
      status: showStatusConfirm,
    };

    // Add appropriate timestamps and user IDs based on status
    if (showStatusConfirm === "approved") {
      statusUpdates.approved_by = user?.id;
      statusUpdates.approved_at = new Date().toISOString();
    } else if (showStatusConfirm === "review") {
      statusUpdates.last_reviewed_by = user?.id;
      statusUpdates.last_reviewed_at = new Date().toISOString();
    }

    // Always update modified info
    statusUpdates.modified_by = user?.id;
    statusUpdates.updated_at = new Date().toISOString();

    onChange(statusUpdates);
    setShowStatusConfirm(null);
    toast.success(`Recipe status changed to ${showStatusConfirm}`);
  };

  const createNewVersion = () => {
    // Determine new version number
    const newVersion =
      versionType === "major" ? nextMajorVersion : nextMinorVersion;

    // Create version entry for current version
    const currentVersionEntry = {
      version: currentVersion,
      date: recipe.updated_at || new Date().toISOString(),
      changedBy: recipe.modified_by || user?.id,
      notes: versionNotes,
      status: recipe.status,
    };

    // Update recipe with new version info
    onChange({
      version: newVersion,
      versions: [currentVersionEntry, ...(recipe.versions || [])],
      status: "draft", // Reset to draft for new version
      modified_by: user?.id,
      updated_at: new Date().toISOString(),
    });

    setShowVersionModal(false);
    setVersionNotes("");
    toast.success(`Created new version ${newVersion}`);
  };

  // Helper function to get status styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50";
      case "review":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "approved":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "archived":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileEdit className="w-4 h-4" />;
      case "review":
        return <Info className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "archived":
        return <Archive className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <History className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Version History</h2>
          <p className="text-gray-400">
            Manage recipe versions and approval status
          </p>
        </div>
      </div>

      {/* Current Version & Status */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4">Current Version</h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-lg font-bold text-purple-400">
                {currentVersion}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-400">Current Version</div>
              <div className="text-white font-medium">{recipe.name}</div>
            </div>
          </div>

          <button
            onClick={() => setShowVersionModal(true)}
            className="btn-primary"
          >
            Create New Version
          </button>
        </div>

        {/* Status Toggle */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-400 mb-3">
            Recipe Status
          </h4>
          <div className="flex flex-wrap rounded-lg overflow-hidden border border-gray-700">
            {["draft", "review", "approved", "archived"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={recipe.status === status}
                className={`px-4 py-2 flex items-center gap-2 ${
                  recipe.status === status
                    ? getStatusStyle(status)
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {getStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Information */}
          <div className="mt-4 p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-white">
                  About Recipe Status
                </h5>
                <ul className="mt-2 space-y-2 text-sm text-gray-400">
                  <li>
                    <span className="text-amber-400 font-medium">Draft:</span>{" "}
                    Recipe is being developed and tested. Not ready for kitchen
                    use.
                  </li>
                  <li>
                    <span className="text-blue-400 font-medium">Review:</span>{" "}
                    Recipe is ready for review by management or head chef.
                  </li>
                  <li>
                    <span className="text-emerald-400 font-medium">
                      Approved:
                    </span>{" "}
                    Recipe is finalized and approved for kitchen production.
                  </li>
                  <li>
                    <span className="text-rose-400 font-medium">Archived:</span>{" "}
                    Recipe is no longer in active use but kept for reference.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Creation & Modification Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Creation Info
            </h4>
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(recipe.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white mt-1">
              <User className="w-4 h-4 text-gray-400" />
              <span>Created by: {getUserName(recipe.created_by)}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-800/50">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Last Modified
            </h4>
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(recipe.updated_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white mt-1">
              <User className="w-4 h-4 text-gray-400" />
              <span>Modified by: {getUserName(recipe.modified_by)}</span>
            </div>
          </div>
        </div>

        {/* Approval Info - Only show if approved */}
        {recipe.status === "approved" && recipe.approved_at && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-500/10">
            <h4 className="text-sm font-medium text-emerald-400 mb-2">
              Approval Info
            </h4>
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{new Date(recipe.approved_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-white mt-1">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Approved by: {getUserName(recipe.approved_by)}</span>
            </div>
          </div>
        )}

        {/* Last Review Info - Only show if reviewed */}
        {recipe.last_reviewed_at && (
          <div className="mt-4 p-4 rounded-lg bg-blue-500/10">
            <h4 className="text-sm font-medium text-blue-400 mb-2">
              Last Review
            </h4>
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>
                {new Date(recipe.last_reviewed_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white mt-1">
              <User className="w-4 h-4 text-blue-400" />
              <span>Reviewed by: {getUserName(recipe.last_reviewed_by)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Version History */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4">Version History</h3>

        {versionHistory.length > 1 ? (
          <div className="space-y-4">
            {versionHistory.slice(1).map((version, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <span className="text-md font-bold text-purple-400">
                        {version.version}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        Version {version.version}
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusStyle(version.status)}`}
                        >
                          {version.status.charAt(0).toUpperCase() +
                            version.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(version.date).toLocaleDateString()} by{" "}
                        {getUserName(version.changedBy)}
                      </div>
                    </div>
                  </div>
                </div>

                {version.notes && (
                  <div className="mt-3 pl-13">
                    <div className="text-sm text-gray-400">Change Notes:</div>
                    <div className="text-sm text-white mt-1">
                      {version.notes}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No previous versions available
          </div>
        )}
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-medium text-white">
                Change Recipe Status?
              </h3>
            </div>

            <p className="text-gray-300 mb-4">
              {showStatusConfirm === "approved" &&
                "This will mark the recipe as APPROVED and make it available for kitchen production. Are you sure it's ready?"}
              {showStatusConfirm === "review" &&
                "This will mark the recipe for REVIEW by management. Continue?"}
              {showStatusConfirm === "draft" &&
                "This will change the recipe back to DRAFT status. Continue?"}
              {showStatusConfirm === "archived" &&
                "This will ARCHIVE the recipe and remove it from active use. This action should only be taken for recipes that are no longer needed."}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusConfirm(null)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`px-4 py-2 rounded-lg ${getStatusStyle(showStatusConfirm)}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Create New Version
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Version Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setVersionType("minor")}
                    className={`p-4 rounded-lg border ${versionType === "minor" ? "border-primary-500 bg-primary-500/10" : "border-gray-700 bg-gray-800"}`}
                  >
                    <div className="text-lg font-bold text-center mb-2">
                      {nextMinorVersion}
                    </div>
                    <div className="text-sm text-center text-gray-400">
                      Minor Change
                    </div>
                    <div className="text-xs text-center text-gray-500 mt-1">
                      Small adjustments, clarifications
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVersionType("major")}
                    className={`p-4 rounded-lg border ${versionType === "major" ? "border-primary-500 bg-primary-500/10" : "border-gray-700 bg-gray-800"}`}
                  >
                    <div className="text-lg font-bold text-center mb-2">
                      {nextMajorVersion}
                    </div>
                    <div className="text-sm text-center text-gray-400">
                      Major Change
                    </div>
                    <div className="text-xs text-center text-gray-500 mt-1">
                      Significant alterations
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Change Notes
                </label>
                <textarea
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  className="input w-full h-24"
                  placeholder="Describe what changed in this version..."
                />
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowVersionModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button onClick={createNewVersion} className="btn-primary">
                  Create Version{" "}
                  {versionType === "major"
                    ? nextMajorVersion
                    : nextMinorVersion}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
