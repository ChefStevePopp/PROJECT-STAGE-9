import React from "react";
import { Route, Routes } from "react-router-dom";
import { InventoryControl } from "../components/InventoryControl";
import { UserInventory } from "../components/UserInventory";

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<UserInventory />} />
      <Route path="admin" element={<InventoryControl />} />
    </Routes>
  );
};
