import React, { useState } from "react";
import {
  Book,
  AlertTriangle,
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
  ChevronDown,
  FilePen,
} from "lucide-react";
// Removed drag and drop imports
import type { RecipeStep, RecipeStage } from "../../types/recipe";
import { mediaService } from "@/lib/media-service";
import toast from "react-hot-toast";

interface SortableStepProps {
  step: RecipeStep;
  index: number;
  onUpdate: (index: number, updates: Partial<RecipeStep>) => void;
  onDelete: (index: number) => void;
  recipeId: string;
  stages?: RecipeStage[];
}

const SortableStep: React.FC<SortableStepProps> = ({
  step,
  index,
  onUpdate,
  onDelete,
  recipeId,
  stages = [],
}) => {
  // Removed drag and drop functionality

  // State for custom stage label editing
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [customStageLabel, setCustomStageLabel] = useState(
    step.custom_stage_label || "",
  );

  // State for custom step label editing
  const [isEditingStepLabel, setIsEditingStepLabel] = useState(false);
  const [customStepLabel, setCustomStepLabel] = useState(
    step.custom_step_label || "",
  );

  // State for expandable sections
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);

  // Handle saving custom stage label
  const handleSaveCustomStage = () => {
    onUpdate(index, { custom_stage_label: customStageLabel });
    setIsEditingStage(false);
  };

  // Handle saving custom step label
  const handleSaveCustomStepLabel = () => {
    onUpdate(index, { custom_step_label: customStepLabel });
    setIsEditingStepLabel(false);
  };

  // Removed drag and drop style

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

    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    );
    const vimeoMatch = url.match(/vimeo\.com\/([0-9]+)/);

    if (youtubeMatch || vimeoMatch) {
      const provider = youtubeMatch ? "youtube" : "vimeo";
      const videoId = youtubeMatch ? youtubeMatch[1] : vimeoMatch![1];
      const embedUrl =
        provider === "youtube"
          ? `https://www.youtube.com/embed/${videoId}`
          : `https://player.vimeo.com/video/${videoId}`;

      onUpdate(index, {
        media: [
          ...(step.media || []),
          {
            id: `media-${Date.now()}`,
            type: "external-video",
            provider,
            url: embedUrl,
            title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Video`,
            step_id: step.id,
            sort_order: (step.media || []).length,
          },
        ],
      });
      toast.success(`${provider} video added successfully`);
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
    <div className="bg-gray-800/50 rounded-lg p-5 space-y-4">
      <div className="flex items-start gap-4">
        {/* Removed drag handle */}

        <div className="flex-grow space-y-4">
          {/* Step Number, Stage and Control Points */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditingStepLabel ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customStepLabel}
                    onChange={(e) => setCustomStepLabel(e.target.value)}
                    className="input py-0.5 px-2 text-sm bg-gray-800 border-gray-700 w-64"
                    placeholder="Custom step label..."
                    autoFocus
                    onBlur={handleSaveCustomStepLabel}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSaveCustomStepLabel()
                    }
                  />
                  <button
                    onClick={handleSaveCustomStepLabel}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-lg font-medium text-white">
                    {step.custom_step_label || `Step ${index + 1}`}
                  </span>
                  <button
                    onClick={() => setIsEditingStepLabel(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors ml-2"
                  >
                    <PenLine className="w-4 h-4" />
                  </button>
                </div>
              )}
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
              {step.is_safety_warning && (
                <div
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    step.warning_level === "low"
                      ? "bg-amber-500/20 text-amber-400"
                      : step.warning_level === "medium"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-red-600 text-white"
                  }`}
                >
                  {step.warning_level === "low"
                    ? "Low Safety Warning"
                    : step.warning_level === "medium"
                      ? "Medium Safety Warning"
                      : "High Safety Warning"}
                </div>
              )}
            </div>

            {/* Stage Selector Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-400/30 mr-1">Assign Stage</p>
                <FilePen className="w-5 h-5 text-blue-400 mr-2" />
                <select
                  value={step.stage_id || ""}
                  onChange={(e) => {
                    onUpdate(index, {
                      stage_id: e.target.value || undefined,
                    });
                  }}
                  className="stage-dropdown input py-2 px-3 text-sm bg-gray-800 border-gray-700"
                >
                  <option value="">No stage</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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

          {/* Time, Temperature, and Delay */}
          <div className="grid grid-cols-3 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                <div className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Delay After Step</span>
                </div>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={step.delay?.value || ""}
                  onChange={(e) =>
                    onUpdate(index, {
                      delay: {
                        value: parseInt(e.target.value) || null,
                        unit: step.delay?.unit || "minutes",
                      },
                    })
                  }
                  className="input flex-1"
                  placeholder="Enter delay..."
                />
                <select
                  value={step.delay?.unit || "minutes"}
                  onChange={(e) =>
                    onUpdate(index, {
                      delay: {
                        value: step.delay?.value || null,
                        unit: e.target.value as "minutes" | "hours" | "days",
                      },
                    })
                  }
                  className="input w-24"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prep List Task - only shown if step is not in a stage */}
          {!step.stage_id && (
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={step.is_prep_list_task}
                  onChange={(e) =>
                    onUpdate(index, {
                      is_prep_list_task: e.target.checked,
                    })
                  }
                  className="checkbox"
                />
                <span className="text-sm text-gray-300">Prep List Task</span>
              </label>
            </div>
          )}

          {/* Warnings Section */}
          <div className="expandable-info-section">
            <button
              type="button"
              className="expandable-info-header"
              onClick={() => setIsWarningExpanded(!isWarningExpanded)}
            >
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <div className="flex-grow text-left">
                <h3 className="text-sm font-medium text-white">
                  Step Warnings
                </h3>
                <p className="text-xs text-gray-400">
                  Add control points, safety warnings and caution levels
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isWarningExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {isWarningExpanded && (
              <div className="expandable-info-content">
                {/* Control Points and Warning Level */}
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Warning Level</span>
                    </div>
                  </label>
                  <div className="flex items-center gap-4">
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
                        Quality Control
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
                        Critical Control
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={step.is_safety_warning}
                        onChange={(e) =>
                          onUpdate(index, {
                            is_safety_warning: e.target.checked,
                          })
                        }
                        className="checkbox"
                      />
                      <span className="text-sm text-gray-300">
                        Safety Warning
                      </span>
                    </label>
                  </div>
                </div>
                <select
                  value={step.warning_level || "low"}
                  onChange={(e) =>
                    onUpdate(index, {
                      warning_level: e.target.value as
                        | "low"
                        | "medium"
                        | "high",
                    })
                  }
                  className="input w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                {/* Warning Notes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    <div className="inline-flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-rose-400" />
                      <span>Warning Notes</span>
                    </div>
                  </label>
                  <textarea
                    value={step.notes || ""}
                    onChange={(e) => onUpdate(index, { notes: e.target.value })}
                    className="input w-full h-20"
                    placeholder="Enter notes related to warnings and control points..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Media Section */}
          <div className="expandable-info-section mt-4">
            <button
              type="button"
              className="expandable-info-header"
              onClick={() => setIsMediaExpanded(!isMediaExpanded)}
            >
              <ImagePlus className="w-5 h-5 text-teal-400" />
              <div className="flex-grow text-left">
                <h3 className="text-sm font-medium text-white">Step Media</h3>
                <p className="text-xs text-gray-400">
                  Add photos, videos, or external media links
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${isMediaExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {isMediaExpanded && (
              <div className="expandable-info-content">
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
                          onClick={() =>
                            handleMediaDelete(media.url, mediaIndex)
                          }
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
            )}
          </div>

          {/* Delete Button - Moved below media section */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => onDelete(index)}
              className="btn-ghost-red flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortableStep;
