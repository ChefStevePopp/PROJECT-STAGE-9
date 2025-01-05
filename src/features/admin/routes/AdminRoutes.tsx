import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { AdminDashboard } from "../components/AdminDashboard";
import { VendorInvoiceManager } from "../components/sections/VendorInvoice/VendorInvoiceManager";
import { TeamManagement } from "../components/sections/TeamManagement";
import { PermissionsManager } from "../components/sections/PermissionsManager";
import { NotificationCenter } from "../components/sections/NotificationCenter";
import { HelpSupport } from "../components/sections/HelpSupport";
import { ExcelImports } from "../components/sections/ExcelImports";
import { RecipeManager } from "@/features/recipes/components/RecipeManager";
import { DevManagement } from "../components/sections/DevManagement";

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="recipes" element={<RecipeManager />} />
        <Route path="team" element={<TeamManagement />} />
        <Route path="permissions" element={<PermissionsManager />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="help" element={<HelpSupport />} />
        <Route path="excel-imports" element={<ExcelImports />} />
        <Route path="vendor-invoices" element={<VendorInvoiceManager />} />
        <Route path="dev-management" element={<DevManagement />} />
      </Route>
    </Routes>
  );
};
