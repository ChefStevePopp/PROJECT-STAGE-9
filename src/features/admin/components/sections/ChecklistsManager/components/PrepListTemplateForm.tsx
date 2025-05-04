import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  ChefHat,
  FileText,
  Calendar,
  Gauge,
  AlignLeft,
  LibraryBig,
  Database,
  User,
  Search,
  MapPin,
  X,
  ChevronDown,
  ChevronUp,
  ClipboardType,
  Settings,
  CheckCircle,
  BrainCog,
  NotebookPen,
  ListChecks,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../../../components/ui/tooltip";
import RecipeSelector from "./RecipeSelector";
import toast from "react-hot-toast";
import { usePrepListTemplateStore } from "../../../../../../stores/prepListTemplateStore";
import { useOperationsStore } from "../../../../../../stores/operationsStore";
import { useTeamStore } from "../../../../../../stores/teamStore";
import { useRecipeStore } from "@/features/recipes/stores/recipeStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { supabase } from "../../../../../../lib/supabase";
import {
  PrepListTemplate,
  PrepListTemplateTask,
} from "../../../../../../types/tasks";

interface PrepListTemplateFormProps {
  templateId?: string;
  onClose: () => void;
}

export const PrepListTemplateForm: React.FC<PrepListTemplateFormProps> = ({
  templateId,
  onClose,
}) => {
  const {
    templates,
    selectedTemplate,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    selectTemplate,
  } = usePrepListTemplateStore();

  const { settings, fetchSettings } = useOperationsStore();
  const { members, fetchTeamMembers } = useTeamStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  const { ingredients, fetchIngredients } = useMasterIngredientsStore();

  // Expanded sections state
  const [expanded, setExpanded] = useState({
    basicInfo: true,
    scheduling: false,
    teamConfig: false,
    assignments: false,
    ingredients: false,
    recipe: false,
  });

  const toggleSection = (section) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [formData, setFormData] = useState<
    Partial<PrepListTemplate> & { kitchen_stations?: string[] }
  >({
    title: "",
    description: "",
    category: "prep",
    prep_system: "par",
    is_active: true,
    default_station: "",
    production_station: "",
    par_levels: {},
    schedule_days: [],
    advance_days: 1,
    recipe_id: "",
    prep_stage: "",
    master_ingredient_id: "",
    kitchen_roles: [],
    kitchen_stations: [], // This is used in the UI but not sent to the database
    kitchen_station_permission: [],
    auto_advance: false,
    estimated_time: 0,
  });

  // Search states
  const [stationSearch, setStationSearch] = useState("");
  const [productionStationSearch, setProductionStationSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [kitchenStationSearch, setKitchenStationSearch] = useState("");
  const [stationPermissionSearch, setStationPermissionSearch] = useState("");

  // Filtered options
  const [filteredStations, setFilteredStations] = useState<string[]>([]);
  const [filteredProductionStations, setFilteredProductionStations] = useState<
    string[]
  >([]);
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<any[]>([]);
  const [filteredKitchenStations, setFilteredKitchenStations] = useState<
    string[]
  >([]);
  const [filteredStationPermissions, setFilteredStationPermissions] = useState<
    string[]
  >([]);

  // Dropdown visibility
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);
  const [productionStationDropdownOpen, setProductionStationDropdownOpen] =
    useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [recipeDropdownOpen, setRecipeDropdownOpen] = useState(false);
  const [ingredientDropdownOpen, setIngredientDropdownOpen] = useState(false);
  const [kitchenStationDropdownOpen, setKitchenStationDropdownOpen] =
    useState(false);
  const [stationPermissionDropdownOpen, setStationPermissionDropdownOpen] =
    useState(false);

  // Refs for dropdown containers
  const stationRef = useRef<HTMLDivElement>(null);
  const productionStationRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const recipeRef = useRef<HTMLDivElement>(null);
  const ingredientRef = useRef<HTMLDivElement>(null);
  const kitchenStationRef = useRef<HTMLDivElement>(null);
  const stationPermissionRef = useRef<HTMLDivElement>(null);

  // Function to fetch prep lists that use this template
  const fetchPrepListsForTemplate = async (id: string) => {
    if (!id) return;

    setLoadingPrepLists(true);
    try {
      // Query prep_lists table for lists that include this template ID in template_ids array
      const { data, error } = await supabase
        .from("prep_lists")
        .select("id, title")
        .contains("template_ids", [id]);

      if (error) throw error;

      // Also check for legacy references in template_id field
      const { data: legacyData, error: legacyError } = await supabase
        .from("prep_lists")
        .select("id, title")
        .eq("template_id", id);

      if (legacyError) throw legacyError;

      // Combine both results, removing duplicates
      const allLists = [...(data || []), ...(legacyData || [])];
      const uniqueLists = allLists.filter(
        (list, index, self) =>
          index === self.findIndex((l) => l.id === list.id),
      );

      setPrepLists(uniqueLists);
    } catch (error) {
      console.error("Error fetching prep lists for template:", error);
    } finally {
      setLoadingPrepLists(false);
    }
  };

  useEffect(() => {
    // Fetch templates first to ensure they're loaded
    fetchTemplates().then(() => {
      if (templateId) {
        selectTemplate(templateId);
        fetchPrepListsForTemplate(templateId);
      } else {
        selectTemplate(null);
      }
    });

    // Fetch operations settings, team members, recipes, and master ingredients
    fetchSettings().then(() => {
      // Initialize filtered stations with all available stations
      if (settings?.kitchen_stations) {
        setFilteredStations(settings.kitchen_stations);
        setFilteredProductionStations(settings.kitchen_stations);
      }
    });
    fetchTeamMembers();
    fetchRecipes();
    fetchIngredients();

    // Add click outside listener to close dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (
        stationRef.current &&
        !stationRef.current.contains(event.target as Node)
      ) {
        setStationDropdownOpen(false);
      }
      if (
        productionStationRef.current &&
        !productionStationRef.current.contains(event.target as Node)
      ) {
        setProductionStationDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (
        recipeRef.current &&
        !recipeRef.current.contains(event.target as Node)
      ) {
        setRecipeDropdownOpen(false);
      }
      if (
        ingredientRef.current &&
        !ingredientRef.current.contains(event.target as Node)
      ) {
        setIngredientDropdownOpen(false);
      }
      if (
        kitchenStationRef.current &&
        !kitchenStationRef.current.contains(event.target as Node)
      ) {
        setKitchenStationDropdownOpen(false);
      }
      if (
        stationPermissionRef.current &&
        !stationPermissionRef.current.contains(event.target as Node)
      ) {
        setStationPermissionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      selectTemplate(null);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    templateId,
    selectTemplate,
    fetchSettings,
    fetchTeamMembers,
    fetchRecipes,
    fetchIngredients,
    fetchTemplates,
  ]);

  // Define recipeOptions here to avoid reference error
  const recipeOptions = recipes
    ? recipes.filter((recipe) => !recipe.id.includes("stage_"))
    : [];

  useEffect(() => {
    if (selectedTemplate) {
      // Process kitchen roles to ensure they're properly formatted as an array
      let processedKitchenRoles: string[] = [];

      if (selectedTemplate.kitchen_role) {
        if (Array.isArray(selectedTemplate.kitchen_role)) {
          // If it's already an array, use it directly
          processedKitchenRoles = selectedTemplate.kitchen_role;
        } else if (typeof selectedTemplate.kitchen_role === "string") {
          try {
            // Check if it's a stringified array
            if (
              selectedTemplate.kitchen_role.startsWith("[") &&
              selectedTemplate.kitchen_role.endsWith("]")
            ) {
              processedKitchenRoles = JSON.parse(selectedTemplate.kitchen_role);
            } else {
              // Single role as string
              processedKitchenRoles = [selectedTemplate.kitchen_role];
            }
          } catch (e) {
            console.error("Error parsing kitchen roles:", e);
            // If parsing fails, treat it as a single role
            processedKitchenRoles = [String(selectedTemplate.kitchen_role)];
          }
        }
      }

      setFormData({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        category: selectedTemplate.category,
        prep_system: selectedTemplate.prep_system,
        is_active: selectedTemplate.is_active,
        default_station:
          selectedTemplate.default_station || selectedTemplate.station,
        production_station: selectedTemplate.production_station || "",
        par_levels: selectedTemplate.par_levels,
        schedule_days: selectedTemplate.schedule_days,
        advance_days: selectedTemplate.advance_days,
        recipe_id: selectedTemplate.recipe_id || "",
        prep_stage: selectedTemplate.prep_stage || "",
        master_ingredient_id: selectedTemplate.master_ingredient_id || "",
        kitchen_roles: processedKitchenRoles,
        kitchen_stations: selectedTemplate.kitchen_stations || [],
        kitchen_station_permission:
          selectedTemplate.kitchen_station_permission || [],
        auto_advance: selectedTemplate.auto_advance || false,
        estimated_time: selectedTemplate.estimated_time || 0,
      });

      // Set search fields based on selected values
      if (selectedTemplate.default_station || selectedTemplate.station) {
        setStationSearch(
          selectedTemplate.default_station || selectedTemplate.station,
        );
      }
      if (selectedTemplate.production_station) {
        setProductionStationSearch(selectedTemplate.production_station);
      }
      // We don't need to set roleSearch for multi-select

      // Set recipe search if a recipe is selected
      if (selectedTemplate.recipe_id && recipeOptions.length > 0) {
        const recipeId = selectedTemplate.recipe_id;
        if (
          recipeId &&
          typeof recipeId === "string" &&
          recipeId.startsWith("stage_")
        ) {
          const stageOption = recipeOptions
            .filter((recipe) => recipe.stages && recipe.stages.length > 0)
            .flatMap((recipe) =>
              recipe.stages.map((stage) => ({
                id: `stage_${recipe.id}_${stage.id || stage.name}`,
                name: `${recipe.name} - ${stage.name}`,
              })),
            )
            .find((stage) => stage.id === recipeId);
          if (stageOption) {
            setRecipeSearch(stageOption.name);
          }
        } else {
          const recipe = recipeOptions.find((r) => r.id === recipeId);
          if (recipe) {
            setRecipeSearch(recipe.name);
          }
        }
      }

      // Set ingredient search if an ingredient is selected
      if (selectedTemplate.master_ingredient_id && ingredients) {
        const ingredient = ingredients.find(
          (i) => i.id === selectedTemplate.master_ingredient_id,
        );
        if (ingredient) {
          setIngredientSearch(ingredient.product);
        }
      }
    }
  }, [selectedTemplate, recipes, ingredients]);

  // Filter stations based on search and initialize dropdown with all stations when empty
  useEffect(() => {
    if (settings?.kitchen_stations) {
      const filtered = settings.kitchen_stations.filter((station) =>
        station.toLowerCase().includes(stationSearch.toLowerCase()),
      );
      setFilteredStations(filtered);

      // If dropdown is open and no search term, show all stations
      if (stationDropdownOpen && !stationSearch) {
        setFilteredStations(settings.kitchen_stations);
      }
    }
  }, [stationSearch, settings?.kitchen_stations, stationDropdownOpen]);

  // Filter production stations based on search
  useEffect(() => {
    if (settings?.kitchen_stations) {
      const filtered = settings.kitchen_stations.filter((station) =>
        station.toLowerCase().includes(productionStationSearch.toLowerCase()),
      );
      setFilteredProductionStations(filtered);

      // If dropdown is open and no search term, show all stations
      if (productionStationDropdownOpen && !productionStationSearch) {
        setFilteredProductionStations(settings.kitchen_stations);
      }
    }
  }, [
    productionStationSearch,
    settings?.kitchen_stations,
    productionStationDropdownOpen,
  ]);

  // Filter kitchen stations based on search
  useEffect(() => {
    if (settings?.kitchen_stations) {
      const filtered = settings.kitchen_stations.filter(
        (station) =>
          station.toLowerCase().includes(kitchenStationSearch.toLowerCase()) &&
          !(formData.kitchen_stations || []).includes(station),
      );
      setFilteredKitchenStations(filtered);
    }
  }, [
    kitchenStationSearch,
    settings?.kitchen_stations,
    formData.kitchen_stations,
  ]);

  // Filter station permissions based on search
  useEffect(() => {
    if (settings?.kitchen_stations) {
      const filtered = settings.kitchen_stations.filter(
        (station) =>
          station
            .toLowerCase()
            .includes(stationPermissionSearch.toLowerCase()) &&
          !(formData.kitchen_station_permission || []).includes(station),
      );
      setFilteredStationPermissions(filtered);
    }
  }, [
    stationPermissionSearch,
    settings?.kitchen_stations,
    formData.kitchen_station_permission,
  ]);

  // Filter roles based on search
  useEffect(() => {
    const uniqueRoles = members
      .flatMap((member) => member.roles || [])
      .filter(
        (role, index, self) =>
          self.indexOf(role) === index && typeof role === "string",
      )
      .sort();

    const filtered = uniqueRoles.filter((role) =>
      role.toLowerCase().includes(roleSearch.toLowerCase()),
    );
    setFilteredRoles(filtered);
  }, [roleSearch, members]);

  // State for selected stage
  const [selectedStage, setSelectedStage] = useState<any>(null);

  // State for prep lists that use this template
  const [prepLists, setPrepLists] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [loadingPrepLists, setLoadingPrepLists] = useState(false);

  // Filter recipes based on search
  useEffect(() => {
    // Filter recipes
    const filteredRecipeOptions = recipeOptions.filter((recipe) =>
      recipe.name.toLowerCase().includes(recipeSearch.toLowerCase()),
    );

    // Filter recipe stages
    const filteredStageOptions = recipeOptions
      .filter((recipe) => recipe.stages && recipe.stages.length > 0)
      .flatMap((recipe) =>
        recipe.stages
          .filter((stage) =>
            `${recipe.name} - ${stage.name}`
              .toLowerCase()
              .includes(recipeSearch.toLowerCase()),
          )
          .map((stage) => ({
            id: `stage_${recipe.id}_${stage.id || stage.name}`,
            name: `${recipe.name} - ${stage.name}`,
            isStage: true,
            recipeId: recipe.id,
            total_time: stage.total_time || null,
            stageData: stage,
          })),
      );

    setFilteredRecipes([...filteredRecipeOptions, ...filteredStageOptions]);
  }, [recipeSearch, recipeOptions, recipes]);

  // Filter ingredients based on search
  useEffect(() => {
    const filtered = ingredients
      .filter(
        (ingredient) =>
          ingredient.product
            .toLowerCase()
            .includes(ingredientSearch.toLowerCase()) ||
          (ingredient.item_code &&
            ingredient.item_code
              .toLowerCase()
              .includes(ingredientSearch.toLowerCase())),
      )
      .sort((a, b) => a.product.localeCompare(b.product));

    setFilteredIngredients(filtered);
  }, [ingredientSearch, ingredients]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      // Handle recipe_id specially to process stage IDs
      if (name === "recipe_id" && value && value.startsWith("stage_")) {
        // Store the stage reference in a format we can parse later
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Extract recipe ID and stage info from the value
        const [_, recipeId, stageId] = value.split("_");
        console.log(`Selected stage ${stageId} from recipe ${recipeId}`);
        console.log(`Storing full stage ID: ${value}`);

        // Here you could also store additional stage metadata if needed
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleScheduleDayToggle = (day: number) => {
    setFormData((prev) => {
      const currentDays = prev.schedule_days || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];

      return { ...prev, schedule_days: newDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Please enter a module title");
      return;
    }

    try {
      // Ensure all fields are included in the submission
      // Remove fields that don't exist in the database schema
      // Ensure kitchen_roles is a proper array before submission
      const kitchenRoles = Array.isArray(formData.kitchen_roles)
        ? formData.kitchen_roles
        : formData.kitchen_roles
          ? [formData.kitchen_roles]
          : [];

      const dataToSubmit = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category || "prep",
        prep_system: formData.prep_system || "par",
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        default_station: formData.default_station || null,
        production_station: formData.production_station || null,
        par_levels: formData.par_levels || {},
        schedule_days: formData.schedule_days || [],
        advance_days: formData.advance_days || 1,
        recipe_id: formData.recipe_id || null,
        kitchen_role: kitchenRoles, // Properly formatted kitchen roles array
        master_ingredient_id: formData.master_ingredient_id || null,
        kitchen_station_permission: formData.kitchen_station_permission || [],
        auto_advance: formData.auto_advance || false,
        prep_stage: formData.prep_stage || null,
        estimated_time: formData.estimated_time || 0,
      };

      // Remove fields that don't exist in the database schema
      delete dataToSubmit.kitchen_stations;
      // Don't include station field at all as it doesn't exist in the schema

      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, dataToSubmit);
        toast.success("Module updated successfully");
      } else {
        const newTemplateId = await createTemplate(
          dataToSubmit as Omit<
            PrepListTemplate,
            "id" | "organization_id" | "created_at" | "updated_at"
          >,
        );
        if (newTemplateId) {
          selectTemplate(newTemplateId);
          toast.success("Module created successfully");
          return; // Don't close the form, allow user to add tasks
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving module:", error);
      toast.error(
        "Error saving module: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (isLoading && !selectedTemplate) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading list modules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-4xl mx-auto">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
          <h3 className="text-red-400 font-medium mb-2">Error Loading Data</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => fetchTemplates()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Function to render a section header
  const renderSectionHeader = (title, icon, section) => (
    <div
      className="flex items-center justify-between cursor-pointer p-3 bg-slate-700/30 border border-gray-500/30 rounded-lg mb-4"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center bg-primary-400/30 rounded-full border border-primary-300/50">
          {icon}
        </div>
        <span className="font-medium text-white">{title}</span>
      </div>
      <div>
        {expanded[section] ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <ClipboardType className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedTemplate ? selectedTemplate.title : "New List Module"}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {selectedTemplate && (
                <div className="bg-blue-500/20 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5" />
                  <span>
                    {" "}
                    Has Been Assigned{" "}
                    {selectedTemplate.tasks
                      ? selectedTemplate.tasks.length
                      : 0}{" "}
                    Times
                  </span>
                </div>
              )}
              {loadingPrepLists ? (
                <div className="bg-gray-500/20 text-gray-300 text-sm px-3 py-1 rounded-full border border-gray-500/30 flex items-center gap-1">
                  <span className="animate-pulse">Loading lists...</span>
                </div>
              ) : selectedTemplate && prepLists.length > 0 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="bg-green-500/20 text-green-300 text-sm px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-1 cursor-help">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Used in {prepLists.length} lists</span>
                        <Info className="h-3.5 w-3.5 ml-1 text-green-300/70" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2 max-w-xs">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">
                          Lists using this module:
                        </h4>
                        <ul className="space-y-1">
                          {prepLists.map((list) => (
                            <li
                              key={list.id}
                              className="text-gray-300 text-2xs"
                            >
                              • {list.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                selectedTemplate && (
                  <div className="bg-amber-500/20 text-amber-300 text-sm px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Not used in any lists</span>
                  </div>
                )
              )}
              {!selectedTemplate && (
                <p className="text-gray-400">
                  Create a new list module for building daily prep lists. Add
                  list items in the Prep List Builder tab after saving.
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Removed the list display from here as it's now shown in the tooltip */}
      </div>

      {selectedTemplate && (
        <div className="mb-4 bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
          <div className="flex items-start gap-2">
            <div className="mt-1">
              <ListChecks className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-blue-300 font-medium mb-1">Module Tasks</h3>
              <p className="text-blue-300">
                This module contains{" "}
                {selectedTemplate.tasks ? selectedTemplate.tasks.length : 0}{" "}
                task items
                {selectedTemplate.tasks && selectedTemplate.tasks.length > 0 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="cursor-help inline-flex items-center">
                          : {selectedTemplate.tasks.length} items
                          <Info className="h-3.5 w-3.5 ml-1 text-blue-300/70" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="p-2 max-w-xs">
                          <h4 className="font-medium text-white mb-1">
                            Task items:
                          </h4>
                          <ul className="space-y-1">
                            {selectedTemplate.tasks.map((task) => (
                              <li
                                key={task.id}
                                className="text-gray-300 text-xs"
                              >
                                • {task.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  ". Add tasks in the Prep List Builder tab."
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="card p-4 border border-gray-700 bg-slate-900/40 rounded-lg mb-4">
          {renderSectionHeader(
            "Basic Module Information",
            <NotebookPen className="text-primary-500 w-5 h-5" />,
            "basicInfo",
          )}

          {expanded.basicInfo && (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                    <FileText className="w-3 h-3 text-blue-400" />
                    Module Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                    placeholder="e.g., Morning Prep Module"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                    <Gauge className="w-3 h-3 text-blue-400" />
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                  >
                    <option value="prep">Prep</option>
                    <option value="production">Production</option>
                    <option value="opening">Opening</option>
                    <option value="closing">Closing</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                  <AlignLeft className="w-3 h-3 text-blue-400" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white h-20"
                  placeholder="Describe the purpose of this list module"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-2">
                  <Clock className="w-3 h-3 text-blue-400" />
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  name="estimated_time"
                  value={formData.estimated_time || 0}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                  placeholder="Enter estimated time in minutes"
                />
                {selectedStage && selectedStage.total_time && (
                  <p className="text-xs text-blue-400 mt-1">
                    Auto-populated from recipe stage time
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Prep System Section */}
        <div className="card p-4 border border-gray-700 bg-slate-900/40 rounded-lg mb-4">
          {renderSectionHeader(
            "Prep System Configuration",
            <BrainCog className="text-green-500 w-5 h-5" />,
            "scheduling",
          )}

          {expanded.scheduling && (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mb-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="auto_advance"
                  name="auto_advance"
                  checked={formData.auto_advance || false}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      auto_advance: e.target.checked,
                    }));
                  }}
                  className="mr-2 h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
                />
                <label
                  htmlFor="auto_advance"
                  className="text-sm font-medium text-gray-400 flex items-center gap-1"
                >
                  <Clock className="w-3 h-3 text-blue-400" />
                  Auto-advance task to next day if not completed
                  <span className="ml-2 text-xs text-gray-500">
                    (Task will automatically move to the current date if it was
                    due in the past)
                  </span>
                </label>
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                  <Gauge className="w-3 h-3 text-blue-400" />
                  Prep System
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/3">
                    <select
                      name="prep_system"
                      value={formData.prep_system}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                    >
                      <option value="par">PAR-based</option>
                      <option value="scheduled_production">
                        Scheduled Production
                      </option>
                      <option value="as_needed">As-Needed</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="w-full md:w-2/3 bg-gray-800/50 p-3 rounded-lg border border-gray-700 line-clamp-4">
                    {formData.prep_system === "par" && (
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-xs font-bold">
                            P
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium text-blue-400">
                            PAR-based:
                          </span>{" "}
                          Prep items to maintain set inventory levels. System
                          calculates needed amounts based on current levels vs.
                          target PAR levels.
                        </p>
                      </div>
                    )}
                    {formData.prep_system === "scheduled_production" && (
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-green-400 text-xs font-bold">
                            S
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium text-green-400">
                            Scheduled Production:
                          </span>{" "}
                          Prep items according to a regular schedule on specific
                          days of the week with advance planning.
                        </p>
                      </div>
                    )}
                    {formData.prep_system === "as_needed" && (
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-amber-400 text-xs font-bold">
                            A
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium text-amber-400">
                            As-Needed:
                          </span>{" "}
                          Flexible prep system where items are prepared when
                          required, based on user determination rather than
                          automated calculations.
                        </p>
                      </div>
                    )}
                    {formData.prep_system === "hybrid" && (
                      <div className="flex items-start gap-2">
                        <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-400 text-xs font-bold">
                            H
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium text-purple-400">
                            Hybrid:
                          </span>{" "}
                          Combines scheduled production with PAR-based approach,
                          allowing both regular prep schedules and
                          inventory-based calculations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* PAR Level Settings */}
              {(formData.prep_system === "par" ||
                formData.prep_system === "hybrid") && (
                <div className="mb-4">
                  <h3 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-400" />
                    PAR Level Settings
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    PAR levels will be configured for individual list items
                    after creating the module. The system will use On Hand, Par
                    Level, and Amount to Prep variables.
                  </p>
                </div>
              )}

              {/* Schedule Settings */}
              {(formData.prep_system === "scheduled_production" ||
                formData.prep_system === "hybrid") && (
                <div className="mb-4">
                  <h3 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    Schedule Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-2">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        Days of Week
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {dayNames.map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleScheduleDayToggle(index)}
                            className={`px-3 py-1 rounded-full text-sm ${(formData.schedule_days || []).includes(index) ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-2">
                        <Clock className="w-3 h-3 text-blue-400" />
                        Advance Days
                        <span className="text-xs text-gray-500 ml-2">
                          (How many days in advance to schedule)
                        </span>
                      </label>
                      <input
                        type="number"
                        name="advance_days"
                        value={formData.advance_days || 1}
                        onChange={handleInputChange}
                        min="0"
                        max="14"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Configuration Section */}
        <div className="card p-4 border border-gray-700 bg-slate-900/40 rounded-lg mb-4">
          {renderSectionHeader(
            "Team Configuration",
            <User className="text-amber-500 w-5 h-5" />,
            "teamConfig",
          )}

          {expanded.teamConfig && (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Default Station */}
                <div className="relative" ref={stationRef}>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    Default Station
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={stationSearch}
                      onChange={(e) => setStationSearch(e.target.value)}
                      onFocus={() => {
                        setStationDropdownOpen(true);
                        // Show all stations when focusing on the input
                        if (settings?.kitchen_stations) {
                          setFilteredStations(settings.kitchen_stations);
                        }
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                      placeholder="Select a station"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() =>
                        setStationDropdownOpen(!stationDropdownOpen)
                      }
                    >
                      {stationDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {stationDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredStations.length > 0 ? (
                        filteredStations.map((station) => (
                          <div
                            key={station}
                            className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                            onClick={() => {
                              setStationSearch(station);
                              setFormData((prev) => ({
                                ...prev,
                                default_station: station,
                              }));
                              setStationDropdownOpen(false);
                            }}
                          >
                            {station}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-400 text-center">
                          No stations found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Production Station */}
                <div className="relative" ref={productionStationRef}>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                    <MapPin className="w-3 h-3 text-green-400" />
                    Production Station
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={productionStationSearch}
                      onChange={(e) =>
                        setProductionStationSearch(e.target.value)
                      }
                      onFocus={() => {
                        setProductionStationDropdownOpen(true);
                        // Show all stations when focusing on the input
                        if (settings?.kitchen_stations) {
                          setFilteredProductionStations(
                            settings.kitchen_stations,
                          );
                        }
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                      placeholder="Select a production station"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() =>
                        setProductionStationDropdownOpen(
                          !productionStationDropdownOpen,
                        )
                      }
                    >
                      {productionStationDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {productionStationDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredProductionStations.length > 0 ? (
                        filteredProductionStations.map((station) => (
                          <div
                            key={station}
                            className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                            onClick={() => {
                              setProductionStationSearch(station);
                              setFormData((prev) => ({
                                ...prev,
                                production_station: station,
                              }));
                              setProductionStationDropdownOpen(false);
                            }}
                          >
                            {station}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-400 text-center">
                          No stations found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Kitchen Roles (Multi-select) */}
              <div className="mb-4">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                  <User className="w-3 h-3 text-blue-400" />
                  Kitchen Roles
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.kitchen_roles || []).map((role) => (
                    <div
                      key={role}
                      className="bg-gray-700 text-white px-2 py-1 rounded-lg flex items-center gap-1"
                    >
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            kitchen_roles: (prev.kitchen_roles || []).filter(
                              (r) => r !== role,
                            ),
                          }));
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative" ref={roleRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      onFocus={() => setRoleDropdownOpen(true)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                      placeholder="Add kitchen roles"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    >
                      {roleDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {roleDropdownOpen && filteredRoles.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredRoles
                        .filter(
                          (role) =>
                            !(formData.kitchen_roles || []).includes(role),
                        )
                        .map((role) => (
                          <div
                            key={role}
                            className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                            onClick={() => {
                              setRoleSearch("");
                              setFormData((prev) => ({
                                ...prev,
                                kitchen_roles: [
                                  ...(prev.kitchen_roles || []),
                                  role,
                                ],
                              }));
                            }}
                          >
                            {role}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Station Permissions (Multi-select) */}
              <div className="mb-4">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                  <Settings className="w-3 h-3 text-amber-400" />
                  Station Permissions (Which stations can view this module)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.kitchen_station_permission || []).map(
                    (station) => (
                      <div
                        key={station}
                        className="bg-gray-700 text-white px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <span>{station}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              kitchen_station_permission: (
                                prev.kitchen_station_permission || []
                              ).filter((s) => s !== station),
                            }));
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ),
                  )}
                </div>
                <div className="relative" ref={stationPermissionRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={stationPermissionSearch}
                      onChange={(e) =>
                        setStationPermissionSearch(e.target.value)
                      }
                      onFocus={() => setStationPermissionDropdownOpen(true)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                      placeholder="Add station permissions"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                      onClick={() =>
                        setStationPermissionDropdownOpen(
                          !stationPermissionDropdownOpen,
                        )
                      }
                    >
                      {stationPermissionDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {stationPermissionDropdownOpen &&
                    filteredStationPermissions.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredStationPermissions.map((station) => (
                          <div
                            key={station}
                            className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                            onClick={() => {
                              setStationPermissionSearch("");
                              setFormData((prev) => ({
                                ...prev,
                                kitchen_station_permission: [
                                  ...(prev.kitchen_station_permission || []),
                                  station,
                                ],
                              }));
                            }}
                          >
                            {station}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recipe & Ingredients Section */}
        <div className="card p-4 border border-gray-700 bg-slate-900/40 rounded-lg mb-4">
          {renderSectionHeader(
            "Recipe & Ingredient References",
            <LibraryBig className="text-purple-500 w-5 h-5" />,
            "recipe",
          )}

          {expanded.recipe && (
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mb-4">
              <div className="mb-4">
                <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
                  <LibraryBig className="w-3 h-3 text-blue-400" />
                  Associated Recipe Library Item
                </label>
                <RecipeSelector
                  recipes={recipeOptions}
                  selectedRecipeId={formData.recipe_id || ""}
                  selectedStageId={formData.prep_stage || ""}
                  onRecipeSelect={(recipeId, recipeName) => {
                    setFormData((prev) => ({
                      ...prev,
                      recipe_id: recipeId,
                    }));

                    // Clear stage selection when recipe changes
                    if (prev.recipe_id !== recipeId) {
                      setFormData((prev) => ({
                        ...prev,
                        prep_stage: "",
                      }));
                      setSelectedStage(null);
                    }
                  }}
                  onStageSelect={(stageId, stageName) => {
                    setFormData((prev) => ({
                      ...prev,
                      prep_stage: stageId,
                    }));

                    // Find stage data for display
                    const recipe = recipeOptions.find(
                      (r) => r.id === formData.recipe_id,
                    );
                    if (recipe && recipe.stages) {
                      const stage = recipe.stages.find(
                        (s) =>
                          `stage_${recipe.id}_${s.id || s.name}` === stageId,
                      );
                      if (stage) {
                        setSelectedStage(stage);

                        // Auto-populate estimated time if stage has total_time
                        if (stage.total_time) {
                          setFormData((prev) => ({
                            ...prev,
                            estimated_time: stage.total_time,
                          }));
                        }
                      }
                    }
                  }}
                />
                {/* List Items Note - shown when editing an existing template */}
                {selectedTemplate && (
                  <div className="card p-4 border border-gray-700 bg-slate-900/40 rounded-lg mb-4">
                    <div className="text-center p-4 border border-dashed border-gray-700 rounded-lg">
                      <h3 className="text-gray-300 font-medium flex items-center justify-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        List Items
                      </h3>
                      <p className="text-gray-300">
                        List items can be added in the Prep List Builder tab
                        after saving this module.
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        This module currently has{" "}
                        {selectedTemplate.tasks
                          ? selectedTemplate.tasks.length
                          : 0}{" "}
                        list items.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {selectedTemplate ? "Update Module" : "Create Module"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default PrepListTemplateForm;
