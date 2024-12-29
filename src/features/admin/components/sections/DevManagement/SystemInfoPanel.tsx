import React from 'react';
import { Info, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export const SystemInfoPanel: React.FC = () => {
  const systemInfo = {
    version: '1.0.0',
    environment: import.meta.env.MODE,
    browser: navigator.userAgent.split(' ').pop() || navigator.userAgent,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: `${window.screen.colorDepth}-bit`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
    cookiesEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine ? 'Online' : 'Offline',
    deviceMemory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown',
    hardwareConcurrency: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'Unknown'
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(systemInfo, null, 2))
      .then(() => toast.success('System info copied to clipboard'))
      .catch(() => toast.error('Failed to copy system info'));
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Info className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">System Information</h3>
          <p className="text-sm text-gray-400">Current system configuration and environment details</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(systemInfo).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <dt className="text-sm font-medium text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="text-sm text-white break-words">{value}</dd>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className="btn-ghost text-purple-400 hover:text-purple-300 w-full"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy System Info
        </button>
      </div>
    </div>
  );
};