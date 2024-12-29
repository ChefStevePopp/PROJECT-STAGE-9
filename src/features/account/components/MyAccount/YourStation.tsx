import React from 'react';
import { Clock, Calendar, ChefHat } from 'lucide-react';

export const YourStation: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Work Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-white font-medium">Show on Schedule</p>
                <p className="text-sm text-gray-400">Appear as available for scheduling</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Shift Reminders</p>
                <p className="text-sm text-gray-400">Get notified before your shifts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-white font-medium">Recipe Notifications</p>
                <p className="text-sm text-gray-400">Get updates about recipe changes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Station Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Primary Station
            </label>
            <select className="input w-full">
              <option>Grill</option>
              <option>Sauté</option>
              <option>Prep</option>
              <option>Pantry</option>
              <option>Pizza</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Secondary Station
            </label>
            <select className="input w-full">
              <option>None</option>
              <option>Grill</option>
              <option>Sauté</option>
              <option>Prep</option>
              <option>Pantry</option>
              <option>Pizza</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};