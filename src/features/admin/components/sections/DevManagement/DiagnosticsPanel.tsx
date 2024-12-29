import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDiagnostics } from '@/hooks/useDiagnostics';

export const DiagnosticsPanel: React.FC = () => {
  const { showDiagnostics, setShowDiagnostics } = useDiagnostics();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Diagnostic Mode</h3>
          <p className="text-sm text-gray-400 mt-1">
            Show file paths and component locations for debugging
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Show Diagnostics</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showDiagnostics}
              onChange={(e) => setShowDiagnostics(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>
      </div>

      <div className="bg-yellow-500/10 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">Important Notice</p>
            <p className="text-sm text-gray-300 mt-1">
              Diagnostic mode shows additional development information throughout the application.
              This should only be enabled during development and testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};