import React from 'react';
import { ChefHat } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = "Welcome to Kitchen AI",
  subtitle = "Sign in to start managing your kitchen"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <ChefHat className="w-16 h-16 text-primary-500 mb-4" />
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-gray-400 mt-2">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};