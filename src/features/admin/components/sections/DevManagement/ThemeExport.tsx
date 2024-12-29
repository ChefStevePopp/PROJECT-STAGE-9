import React from 'react';
import { Download } from 'lucide-react';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { components } from '@/theme/components';
import { spacing } from '@/theme/index';
import toast from 'react-hot-toast';

export const ThemeExport: React.FC = () => {
  const handleExport = () => {
    try {
      const themeConfig = {
        colors,
        typography,
        components,
        spacing
      };

      // Create Blob with theme data
      const blob = new Blob(
        [JSON.stringify(themeConfig, null, 2)], 
        { type: 'application/json' }
      );
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kitchen-ai-theme-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Theme configuration exported successfully');
    } catch (error) {
      console.error('Error exporting theme:', error);
      toast.error('Failed to export theme configuration');
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Theme Configuration</h3>
          <p className="text-sm text-gray-400 mt-1">
            Export the current theme settings as a JSON file
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn-primary"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Theme
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Included Configuration</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Colors and color schemes</li>
            <li>• Typography settings (fonts, sizes, line heights)</li>
            <li>• Component styles and variants</li>
            <li>• Spacing and layout values</li>
          </ul>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Export Format</h4>
          <pre className="text-xs text-gray-400 font-mono bg-gray-900/50 p-3 rounded-lg overflow-x-auto">
{`{
  "colors": { ... },
  "typography": { ... },
  "components": { ... },
  "spacing": { ... }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};