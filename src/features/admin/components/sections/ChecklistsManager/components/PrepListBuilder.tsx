import React, { useState, useEffect } from "react";
import {
  Plus,
  ListChecks,
  Edit,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  Folder,
  FolderOpen,
  HelpCircle,
  FileEdit,
  FilePlus,
  FileX,
  ChevronRight,
  ChefHat,
  CookingPot,
  Sunrise,
  Sunset,
} from "lucide-react";
import { usePrepListTemplateStore } from "../../../../../../stores/prepListTemplateStore";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-hot-toast";

interface PrepListItemProps {
  id: string;
  title: string;
  description?: string;
  templateId: string;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

const SortableItem = ({
  id,
  title,
  description,
  templateId,
  onEdit,
  onRemove,
}: PrepListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const { templates } = usePrepListTemplateStore();

  // Find the template to get its prep system
  const template = templates.find((t) => t.id === id);
  const prepSystem = template?.prep_system || template?.prepSystem || "";

  const getPrepSystemBadgeClass = (prepSystem: string) => {
    switch (prepSystem?.toLowerCase()) {
      case "as-needed":
      case "as_needed":
        return "bg-amber-500/20 text-amber-400";
      case "scheduled":
      case "scheduled_production":
      case "sched":
        return "bg-green-500/20 text-green-400";
      case "par":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-700 text-gray-400";
    }
  };

  const getPrepSystemInitial = (prepSystem: string) => {
    switch (prepSystem?.toLowerCase()) {
      case "as-needed":
      case "as_needed":
        return "A";
      case "scheduled":
      case "scheduled_production":
      case "sched":
        return "S";
      case "par":
        return "P";
      default:
        return "?";
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 border border-gray-700 rounded-lg mb-2 overflow-hidden"
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div
            {...attributes}
            {...listeners}
            className="mr-2 p-1 cursor-grab hover:bg-gray-700 rounded"
          >
            <GripVertical className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg text-white font-medium">{title}</h3>
              {prepSystem && (
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${getPrepSystemBadgeClass(prepSystem)}`}
                >
                  <span className="text-xs font-bold">
                    {getPrepSystemInitial(prepSystem)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(id)}
            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRemove(id)}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-3 pt-0 border-t border-gray-700 bg-gray-800/50">
          {description && (
            <p className="text-gray-400 text-sm mt-2">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

interface SavedPrepList {
  id: string;
  title: string;
  description?: string;
  templates: string[];
  createdAt: string;
  updatedAt: string;
}

interface PrepListBuilderProps {
  defaultShowCreationTool?: boolean;
}

const PrepListBuilder: React.FC<PrepListBuilderProps> = ({
  defaultShowCreationTool = true,
}) => {
  const { templates, fetchTemplates, isLoading, generatePrepListFromTemplate } =
    usePrepListTemplateStore();
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [prepListTitle, setPrepListTitle] = useState("New Prep List");
  const [prepListDescription, setPrepListDescription] = useState("");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPrepLists, setSavedPrepLists] = useState<SavedPrepList[]>([]);
  const [showSavedLists, setShowSavedLists] = useState(
    defaultShowCreationTool ? false : true,
  );
  const [showCreationTool, setShowCreationTool] = useState(
    defaultShowCreationTool,
  );
  const [currentPrepListId, setCurrentPrepListId] = useState<string | null>(
    null,
  );
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [infoSectionExpanded, setInfoSectionExpanded] = useState(true);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchTemplates();
    // Load saved prep lists from local storage
    const savedLists = localStorage.getItem("savedPrepLists");
    if (savedLists) {
      try {
        setSavedPrepLists(JSON.parse(savedLists));
      } catch (error) {
        console.error("Error loading saved prep lists:", error);
        toast.error("Failed to load saved prep lists");
      }
    }
  }, [fetchTemplates]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedTemplates((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddTemplate = (templateId: string) => {
    if (!selectedTemplates.includes(templateId)) {
      setSelectedTemplates([...selectedTemplates, templateId]);
      toast.success("Module added to prep list");
    } else {
      toast.error("This module is already in the prep list");
    }
  };

  const handleRemoveTemplate = (templateId: string) => {
    setSelectedTemplates(selectedTemplates.filter((id) => id !== templateId));
    toast.success("Module removed from prep list");
  };

  const handleEditTemplate = (templateId: string) => {
    // This would open a modal or form to edit the template
    console.log("Edit template", templateId);
  };

  const handleSavePrepList = async () => {
    if (selectedTemplates.length === 0) {
      toast.error("Please add at least one module to the prep list");
      return;
    }

    if (!prepListTitle.trim()) {
      toast.error("Please enter a title for the prep list");
      return;
    }

    setIsSaving(true);
    try {
      // Save the prep list configuration to local storage first
      const now = new Date().toISOString();
      let updatedLists = [...savedPrepLists];

      if (isEditingExisting && currentPrepListId) {
        // Update existing prep list
        updatedLists = updatedLists.map((list) => {
          if (list.id === currentPrepListId) {
            return {
              ...list,
              title: prepListTitle,
              description: prepListDescription,
              templates: selectedTemplates,
              updatedAt: now,
            };
          }
          return list;
        });
        toast.success("Prep list updated successfully");
      } else {
        // Create new prep list
        const newPrepList: SavedPrepList = {
          id: `preplist_${Date.now()}`,
          title: prepListTitle,
          description: prepListDescription,
          templates: selectedTemplates,
          createdAt: now,
          updatedAt: now,
        };
        updatedLists.push(newPrepList);
        setCurrentPrepListId(newPrepList.id);
        toast.success("Prep list saved successfully");
      }

      setSavedPrepLists(updatedLists);
      localStorage.setItem("savedPrepLists", JSON.stringify(updatedLists));

      // Get tomorrow's date as the default date for the prep list
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split("T")[0];

      // Create a prep list for the first template and get its ID
      const firstTemplateId = selectedTemplates[0];
      const prepListId = await generatePrepListFromTemplate(
        firstTemplateId,
        formattedDate,
      );

      if (prepListId) {
        // If there are more templates, generate prep lists for them too
        if (selectedTemplates.length > 1) {
          const remainingTemplates = selectedTemplates.slice(1);
          for (const templateId of remainingTemplates) {
            await generatePrepListFromTemplate(templateId, formattedDate);
          }
        }
      } else {
        toast.error("Failed to generate prep list in database");
      }
    } catch (error) {
      console.error("Error saving prep list:", error);
      toast.error("An error occurred while saving the prep list");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewList = () => {
    setCurrentPrepListId(null);
    setIsEditingExisting(false);
    setPrepListTitle("New Prep List");
    setPrepListDescription("");
    setSelectedTemplates([]);
    setShowCreationTool(true);
    setShowSavedLists(false);
    toast.success("Started new prep list");
  };

  const handleLoadPrepList = (prepListId: string) => {
    const prepList = savedPrepLists.find((list) => list.id === prepListId);
    if (prepList) {
      setPrepListTitle(prepList.title);
      setPrepListDescription(prepList.description || "");
      setSelectedTemplates(prepList.templates);
      setCurrentPrepListId(prepList.id);
      setIsEditingExisting(true);
      setShowSavedLists(false);
      setShowCreationTool(true);
      toast.success(`Loaded prep list: ${prepList.title}`);
    }
  };

  const handleDeletePrepList = (
    prepListId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this prep list?")) {
      const updatedLists = savedPrepLists.filter(
        (list) => list.id !== prepListId,
      );
      setSavedPrepLists(updatedLists);
      localStorage.setItem("savedPrepLists", JSON.stringify(updatedLists));

      if (currentPrepListId === prepListId) {
        handleCreateNewList();
      }

      toast.success("Prep list deleted");
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "prep":
        return "bg-blue-500/20 text-blue-400";
      case "production":
        return "bg-green-500/20 text-green-400";
      case "opening":
        return "bg-amber-500/20 text-amber-400";
      case "closing":
        return "bg-rose-500/20 text-rose-400";
      default:
        return "bg-purple-500/20 text-purple-400";
    }
  };

  const getPrepSystemBadgeClass = (prepSystem: string) => {
    switch (prepSystem?.toLowerCase()) {
      case "as-needed":
      case "as_needed":
        return "text-amber-400";
      case "scheduled":
      case "scheduled_production":
      case "sched":
        return "text-green-400";
      case "par":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const toggleInfoSection = () => {
    setInfoSectionExpanded(!infoSectionExpanded);
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600/20 rounded-lg flex items-center justify-center">
            <ListChecks className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Prep List Builder</h2>
            <p className="text-gray-400">
              Create and manage prep lists using modules for daily kitchen
              operations.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex">
            {!showSavedLists && (
              <button
                className="btn-ghost-blue rounded-r-none border-r border-gray-700"
                onClick={() => {
                  setShowSavedLists(true);
                  setShowCreationTool(false);
                }}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Saved Lists
              </button>
            )}
            <button
              className="btn-ghost rounded-l-none"
              onClick={handleCreateNewList}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              New List
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Info Section */}
      <div className="expandable-info-section mb-6">
        <button
          className="expandable-info-header w-full flex justify-between items-center"
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
        >
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 text-amber-400 mr-2" />
            <h3 className="text-xl font-medium text-white">
              What is a List Module?
            </h3>
          </div>
          <div className="ml-auto">
            {isInfoExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400 transform transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400 transform transition-transform duration-200" />
            )}
          </div>
        </button>
        {isInfoExpanded && (
          <div className="expandable-info-content mt-4">
            <p className="text-gray-400 mb-6">
              A list module equates to a single line of a hand-written prep list
              or check list. By making your lists modular, you create your lists
              on the fly like your would traditionally, but with the efficiency
              of drag and drop. The best part, no writing the prep list from
              scratch each time! Modules can include both free-standing list
              items and items linked to recipes or prep items.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-3">
                  Features
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Create modules for different stations and shifts
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Link list items to recipes and prep items
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Set item sequence and estimated times
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Support for SCHEDULE by DAY prep systems
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Support for PAR-based inventory prep systems
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Support for As-Needed prep systems
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-3">
                  Module Categories
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <ChefHat className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-400">
                      Prep - Daily preparation tasks
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CookingPot className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-400">
                      Production - Service preparation
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Sunrise className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-gray-400">
                      Opening - Start of day procedures
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Sunset className="h-4 w-4 text-rose-500 mr-2" />
                    <span className="text-gray-400">
                      Closing - End of day procedures
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List Management Section */}
      {showSavedLists && (
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">
              <Folder className="h-4 w-4 inline mr-2" />
              Saved Prep Lists
            </h3>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => {
                setShowSavedLists(false);
                setShowCreationTool(true);
              }}
            >
              <FileX className="h-4 w-4" />
            </button>
          </div>

          {savedPrepLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {savedPrepLists.map((list) => (
                <div
                  key={list.id}
                  className={`p-3 rounded-lg border ${currentPrepListId === list.id ? "border-blue-500 bg-blue-900/20" : "border-gray-700 bg-gray-800/50"} hover:border-blue-500 transition-all cursor-pointer`}
                  onClick={() => handleLoadPrepList(list.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-medium">{list.title}</h4>
                    <div className="flex gap-1">
                      <button
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        onClick={(e) => handleDeletePrepList(list.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {list.description && (
                    <p className="text-gray-400 text-sm mt-1 truncate">
                      {list.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{new Date(list.updatedAt).toLocaleDateString()}</span>
                    <span>{list.templates.length} modules</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-center">
              <p className="text-gray-500">
                No saved prep lists. Create and save a list to see it here.
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button className="btn-primary" onClick={handleCreateNewList}>
              <Plus className="h-4 w-4 mr-2" />
              Create New List
            </button>
          </div>
        </div>
      )}
      {showCreationTool && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Prep List Builder */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 mb-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="prepListTitle"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Prep List Title
                  </label>
                  {isEditingExisting && (
                    <span className="text-xs text-blue-400 flex items-center">
                      <FileEdit className="h-3 w-3 mr-1" />
                      Editing Existing List
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="prepListTitle"
                    type="text"
                    value={prepListTitle}
                    onChange={(e) => setPrepListTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter prep list title"
                  />
                  <button
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md ${isSaving ? "opacity-70 cursor-not-allowed bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}`}
                    onClick={handleSavePrepList}
                    disabled={isSaving}
                    title={
                      isEditingExisting ? "Update Prep List" : "Save Prep List"
                    }
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="prepListDescription"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="prepListDescription"
                  value={prepListDescription}
                  onChange={(e) => setPrepListDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter prep list description"
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Modules in this Prep List
                </h3>
                <button
                  className="btn-secondary text-sm"
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Module
                </button>
              </div>

              {selectedTemplates.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedTemplates}
                    strategy={verticalListSortingStrategy}
                  >
                    {selectedTemplates.map((templateId) => {
                      const template = templates.find(
                        (t) => t.id === templateId,
                      );
                      if (!template) return null;

                      return (
                        <SortableItem
                          key={templateId}
                          id={templateId}
                          title={template.title}
                          description={template.description}
                          templateId={templateId}
                          onEdit={handleEditTemplate}
                          onRemove={handleRemoveTemplate}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-center">
                  <p className="text-gray-500">
                    No modules added yet. Click "Add Module" to get started.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Available Modules */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-medium text-white mb-4">
                Available Modules
              </h3>

              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : templates.length > 0 ? (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 rounded-lg border ${selectedTemplates.includes(template.id) ? "border-blue-500 bg-blue-900/20" : "border-gray-700 bg-gray-800/50"} hover:border-blue-500 transition-all cursor-pointer`}
                      onClick={() => handleAddTemplate(template.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl text-white font-medium">
                          {template.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeClass(template.category)}`}
                        >
                          {template.category.charAt(0).toUpperCase() +
                            template.category.slice(1)}
                        </span>
                      </div>
                      {template.description && (
                        <p className="text-gray-400 text-sm mt-1 truncate">
                          {template.description}
                        </p>
                      )}
                      <div className="space-y-1 mt-2">
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Station:</span>
                            <span className="text-gray-300">
                              {template.station || "None"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">System:</span>
                            <span
                              className={getPrepSystemBadgeClass(
                                template.prep_system || template.prepSystem,
                              )}
                            >
                              {(template.prep_system === "as_needed"
                                ? "As-Needed"
                                : template.prep_system ===
                                    "scheduled_production"
                                  ? "Scheduled"
                                  : template.prep_system) ||
                                (template.prepSystem === "as_needed"
                                  ? "As-Needed"
                                  : template.prepSystem ===
                                      "scheduled_production"
                                    ? "Scheduled"
                                    : template.prepSystem) ||
                                "None"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Role:</span>
                            <span className="text-gray-300">
                              {template.kitchen_role ||
                                template.teamMemberRole ||
                                "None"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-center">
                  <p className="text-gray-500">
                    No modules available. Create modules in the List Modules
                    tab.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepListBuilder;
