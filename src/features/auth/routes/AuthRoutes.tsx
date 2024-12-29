import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignIn } from '../components/SignIn';
import { SignUp } from '../components/SignUp';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/config/routes';

export const AuthRoutes = () => {
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />;
  }

  return (
    <Routes>
      <Route path="signin" element={<SignIn />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="*" element={<Navigate to={ROUTES.AUTH.SIGN_IN} replace />} />
    </Routes>
  );
};