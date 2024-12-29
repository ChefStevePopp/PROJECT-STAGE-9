import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddCategoryGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, icon: string, color: string) => void;
}

export const AddCategoryGroupModal: React.FC<AddCategoryGroupModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tags');
  const [color, setColor] = useState('primary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd(name.trim(), icon, color);
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">Add Category Group</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Enter group name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Icon
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="input w-full"
            >
              <option value="Tags">Tags</option>
              <option value="Box">Box</option>
              <option value="Package">Package</option>
              <option value="Truck">Truck</option>
              <option value="Store">Store</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Color Theme
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input w-full"
            >
              <option value="primary">Blue</option>
              <option value="green">Green</option>
              <option value="amber">Amber</option>
              <option value="rose">Rose</option>
              <option value="purple">Purple</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Add Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};