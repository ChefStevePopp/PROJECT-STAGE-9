import React, { useState, useEffect } from "react";
import {
  Book,
  Plus,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
// Removed DnD imports
import { arrayMove } from "@dnd-kit/sortable";
import type { Recipe, RecipeStep, RecipeStage } from "../../types/recipe";
import { mediaService } from "@/lib/media-service";
import toast from "react-hot-toast";
import SortableStep from "./SortableStep";
import StageList from "./StageList";

interface InstructionEditorProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const InstructionEditor: React.FC<InstructionEditorProps> = ({
  recipe,
  onChange,
}) => {
  // Removed DnD sensors

  const handleStepChange = (index: number, updates: Partial<RecipeStep>) => {
    const updatedSteps = [...(recipe.steps || [])];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    onChange({ steps: updatedSteps });
  };

  const addStep = (stageId?: string) => {
    const newStep: RecipeStep = {
      id: `step-${Date.now()}`,
      instruction: "",
      notes: "",
      warning_level: "low",
      time_in_minutes: null,
      temperature: {
        value: null,
        unit: "F",
      },
      is_quality_control_point: false,
      is_critical_control_point: false,
      is_prep_list_task: false,
      stage: "",
      custom_stage_label: null,
      custom_step_label: null,
      delay: {
        value: null,
        unit: "minutes",
      },
      media: [],
      stage_id: stageId,
    };

    onChange({
      steps: [...(recipe.steps || []), newStep],
    });
  };

  const removeStep = async (index: number) => {
    const step = recipe.steps[index];

    // Delete all media associated with the step
    if (step.media?.length) {
      try {
        await Promise.all(
          step.media
            .filter((media) => media.type !== "external-video")
            .map((media) => mediaService.deleteStepMedia(media.url)),
        );
      } catch (error) {
        console.error("Error deleting step media:", error);
        toast.error("Some media files could not be deleted");
      }
    }

    const updatedSteps = (recipe.steps || []).filter((_, i) => i !== index);
    onChange({ steps: updatedSteps });
  };

  // Reordering functions
  const moveStepUp = (index: number) => {
    if (index > 0) {
      const newSteps = arrayMove(recipe.steps || [], index, index - 1);
      onChange({ steps: newSteps });
      setCurrentStepIndex(index - 1);
    }
  };

  const moveStepDown = (index: number) => {
    if (index < (recipe.steps?.length || 0) - 1) {
      const newSteps = arrayMove(recipe.steps || [], index, index + 1);
      onChange({ steps: newSteps });
      setCurrentStepIndex(index + 1);
    }
  };

  // Group steps by stage and calculate total time for each stage
  const getStepsByStage = () => {
    const stepsWithoutStage = (recipe.steps || []).filter(
      (step) => !step.stage_id,
    );
    const stepsWithStage = (recipe.steps || []).filter((step) => step.stage_id);

    const stepsByStage = {};

    // Initialize with empty arrays for each stage
    (recipe.stages || []).forEach((stage) => {
      stepsByStage[stage.id] = [];
    });

    // Add steps to their respective stages
    stepsWithStage.forEach((step) => {
      if (step.stage_id && stepsByStage[step.stage_id]) {
        stepsByStage[step.stage_id].push(step);
      }
    });

    return { stepsWithoutStage, stepsByStage };
  };

  const { stepsWithoutStage, stepsByStage } = getStepsByStage();

  // Calculate total time for each stage
  useEffect(() => {
    if (
      recipe.stages &&
      recipe.stages.length > 0 &&
      recipe.steps &&
      recipe.steps.length > 0
    ) {
      const stageTotalTimes = {};

      // Initialize total times to 0
      recipe.stages.forEach((stage) => {
        stageTotalTimes[stage.id] = 0;
      });

      // Calculate total time for each stage
      recipe.steps.forEach((step) => {
        if (step.stage_id && step.time_in_minutes) {
          stageTotalTimes[step.stage_id] =
            (stageTotalTimes[step.stage_id] || 0) + step.time_in_minutes;
        }
      });

      // Check if any total times need to be updated
      let hasChanges = false;
      const updatedStages = recipe.stages.map((stage) => {
        if (stageTotalTimes[stage.id] !== stage.total_time) {
          hasChanges = true;
          return { ...stage, total_time: stageTotalTimes[stage.id] };
        }
        return stage;
      });

      // Only update if there are changes
      if (hasChanges) {
        onChange({ stages: updatedStages });
      }
    }
  }, [recipe.steps, recipe.stages]);

  // Calculate total time for each stage
  useEffect(() => {
    if (
      recipe.stages &&
      recipe.stages.length > 0 &&
      recipe.steps &&
      recipe.steps.length > 0
    ) {
      const stageTotalTimes = {};

      // Initialize total times to 0
      recipe.stages.forEach((stage) => {
        stageTotalTimes[stage.id] = 0;
      });

      // Calculate total time for each stage
      recipe.steps.forEach((step) => {
        if (step.stage_id && step.time_in_minutes) {
          stageTotalTimes[step.stage_id] =
            (stageTotalTimes[step.stage_id] || 0) + step.time_in_minutes;
        }
      });

      // Check if any total times need to be updated
      let hasChanges = false;
      const updatedStages = recipe.stages.map((stage) => {
        if (stageTotalTimes[stage.id] !== stage.total_time) {
          hasChanges = true;
          return { ...stage, total_time: stageTotalTimes[stage.id] };
        }
        return stage;
      });

      // Only update if there are changes
      if (hasChanges) {
        onChange({ stages: updatedStages });
      }
    }
  }, [recipe.steps, recipe.stages]);

  // Step slider state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<RecipeStep[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);

  // Update visible steps when recipe steps change
  useEffect(() => {
    const allSteps = recipe.steps || [];
    setTotalSteps(allSteps.length);

    // Reset current index if it's out of bounds
    if (currentStepIndex >= allSteps.length && allSteps.length > 0) {
      setCurrentStepIndex(allSteps.length - 1);
    }

    // Show current step and next step if available
    if (allSteps.length > 0) {
      const startIdx = Math.max(0, currentStepIndex);
      const endIdx = Math.min(startIdx + 1, allSteps.length - 1);
      setVisibleSteps(allSteps.slice(startIdx, endIdx + 1));
    } else {
      setVisibleSteps([]);
    }
  }, [recipe.steps, currentStepIndex]);

  // Navigation functions
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < (recipe.steps?.length || 0) - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const saveAndGoToNextStep = () => {
    // Save is automatic since we're using controlled components
    // Just navigate to next step
    if (currentStepIndex < (recipe.steps?.length || 0) - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // If we're on the last step, add a new step and go to it
      addStep();
      setCurrentStepIndex(recipe.steps?.length || 0);
    }
  };

  // Add a step to a specific stage
  const addStepToStage = (stageId: string) => {
    addStep(stageId);
  };

  return (
    <div className="space-y-6">
      {/* Stage Management Section */}
      <StageList recipe={recipe} onChange={onChange} />

      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Book className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">
              Recipe Instructions
            </h2>
            <p className="text-sm text-gray-400">
              Add and organize your recipe steps
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveAndGoToNextStep} className="btn-ghost-green">
            <Save className="w-4 h-4 mr-2" />
            Save & Next
          </button>
          <button onClick={() => addStep()} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </button>
        </div>
      </div>

      {/* Step Navigation Controls moved to bottom */}

      {/* Current Step View */}
      <div className="space-y-4">
        {visibleSteps.length > 0 ? (
          visibleSteps.map((step, index) => {
            const realIndex = recipe.steps.findIndex((s) => s.id === step.id);
            return (
              <SortableStep
                key={step.id}
                step={step}
                index={realIndex}
                onUpdate={handleStepChange}
                onDelete={removeStep}
                recipeId={recipe.id}
                stages={recipe.stages || []}
              />
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            No steps added yet. Click "Add Step" to begin building your recipe
            instructions.
          </div>
        )}

        {/* Main Step Navigation Controls with Reordering */}
        {totalSteps > 0 && (
          <div className="flex items-center justify-center mt-6 mb-4 bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="btn-ghost disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Step {currentStepIndex + 1} of {totalSteps || 1}
              </span>
              <button
                onClick={goToNextStep}
                disabled={currentStepIndex >= totalSteps - 1}
                className="btn-ghost disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Reordering Controls */}
              <div className="border-l border-gray-700 pl-3 ml-3 flex items-center gap-2">
                <button
                  onClick={() => moveStepUp(currentStepIndex)}
                  disabled={currentStepIndex === 0}
                  className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:text-gray-600 p-1 rounded-md hover:bg-gray-700/50"
                  title="Move step up"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                </button>
                <button
                  onClick={() => moveStepDown(currentStepIndex)}
                  disabled={currentStepIndex >= totalSteps - 1}
                  className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:text-gray-600 p-1 rounded-md hover:bg-gray-700/50"
                  title="Move step down"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stage Overview Section */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Step Overview by Stage
          </h3>
          <button
            onClick={() => setCurrentStepIndex(0)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Go to First Step
          </button>
        </div>

        {/* Unstaged Steps Overview */}
        {stepsWithoutStage.length > 0 && (
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-400 mb-2 pb-2 border-b border-gray-700">
              Unstaged Steps ({stepsWithoutStage.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stepsWithoutStage.map((step, index) => {
                const realIndex = recipe.steps.findIndex(
                  (s) => s.id === step.id,
                );
                return (
                  <div
                    key={step.id}
                    className="bg-gray-800/30 p-3 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
                    onClick={() => setCurrentStepIndex(realIndex)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {step.custom_step_label || `Step ${realIndex + 1}`}
                      </span>
                      {step.is_prep_list_task && (
                        <span className="text-2xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                          Prep
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {step.instruction}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Staged Steps Overview */}
        {(recipe.stages || []).map((stage) => (
          <div key={stage.id} className="mb-6">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500/50"></div>
                <h3 className="text-sm font-medium text-white">{stage.name}</h3>
                {stage.is_prep_list_task && (
                  <span className="text-2xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                    Prep List Task
                  </span>
                )}
                {stage.total_time > 0 && (
                  <span className="text-2xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                    {stage.total_time} min
                  </span>
                )}
              </div>
            </div>

            {(stepsByStage[stage.id] || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(stepsByStage[stage.id] || []).map((step) => {
                  const realIndex = recipe.steps.findIndex(
                    (s) => s.id === step.id,
                  );
                  return (
                    <div
                      key={step.id}
                      className="bg-gray-800/30 p-3 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
                      onClick={() => setCurrentStepIndex(realIndex)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {step.custom_step_label || `Step ${realIndex + 1}`}
                        </span>
                        {step.is_critical_control_point && (
                          <span className="text-2xs bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full">
                            CCP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {step.instruction}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 italic text-xs">
                No steps in this stage yet. Add a step or drag existing steps
                here.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
