import { createColumnHelper } from "@tanstack/react-table";
import { MasterIngredient } from "@/types/master-ingredient";
import { AllergenCell } from "./components/AllergenCell";

const columnHelper = createColumnHelper<MasterIngredient>();

export const columns = [
  columnHelper.accessor("product", {
    header: "Product",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("vendor", {
    header: "Vendor",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("item_code", {
    header: "Item Code",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("unit_of_measure", {
    header: "Unit of Measure",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("recipe_unit_type", {
    header: "Recipe Unit Type",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("current_price", {
    header: "Current Price",
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor("cost_per_recipe_unit", {
    header: "Cost per Recipe Unit",
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor("allergen_peanut", {
    header: "Allergens",
    cell: (info) => {
      return {
        component: AllergenCell,
        props: { ingredient: info.row.original },
      };
    },
  }),
];
