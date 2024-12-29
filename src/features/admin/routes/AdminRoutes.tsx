import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { AdminDashboard } from '../components/AdminDashboard';
import { ExcelImports } from '../components/sections/ExcelImports';
import { TeamManagement } from '../components/sections/TeamManagement';
import { RecipeManager } from '@/features/recipes/components/RecipeManager';
import { TaskManagement } from '../components/sections/TaskManagement';
import { NotificationCenter } from '../components/sections/NotificationCenter';
import { PermissionsManager } from '../components/sections/PermissionsManager';
import { OrganizationSettings } from '../components/settings/OrganizationSettings';
import { HelpSupport } from '../components/sections/HelpSupport';
import { DevManagement } from '../components/sections/DevManagement';
import { MyAccount } from '@/features/account/components/MyAccount';
import { useAuth } from '@/hooks/useAuth';

export const AdminRoutes: React.FC = () => {
  const { hasAdminAccess, isDev } = useAuth();

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* My Account - Accessible to all authenticated users */}
        <Route path="my-account" element={<MyAccount />} />

        {/* Admin-only routes */}
        {hasAdminAccess ? (
          <>
            <Route index element={<AdminDashboard />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="recipes" element={<RecipeManager />} />
            <Route path="excel-imports/*" element={<ExcelImports />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="permissions" element={<PermissionsManager />} />
            <Route path="organizations" element={<OrganizationSettings />} />
            <Route path="activity" element={<AdminDashboard />} />
            <Route path="help" element={<HelpSupport />} />
            {isDev && <Route path="dev-management" element={<DevManagement />} />}
          </>
        ) : null}
      </Route>
    </Routes>
  );
};