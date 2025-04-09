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
} from "lucide-react";
import toast from "react-hot-toast";
import { usePrepListTemplateStore } from "../../../../../../stores/prepListTemplateStore";
import { useOperationsStore } from "../../../../../../stores/operationsStore";
import { useTeamStore } from "../../../../../../stores/teamStore";
import { useRecipeStore } from "@/features/recipes/stores/recipeStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
// Using team member roles from the team store instead of kitchen roles
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

  const [formData, setFormData] = useState<Partial<PrepListTemplate>>({
    title: "",
    description: "",
    category: "prep",
    prep_system: "par",
    is_active: true,
    station: "",
    par_levels: {},
    schedule_days: [],
    advance_days: 1,
    recipe_id: "",
    master_ingredient_id: "",
    kitchen_role: "",
    kitchen_stations: [],
    auto_advance: false,
  });

  // Search states
  const [stationSearch, setStationSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [kitchenStationSearch, setKitchenStationSearch] = useState("");

  // Filtered options
  const [filteredStations, setFilteredStations] = useState<string[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<any[]>([]);
  const [filteredKitchenStations, setFilteredKitchenStations] = useState<
    string[]
  >([]);

  // Dropdown visibility
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [recipeDropdownOpen, setRecipeDropdownOpen] = useState(false);
  const [ingredientDropdownOpen, setIngredientDropdownOpen] = useState(false);
  const [kitchenStationDropdownOpen, setKitchenStationDropdownOpen] =
    useState(false);

  // Refs for dropdown containers
  const stationRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const recipeRef = useRef<HTMLDivElement>(null);
  const ingredientRef = useRef<HTMLDivElement>(null);
  const kitchenStationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch templates first to ensure they're loaded
    fetchTemplates().then(() => {
      if (templateId) {
        selectTemplate(templateId);
      } else {
        selectTemplate(null);
      }
    });

    // Fetch operations settings, team members, recipes, and master ingredients
    fetchSettings();
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
      setFormData({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        category: selectedTemplate.category,
        prep_system: selectedTemplate.prep_system,
        is_active: selectedTemplate.is_active,
        station: selectedTemplate.station,
        par_levels: selectedTemplate.par_levels,
        schedule_days: selectedTemplate.schedule_days,
        advance_days: selectedTemplate.advance_days,
        recipe_id: selectedTemplate.recipe_id || "",
        master_ingredient_id: selectedTemplate.master_ingredient_id || "",
        kitchen_role: selectedTemplate.kitchen_role || "",
        kitchen_stations: selectedTemplate.kitchen_stations || [],
        auto_advance: selectedTemplate.auto_advance || false,
      });

      // Set search fields based on selected values
      if (selectedTemplate.station) {
        setStationSearch(selectedTemplate.station);
      }
      if (selectedTemplate.kitchen_role) {
        setRoleSearch(selectedTemplate.kitchen_role);
      }

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

  // Filter stations based on search
  useEffect(() => {
    if (settings?.kitchen_stations) {
      const filtered = settings.kitchen_stations.filter((station) =>
        station.toLowerCase().includes(stationSearch.toLowerCase()),
      );
      setFilteredStations(filtered);
    }
  }, [stationSearch, settings?.kitchen_stations]);

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

  // Filter roles based on search
  useEffect(() => {
    const uniqueRoles = members
      .flatMap((member) => member.roles || [])
      .filter((role, index, self) => self.indexOf(role) === index)
      .sort();

    const filtered = uniqueRoles.filter((role) =>
      role.toLowerCase().includes(roleSearch.toLowerCase()),
    );
    setFilteredRoles(filtered);
  }, [roleSearch, members]);

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
      // Ensure kitchen_role and master_ingredient_id are included in the submission
      const dataToSubmit = {
        ...formData,
        kitchen_role: formData.kitchen_role || null,
        master_ingredient_id: formData.master_ingredient_id || null,
      };

      // Log the data being submitted for debugging
      console.log("Submitting form data:", dataToSubmit);
      console.log("Recipe ID being saved:", dataToSubmit.recipe_id);

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

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">
        {selectedTemplate ? "Edit List Module" : "Create New List Module"}
      </h2>
      {selectedTemplate && (
        <div className="mb-4 bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
          <p className="text-blue-300">
            This module is part of{" "}
            {selectedTemplate.tasks ? selectedTemplate.tasks.length : 0} lists
            {selectedTemplate.tasks && selectedTemplate.tasks.length > 0
              ? ": " +
                selectedTemplate.tasks.map((task) => task.title).join(", ")
              : ". Add it to a list in the Prep List Builder tab."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
              <ChefHat className="w-3 h-3 text-blue-400" />
              Station (Optional)
            </label>
            <div className="relative" ref={stationRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search stations..."
                  value={stationSearch}
                  onChange={(e) => {
                    setStationSearch(e.target.value);
                    setStationDropdownOpen(true);
                  }}
                  onFocus={() => setStationDropdownOpen(true)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white pr-8"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {stationDropdownOpen && filteredStations.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto">
                  {filteredStations.map((station) => (
                    <div
                      key={station}
                      className={`p-2 hover:bg-gray-700 cursor-pointer ${formData.station === station ? "bg-gray-700" : ""}`}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, station }));
                        setStationSearch(station);
                        setStationDropdownOpen(false);
                      }}
                    >
                      {station}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              Kitchen Stations Access
            </label>
            <div className="relative" ref={kitchenStationRef}>
              {/* Selected stations */}
              <div className="flex flex-wrap gap-1 mb-2">
                {(formData.kitchen_stations || []).map((station) => (
                  <div
                    key={station}
                    className="bg-blue-900/30 border border-blue-500/30 rounded-full px-2 py-1 text-sm flex items-center"
                  >
                    <span className="text-blue-300 mr-1">{station}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          kitchen_stations: (
                            prev.kitchen_stations || []
                          ).filter((s) => s !== station),
                        }));
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to add kitchen stations..."
                  value={kitchenStationSearch}
                  onChange={(e) => {
                    setKitchenStationSearch(e.target.value);
                    setKitchenStationDropdownOpen(true);
                  }}
                  onFocus={() => setKitchenStationDropdownOpen(true)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white pr-8"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {kitchenStationDropdownOpen &&
                filteredKitchenStations.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto">
                    {filteredKitchenStations.map((station) => (
                      <div
                        key={station}
                        className="p-2 hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            kitchen_stations: [
                              ...(prev.kitchen_stations || []),
                              station,
                            ],
                          }));
                          setKitchenStationSearch("");
                        }}
                      >
                        {station}
                      </div>
                    ))}
                  </div>
                )}

              {kitchenStationDropdownOpen &&
                kitchenStationSearch &&
                filteredKitchenStations.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-gray-400">
                    No matching stations found
                  </div>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select which kitchen stations have access to this module
            </p>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
              <User className="w-3 h-3 text-blue-400" />
              Team Member Role
            </label>
            <div className="relative" ref={roleRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search roles..."
                  value={roleSearch}
                  onChange={(e) => {
                    setRoleSearch(e.target.value);
                    setRoleDropdownOpen(true);
                  }}
                  onFocus={() => setRoleDropdownOpen(true)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white pr-8"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {roleDropdownOpen && filteredRoles.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto">
                  {filteredRoles.map((role) => (
                    <div
                      key={role}
                      className={`p-2 hover:bg-gray-700 cursor-pointer ${formData.kitchen_role === role ? "bg-gray-700" : ""}`}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          kitchen_role: role,
                        }));
                        setRoleSearch(role);
                        setRoleDropdownOpen(false);
                        console.log("Selected kitchen role:", role); // Debug log
                      }}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
              <LibraryBig className="w-3 h-3 text-blue-400" />
              Associated Recipe Library Item
            </label>
            <div className="relative" ref={recipeRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search recipes or stages..."
                  value={recipeSearch}
                  onChange={(e) => {
                    setRecipeSearch(e.target.value);
                    setRecipeDropdownOpen(true);
                  }}
                  onFocus={() => setRecipeDropdownOpen(true)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white pr-8"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {recipeDropdownOpen && filteredRecipes.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto">
                  {filteredRecipes.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 hover:bg-gray-700 cursor-pointer ${formData.recipe_id === item.id ? "bg-gray-700" : ""}`}
                      onClick={() => {
                        const newRecipeId = item.id;
                        console.log(`Setting recipe_id to: ${newRecipeId}`);
                        setFormData((prev) => ({
                          ...prev,
                          recipe_id: newRecipeId,
                        }));
                        setRecipeSearch(item.name);
                        setRecipeDropdownOpen(false);
                      }}
                    >
                      {item.isStage ? (
                        <span className="pl-4">{item.name}</span>
                      ) : (
                        item.name
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
              <Database className="w-3 h-3 text-blue-400" />
              Associated Master Ingredient
            </label>
            <div className="relative" ref={ingredientRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search ingredients..."
                  value={ingredientSearch}
                  onChange={(e) => {
                    setIngredientSearch(e.target.value);
                    setIngredientDropdownOpen(true);
                  }}
                  onFocus={() => setIngredientDropdownOpen(true)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white pr-8"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {ingredientDropdownOpen && filteredIngredients.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto">
                  {filteredIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className={`p-2 hover:bg-gray-700 cursor-pointer ${formData.master_ingredient_id === ingredient.id ? "bg-gray-700" : ""}`}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          master_ingredient_id: ingredient.id,
                        }));
                        setIngredientSearch(ingredient.product);
                        setIngredientDropdownOpen(false);
                        console.log(
                          "Selected master ingredient ID:",
                          ingredient.id,
                        ); // Debug log
                      }}
                    >
                      {ingredient.product}{" "}
                      {ingredient.item_code && `(${ingredient.item_code})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
              <AlignLeft className="w-3 h-3 text-blue-400" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white h-24"
              placeholder="Describe the purpose of this list module"
            />
          </div>

          <div className="md:col-span-2">
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
                      <span className="text-blue-400 text-xs font-bold">P</span>
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
                      allowing both regular prep schedules and inventory-based
                      calculations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conditional fields based on prep system */}
        {formData.prep_system === "scheduled_production" ||
        formData.prep_system === "hybrid" ? (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
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
        ) : null}

        {formData.prep_system === "par" || formData.prep_system === "hybrid" ? (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-400" />
              PAR Level Settings
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              PAR levels will be configured for individual list items after
              creating the module. The system will use On Hand, Par Level, and
              Amount to Prep variables.
            </p>
          </div>
        ) : null}

        {/* Note about list items - shown when editing an existing template */}
        {selectedTemplate && (
          <div className="mb-6">
            <div className="text-center p-6 border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-300 font-medium">
                List items can be added in the Prep List Builder tab after
                saving this module.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This module currently has{" "}
                {selectedTemplate.tasks ? selectedTemplate.tasks.length : 0}{" "}
                list items.
              </p>
            </div>
          </div>
        )}

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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            {selectedTemplate ? "Update Module" : "Create Module"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrepListTemplateForm;
