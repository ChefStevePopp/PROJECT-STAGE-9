import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MyAccount } from "../components/MyAccount";
import { useAuth } from "@/hooks/useAuth";

export const AccountRoutes: React.FC = () => {
  const { user, organization } = useAuth();

  // Debug logging
  console.log("AccountRoutes:", {
    hasUser: !!user,
    hasOrg: !!organization,
    userRole: user?.user_metadata?.role,
    orgName: organization?.name,
  });

  if (!user || !organization) {
    return <Navigate to="/auth/signin" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<MyAccount />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
