import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { AdminDashboard } from '../components/AdminDashboard';
import { ExcelImports } from '../components/sections/ExcelImports';
import { TeamManagement } from '@/features/team/components/TeamManagement';
import { RecipeConfig } from '../components/sections/RecipeConfig';
import { TaskManagement } from '../components/sections/TaskManagement';
import { NotificationCenter } from '../components/sections/NotificationCenter';
import { PermissionsManager } from '../components/sections/PermissionsManager';
import { OrganizationSettings } from '../components/settings/OrganizationSettings';
import { HelpSupport } from '../components/sections/HelpSupport';
import { DevManagement } from '../components/sections/DevManagement';
import { MyAccount } from '@/features/account/components/MyAccount';
import { useAuth } from '@/hooks/useAuth';

export const AdminRoutes = () => {
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
            <Route path="recipes" element={<RecipeConfig />} />
            <Route path="excel-imports/*" element={<ExcelImports />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="permissions" element={<PermissionsManager />} />
            <Route path="organizations" element={<OrganizationSettings />} />
            <Route path="activity" element={<AdminDashboard />} />
            <Route path="help" element={<HelpSupport />} />
            {isDev && <Route path="dev-management" element={<DevManagement />} />}
          </>
        ) : (
          // For non-admin users, redirect admin routes to My Account
          <Route path="*" element={<Navigate to="/admin/my-account" replace />} />
        )}
      </Route>
    </Routes>
  );
};