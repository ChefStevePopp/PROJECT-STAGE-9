import React, { useState } from "react";
import {
  Save,
  Tags,
  Box,
  Package,
  Truck,
  Store,
  Archive,
  Scale,
  Printer,
  Settings,
  Building2,
  ShoppingCart,
  Utensils,
  Coffee,
  ChefHat,
  Refrigerator,
} from "lucide-react";
import toast from "react-hot-toast";

interface AddCategoryGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    icon: string,
    color: string,
    description: string,
  ) => void;
  initialValues?: {
    name: string;
    icon: string;
    color: string;
    description: string;
  };
}

// Map of icon names to their components for rendering preview
const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Tags,
  Box,
  Package,
  Truck,
  Store,
  Archive,
  Scale,
  Printer,
  Settings,
  Building2,
  ShoppingCart,
  Utensils,
  Coffee,
  ChefHat,
  Refrigerator,
};

// Color options with preview
const COLOR_OPTIONS = [
  { value: "primary", label: "Blue", class: "bg-primary-400" },
  { value: "green", label: "Green", class: "bg-green-400" },
  { value: "amber", label: "Amber", class: "bg-amber-400" },
  { value: "rose", label: "Rose", class: "bg-rose-400" },
  { value: "purple", label: "Purple", class: "bg-purple-400" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-400" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-400" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-400" },
  { value: "orange", label: "Orange", class: "bg-orange-400" },
  { value: "teal", label: "Teal", class: "bg-teal-400" },
];

export const AddCategoryGroupModal: React.FC<AddCategoryGroupModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  initialValues,
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [icon, setIcon] = useState(initialValues?.icon || "Tags");
  const [color, setColor] = useState(initialValues?.color || "primary");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd(
      name.trim(),
      icon,
      color,
      description.trim() || `${name.trim()} settings`,
    );
    setName("");
    setDescription("");
    onClose();
  };

  if (!isOpen) return null;

  const IconComponent = ICON_MAP[icon];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">
          {initialValues ? "Edit Tab" : "Add New Tab"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tab Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Enter tab name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full"
              placeholder="Enter tab description (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {Object.keys(ICON_MAP).map((iconName) => {
                const IconComp = ICON_MAP[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-lg flex items-center justify-center ${icon === iconName ? "bg-gray-700 ring-2 ring-white/30" : "bg-gray-800 hover:bg-gray-700"}`}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Color Theme
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`h-8 rounded-lg ${colorOption.class} ${color === colorOption.value ? "ring-2 ring-white" : ""}`}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Preview:</p>
            <div className="flex items-center gap-2">
              <button className={`tab ${color} active`}>
                {IconComponent && (
                  <IconComponent className={`w-5 h-5 text-${color}-400`} />
                )}
                {name || "New Tab"}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              {initialValues ? "Save Changes" : "Add Tab"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
