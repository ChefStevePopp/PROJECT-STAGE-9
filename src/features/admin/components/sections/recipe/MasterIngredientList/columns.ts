import { MasterIngredient } from "@/types/master-ingredient";
import type { ReactNode } from "react";

interface Column<T> {
  key: keyof T;
  header: string;
  enableSorting?: boolean;
  cell?: (value: any, row: T) => ReactNode;
}

export const masterIngredientColumns: Column<MasterIngredient>[] = [
  {
    key: "product",
    header: "Product Name",
    enableSorting: true,
  },
  {
    key: "major_group_name",
    header: "Major Group",
    enableSorting: true,
  },
  {
    key: "category_name",
    header: "Category",
    enableSorting: true,
  },
  {
    key: "sub_category_name",
    header: "Sub Category",
    enableSorting: true,
  },
  {
    key: "recipe_unit_type",
    header: "Recipe Unit",
    enableSorting: true,
  },
  {
    key: "cost_per_recipe_unit",
    header: "Cost per Unit",
    enableSorting: true,
    cell: (value, row) => {
      const cost = row.cost_per_recipe_unit;
      return typeof cost === "number" ? `${cost.toFixed(2)}` : "-";
    },
  },
  {
    key: "storage_area",
    header: "Storage Area",
    enableSorting: true,
  },
  {
    key: "id",
    header: "Allergens",
    enableSorting: false,
    cell: (_value, row) => ({ type: "allergen-cell", ingredient: row }),
  },
];

// For backward compatibility
export const columns = masterIngredientColumns;
