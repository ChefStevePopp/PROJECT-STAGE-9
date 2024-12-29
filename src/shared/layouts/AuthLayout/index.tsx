import React from 'react';
import { ChefHat } from 'lucide-react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';

export const AuthLayout: React.FC = () => {
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to={ROUTES.KITCHEN.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <ChefHat className="w-16 h-16 text-primary-500 mb-4" />
          <h1 className="text-3xl font-bold text-white">KITCHEN AI</h1>
          <p className="text-gray-400">Turning Your Passion into Profit</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};