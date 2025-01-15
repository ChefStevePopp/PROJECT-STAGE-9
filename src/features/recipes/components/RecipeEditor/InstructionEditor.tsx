import React from "react";
import {
  Book,
  Info,
  Plus,
  Trash2,
  Camera,
  AlertCircle,
  GripVertical,
  ThermometerSun,
} from "lucide-react";
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
import type { Recipe, RecipeStep } from "../../types/recipe";

interface InstructionEditorProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

const SortableStep = ({
  step,
  index,
  onUpdate,
  onDelete,
}: {
  step: RecipeStep;
  index: number;
  onUpdate: (index: number, updates: Partial<RecipeStep>) => void;
  onDelete: (index: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800/50 rounded-lg p-4 space-y-4"
    >
      <div className="flex items-start gap-4">
        <div {...attributes} {...listeners} className="mt-2 cursor-grab">
          <GripVertical className="w-5 h-5 text-gray-500 hover:text-gray-400" />
        </div>

        <div className="flex-grow space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-primary-400">
              Step {index + 1}
            </span>
            <button
              onClick={() => onDelete(index)}
              className="text-gray-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Instruction
            </label>
            <textarea
              value={step.instruction}
              onChange={(e) => onUpdate(index, { instruction: e.target.value })}
              className="input w-full h-24"
              placeholder="Describe the step clearly and concisely..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Time Required (minutes)
              </label>
              <input
                type="number"
                value={step.time_in_minutes || ""}
                onChange={(e) =>
                  onUpdate(index, {
                    time_in_minutes: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="input w-full"
                placeholder="Duration"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Temperature (if applicable)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={step.temperature_value || ""}
                  onChange={(e) =>
                    onUpdate(index, {
                      temperature_value: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="input flex-1"
                  placeholder="Temperature"
                />
                <select
                  value={step.temperature_unit || "F"}
                  onChange={(e) =>
                    onUpdate(index, {
                      temperature_unit: e.target.value as "F" | "C",
                    })
                  }
                  className="input w-20"
                >
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Notes
            </label>
            <textarea
              value={step.notes || ""}
              onChange={(e) => onUpdate(index, { notes: e.target.value })}
              className="input w-full h-20"
              placeholder="Add any additional notes, warnings, or tips..."
            />
          </div>

          {/* Media Section */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Step Media
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(step.media || []).map((media, mediaIndex) => (
                <div
                  key={media.id}
                  className="bg-gray-900/50 rounded-lg p-3 flex items-start gap-2"
                >
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={media.title || ""}
                      onChange={(e) => {
                        const updatedMedia = [...(step.media || [])];
                        updatedMedia[mediaIndex] = {
                          ...media,
                          title: e.target.value,
                        };
                        onUpdate(index, { media: updatedMedia });
                      }}
                      className="input w-full mb-2"
                      placeholder="Media title..."
                    />
                    <input
                      type="text"
                      value={media.url || ""}
                      onChange={(e) => {
                        const updatedMedia = [...(step.media || [])];
                        updatedMedia[mediaIndex] = {
                          ...media,
                          url: e.target.value,
                        };
                        onUpdate(index, { media: updatedMedia });
                      }}
                      className="input w-full text-sm"
                      placeholder="Media URL..."
                    />
                  </div>
                  <button
                    onClick={() => {
                      const updatedMedia = (step.media || []).filter(
                        (_, i) => i !== mediaIndex,
                      );
                      onUpdate(index, { media: updatedMedia });
                    }}
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  const newMedia = {
                    id: `media-${Date.now()}`,
                    type: "image",
                    url: "",
                    title: "",
                    step_id: step.id,
                    is_primary: false,
                    sort_order: (step.media || []).length,
                  };
                  onUpdate(index, {
                    media: [...(step.media || []), newMedia],
                  });
                }}
                className="flex items-center justify-center gap-2 text-sm text-primary-400 hover:text-primary-300 bg-gray-900/50 rounded-lg p-3 border-2 border-dashed border-gray-700 hover:border-primary-400/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Media
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-700 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={step.is_quality_control_point || false}
                onChange={(e) =>
                  onUpdate(index, {
                    is_quality_control_point: e.target.checked,
                  })
                }
                className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500"
              />
              <span className="text-sm text-gray-300">
                Quality Control Point
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={step.is_critical_control_point || false}
                onChange={(e) =>
                  onUpdate(index, {
                    is_critical_control_point: e.target.checked,
                  })
                }
                className="form-checkbox rounded bg-gray-700 border-gray-600 text-rose-500"
              />
              <span className="text-sm text-gray-300">
                Critical Control Point
              </span>
            </label>
          </div>

          {step.is_critical_control_point && (
            <div className="bg-rose-500/10 rounded-lg p-4 mt-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-rose-400 font-medium">
                  Critical Control Point
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  This step requires specific monitoring and documentation.
                  Ensure all quality checks are performed and recorded.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const InstructionEditor: React.FC<InstructionEditorProps> = ({
  recipe,
  onChange,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleStepChange = (index: number, updates: Partial<RecipeStep>) => {
    const updatedSteps = [...(recipe.steps || [])];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    onChange({ steps: updatedSteps });
  };

  const addStep = () => {
    const newStep: RecipeStep = {
      id: `step-${Date.now()}`,
      recipe_id: recipe.id || "",
      instruction: "",
      notes: "",
      warning_level: "low",
      time_in_minutes: null,
      temperature_value: null,
      temperature_unit: "F",
      is_quality_control_point: false,
      is_critical_control_point: false,
      sort_order: recipe.steps?.length || 0,
    };

    onChange({
      steps: [...(recipe.steps || []), newStep],
    });
  };

  const removeStep = (index: number) => {
    const updatedSteps = (recipe.steps || []).filter((_, i) => i !== index);
    onChange({ steps: updatedSteps });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = recipe.steps?.findIndex((step) => step.id === active.id);
      const newIndex = recipe.steps?.findIndex((step) => step.id === over.id);
      if (oldIndex !== undefined && newIndex !== undefined) {
        const newSteps = arrayMove(recipe.steps || [], oldIndex, newIndex);
        onChange({ steps: newSteps });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Book className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Instructions Editor Guide
            </h3>
            <p className="text-gray-400 mt-1">
              Create clear, detailed instructions for consistent recipe
              execution.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Best Practices
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-gray-400">
                    <li>• Write clear, action-oriented instructions</li>
                    <li>• Include specific measurements and temperatures</li>
                    <li>• Note quality control points and critical steps</li>
                    <li>• Add relevant warnings and tips</li>
                    <li>• Use consistent terminology</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Media Support
                  </p>
                  <p className="text-sm text-gray-400">
                    Add photos or videos in the Media section to illustrate
                    specific techniques or quality standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ThermometerSun className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Temperature & Time
                  </p>
                  <p className="text-sm text-gray-400">
                    Always specify temperatures and times for critical steps.
                    Mark steps requiring temperature monitoring as Critical
                    Control Points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Editor */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-white">Recipe Steps</h3>
          <button onClick={addStep} className="btn-ghost text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={(recipe.steps || []).map((step) => step.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {(recipe.steps || []).map((step, index) => (
                <SortableStep
                  key={step.id}
                  step={step}
                  index={index}
                  onUpdate={handleStepChange}
                  onDelete={removeStep}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {(!recipe.steps || recipe.steps.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            No steps added yet. Click "Add Step" to begin building your recipe
            instructions.
          </div>
        )}
      </div>
    </div>
  );
};
