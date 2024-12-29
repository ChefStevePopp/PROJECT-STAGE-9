export interface FoodCategoryGroup {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodCategory {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodSubCategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodRelationshipsStore {
  groups: FoodCategoryGroup[];
  categories: FoodCategory[];
  subCategories: FoodSubCategory[];
  isLoading: boolean;
  error: string | null;
  
  // Fetch methods
  fetchGroups: () => Promise<void>;
  fetchCategories: (groupId?: string) => Promise<void>;
  fetchSubCategories: (categoryId?: string) => Promise<void>;
  
  // Group methods
  addGroup: (group: Omit<FoodCategoryGroup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGroup: (id: string, updates: Partial<FoodCategoryGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  
  // Category methods
  addCategory: (category: Omit<FoodCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<FoodCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Sub-category methods
  addSubCategory: (subCategory: Omit<FoodSubCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubCategory: (id: string, updates: Partial<FoodSubCategory>) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
}