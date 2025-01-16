<<<<<<< HEAD
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
=======
import React, { useCallback } from "react";
import {
  Book,
  AlertTriangle,
  RefreshCw,
  Upload,
  ImagePlus,
  Printer,
  CheckCircle,
  UtensilsCrossed,
  Calendar,
  Clock,
  User,
  Hash,
  Thermometer,
  Soup,
  Plus,
  Trash2,
  Camera,
  GripVertical,
  ThermometerSun,
  Shield,
  Youtube,
  Link,
  Video,
  PenLine,
  StickyNote,
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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
<<<<<<< HEAD
=======
import { mediaService } from "@/lib/media-service";
import toast from "react-hot-toast";
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa

interface InstructionEditorProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

const SortableStep = ({
  step,
  index,
  onUpdate,
  onDelete,
<<<<<<< HEAD
=======
  recipeId,
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
}: {
  step: RecipeStep;
  index: number;
  onUpdate: (index: number, updates: Partial<RecipeStep>) => void;
  onDelete: (index: number) => void;
  recipeId: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMediaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await mediaService.uploadStepMedia(file, recipeId, step.id);
      onUpdate(index, {
        media: [
          ...(step.media || []),
          {
            id: `media-${Date.now()}`,
            type: file.type.startsWith("image/") ? "image" : "video",
            url,
            title: file.name,
            step_id: step.id,
            is_primary: false,
            sort_order: (step.media || []).length,
          },
        ],
      });
      toast.success("Media uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload media",
      );
    }
  };

  const handleExternalVideoAdd = () => {
    const url = prompt("Enter YouTube or Vimeo URL:");
    if (!url) return;

    // Simple URL validation
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    );
    const vimeoMatch = url.match(/vimeo\.com\/([0-9]+)/);

    if (youtubeMatch) {
      onUpdate(index, {
        media: [
          ...(step.media || []),
          {
            id: `media-${Date.now()}`,
            type: "external-video",
            provider: "youtube",
            url: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
            title: "YouTube Video",
            step_id: step.id,
            sort_order: (step.media || []).length,
          },
        ],
      });
      toast.success("YouTube video added successfully");
    } else if (vimeoMatch) {
      onUpdate(index, {
        media: [
          ...(step.media || []),
          {
            id: `media-${Date.now()}`,
            type: "external-video",
            provider: "vimeo",
            url: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
            title: "Vimeo Video",
            step_id: step.id,
            sort_order: (step.media || []).length,
          },
        ],
      });
      toast.success("Vimeo video added successfully");
    } else {
      toast.error("Invalid YouTube or Vimeo URL");
    }
  };

  const handleMediaDelete = async (mediaUrl: string, mediaIndex: number) => {
    try {
      if (
        !mediaUrl.includes("youtube.com") &&
        !mediaUrl.includes("vimeo.com")
      ) {
        await mediaService.deleteStepMedia(mediaUrl);
      }
      const updatedMedia = [...(step.media || [])];
      updatedMedia.splice(mediaIndex, 1);
      onUpdate(index, { media: updatedMedia });
      toast.success("Media removed successfully");
    } catch (error) {
      toast.error("Failed to delete media");
    }
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
          {/* Step Number */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-white">
                Step {index + 1}
              </span>
              {step.is_critical_control_point && (
                <div className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium">
                  Critical Control Point
                </div>
              )}
              {step.is_quality_control_point && (
                <div className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  Quality Control Point
                </div>
              )}
            </div>
            <button
              onClick={() => onDelete(index)}
              className="text-gray-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Instruction */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <div className="inline-flex items-center gap-2">
                <PenLine className="w-4 h-4 text-emerald-400" />
                <span>Instruction</span>
              </div>
            </label>
            <textarea
              value={step.instruction}
              onChange={(e) => onUpdate(index, { instruction: e.target.value })}
              className="input w-full h-24"
              placeholder="Enter step instruction..."
              required
            />
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                <div className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Time (minutes)</span>
                </div>
              </label>
              <input
                type="number"
                value={step.time_in_minutes || ""}
                onChange={(e) =>
                  onUpdate(index, {
<<<<<<< HEAD
                    time_in_minutes: e.target.value
                      ? parseInt(e.target.value)
                      : null,
=======
                    time_in_minutes: parseInt(e.target.value) || null,
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
                  })
                }
                className="input w-full"
                placeholder="Enter time..."
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                <div className="inline-flex items-center gap-2">
                  <ThermometerSun className="w-4 h-4 text-amber-400" />
                  <span>Temperature</span>
                </div>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
<<<<<<< HEAD
                  value={step.temperature_value || ""}
                  onChange={(e) =>
                    onUpdate(index, {
                      temperature_value: e.target.value
                        ? parseInt(e.target.value)
                        : null,
=======
                  value={step.temperature?.value || ""}
                  onChange={(e) =>
                    onUpdate(index, {
                      temperature: {
                        value: parseInt(e.target.value) || null,
                        unit: step.temperature?.unit || "F",
                      },
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
                    })
                  }
                  className="input flex-1"
                  placeholder="Enter temp..."
                />
                <select
<<<<<<< HEAD
                  value={step.temperature_unit || "F"}
                  onChange={(e) =>
                    onUpdate(index, {
                      temperature_unit: e.target.value as "F" | "C",
=======
                  value={step.temperature?.unit || "F"}
                  onChange={(e) =>
                    onUpdate(index, {
                      temperature: {
                        value: step.temperature?.value || null,
                        unit: e.target.value as "F" | "C",
                      },
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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

          {/* Control Points */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={step.is_quality_control_point}
                onChange={(e) =>
                  onUpdate(index, {
                    is_quality_control_point: e.target.checked,
                  })
                }
                className="checkbox"
              />
              <span className="text-sm text-gray-300">
                Quality Control Point
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={step.is_critical_control_point}
                onChange={(e) =>
                  onUpdate(index, {
                    is_critical_control_point: e.target.checked,
                  })
                }
                className="checkbox"
              />
              <span className="text-sm text-gray-300">
                Critical Control Point
              </span>
            </label>
          </div>

          {/* Warning Level */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <div className="inline-flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Warning Level</span>
              </div>
            </label>
            <select
              value={step.warning_level || "low"}
              onChange={(e) =>
                onUpdate(index, {
                  warning_level: e.target.value as "low" | "medium" | "high",
                })
              }
              className="input w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <div className="inline-flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-purple-400" />
                <span>Notes</span>
              </div>
            </label>
            <textarea
              value={step.notes || ""}
              onChange={(e) => onUpdate(index, { notes: e.target.value })}
              className="input w-full h-20"
              placeholder="Enter additional notes..."
            />
          </div>

          {/* Media Section */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <div className="inline-flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-teal-400" />
                <span>Step Media</span>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(step.media || []).map((media, mediaIndex) => (
                <div
                  key={media.id}
<<<<<<< HEAD
                  className="bg-gray-900/50 rounded-lg p-3 flex items-start gap-2"
=======
                  className="bg-gray-900/50 rounded-lg overflow-hidden"
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
                >
                  <div className="p-3">
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
<<<<<<< HEAD
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
=======
                    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                      {media.type === "external-video" ? (
                        <iframe
                          src={media.url}
                          className="absolute inset-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : media.type === "video" ? (
                        <video
                          src={media.url}
                          className="absolute inset-0 w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={media.url}
                          alt={media.title || "Step image"}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-sm">
                      {media.type === "image" && (
                        <Camera className="w-4 h-4 text-blue-400" />
                      )}
                      {media.type === "video" && (
                        <Video className="w-4 h-4 text-purple-400" />
                      )}
                      {media.type === "external-video" &&
                        (media.provider === "youtube" ? (
                          <Youtube className="w-4 h-4 text-red-400" />
                        ) : (
                          <Link className="w-4 h-4 text-teal-400" />
                        ))}
                      <span className="text-gray-400">
                        {media.type === "image"
                          ? "Image"
                          : media.type === "video"
                            ? "Video"
                            : media.provider === "youtube"
                              ? "YouTube"
                              : "Vimeo"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleMediaDelete(media.url, mediaIndex)}
                      className="p-1 text-gray-400 hover:text-rose-400 hover:bg-gray-800/50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <label className="flex-1 flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-gray-900/50 rounded-lg p-3 border-2 border-dashed border-gray-700 hover:border-blue-400/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <Upload className="w-4 h-4" />
                Upload Media
              </label>
              <button
                onClick={handleExternalVideoAdd}
                className="flex-1 flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 bg-gray-900/50 rounded-lg p-3 border-2 border-dashed border-gray-700 hover:border-purple-400/50 transition-colors"
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
              >
                <Youtube className="w-4 h-4" />
                Add Video URL
              </button>
            </div>
          </div>
<<<<<<< HEAD

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
=======
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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
<<<<<<< HEAD
      recipe_id: recipe.id || "",
=======
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
      instruction: "",
      notes: "",
      warning_level: "low",
      time_in_minutes: null,
<<<<<<< HEAD
      temperature_value: null,
      temperature_unit: "F",
      is_quality_control_point: false,
      is_critical_control_point: false,
      sort_order: recipe.steps?.length || 0,
=======
      temperature: {
        value: null,
        unit: "F",
      },
      is_quality_control_point: false,
      is_critical_control_point: false,
      media: [],
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Book className="w-5 h-5 text-blue-400" />
          </div>
          <div>
<<<<<<< HEAD
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
=======
            <h2 className="text-lg font-medium text-white">
              Recipe Instructions
            </h2>
            <p className="text-sm text-gray-400">
              Add and organize your recipe steps
            </p>
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
          </div>
        </div>
        <button onClick={addStep} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </button>
      </div>

<<<<<<< HEAD
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
=======
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
                recipeId={recipe.id}
              />
            ))}
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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
  );
};
