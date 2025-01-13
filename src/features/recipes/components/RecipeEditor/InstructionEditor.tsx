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
import { mediaService } from "@/lib/media-service";
import toast from "react-hot-toast";

interface InstructionEditorProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

const SortableStep = ({
  step,
  index,
  onUpdate,
  onDelete,
  recipeId,
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
                    time_in_minutes: parseInt(e.target.value) || null,
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
                  value={step.temperature?.value || ""}
                  onChange={(e) =>
                    onUpdate(index, {
                      temperature: {
                        value: parseInt(e.target.value) || null,
                        unit: step.temperature?.unit || "F",
                      },
                    })
                  }
                  className="input flex-1"
                  placeholder="Enter temp..."
                />
                <select
                  value={step.temperature?.unit || "F"}
                  onChange={(e) =>
                    onUpdate(index, {
                      temperature: {
                        value: step.temperature?.value || null,
                        unit: e.target.value as "F" | "C",
                      },
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
                  className="bg-gray-900/50 rounded-lg overflow-hidden"
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
              >
                <Youtube className="w-4 h-4" />
                Add Video URL
              </button>
            </div>
          </div>
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
      media: [],
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
            <h2 className="text-lg font-medium text-white">
              Recipe Instructions
            </h2>
            <p className="text-sm text-gray-400">
              Add and organize your recipe steps
            </p>
          </div>
        </div>
        <button onClick={addStep} className="btn-primary">
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
                recipeId={recipe.id}
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
  );
};
