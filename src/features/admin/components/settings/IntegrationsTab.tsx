import React, { useState } from 'react';
import { Calendar, AlertCircle, RefreshCw, Check, Eye, EyeOff } from 'lucide-react';
import { useScheduleStore } from '@/stores/scheduleStore';
import toast from 'react-hot-toast';

export const IntegrationsTab: React.FC = () => {
  const { accessToken, companyId, locationId, testConnection, syncSchedule, setAccessToken } = useScheduleStore();
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<boolean | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [tokenInput, setTokenInput] = useState(accessToken || '');
  const [isEditing, setIsEditing] = useState(!accessToken);

  const handleTest = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLastTestResult(null);
    
    try {
      const isConnected = await testConnection();
      setLastTestResult(isConnected);
      setIsEditing(false);

      if (isConnected) {
        await syncSchedule();
        toast.success('Successfully connected to 7shifts!');
      } else {
        toast.error('Failed to connect to 7shifts. Please check your credentials.');
      }
    } catch (error) {
      setLastTestResult(false);
      toast.error('Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToken = () => {
    if (!tokenInput.trim()) {
      toast.error('Access token cannot be empty');
      return;
    }
    setAccessToken(tokenInput.trim());
    handleTest();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setLastTestResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">7shifts Integration</h3>
        
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Connection Status</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {lastTestResult === true ? 'Connected to 7shifts' : 
                   lastTestResult === false ? 'Connection failed' : 
                   'Not tested'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                lastTestResult === true ? 'bg-green-500' : 
                lastTestResult === false ? 'bg-red-500' : 
                'bg-yellow-500'
              }`} />
            </div>
          </div>

          {/* Access Token Input */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Access Token
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showToken ? "text" : "password"}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  disabled={!isEditing}
                  className="input w-full bg-gray-700 pr-10"
                  placeholder="Enter your 7shifts access token"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="btn-secondary"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSaveToken}
                  disabled={isLoading || !tokenInput.trim()}
                  className="btn-primary"
                >
                  Save & Test
                </button>
              )}
            </div>
          </div>

          {/* Configuration Details */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Company ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={companyId}
                  readOnly
                  className="input flex-1 bg-gray-700"
                />
                {lastTestResult === true && <Check className="w-5 h-5 text-green-400" />}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Location ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={locationId}
                  readOnly
                  className="input flex-1 bg-gray-700"
                />
                {lastTestResult === true && <Check className="w-5 h-5 text-green-400" />}
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-yellow-500/10 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium">Integration Information</p>
                <p className="text-sm text-gray-300 mt-2">
                  This integration syncs your 7shifts schedule data. You'll need an access token from your 7shifts account settings. 
                  Once connected, the sync happens automatically every few minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Test Connection Button */}
          {!isEditing && (
            <div className="flex justify-end">
              <button
                onClick={handleTest}
                disabled={isLoading || !accessToken}
                className={`btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Test Connection
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTab;