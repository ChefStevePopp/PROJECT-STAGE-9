import React from "react";
import { Route, Routes } from "react-router-dom";
import { KitchenDashboard } from "../components/KitchenDashboard";
import { InventoryManagement } from "@/features/admin/components/sections/InventoryManagement";
import { ProductionBoard } from "@/features/production/components/ProductionBoard";
import {
  RecipeViewer,
  FullPageViewer,
} from "@/features/recipes/components/RecipeViewer";

export const KitchenRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<KitchenDashboard />} />
      <Route path="inventory" element={<InventoryManagement />} />
      <Route path="recipes" element={<RecipeViewer />} />
      <Route path="recipes/:id" element={<FullPageViewer />} />
      <Route path="production" element={<ProductionBoard />} />
    </Routes>
  );
};
