import React from "react";
import { Image, Upload, Camera, Trash2 } from "lucide-react";
import { ModalHeader } from "./ModalHeader";
import { MasterIngredient } from "@/types/master-ingredient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { BasicInformation } from "./BasicInformation";
import { AllergenSection } from "./AllergenSection";
import { RecipeUnits } from "./RecipeUnits";
import { PurchaseUnits } from "./PurchaseUnits";
import toast from "react-hot-toast";

interface EditIngredientModalProps {
  ingredient: MasterIngredient;
  onClose: () => void;
  onSave: (ingredient: MasterIngredient) => Promise<void>;
  isNew?: boolean;
}

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  ingredient: initialIngredient,
  onClose,
  onSave,
  isNew = false,
}) => {
  const { organization, user, isDev } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Debug session info
  React.useEffect(() => {
    console.log("Auth debug:", {
      organization,
      orgId: organization?.id,
      user,
      metadata: user?.user_metadata,
      isDev,
    });
  }, [organization, user, isDev]);

  // Check user permissions
  React.useEffect(() => {
    const checkPermissions = async () => {
      // Skip permission check for dev users
      if (isDev) return;

      if (!organization?.id || !user?.id) {
        toast.error("Missing organization or user information");
        onClose();
        return;
      }

      const { data: roles } = await supabase
        .from("organization_roles")
        .select("role")
        .eq("organization_id", organization.id)
        .eq("user_id", user.id)
        .single();

      if (!roles || !["owner", "admin"].includes(roles.role)) {
        toast.error("You do not have permission to manage ingredients");
        onClose();
      }
    };

    checkPermissions();
  }, [organization?.id, user?.id, onClose, isDev]);

  // Get the organization ID upfront
  const orgId = React.useMemo(() => {
    const id = organization?.id;
    if (!id) {
      console.warn("Organization ID not available");
    }
    return id;
  }, [organization]);

  const [formData, setFormData] = React.useState<MasterIngredient>(() => {
    if (!orgId) {
      console.error("No organization ID available for form initialization");
    }

    return {
      id: initialIngredient.id || crypto.randomUUID(),
      // Explicitly set organization_id from auth context
      organization_id: orgId || "",
      product: initialIngredient.product || "",
      major_group: initialIngredient.major_group || null,
      category: initialIngredient.category || null,
      sub_category: initialIngredient.sub_category || null,
      vendor: initialIngredient.vendor || "",
      item_code: initialIngredient.item_code || null,
      case_size: initialIngredient.case_size || "",
      units_per_case: initialIngredient.units_per_case || 0,
      recipe_unit_type: initialIngredient.recipe_unit_type || "",
      yield_percent: initialIngredient.yield_percent || 100,
      cost_per_recipe_unit: initialIngredient.cost_per_recipe_unit || 0,
      current_price: initialIngredient.current_price || 0,
      recipe_unit_per_purchase_unit:
        initialIngredient.recipe_unit_per_purchase_unit || 0,
      unit_of_measure: initialIngredient.unit_of_measure || "",
      storage_area: initialIngredient.storage_area || "",
      image_url: initialIngredient.image_url || null,
      created_at: initialIngredient.created_at || new Date().toISOString(),
      updated_at: initialIngredient.updated_at || new Date().toISOString(),
      // Allergen fields with default false
      allergen_peanut: initialIngredient.allergen_peanut || false,
      allergen_crustacean: initialIngredient.allergen_crustacean || false,
      allergen_treenut: initialIngredient.allergen_treenut || false,
      allergen_shellfish: initialIngredient.allergen_shellfish || false,
      allergen_sesame: initialIngredient.allergen_sesame || false,
      allergen_soy: initialIngredient.allergen_soy || false,
      allergen_fish: initialIngredient.allergen_fish || false,
      allergen_wheat: initialIngredient.allergen_wheat || false,
      allergen_milk: initialIngredient.allergen_milk || false,
      allergen_sulphite: initialIngredient.allergen_sulphite || false,
      allergen_egg: initialIngredient.allergen_egg || false,
      allergen_gluten: initialIngredient.allergen_gluten || false,
      allergen_mustard: initialIngredient.allergen_mustard || false,
      allergen_celery: initialIngredient.allergen_celery || false,
      allergen_garlic: initialIngredient.allergen_garlic || false,
      allergen_onion: initialIngredient.allergen_onion || false,
      allergen_nitrite: initialIngredient.allergen_nitrite || false,
      allergen_mushroom: initialIngredient.allergen_mushroom || false,
      allergen_hot_pepper: initialIngredient.allergen_hot_pepper || false,
      allergen_citrus: initialIngredient.allergen_citrus || false,
      allergen_pork: initialIngredient.allergen_pork || false,
      allergen_custom1_name: initialIngredient.allergen_custom1_name || null,
      allergen_custom1_active:
        initialIngredient.allergen_custom1_active || false,
      allergen_custom2_name: initialIngredient.allergen_custom2_name || null,
      allergen_custom2_active:
        initialIngredient.allergen_custom2_active || false,
      allergen_custom3_name: initialIngredient.allergen_custom3_name || null,
      allergen_custom3_active:
        initialIngredient.allergen_custom3_active || false,
      allergen_notes: initialIngredient.allergen_notes || null,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!orgId) {
        throw new Error("Organization ID is not available");
      }

      // Create a new object with guaranteed organization_id
      const dataToSave: MasterIngredient = {
        ...formData,
        organization_id: orgId,
        updated_at: new Date().toISOString(),
      };

      // Log the data being saved
      console.log("Saving ingredient:", {
        organizationId: dataToSave.organization_id,
        isNew,
        data: dataToSave,
      });

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Error saving ingredient:", error);
      toast.error("Failed to save ingredient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <ModalHeader ingredient={formData} onClose={onClose} />

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Basic Information
              </h3>
              <BasicInformation
                formData={formData}
                onChange={(updates) =>
                  setFormData((prev) => ({ ...prev, ...updates }))
                }
              />
            </div>

            {/* Purchase Units */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Purchase Units
              </h3>
              <PurchaseUnits
                formData={formData}
                onChange={(updates) =>
                  setFormData((prev) => ({ ...prev, ...updates }))
                }
              />
            </div>

            {/* Recipe Units */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Recipe Units
              </h3>
              <RecipeUnits
                formData={formData}
                onChange={(updates) =>
                  setFormData((prev) => ({ ...prev, ...updates }))
                }
              />
            </div>

            {/* Allergen Information */}
            <div className="card p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Allergen Information
              </h3>
              <AllergenSection
                formData={formData}
                onChange={(updates) =>
                  setFormData((prev) => ({ ...prev, ...updates }))
                }
              />
            </div>

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
                        type="button"
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
                        if (!file || !organization?.id) return;

                        try {
                          const timestamp = Date.now();
                          const filePath = `${organization.id}/ingredients/${timestamp}_${file.name}`;

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
                        } catch (error) {
                          console.error("Error uploading image:", error);
                        }
                      }}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </label>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!organization?.id) return;

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
                        const filePath = `${organization.id}/ingredients/${timestamp}_photo.jpg`;

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
                      } catch (error) {
                        console.error("Error capturing photo:", error);
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

          <div className="sticky bottom-0 bg-gray-900 p-6 border-t border-gray-800 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting
                ? "Saving..."
                : isNew
                  ? "Create Ingredient"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
