import React from "react";
import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import { AdminDashboard } from "../components/AdminDashboard";
import { VendorInvoiceManager } from "../components/sections/VendorInvoice/VendorInvoiceManager";
import { TeamManagement } from "../components/sections/TeamManagement";
import { PermissionsManager } from "../components/sections/PermissionsManager";
import { NotificationCenter } from "../components/sections/NotificationCenter/index";
import { HelpSupport } from "../components/sections/HelpSupport";
import { ExcelImports } from "../components/sections/ExcelImports";
import { RecipeManager } from "@/features/recipes/components/RecipeManager";
import { DevManagement } from "../components/sections/DevManagement";
import { MyAccount } from "@/features/account/components/MyAccount";
import { OrganizationSettings } from "../components/settings/OrganizationSettings";
import { ActivityLogList } from "../components/ActivityLogList";
import { ScheduleManager } from "../components/sections/ScheduleManager";

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="recipes" element={<RecipeManager />} />
        <Route path="team" element={<TeamManagement />} />
        <Route path="schedule/*" element={<ScheduleManager />} />
        <Route path="permissions" element={<PermissionsManager />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="help" element={<HelpSupport />} />
        <Route path="excel-imports" element={<ExcelImports />} />
        <Route path="vendor-invoices" element={<VendorInvoiceManager />} />
        <Route path="dev-management" element={<DevManagement />} />
        <Route path="organizations" element={<OrganizationSettings />} />
        <Route path="activity" element={<ActivityLogList />} />
        <Route path="account" element={<MyAccount />} />
        <Route path="account/*" element={<MyAccount />} />
      </Route>
    </Routes>
  );
};
