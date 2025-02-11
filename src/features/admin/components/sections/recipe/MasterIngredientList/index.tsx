import React from "react";
import { Plus, Search } from "lucide-react";
import { CategoryStats } from "./CategoryStats";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
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
  const [searchTerm, setSearchTerm] = React.useState("");

  const { ingredients, fetchIngredients } = useMasterIngredientsStore();

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
      fetchIngredients();
    }
  }, [organization?.id, fetchIngredients]);

  const handleSaveIngredient = async (ingredient: MasterIngredient) => {
    if (!organization?.id) return;

    try {
      // Only send fields that exist in the database
      const {
        id,
        product,
        major_group,
        category,
        sub_category,
        vendor,
        item_code,
        case_size,
        units_per_case,
        recipe_unit_type,
        yield_percent,
        cost_per_recipe_unit,
        recipe_unit_per_purchase_unit,
        current_price,
        unit_of_measure,
        storage_area,
        allergen_peanut,
        allergen_crustacean,
        allergen_treenut,
        allergen_shellfish,
        allergen_sesame,
        allergen_soy,
        allergen_fish,
        allergen_wheat,
        allergen_milk,
        allergen_sulphite,
        allergen_egg,
        allergen_gluten,
        allergen_mustard,
        allergen_celery,
        allergen_garlic,
        allergen_onion,
        allergen_nitrite,
        allergen_mushroom,
        allergen_hot_pepper,
        allergen_citrus,
        allergen_pork,
        allergen_custom1_name,
        allergen_custom1_active,
        allergen_custom2_name,
        allergen_custom2_active,
        allergen_custom3_name,
        allergen_custom3_active,
        allergen_notes,
      } = ingredient;

      const { error } = await supabase
        .from("master_ingredients")
        .update({
          product,
          major_group,
          category,
          sub_category,
          vendor,
          item_code,
          case_size,
          units_per_case,
          recipe_unit_type,
          yield_percent,
          cost_per_recipe_unit,
          storage_area,
          unit_of_measure,
          allergen_peanut,
          allergen_crustacean,
          allergen_treenut,
          allergen_shellfish,
          allergen_sesame,
          allergen_soy,
          allergen_fish,
          allergen_wheat,
          allergen_milk,
          allergen_sulphite,
          allergen_egg,
          allergen_gluten,
          allergen_mustard,
          allergen_celery,
          allergen_garlic,
          allergen_onion,
          allergen_nitrite,
          allergen_mushroom,
          allergen_hot_pepper,
          allergen_citrus,
          allergen_pork,
          allergen_custom1_name,
          allergen_custom1_active,
          allergen_custom2_name,
          allergen_custom2_active,
          allergen_custom3_name,
          allergen_custom3_active,
          allergen_notes,
          organization_id: organization.id,
        })
        .eq("id", id);

      if (error) throw error;

      await fetchIngredients();
      toast.success("Ingredient updated successfully");
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast.error("Failed to update ingredient");
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <CategoryStats ingredients={ingredients} />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Master Ingredients</h2>
        <button
          onClick={() =>
            setNewIngredient({
              product: "",
              major_group: "",
              category: "",
              sub_category: "",
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
            } as MasterIngredient)
          }
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </button>
      </div>

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
        data={filteredIngredients}
        columns={masterIngredientColumns}
        onRowClick={(row) => setEditingIngredient(row)}
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
                const { error } = await supabase
                  .from("master_ingredients")
                  .insert([
                    {
                      ...ingredient,
                      organization_id: organization?.id,
                    },
                  ]);
                if (error) throw error;
                await fetchIngredients();
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
