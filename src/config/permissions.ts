export type Role = 'admin' | 'manager' | 'chef' | 'cook' | 'prep';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export const PERMISSIONS: Record<Role, Record<string, Permission>> = {
  admin: {
    inventory: { view: true, create: true, edit: true, delete: true },
    recipes: { view: true, create: true, edit: true, delete: true },
    production: { view: true, create: true, edit: true, delete: true },
    team: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
  },
  manager: {
    inventory: { view: true, create: true, edit: true, delete: false },
    recipes: { view: true, create: true, edit: true, delete: false },
    production: { view: true, create: true, edit: true, delete: false },
    team: { view: true, create: false, edit: true, delete: false },
    settings: { view: true, create: false, edit: true, delete: false },
  },
  chef: {
    inventory: { view: true, create: true, edit: true, delete: false },
    recipes: { view: true, create: true, edit: true, delete: false },
    production: { view: true, create: true, edit: true, delete: false },
    team: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  cook: {
    inventory: { view: true, create: false, edit: false, delete: false },
    recipes: { view: true, create: false, edit: false, delete: false },
    production: { view: true, create: true, edit: true, delete: false },
    team: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  prep: {
    inventory: { view: true, create: false, edit: false, delete: false },
    recipes: { view: true, create: false, edit: false, delete: false },
    production: { view: true, create: true, edit: false, delete: false },
    team: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
};