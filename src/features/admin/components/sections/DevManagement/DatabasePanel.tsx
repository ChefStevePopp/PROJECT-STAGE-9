import React from 'react';
import { Database, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export const DatabasePanel: React.FC = () => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Export all tables data
      const tables = ['organizations', 'organization_roles', 'master_ingredients', 'inventory_counts'];
      const exportData: Record<string, any> = {};

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (error) throw error;
        exportData[table] = data;
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kitchen-ai-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Database exported successfully');
    } catch (error) {
      console.error('Error exporting database:', error);
      toast.error('Failed to export database');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This action cannot be undone.')) {
      return;
    }

    setIsResetting(true);
    try {
      // Delete all data from tables in reverse dependency order
      const tables = ['inventory_counts', 'master_ingredients', 'organization_roles', 'organizations'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Prevent deleting system records

        if (error) throw error;
      }

      toast.success('Database reset successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Failed to reset database');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Database className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">Database Management</h3>
          <p className="text-sm text-gray-400">Export and manage database data</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Export Database</h4>
            <p className="text-sm text-gray-400 mt-1">Download all database tables as JSON</p>
          </div>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="btn-ghost text-blue-400 hover:text-blue-300"
          >
            <Download className="w-5 h-5 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Reset Database</h4>
            <p className="text-sm text-gray-400 mt-1">Clear all data from the database</p>
          </div>
          <button
            onClick={handleResetDatabase}
            disabled={isResetting}
            className="btn-ghost text-red-400 hover:text-red-300"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Resetting...' : 'Reset'}
          </button>
        </div>

        <div className="bg-yellow-500/10 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium">Database Operations</p>
              <p className="text-sm text-gray-300 mt-1">
                These operations affect the entire database. Use with caution as some actions cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};