import React, { useState, useEffect } from "react";
import {
  Ruler,
  ChefHat,
  Tags,
  Building2,
  Plus,
  AlertTriangle,
  Archive,
  Scale,
  Store,
  FolderPlus,
  Printer,
  Settings,
  GripVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";
import { AddSubCategoryModal } from "./AddSubCategoryModal";
import { AddCategoryGroupModal } from "./AddCategoryGroupModal";
import { SettingsManager } from "./SettingsManager";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CategoryGroup } from "@/types/operations";

// Default category group definitions with icons and colors
const DEFAULT_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "measurements",
    name: "Measurements",
    icon: "Scale",
    color: "primary",
    description: "Configure measurement units for recipes and inventory",
    order: 0,
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
    icon: "Archive",
    color: "green",
    description: "Manage storage locations and container types",
    order: 1,
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
    icon: "ChefHat",
    color: "amber",
    description: "Define mise en place categories and kitchen stations",
    order: 2,
    categories: [
      { id: "mise_en_place_categories", label: "Mise en Place Categories" },
      { id: "kitchen_stations", label: "Kitchen Stations" },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: "Store",
    color: "rose",
    description: "Configure business-related settings",
    order: 3,
    categories: [
      { id: "revenue_channels", label: "Revenue Channels" },
      { id: "pos_major_groups", label: "POS Major Groups" },
      { id: "pos_family_groups", label: "POS Family Groups" },
      { id: "vendors", label: "Vendors" },
      { id: "departments", label: "Departments" },
    ],
  },
  {
    id: "labels",
    name: "Labels & Printing",
    icon: "Printer",
    color: "purple",
    description: "Configure label templates and printer settings",
    order: 4,
    categories: [
      { id: "label_templates", label: "Label Templates" },
      { id: "required_label_fields", label: "Required Fields" },
      { id: "printer_settings", label: "Printer Settings" },
    ],
  },
];

// Map of icon names to their components for rendering
const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Tags,
  Archive,
  Scale,
  Store,
  Printer,
  Building2,
  Settings,
};

// Sortable tab component
interface SortableTabProps {
  id: string;
  group: CategoryGroup;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditMode: boolean;
}

const SortableTab: React.FC<SortableTabProps> = ({
  id,
  group,
  isActive,
  onClick,
  onEdit,
  onDelete,
  isEditMode,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const IconComponent = ICON_MAP[group.icon] || Tags;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center ${isDragging ? "opacity-50" : ""}`}
    >
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-gray-500 hover:text-gray-300"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <button
        onClick={onClick}
        className={`tab ${group.color} ${isActive ? "active" : ""}`}
      >
        <IconComponent
          className={`w-5 h-5 ${
            isActive ? `text-${group.color}-400` : "text-current"
          }`}
        />
        <span>{group.name}</span>
      </button>
      {isEditMode && (
        <div className="flex">
          <button
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-gray-300"
            title="Edit tab"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-rose-400"
            title="Delete tab"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export const OperationsManager: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<string>("measurements");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [isAddingCategoryGroup, setIsAddingCategoryGroup] = useState(false);
  const [isEditingCategoryGroup, setIsEditingCategoryGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CategoryGroup | null>(null);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [isEditingTabs, setIsEditingTabs] = useState(false);

  const { settings, isLoading, updateSettings, fetchSettings } =
    useOperationsStore();

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Initialize category groups from settings or defaults
  useEffect(() => {
    if (settings) {
      try {
        // First check if category_groups property exists at all in the settings object
        if (
          "category_groups" in settings &&
          settings.category_groups &&
          Array.isArray(settings.category_groups) &&
          settings.category_groups.length > 0
        ) {
          // Sort by order field
          const sortedGroups = [...settings.category_groups].sort(
            (a, b) => a.order - b.order,
          );
          setCategoryGroups(sortedGroups);

          // Ensure the departments category exists in the business group
          const businessGroup = sortedGroups.find(
            (group) => group.id === "business",
          );
          if (
            businessGroup &&
            !businessGroup.categories.some((cat) => cat.id === "departments")
          ) {
            // Add departments category if it doesn't exist
            businessGroup.categories.push({
              id: "departments",
              label: "Departments",
            });
            // Save the updated groups
            updateSettings({
              ...settings,
              category_groups: sortedGroups,
              departments: settings.departments || [], // Initialize departments array if it doesn't exist
            });
          }
        } else {
          // Initialize with defaults if no saved groups or if property doesn't exist
          setCategoryGroups(DEFAULT_CATEGORY_GROUPS);
          // Save defaults to database
          updateSettings({
            ...settings,
            category_groups: DEFAULT_CATEGORY_GROUPS,
            departments: settings.departments || [], // Initialize departments array if it doesn't exist
          });
          console.log("Initialized with default category groups");
        }
      } catch (error) {
        console.error("Error initializing category groups:", error);
        // Fallback to defaults if there's an error
        setCategoryGroups(DEFAULT_CATEGORY_GROUPS);
        // Try to save defaults to database
        try {
          updateSettings({
            ...settings,
            category_groups: DEFAULT_CATEGORY_GROUPS,
            departments: settings.departments || [], // Initialize departments array if it doesn't exist
          });
        } catch (saveError) {
          console.error("Error saving default category groups:", saveError);
        }
      }
    }
  }, [settings, updateSettings]);

  useEffect(() => {
    if (
      (!activeCategory || activeCategory === null) &&
      settings &&
      categoryGroups.length > 0
    ) {
      const currentGroup = categoryGroups.find((g) => g.id === activeGroup);
      // Add additional null check for categories array
      const firstCategory =
        currentGroup?.categories && currentGroup.categories.length > 0
          ? currentGroup.categories[0]?.id
          : null;
      setActiveCategory(firstCategory || null);
    }
  }, [settings, activeCategory, activeGroup, categoryGroups]);

  const handleAddItem = async (name: string) => {
    if (!activeCategory || !settings) return;

    try {
      // Get a direct reference to the current items array
      const currentItems = [
        ...(settings[activeCategory as keyof typeof settings] || []),
      ];

      // Add the new item to the array
      currentItems.push(name);

      // Create a new settings object with the updated array
      const updatedSettings = {
        ...settings,
        [activeCategory]: currentItems,
      };

      console.log("Updating settings with:", JSON.stringify(updatedSettings));

      // Update the database and wait for it to complete
      const result = await updateSettings(updatedSettings);
      console.log("Update completed, result:", result);

      // Wait a bit before refreshing to ensure DB transaction is complete
      setTimeout(() => {
        fetchSettings().then(() => {
          console.log("Settings refreshed after update");
        });
      }, 1000);

      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error in handleAddItem:", error);
      toast.error("Failed to add item");
    }
  };

  // Handle drag end for reordering tabs
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categoryGroups.findIndex(
        (group) => group.id === active.id,
      );
      const newIndex = categoryGroups.findIndex(
        (group) => group.id === over.id,
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create a new array with the updated order
        const updatedGroups = [...categoryGroups];
        const [movedItem] = updatedGroups.splice(oldIndex, 1);
        updatedGroups.splice(newIndex, 0, movedItem);

        // Update the order property for each group
        const reorderedGroups = updatedGroups.map((group, index) => ({
          ...group,
          order: index,
        }));

        setCategoryGroups(reorderedGroups);

        // Save the updated order to the database
        if (settings) {
          try {
            // Create a new settings object with the updated category_groups
            const updatedSettings = {
              ...settings,
              category_groups: reorderedGroups,
            };

            await updateSettings(updatedSettings);
            toast.success("Tab order updated");
          } catch (error) {
            console.error("Error updating tab order:", error);
            toast.error("Failed to update tab order");
          }
        }
      }
    }
  };

  // Add a new category group
  const handleAddCategoryGroup = async (
    name: string,
    icon: string,
    color: string,
    description: string,
  ) => {
    try {
      if (!settings) return;

      // Create a new category group ID (lowercase, replace spaces with underscores)
      const newGroupId = name.toLowerCase().replace(/\s+/g, "_");

      // Create a new category ID for the first category in this group
      const newCategoryId = `${newGroupId}_default`;

      // Create the new group object
      const newGroup: CategoryGroup = {
        id: newGroupId,
        name: name,
        icon: icon,
        color: color,
        description: description,
        order: categoryGroups.length, // Add at the end
        categories: [{ id: newCategoryId, label: `${name} Default` }],
      };

      // Ensure category_groups exists in settings
      const existingGroups = Array.isArray(settings.category_groups)
        ? settings.category_groups
        : [];

      // Update the settings to include the new category and group
      const updatedGroups = [...existingGroups, newGroup];
      const updatedSettings = {
        ...settings,
        category_groups: updatedGroups,
        [newCategoryId]: [], // Initialize the category with an empty array
      };

      // Update the database
      await updateSettings(updatedSettings);
      setCategoryGroups(updatedGroups);

      // Set the active group and category to the newly created ones
      setActiveGroup(newGroupId);
      setActiveCategory(newCategoryId);

      toast.success("New tab added successfully");
    } catch (error) {
      console.error("Error in handleAddCategoryGroup:", error);
      toast.error("Failed to add new tab");
    }
  };

  // Edit an existing category group
  const handleEditCategoryGroup = async (
    id: string,
    name: string,
    icon: string,
    color: string,
    description: string,
  ) => {
    try {
      if (!settings) return;

      // Find and update the group
      const updatedGroups = categoryGroups.map((group) => {
        if (group.id === id) {
          return {
            ...group,
            name,
            icon,
            color,
            description,
          };
        }
        return group;
      });

      // Update settings with safety check for category_groups
      const updatedSettings = {
        ...settings,
        category_groups: updatedGroups,
      };

      // Save to database
      await updateSettings(updatedSettings);
      setCategoryGroups(updatedGroups);

      toast.success("Tab updated successfully");
    } catch (error) {
      console.error("Error updating tab:", error);
      toast.error("Failed to update tab");
    }
  };

  // Delete a category group
  const handleDeleteCategoryGroup = async (groupId: string) => {
    try {
      if (!settings || categoryGroups.length <= 1) {
        toast.error("Cannot delete the last tab");
        return;
      }

      // Confirm deletion
      if (
        !window.confirm(
          "Are you sure you want to delete this tab? All associated categories and settings will be lost.",
        )
      ) {
        return;
      }

      // Find the group to delete
      const groupToDelete = categoryGroups.find((g) => g.id === groupId);
      if (!groupToDelete) return;

      // Remove the group and reorder remaining groups
      const updatedGroups = categoryGroups
        .filter((g) => g.id !== groupId)
        .map((group, index) => ({
          ...group,
          order: index,
        }));

      // Create a new settings object without the deleted categories
      const updatedSettings = { ...settings };

      // Ensure category_groups exists before updating it
      if (updatedSettings.category_groups !== undefined) {
        updatedSettings.category_groups = updatedGroups;
      } else {
        // If category_groups doesn't exist, create it
        updatedSettings.category_groups = updatedGroups;
      }

      // Remove all category data for this group
      if (groupToDelete && groupToDelete.categories) {
        groupToDelete.categories.forEach((category) => {
          if (category && category.id) {
            delete updatedSettings[category.id];
          }
        });
      }

      // Update database
      await updateSettings(updatedSettings);
      setCategoryGroups(updatedGroups);

      // If the active group was deleted, set a new active group
      if (activeGroup === groupId) {
        const newActiveGroup = updatedGroups[0]?.id;
        setActiveGroup(newActiveGroup);
        setActiveCategory(updatedGroups[0]?.categories[0]?.id || null);
      }

      toast.success("Tab deleted successfully");
    } catch (error) {
      console.error("Error deleting tab:", error);
      toast.error("Failed to delete tab");
    }
  };

  // Open edit modal for a category group
  const openEditModal = (group: CategoryGroup) => {
    setEditingGroup(group);
    setIsEditingCategoryGroup(true);
  };

  const currentGroup = categoryGroups.find((g) => g.id === activeGroup);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center rounded-lg bg-[#1a1f2b] py-[4] py-[6] p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Operations Manager
            </h1>
            <p className="text-gray-400">
              Configure system-wide lookup values and master lists
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditingTabs(!isEditingTabs)}
            className="btn-ghost-blue"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditingTabs ? "Done Editing" : "Edit Tabs"}
          </button>
        </div>
      </div>
      {/* Category Group Tabs with drag-and-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-2 items-center">
          <SortableContext
            items={categoryGroups.map((group) => group.id)}
            strategy={verticalListSortingStrategy}
          >
            {categoryGroups.map((group) => (
              <SortableTab
                key={group.id}
                id={group.id}
                group={group}
                isActive={activeGroup === group.id}
                onClick={() => {
                  setActiveGroup(group.id);
                  setActiveCategory(group.categories[0].id);
                }}
                onEdit={() => openEditModal(group)}
                onDelete={() => handleDeleteCategoryGroup(group.id)}
                isEditMode={isEditingTabs}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="col-span-3">
          <div className="card p-6 rounded-xl p-4 bg-[#262d3c]">
            <h3 className="card p-4 text-xl text-center font-bold mb-4 text-white">
              {currentGroup?.name || "Category Groups"}{" "}
              <span className="text-med text-gray-400">Categories</span>
            </h3>

            <div className="space-y-2">
              {currentGroup?.categories
                .slice()
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`p-3 rounded-lg transition-colors w-full text-left ${
                      activeCategory === category.id
                        ? `bg-${currentGroup.color}-500/30 text-white`
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
            </div>
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
                ?.label || "Variable"
            : "Variable"
        }
        onAdd={handleAddItem}
      />
      {/* Add Category Group Modal */}
      <AddCategoryGroupModal
        isOpen={isAddingCategoryGroup}
        onClose={() => setIsAddingCategoryGroup(false)}
        onAdd={handleAddCategoryGroup}
      />

      {/* Edit Category Group Modal */}
      {editingGroup && (
        <AddCategoryGroupModal
          isOpen={isEditingCategoryGroup}
          onClose={() => {
            setIsEditingCategoryGroup(false);
            setEditingGroup(null);
          }}
          onAdd={(name, icon, color, description) => {
            handleEditCategoryGroup(
              editingGroup.id,
              name,
              icon,
              color,
              description,
            );
            setIsEditingCategoryGroup(false);
            setEditingGroup(null);
          }}
          initialValues={editingGroup}
        />
      )}
    </div>
  );
};
