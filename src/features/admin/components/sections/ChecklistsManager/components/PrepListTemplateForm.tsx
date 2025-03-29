import React, { useState, useEffect } from "react";
import {
  Clock,
  ChefHat,
  FileText,
  Calendar,
  Gauge,
  AlignLeft,
  LibraryBig,
} from "lucide-react";
import { usePrepListTemplateStore } from "../../../../../../stores/prepListTemplateStore";
import { useOperationsStore } from "../../../../../../stores/operationsStore";
import { useTeamStore } from "../../../../../../stores/teamStore";
import { useRecipeStore } from "@/features/recipes/stores/recipeStore";
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
  });

  useEffect(() => {
    // Fetch templates first to ensure they're loaded
    fetchTemplates().then(() => {
      if (templateId) {
        selectTemplate(templateId);
      } else {
        selectTemplate(null);
      }
    });

    // Fetch operations settings, team members, and recipes
    fetchSettings();
    fetchTeamMembers();
    fetchRecipes();

    return () => selectTemplate(null);
  }, [
    templateId,
    selectTemplate,
    fetchSettings,
    fetchTeamMembers,
    fetchRecipes,
    fetchTemplates,
  ]);

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
      });
    }
  }, [selectedTemplate]);

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
      if (name === "recipe_id" && value.startsWith("stage_")) {
        // Store the stage reference in a format we can parse later
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Extract recipe ID and stage info from the value
        const [_, recipeId, stageId] = value.split("_");
        console.log(`Selected stage ${stageId} from recipe ${recipeId}`);

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
      alert("Please enter a module title");
      return;
    }

    try {
      if (selectedTemplate) {
        await updateTemplate(selectedTemplate.id, formData);
      } else {
        const newTemplateId = await createTemplate(
          formData as Omit<
            PrepListTemplate,
            "id" | "organization_id" | "created_at" | "updated_at"
          >,
        );
        if (newTemplateId) {
          selectTemplate(newTemplateId);
          return; // Don't close the form, allow user to add tasks
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving module:", error);
    }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Process recipes to include stages
  const recipeOptions = recipes.filter(
    (recipe) => !recipe.id.includes("stage_"),
  );

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
            <select
              name="station"
              value={formData.station || ""}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
            >
              <option value="">Select Kitchen Station</option>
              {settings?.kitchen_stations?.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
              <LibraryBig className="w-3 h-3 text-blue-400" />
              Associated Recipe Library Item
            </label>
            <select
              name="recipe_id"
              value={formData.recipe_id || ""}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
            >
              <option value="">Select Recipe or Stage (Optional)</option>
              {recipeOptions.map((recipe) => (
                <React.Fragment key={recipe.id}>
                  <option value={recipe.id}>{recipe.name}</option>

                  {/* Render stages for this recipe if any */}
                  {recipes
                    .filter(
                      (r) =>
                        r.id === recipe.id && r.stages && r.stages.length > 0,
                    )
                    .flatMap((r) =>
                      r.stages.map((stage) => (
                        <option
                          key={`stage_${recipe.id}_${stage.id || stage.name}`}
                          value={`stage_${recipe.id}_${stage.id || stage.name}`}
                        >
                          &nbsp;&nbsp;&nbsp;{stage.name}
                        </option>
                      )),
                    )}
                </React.Fragment>
              ))}
            </select>
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
