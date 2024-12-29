import React from 'react';
import { Settings } from 'lucide-react';
import { useDevAccess } from '@/hooks/useDevAccess';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { DatabasePanel } from './DatabasePanel';
import { SystemInfoPanel } from './SystemInfoPanel';
import { ThemeExport } from './ThemeExport';
import { CodeBaseCombiner } from './CodeBaseCombiner';

interface DevManagementProps {}

export const DevManagement: React.FC<DevManagementProps> = () => {
  const { isDev } = useDevAccess();

  if (!isDev) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Settings className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-center max-w-md">
          This section is only accessible to users with dev privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dev Management</h1>
          <p className="text-gray-400">Development tools and system configuration</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <DiagnosticsPanel />
          <DatabasePanel />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <SystemInfoPanel />
          <ThemeExport />
          <CodeBaseCombiner />
        </div>
      </div>
    </div>
  );
};

export default DevManagement;