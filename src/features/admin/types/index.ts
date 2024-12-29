import { type ReactNode } from 'react';

export interface AdminModuleRoute {
  path: string;
  element: ReactNode;
}

export interface AdminModule {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon?: React.ComponentType;
  routes: AdminModuleRoute[];
  navigationItems?: {
    label: string;
    path: string;
    icon?: React.ComponentType;
  }[];
  settings?: {
    label: string;
    component: React.ComponentType;
  }[];
}

export interface ModuleRegistration {
  module: AdminModule;
  enabled: boolean;
}