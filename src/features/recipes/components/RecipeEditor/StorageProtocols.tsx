import React from "react";
import {
  MapPin,
  Upload,
  Trash2,
  Package,
  Clock,
  ThermometerSun,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";
import { mediaService } from "@/lib/media-service";
import type { Recipe } from "../../types/recipe";
import toast from "react-hot-toast";

interface StorageProtocolsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const StorageProtocols: React.FC<StorageProtocolsProps> = ({
  recipe,
  onChange,
}) => {
  const { settings } = useOperationsStore();
  const storageAreas = settings?.storage_areas || [];
  const storageContainers = settings?.storage_containers || [];
  const containerTypes = settings?.container_types || [];

  const handleImageUpload = async (
    type: "primary" | "secondary",
    file: File,
  ) => {
    try {
      const url = await mediaService.uploadStorageImage(file);
      onChange({
        storage: {
          ...recipe.storage,
          [`${type === "primary" ? "primary" : "secondary"}_image_url`]: url,
        },
      });
      toast.success(
        `${type === "primary" ? "Primary" : "Secondary"} storage image uploaded`,
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleImageDelete = async (type: "primary" | "secondary") => {
    try {
      const imageUrl =
        type === "primary"
          ? recipe.storage?.primary_image_url
          : recipe.storage?.secondary_image_url;
      if (imageUrl) {
        await mediaService.deleteStorageImage(imageUrl);
        onChange({
          storage: {
            ...recipe.storage,
            [`${type === "primary" ? "primary" : "secondary"}_image_url`]: null,
          },
        });
        toast.success(
          `${type === "primary" ? "Primary" : "Secondary"} storage image removed`,
        );
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="space-y-6">
      {/* Storage Location */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Storage Location</h3>
            <p className="text-sm text-gray-400">
              Define where and how this item should be stored
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Container Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Storage Container
                </label>
                <select
                  value={recipe.storage?.container || ""}
                  onChange={(e) =>
                    onChange({
                      storage: { ...recipe.storage, container: e.target.value },
                    })
                  }
                  className="input w-full"
                >
                  <option value="">Select container...</option>
                  {storageContainers.map((container) => (
                    <option key={container} value={container}>
                      {container}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Container Type
                </label>
                <select
                  value={recipe.storage?.container_type || ""}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        container_type: e.target.value,
                      },
                    })
                  }
                  className="input w-full"
                >
                  <option value="">Select type...</option>
                  {containerTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Storage Areas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Primary Storage Area
                </label>
                <select
                  value={recipe.storage?.primary_area || ""}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        primary_area: e.target.value,
                      },
                    })
                  }
                  className="input w-full"
                >
                  <option value="">Select area...</option>
                  {storageAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Secondary Storage Area (Optional)
                </label>
                <select
                  value={recipe.storage?.secondary_area || ""}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        secondary_area: e.target.value,
                      },
                    })
                  }
                  className="input w-full"
                >
                  <option value="">Select area...</option>
                  {storageAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Storage Images */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Primary Storage Image
              </label>
              {recipe.storage?.primary_image_url ? (
                <div className="relative">
                  <img
                    src={recipe.storage.primary_image_url}
                    alt="Primary storage location"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleImageDelete("primary")}
                    className="absolute top-2 right-2 p-1.5 bg-gray-900/80 text-gray-400 hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-700 rounded-lg hover:border-primary-500/50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">
                    Upload primary storage image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("primary", file);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Secondary Storage Image (Optional)
              </label>
              {recipe.storage?.secondary_image_url ? (
                <div className="relative">
                  <img
                    src={recipe.storage.secondary_image_url}
                    alt="Secondary storage location"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleImageDelete("secondary")}
                    className="absolute top-2 right-2 p-1.5 bg-gray-900/80 text-gray-400 hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-700 rounded-lg hover:border-primary-500/50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">
                    Upload secondary storage image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("secondary", file);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Storage Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Storage Notes
              </label>
              <textarea
                value={recipe.storage?.notes || ""}
                onChange={(e) =>
                  onChange({
                    storage: { ...recipe.storage, notes: e.target.value },
                  })
                }
                className="input w-full"
                rows={3}
                placeholder="Enter any additional storage notes or special instructions..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shelf Life Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Shelf Life</h3>
            <p className="text-sm text-gray-400">
              Set storage duration and expiration guidelines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Duration Time
                </label>
                <input
                  type="number"
                  value={recipe.storage?.shelf_life_duration || ""}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        shelf_life_duration: parseInt(e.target.value) || null,
                      },
                    })
                  }
                  className="input w-full"
                  min="0"
                  placeholder="Enter duration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Unit of Time
                </label>
                <select
                  value={recipe.storage?.shelf_life_unit || "days"}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        shelf_life_unit: e.target.value,
                      },
                    })
                  }
                  className="input w-full"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <input
                  type="checkbox"
                  checked={recipe.storage?.thawing_required || false}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        thawing_required: e.target.checked,
                      },
                    })
                  }
                  className="checkbox"
                />
                Requires Thawing
              </label>
              {recipe.storage?.thawing_required && (
                <textarea
                  value={recipe.storage?.thawing_instructions || ""}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        thawing_instructions: e.target.value,
                      },
                    })
                  }
                  className="input w-full mt-2"
                  placeholder="Enter thawing instructions..."
                  rows={2}
                />
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Expiration Guidelines
              </label>
              <textarea
                value={recipe.storage?.expiration_guidelines || ""}
                onChange={(e) =>
                  onChange({
                    storage: {
                      ...recipe.storage,
                      expiration_guidelines: e.target.value,
                    },
                  })
                }
                className="input w-full"
                rows={4}
                placeholder="Enter guidelines for determining expiration..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Controls */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <ThermometerSun className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Temperature Controls
            </h3>
            <p className="text-sm text-gray-400">
              Set temperature requirements and tolerances
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Storage Temp
                </label>
                <input
                  type="number"
                  value={recipe.storage?.storage_temp || ""}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        storage_temp: parseInt(e.target.value) || null,
                      },
                    })
                  }
                  className="input w-full"
                  placeholder="Temperature"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Unit
                </label>
                <select
                  value={recipe.storage?.storage_temp_unit || "F"}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        storage_temp_unit: e.target.value,
                      },
                    })
                  }
                  className="input w-full"
                >
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Tolerance (±)
                </label>
                <input
                  type="number"
                  value={recipe.storage?.temp_tolerance || ""}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        temp_tolerance: parseInt(e.target.value) || null,
                      },
                    })
                  }
                  className="input w-full"
                  min="0"
                  placeholder="Range"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Unit
                </label>
                <select
                  value={recipe.storage?.temp_tolerance_unit || "F"}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        temp_tolerance_unit: e.target.value,
                      },
                    })
                  }
                  className="input w-full"
                >
                  <option value="F">°F</option>
                  <option value="C">°C</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <input
                  type="checkbox"
                  checked={recipe.storage?.is_critical_control_point || false}
                  onChange={(e) =>
                    onChange({
                      storage: {
                        ...recipe.storage,
                        is_critical_control_point: e.target.checked,
                      },
                    })
                  }
                  className="checkbox"
                />
                Critical Control Point
              </label>
              {recipe.storage?.is_critical_control_point && (
                <div className="mt-2 p-3 bg-rose-500/10 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    This item requires strict temperature monitoring and
                    documentation
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Temperature Notes
              </label>
              <textarea
                value={recipe.storage?.temperature_notes || ""}
                onChange={(e) =>
                  onChange({
                    storage: {
                      ...recipe.storage,
                      temperature_notes: e.target.value,
                    },
                  })
                }
                className="input w-full"
                rows={3}
                placeholder="Enter any additional temperature control notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
