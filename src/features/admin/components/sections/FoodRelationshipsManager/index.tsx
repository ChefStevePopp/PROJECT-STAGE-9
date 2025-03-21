import React, { useRef, useEffect } from "react";
import {
  FolderTree,
  Plus,
  GripVertical,
  Info,
  ChevronRight,
  Edit,
  Archive,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFoodRelationshipsStore } from "@/stores/foodRelationshipsStore";
import toast from "react-hot-toast";

export const FoodRelationshipsManager = () => {
  const store = useFoodRelationshipsStore();
  const {
    fetchFoodRelationships,
    isLoading,
    addItem,
    updateItem,
    toggleArchiveItem,
  } = store;
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
    name?: string;
    archived?: boolean;
  } | null>(null);
  const [showAddModal, setShowAddModal] = React.useState<
    "group" | "category" | "sub" | null
  >(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = React.useState(false);
  const [showArchivedItems, setShowArchivedItems] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemDescription, setNewItemDescription] = React.useState("");
  const [infoExpanded, setInfoExpanded] = React.useState(false);
  const [descriptionOverflows, setDescriptionOverflows] = React.useState<{
    [key: string]: boolean;
  }>({});

  React.useEffect(() => {
    fetchFoodRelationships();
  }, []); // Empty dependency array

  // Reset selections when changing levels
  React.useEffect(() => {
    if (!selectedGroup) setSelectedCategory(null);
  }, [selectedGroup]);

  // Check if descriptions overflow their containers
  const checkDescriptionOverflow = () => {
    const newOverflows = { ...descriptionOverflows };

    // Check major groups
    majorGroups.forEach((group) => {
      if (group.description) {
        newOverflows[`group-${group.id}`] = group.description.length > 100;
      }
    });

    // Check categories
    categories.forEach((category) => {
      if (category.description) {
        newOverflows[`category-${category.id}`] =
          category.description.length > 100;
      }
    });

    // Check sub-categories
    subCategories.forEach((subCategory) => {
      if (subCategory.description) {
        newOverflows[`sub-${subCategory.id}`] =
          subCategory.description.length > 100;
      }
    });

    setDescriptionOverflows(newOverflows);
  };

  // Run overflow check when data changes
  React.useEffect(() => {
    checkDescriptionOverflow();
  }, [majorGroups, categories, subCategories]);

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

  // Filter major groups based on archive status
  const filteredMajorGroups = majorGroups.filter((g) =>
    showArchivedItems ? true : !g.archived,
  );

  // Filter categories based on selected group and archive status
  const filteredCategories = selectedGroup
    ? categories.filter(
        (c) =>
          c.group_id === selectedGroup &&
          (showArchivedItems ? true : !c.archived),
      )
    : [];

  // Filter sub-categories based on selected category and archive status
  const filteredSubCategories = selectedCategory
    ? subCategories.filter(
        (s) =>
          s.category_id === selectedCategory &&
          (showArchivedItems ? true : !s.archived),
      )
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
        <button
          onClick={() => setShowArchivedItems(!showArchivedItems)}
          className="btn-ghost btn-sm flex items-center gap-2"
        >
          {showArchivedItems ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Hide Archived</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Show Archived</span>
            </>
          )}
        </button>
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
            <p className="mb-2 text-sm text-grey-500">
              Food relationships help organize your ingredients into a logical
              hierarchy:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
              <li>
                Major Groups - Top level categories (e.g.,{" "}
                <span className="text-primary-400">
                  Food, Alcohol, Final Plates,{" "}
                </span>
                etc.)
              </li>
              <li>
                Categories - Broad Categories within Major Groups (e.g.,{" "}
                <span className="text-green-400">
                  Proteins, Produce, Wines, Presented Plates, Catering,{" "}
                </span>
                etc.)
              </li>
              <li>
                Sub Categories - Specific types of Ingredients, Plates or
                Revenue Items (e.g.,{" "}
                <span className="text-amber-400">
                  Pork, Beef, Wine, Spirits, Appetizers, Merchandise,{" "}
                </span>
                etc.)
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
              {filteredMajorGroups.map((group) => (
                <div key={group.id} className="space-y-1 card p-1">
                  <button
                    onClick={() =>
                      setSelectedGroup(
                        selectedGroup === group.id ? null : group.id,
                      )
                    }
                    className={
                      `w-full flex items-center justify-between rounded-lg transition-colors ${selectedGroup === group.id ? "bg-primary-500/20 text-primary-400" : group.archived ? "bg-gray-800/30 text-gray-500" : "bg-gray-800/50 hover:bg-gray-800 text-gray-300"}` +
                      " py-2"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                      <FolderTree className="w-4 h-4 text-primary-400" />
                      <span
                        className={`font-bold ${group.archived ? "line-through opacity-70" : ""}`}
                      >
                        {group.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({
                            id: group.id,
                            type: "group",
                            description: group.description || "",
                            name: group.name,
                            archived: group.archived,
                          });
                          setShowEditModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({
                            id: group.id,
                            type: "group",
                            description: group.description || "",
                            name: group.name,
                            archived: group.archived,
                          });
                          setShowArchiveConfirm(true);
                        }}
                        className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
                        title={group.archived ? "Restore" : "Archive"}
                      >
                        {group.archived ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                      </button>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          selectedGroup === group.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {selectedGroup === group.id && (
                    <div className="px-9 mt-0.5 overflow-hidden transition-all max-h-20">
                      <span className="text-xs text-primary-400">
                        {
                          categories.filter(
                            (c) => c.group_id === group.id && !c.archived,
                          ).length
                        }{" "}
                      </span>
                      <span className="text-xs text-gray-400">
                        {" "}
                        Categories Active
                      </span>
                      {group.description && (
                        <div className="relative">
                          <p className="text-xs text-gray-300 mb-2 line-clamp-3">
                            {group.description}
                          </p>
                          {group.description &&
                            descriptionOverflows[`group-${group.id}`] && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                                    Show more
                                  </button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{group.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="mt-4 text-gray-300 whitespace-pre-wrap">
                                    {group.description}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                        </div>
                      )}
                      {group.archived && (
                        <p className="text-xs text-amber-400 italic">
                          This item is archived
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {filteredMajorGroups.length === 0 && (
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
                  <div key={category.id} className="space-y-2 card p-1">
                    <button
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category.id ? null : category.id,
                        )
                      }
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-emerald-500/20 text-emerald-400"
                          : category.archived
                            ? "bg-gray-800/30 text-gray-500"
                            : "bg-gray-800/50 hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                        <FolderTree className="w-4 h-4 text-emerald-400" />
                        <span
                          className={`font-bold ${category.archived ? "line-through opacity-70" : ""}`}
                        >
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({
                              id: category.id,
                              type: "category",
                              description: category.description || "",
                              name: category.name,
                              archived: category.archived,
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({
                              id: category.id,
                              type: "category",
                              description: category.description || "",
                              name: category.name,
                              archived: category.archived,
                            });
                            setShowArchiveConfirm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
                          title={category.archived ? "Restore" : "Archive"}
                        >
                          {category.archived ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </button>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            selectedCategory === category.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>
                    {selectedCategory === category.id && (
                      <div className="px-9 overflow-hidden transition-all max-h-20">
                        <span className="text-xs text-green-500">
                          {
                            subCategories.filter(
                              (s) =>
                                s.category_id === category.id && !s.archived,
                            ).length
                          }{" "}
                        </span>
                        <span className="text-xs text-gray-400">
                          {" "}
                          Sub-Categories Active
                        </span>
                        {category.description && (
                          <div className="relative">
                            <p className="text-xs text-gray-300 mb-2 line-clamp-3">
                              {category.description}
                            </p>
                            {category.description &&
                              descriptionOverflows[
                                `category-${category.id}`
                              ] && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                      Show more
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>{category.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-4 text-gray-300 whitespace-pre-wrap">
                                      {category.description}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                          </div>
                        )}
                        {category.archived && (
                          <p className="text-xs text-amber-400 italic">
                            This item is archived
                          </p>
                        )}
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
                  <div key={subCategory.id} className="space-y-2 card p-1">
                    <button
                      onClick={() => {
                        // Toggle description visibility by using a local state
                        setEditingItem((prev) =>
                          prev?.id === subCategory.id && prev?.type === "sub"
                            ? null
                            : {
                                id: subCategory.id,
                                type: "sub",
                                description: subCategory.description || "",
                                name: subCategory.name,
                                archived: subCategory.archived,
                              },
                        );
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${subCategory.archived ? "bg-gray-800/30 text-gray-500" : "bg-gray-800/50 hover:bg-gray-800 text-gray-300"}`}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                        <FolderTree className="w-4 h-4 text-amber-400" />
                        <span
                          className={`font-bold ${subCategory.archived ? "line-through opacity-70" : ""}`}
                        >
                          {subCategory.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({
                              id: subCategory.id,
                              type: "sub",
                              description: subCategory.description || "",
                              name: subCategory.name,
                              archived: subCategory.archived,
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({
                              id: subCategory.id,
                              type: "sub",
                              description: subCategory.description || "",
                              name: subCategory.name,
                              archived: subCategory.archived,
                            });
                            setShowArchiveConfirm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-amber-400 transition-colors"
                          title={subCategory.archived ? "Restore" : "Archive"}
                        >
                          {subCategory.archived ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </button>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            editingItem?.id === subCategory.id &&
                            editingItem?.type === "sub"
                              ? "rotate-90"
                              : ""
                          }`}
                        />
                      </div>
                    </button>
                    {editingItem?.id === subCategory.id &&
                      editingItem?.type === "sub" && (
                        <div className="px-9 overflow-hidden transition-all max-h-20">
                          {subCategory.description && (
                            <div className="relative">
                              <p className="text-xs text-gray-300 mb-2 line-clamp-3">
                                {subCategory.description}
                              </p>
                              {subCategory.description &&
                                descriptionOverflows[
                                  `sub-${subCategory.id}`
                                ] && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                                        Show more
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          {subCategory.name}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="mt-4 text-gray-300 whitespace-pre-wrap">
                                        {subCategory.description}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                            </div>
                          )}
                          {subCategory.archived && (
                            <p className="text-xs text-amber-400 italic">
                              This item is archived
                            </p>
                          )}
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
      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">
                Edit{" "}
                {editingItem.type === "group"
                  ? "Major Group"
                  : editingItem.type === "category"
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
                  value={editingItem.name || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="input w-full"
                  placeholder="Enter name..."
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  className="input w-full h-24"
                  placeholder="Enter description..."
                  autoFocus
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await updateItem(editingItem.type, editingItem.id, {
                      description: editingItem.description,
                    });
                    setShowEditModal(false);
                    setEditingItem(null);
                    toast.success("Item updated successfully");
                  } catch (error) {
                    console.error("Error updating item:", error);
                    toast.error("Failed to update item");
                  }
                }}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">
                {editingItem.archived ? "Restore" : "Archive"} Confirmation
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300">
                Are you sure you want to{" "}
                {editingItem.archived ? "restore" : "archive"} this{" "}
                {editingItem.type === "group"
                  ? "major group"
                  : editingItem.type === "category"
                    ? "category"
                    : "sub-category"}
                ?
                {!editingItem.archived && editingItem.type === "group" && (
                  <span className="block mt-2 text-amber-400 font-medium">
                    Note: This will hide all categories and sub-categories
                    within this group from view until restored.
                  </span>
                )}
                {!editingItem.archived && editingItem.type === "category" && (
                  <span className="block mt-2 text-amber-400 font-medium">
                    Note: This will hide all sub-categories within this category
                    from view until restored.
                  </span>
                )}
              </p>
            </div>
            <div className="p-6 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowArchiveConfirm(false);
                  setEditingItem(null);
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Toggle the archived status
                    const currentStatus = editingItem.archived || false;
                    await toggleArchiveItem(
                      editingItem.type,
                      editingItem.id,
                      !currentStatus,
                    );
                    setShowArchiveConfirm(false);
                    setEditingItem(null);

                    // Reset selections if needed when archiving
                    if (!currentStatus) {
                      // If we're archiving (not restoring)
                      if (
                        editingItem.type === "group" &&
                        selectedGroup === editingItem.id
                      ) {
                        setSelectedGroup(null);
                      } else if (
                        editingItem.type === "category" &&
                        selectedCategory === editingItem.id
                      ) {
                        setSelectedCategory(null);
                      }
                    }

                    toast.success(
                      `Item ${currentStatus ? "restored" : "archived"} successfully`,
                    );
                  } catch (error) {
                    console.error(
                      `Error ${editingItem.archived ? "restoring" : "archiving"} item:`,
                      error,
                    );
                    toast.error(
                      `Failed to ${editingItem.archived ? "restore" : "archive"} item`,
                    );
                  }
                }}
                className={`btn-primary ${editingItem.archived ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"}`}
              >
                {editingItem.archived ? "Restore" : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
