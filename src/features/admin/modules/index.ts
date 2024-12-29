import { type AdminModule } from '../types';

// Registry of loaded admin modules
const moduleRegistry = new Map<string, AdminModule>();

// Function to register a new module
export function registerAdminModule(module: AdminModule) {
  if (moduleRegistry.has(module.id)) {
    console.warn(`Module ${module.id} is already registered`);
    return;
  }
  moduleRegistry.set(module.id, module);
}

// Function to get all registered modules
export function getAdminModules(): AdminModule[] {
  return Array.from(moduleRegistry.values());
}

// Function to get a specific module
export function getAdminModule(id: string): AdminModule | undefined {
  return moduleRegistry.get(id);
}