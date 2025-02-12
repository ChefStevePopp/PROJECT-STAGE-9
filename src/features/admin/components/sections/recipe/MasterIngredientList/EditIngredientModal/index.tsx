import React from "react";
import { X, Image, Upload, Camera, Trash2 } from "lucide-react";
import { MasterIngredientFormData } from "@/types/master-ingredient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { BasicInformation } from "./BasicInformation";
import { AllergenSection } from "./AllergenSection";
import { RecipeUnits } from "./RecipeUnits";
import { PurchaseUnits } from "./PurchaseUnits";

interface EditIngredientModalProps {
  ingredient: MasterIngredientFormData;
  onClose: () => void;
  onSave: (ingredient: MasterIngredientFormData) => Promise<void>;
  isNew?: boolean;
}

// Function to calculate completion status
const getCompletionStatus = (data: MasterIngredientFormData) => {
  // Required fields for a complete ingredient
  const requiredFields = [
    "product",
    "major_group",
    "category",
    "recipe_unit_type",
    "recipe_unit_per_purchase_unit",
    "current_price",
    "unit_of_measure",
  ];

  // Count how many required fields are filled
  const filledFields = requiredFields.filter((field) => {
    const value = data[field];
    return value !== null && value !== undefined && value !== "" && value !== 0;
  }).length;

  const completionPercentage = (filledFields / requiredFields.length) * 100;

  if (completionPercentage === 100) {
    return { label: "Complete", color: "bg-emerald-500/20 text-emerald-400" };
  } else if (completionPercentage >= 50) {
    return { label: "In Progress", color: "bg-amber-500/20 text-amber-400" };
  } else {
    return { label: "Draft", color: "bg-gray-500/20 text-gray-400" };
  }
};

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  ingredient: initialIngredient,
  onClose,
  onSave,
  isNew = false,
}) => {
  const { organization } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<MasterIngredientFormData>({
    ...initialIngredient,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success("Ingredient saved successfully");
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error saving ingredient:", error);
      toast.error("Failed to save ingredient");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gray-900">
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isNew ? "Create New Ingredient" : formData.product}
                </h2>
                <div className="flex items-center gap-2">
                  {!isNew && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-800 text-gray-300">
                      ID: {formData.id}
                    </span>
                  )}
                  {!isNew && (
                    <span className="text-xs text-gray-400">
                      Last edited:{" "}
                      {new Date(formData.updated_at).toLocaleDateString()}{" "}
                      {new Date(formData.updated_at).toLocaleTimeString()}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      getCompletionStatus(formData).color
                    }`}
                  >
                    {getCompletionStatus(formData).label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-6">
            <BasicInformation
              formData={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
            />

            <PurchaseUnits
              formData={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
            />

            <RecipeUnits
              formData={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
            />

            <AllergenSection
              formData={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
            />

            {/* Image Management Section */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Product Image
                  </h3>
                  <p className="text-sm text-gray-400">
                    Add or update product image
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative aspect-video bg-gray-900/50 rounded-lg overflow-hidden">
                  {formData.image_url ? (
                    <>
                      <img
                        src={formData.image_url}
                        alt={formData.product}
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image_url: null }))
                        }
                        className="absolute top-2 right-2 p-2 bg-gray-900/80 text-gray-400 hover:text-rose-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <Image className="w-12 h-12 mb-2 opacity-50" />
                      <p>No image available</p>
                      <p className="text-sm">
                        Upload, take a photo, or add URL
                      </p>
                    </div>
                  )}
                </div>

                {/* Image Actions */}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-gray-900/50 rounded-lg p-3 border-2 border-dashed border-gray-700 hover:border-blue-400/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          const timestamp = Date.now();
                          const filePath = `${organization?.id}/ingredients/${timestamp}_${file.name}`;

                          const { error: uploadError } = await supabase.storage
                            .from("ingredient-photos")
                            .upload(filePath, file);

                          if (uploadError) throw uploadError;

                          const {
                            data: { publicUrl },
                          } = supabase.storage
                            .from("ingredient-photos")
                            .getPublicUrl(filePath);

                          setFormData((prev) => ({
                            ...prev,
                            image_url: publicUrl,
                          }));
                          toast.success("Image uploaded successfully");
                        } catch (error) {
                          console.error("Error uploading image:", error);
                          toast.error("Failed to upload image");
                        }
                      }}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </label>

                  <button
                    onClick={async () => {
                      try {
                        const stream =
                          await navigator.mediaDevices.getUserMedia({
                            video: true,
                          });
                        const video = document.createElement("video");
                        video.srcObject = stream;
                        await video.play();

                        const canvas = document.createElement("canvas");
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas.getContext("2d")?.drawImage(video, 0, 0);

                        const blob = await new Promise<Blob>((resolve) =>
                          canvas.toBlob((blob) => resolve(blob!)),
                        );
                        stream.getTracks().forEach((track) => track.stop());

                        const timestamp = Date.now();
                        const filePath = `${organization?.id}/ingredients/${timestamp}_photo.jpg`;

                        const { error: uploadError } = await supabase.storage
                          .from("ingredient-photos")
                          .upload(filePath, blob);

                        if (uploadError) throw uploadError;

                        const {
                          data: { publicUrl },
                        } = supabase.storage
                          .from("ingredient-photos")
                          .getPublicUrl(filePath);

                        setFormData((prev) => ({
                          ...prev,
                          image_url: publicUrl,
                        }));
                        toast.success("Photo captured successfully");
                      } catch (error) {
                        console.error("Error capturing photo:", error);
                        toast.error("Failed to capture photo");
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 bg-gray-900/50 rounded-lg p-3 border-2 border-dashed border-gray-700 hover:border-purple-400/50 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </button>
                </div>

                {/* URL Input */}
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Or paste an image URL from supplier website..."
                    value={formData.image_url || ""}
                    onChange={(e) => {
                      if (e.target.value.trim() === "") {
                        setFormData((prev) => ({ ...prev, image_url: null }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          image_url: e.target.value,
                        }));
                      }
                    }}
                    className="input w-full pl-10"
                  />
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Supported formats: JPG, PNG, WebP (max 5MB) or direct image
                  URL
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 bg-gray-900 p-4 border-t border-gray-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
