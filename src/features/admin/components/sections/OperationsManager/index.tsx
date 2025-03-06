import React, { useState, useEffect } from "react";
import {
  Ruler,
  Tags,
  Building2,
  Plus,
  AlertTriangle,
  Archive,
  Scale,
  Store,
  FolderPlus,
  Printer,
} from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";
import { AddSubCategoryModal } from "./AddSubCategoryModal";
import { SettingsManager } from "./SettingsManager";
import toast from "react-hot-toast";

// Category group definitions with icons and colors
const CATEGORY_GROUPS = [
  {
    id: "measurements",
    name: "Measurements",
    icon: Scale,
    color: "primary",
    description: "Configure measurement units for recipes and inventory",
    categories: [
      { id: "alcohol_measures", label: "Alcohol Measures" },
      { id: "volume_measures", label: "Volume Measures" },
      { id: "weight_measures", label: "Weight Measures" },
      { id: "dry_goods_measures", label: "Dry Goods Measures" },
      { id: "recipe_unit_measures", label: "Recipe Unit Measures" },
      { id: "protein_measures", label: "Protein Measures" },
      { id: "batch_units", label: "Batch Units" },
    ],
  },
  {
    id: "storage",
    name: "Storage and Location",
    icon: Archive,
    color: "green",
    description: "Manage storage locations and container types",
    categories: [
      { id: "storage_areas", label: "Storage Areas" },
      { id: "storage_containers", label: "Storage Containers" },
      { id: "container_types", label: "Container Types" },
      { id: "shelf_life_options", label: "Shelf Life Options" },
    ],
  },
  {
    id: "categories",
    name: "Categories",
    icon: Tags,
    color: "amber",
    description: "Define mise en place categories and kitchen stations",
    categories: [
      { id: "mise_en_place_categories", label: "Mise en Place Categories" },
      { id: "kitchen_stations", label: "Kitchen Stations" },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: Store,
    color: "rose",
    description: "Configure business-related settings",
    categories: [
      { id: "revenue_channels", label: "Revenue Channels" },
      { id: "pos_major_groups", label: "POS Major Groups" },
      { id: "pos_family_groups", label: "POS Family Groups" },
      { id: "vendors", label: "Vendors" },
    ],
  },
  {
    id: "labels",
    name: "Labels & Printing",
    icon: Printer,
    color: "purple",
    description: "Configure label templates and printer settings",
    categories: [
      { id: "label_templates", label: "Label Templates" },
      { id: "required_label_fields", label: "Required Fields" },
      { id: "printer_settings", label: "Printer Settings" },
    ],
  },
] as const;

export const OperationsManager: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<string>("measurements");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);

  const { settings, isLoading, updateSettings, fetchSettings } =
    useOperationsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!activeCategory && settings) {
      const firstCategory = CATEGORY_GROUPS.find((g) => g.id === activeGroup)
        ?.categories[0].id;
      setActiveCategory(firstCategory || null);
    }
  }, [settings, activeCategory, activeGroup]);

  const handleAddItem = async (name: string) => {
    if (!activeCategory || !settings) return;

    // Handle regular categories
    const currentItems =
      settings[activeCategory as keyof typeof settings] || [];
    const updatedSettings = {
      ...settings,
      [activeCategory]: [...currentItems, name],
    };

    await updateSettings(updatedSettings);
    toast.success("Item added successfully");
  };

  const currentGroup = CATEGORY_GROUPS.find((g) => g.id === activeGroup);

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/OperationsManager/index.tsx
      </div>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Operations Manager
          </h1>
          <p className="text-gray-400">
            Configure system-wide lookup values and master lists
          </p>
        </div>
      </header>

      {/* Category Group Tabs */}
      <div className="flex gap-2">
        {CATEGORY_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <button
              key={group.id}
              onClick={() => {
                setActiveGroup(group.id);
                setActiveCategory(group.categories[0].id);
              }}
              className={`tab ${group.color} ${activeGroup === group.id ? "active" : ""}`}
            >
              <Icon
                className={`w-5 h-5 ${
                  activeGroup === group.id
                    ? `text-${group.color}-400`
                    : "text-current"
                }`}
              />
              {group.name}
            </button>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="col-span-3">
          <div className="card p-6 bg-gray-800 rounded-xl p-4">
            <h3 className="text-xl font-bold text-white mb-4">Categories</h3>

            <div className="space-y-2">
              {currentGroup?.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`p-3 rounded-lg transition-colors w-full text-left ${
                    activeCategory === category.id
                      ? "bg-primary-500/20 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Add Category Button */}
            <button
              onClick={() => setIsAddingSubCategory(true)}
              className="w-full mt-4 btn-ghost text-gray-300 hover:text-white py-2 px-4 rounded-lg"
            >
              <FolderPlus className="w-4 h-4 inline-block mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-9 card p-4">
          <div className="bg-gray-800 rounded-xl p-6">
            <SettingsManager
              group={currentGroup!}
              activeCategory={activeCategory}
              settings={settings}
              onAddItem={handleAddItem}
            />
          </div>
        </div>
      </div>

      {/* Add Sub-Category Modal */}
      <AddSubCategoryModal
        isOpen={isAddingSubCategory}
        onClose={() => setIsAddingSubCategory(false)}
        groupName={
          activeCategory
            ? currentGroup?.categories.find((c) => c.id === activeCategory)
                ?.label || "Item"
            : "Item"
        }
        onAdd={handleAddItem}
      />
    </div>
  );
};
