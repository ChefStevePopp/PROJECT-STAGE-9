import React from "react";
import { Plus, Search, Utensils, Database } from "lucide-react";
import { CategoryStats } from "./CategoryStats";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { useFoodRelationshipsStore } from "@/stores/foodRelationshipsStore";
import { ExcelDataGrid } from "@/shared/components/ExcelDataGrid";
import { masterIngredientColumns } from "./columns";
import { EditIngredientModal } from "./EditIngredientModal";
import { MasterIngredient } from "@/types/master-ingredient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export const MasterIngredientList = () => {
  const { organization } = useAuth();
  const [newIngredient, setNewIngredient] =
    React.useState<MasterIngredient | null>(null);
  const [editingIngredient, setEditingIngredient] =
    React.useState<MasterIngredient | null>(null);
  const { fetchFoodRelationships } = useFoodRelationshipsStore();
  const [searchTerm, setSearchTerm] = React.useState("");

  const { ingredients, fetchIngredients } = useMasterIngredientsStore();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const filteredIngredients = React.useMemo(() => {
    return ingredients.filter(
      (ingredient) =>
        (ingredient.product || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (ingredient.major_group || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (ingredient.category || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (ingredient.sub_category || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (ingredient.vendor || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (ingredient.item_code || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [ingredients, searchTerm]);

  React.useEffect(() => {
    if (organization?.id) {
      Promise.all([fetchIngredients(), fetchFoodRelationships()]).catch(
        (error) => {
          console.error("Error fetching data:", error);
          toast.error("Failed to load data");
        },
      );
    }
  }, [organization?.id, fetchIngredients, fetchFoodRelationships]);

  const handleSaveIngredient = async (ingredient: MasterIngredient) => {
    if (!organization?.id) return;

    try {
      await useMasterIngredientsStore
        .getState()
        .updateIngredient(ingredient.id, {
          ...ingredient,
          organization_id: organization.id,
        });
      toast.success("Ingredient updated successfully");
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast.error("Failed to update ingredient");
      throw error;
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchIngredients();
      toast.success("Ingredients refreshed");
    } catch (error) {
      console.error("Error refreshing ingredients:", error);
      toast.error("Failed to refresh ingredients");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#1a1f2b] rounded-t-lg p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600/20 p-2 rounded-lg">
            <Database className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              <span className="block">Master Ingredients Manager</span>
            </h2>
            <p className="text-gray-400">
              Manage all of your individual purchased items
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            setNewIngredient({
              product: "",
              major_group: null,
              category: null,
              sub_category: null,
              vendor: "",
              item_code: "",
              case_size: "",
              units_per_case: 0,
              recipe_unit_type: "",
              yield_percent: 100,
              cost_per_recipe_unit: 0,
              current_price: 0,
              recipe_unit_per_purchase_unit: 0,
              unit_of_measure: "",
              storage_area: "",
              image_url: null,
              allergen_peanut: false,
              allergen_crustacean: false,
              allergen_treenut: false,
              allergen_shellfish: false,
              allergen_sesame: false,
              allergen_soy: false,
              allergen_fish: false,
              allergen_wheat: false,
              allergen_milk: false,
              allergen_sulphite: false,
              allergen_egg: false,
              allergen_gluten: false,
              allergen_mustard: false,
              allergen_celery: false,
              allergen_garlic: false,
              allergen_onion: false,
              allergen_nitrite: false,
              allergen_mushroom: false,
              allergen_hot_pepper: false,
              allergen_citrus: false,
              allergen_pork: false,
              allergen_custom1_name: null,
              allergen_custom1_active: false,
              allergen_custom2_name: null,
              allergen_custom2_active: false,
              allergen_custom3_name: null,
              allergen_custom3_active: false,
              allergen_notes: null,
              organization_id: organization?.id,
            } as MasterIngredient)
          }
          className="btn-ghost-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </button>
      </div>
      <div className="bg-[#1a1f2b] p-4 rounded-lg mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          The Master Ingredients Manager is a central hub for managing all the
          ingredients used in your operation. It allows you to create, edit, and
          organize your ingredients, assign them to categories, track pricing,
          and manage allergen information. It provides a comprehensive overview
          of your ingredients, helping you maintain accurate and up-to-date
          information for your recipes and inventory.
        </p>
      </div>
      <CategoryStats ingredients={ingredients} />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search ingredients..."
          className="input w-full pl-10"
        />
      </div>
      <ExcelDataGrid
        data={isRefreshing ? [] : filteredIngredients}
        columns={masterIngredientColumns}
        onRowClick={(row) => setEditingIngredient(row)}
        onRefresh={handleRefresh}
        isLoading={isRefreshing}
      />
      {(editingIngredient || newIngredient) && (
        <EditIngredientModal
          ingredient={editingIngredient || newIngredient}
          onClose={() =>
            editingIngredient
              ? setEditingIngredient(null)
              : setNewIngredient(null)
          }
          onSave={async (ingredient) => {
            if (editingIngredient) {
              await handleSaveIngredient(ingredient);
            } else {
              // Handle create
              try {
                if (!organization?.id) {
                  throw new Error("Organization ID is required");
                }

                // Clean up the ingredient data before sending
                const {
                  id, // Remove id since it's a new record
                  created_at, // Remove timestamps
                  updated_at,
                  major_group_name, // Remove view-only fields
                  category_name,
                  sub_category_name,
                  ...rest
                } = ingredient;

                // Ensure required fields are never null
                // Debug log organization info
                console.log("Organization debug:", {
                  organization,
                  orgId: organization?.id,
                });

                const cleanIngredient = {
                  ...rest,
                  organization_id: organization?.id,
                  vendor: rest.vendor || "",
                  item_code: rest.item_code || "",
                  unit_of_measure: rest.unit_of_measure || "",
                  product: rest.product || "",
                  major_group: rest.major_group || "",
                  category: rest.category || "",
                  sub_category: rest.sub_category || "",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  current_price: rest.current_price || 0,
                  recipe_unit_per_purchase_unit:
                    rest.recipe_unit_per_purchase_unit || 0,
                  units_per_case: rest.units_per_case || 0,
                  yield_percent: rest.yield_percent || 100,
                };

                // Debug log the clean ingredient
                console.log("Clean ingredient:", cleanIngredient);

                // Use the store's createIngredient method instead of direct supabase call
                await useMasterIngredientsStore
                  .getState()
                  .createIngredient(cleanIngredient);
                setNewIngredient(null);
                toast.success("Ingredient created successfully");
              } catch (error) {
                console.error("Error creating ingredient:", error);
                toast.error("Failed to create ingredient");
                throw error;
              }
            }
          }}
          isNew={!editingIngredient}
        />
      )}
    </div>
  );
};
