import React from "react";
import {
  FolderTree,
  Plus,
  GripVertical,
  Info,
  ChevronRight,
} from "lucide-react";
import { useFoodRelationshipsStore } from "@/stores/foodRelationshipsStore";
import toast from "react-hot-toast";

export const FoodRelationshipsManager = () => {
  const store = useFoodRelationshipsStore();
  const { fetchFoodRelationships, isLoading, addItem } = store;
  const majorGroups = store.majorGroups || [];
  const categories = store.categories || [];
  const subCategories = store.subCategories || [];

  const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null,
  );
  const [editingItem, setEditingItem] = React.useState<{
    id: string;
    type: "group" | "category" | "sub";
    description: string;
  } | null>(null);
  const [showAddModal, setShowAddModal] = React.useState<
    "group" | "category" | "sub" | null
  >(null);
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemDescription, setNewItemDescription] = React.useState("");
  const [infoExpanded, setInfoExpanded] = React.useState(false);

  React.useEffect(() => {
    fetchFoodRelationships();
  }, []); // Empty dependency array

  // Reset selections when changing levels
  React.useEffect(() => {
    if (!selectedGroup) setSelectedCategory(null);
  }, [selectedGroup]);

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      if (showAddModal === "group") {
        await addItem("group", {
          name: newItemName,
          description: newItemDescription,
          sort_order: majorGroups.length,
        });
      } else if (showAddModal === "category" && selectedGroup) {
        await addItem("category", {
          name: newItemName,
          description: newItemDescription,
          group_id: selectedGroup,
          sort_order: categories.filter((c) => c.group_id === selectedGroup)
            .length,
        });
      } else if (showAddModal === "sub" && selectedCategory) {
        await addItem("sub", {
          name: newItemName,
          description: newItemDescription,
          category_id: selectedCategory,
          sort_order: subCategories.filter(
            (s) => s.category_id === selectedCategory,
          ).length,
        });
      }

      setNewItemName("");
      setNewItemDescription("");
      setShowAddModal(null);
      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading food relationships...</div>
      </div>
    );
  }

  const showEmptyState = !majorGroups?.length || majorGroups.length === 0;

  // Filter categories based on selected group
  const filteredCategories = selectedGroup
    ? categories.filter((c) => c.group_id === selectedGroup)
    : [];

  // Filter sub-categories based on selected category
  const filteredSubCategories = selectedCategory
    ? subCategories.filter((s) => s.category_id === selectedCategory)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-4 rounded-lg bg-[#1a1f2b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <FolderTree className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Food Relationships
            </h2>
            <p className="text-gray-400">
              Manage food categories and relationships
            </p>
          </div>
        </div>
      </div>

      <div className="expandable-info-section">
        <button
          onClick={() => setInfoExpanded(!infoExpanded)}
          className="expandable-info-header"
        >
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex items-center justify-between">
            <p className="font-medium text-white-400">
              About Food Relationships
            </p>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${infoExpanded ? "rotate-90" : ""}`}
            />
          </div>
        </button>
        {infoExpanded && (
          <div className="expandable-info-content">
            <p className="mb-2 text-sm text-grey-300">
              Food relationships help organize your ingredients into a logical
              hierarchy:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
              <li>
                Major Groups - Top level categories (e.g., Proteins, Produce)
              </li>
              <li>
                Categories - Sub-divisions of groups (e.g., Beef, Poultry)
              </li>
              <li>
                Sub Categories - Specific types (e.g., Ground Beef, Chicken
                Breast)
              </li>
            </ul>
          </div>
        )}
      </div>

      {showEmptyState ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <FolderTree className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No Categories Set Up
          </h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Start by adding major groups, then create categories and
            sub-categories to organize your ingredients.
          </p>
          <button
            onClick={() => setShowAddModal("group")}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Major Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Major Groups */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Major Groups</h3>
              <button
                onClick={() => setShowAddModal("group")}
                className="btn-ghost btn-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {majorGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <button
                    onClick={() =>
                      setSelectedGroup(
                        selectedGroup === group.id ? null : group.id,
                      )
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedGroup === group.id
                        ? "bg-primary-500/20 text-primary-400"
                        : "bg-gray-800/50 hover:bg-gray-800 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                      <FolderTree className="w-4 h-4 text-primary-400" />
                      <span className="font-bold">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {
                          categories.filter((c) => c.group_id === group.id)
                            .length
                        }{" "}
                        categories
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          selectedGroup === group.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {group.description && (
                    <div className="px-9">
                      <p className="text-sm text-gray-400">
                        {group.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {majorGroups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No major groups added
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Categories</h3>
              <button
                onClick={() => setShowAddModal("category")}
                className="btn-ghost btn-sm"
                disabled={!selectedGroup}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {selectedGroup ? (
                filteredCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <button
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category.id ? null : category.id,
                        )
                      }
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-gray-800/50 hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                        <FolderTree className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {
                            subCategories.filter(
                              (s) => s.category_id === category.id,
                            ).length
                          }{" "}
                          sub-categories
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            selectedCategory === category.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>
                    {category.description && (
                      <div className="px-9">
                        <p className="text-sm text-gray-400">
                          {category.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {majorGroups.length === 0
                    ? "Add a major group first"
                    : "Select a major group"}
                </div>
              )}
            </div>
          </div>

          {/* Sub Categories */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Sub Categories</h3>
              <button
                onClick={() => setShowAddModal("sub")}
                className="btn-ghost btn-sm"
                disabled={!selectedCategory}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {selectedCategory ? (
                filteredSubCategories.map((subCategory) => (
                  <div key={subCategory.id} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                        <FolderTree className="w-4 h-4 text-amber-400" />
                        <span className="text-gray-300 font-bold">
                          {subCategory.name}
                        </span>
                      </div>
                    </div>
                    {subCategory.description && (
                      <div className="px-9">
                        <p className="text-sm text-gray-400">
                          {subCategory.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {categories.length === 0
                    ? "Add a category first"
                    : "Select a category"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">
                Add{" "}
                {showAddModal === "group"
                  ? "Major Group"
                  : showAddModal === "category"
                    ? "Category"
                    : "Sub Category"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="input w-full"
                  placeholder="Enter name..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="input w-full h-24"
                  placeholder="Enter description..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(null)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button onClick={handleAddItem} className="btn-primary">
                Add{" "}
                {showAddModal === "group"
                  ? "Group"
                  : showAddModal === "category"
                    ? "Category"
                    : "Sub Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
