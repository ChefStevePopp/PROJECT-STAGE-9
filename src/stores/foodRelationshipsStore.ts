import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { 
  FoodCategoryGroup, 
  FoodCategory, 
  FoodSubCategory,
  FoodRelationshipsStore 
} from '@/types/food-relationships';
import toast from 'react-hot-toast';

export const useFoodRelationshipsStore = create<FoodRelationshipsStore>((set, get) => ({
  groups: [],
  categories: [],
  subCategories: [],
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_category_groups')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .order('sort_order');

      if (error) throw error;
      set({ groups: data || [], error: null });
    } catch (error) {
      console.error('Error fetching food category groups:', error);
      set({ error: 'Failed to load category groups', groups: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategories: async (groupId: string) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .eq('group_id', groupId)
        .order('sort_order');

      if (error) throw error;

      const mappedCategories = (data || []).map(item => ({
        id: item.id,
        groupId: item.group_id,
        name: item.name,
        description: item.description,
        sortOrder: item.sort_order,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      set({ categories: mappedCategories, error: null });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Failed to load categories', categories: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSubCategories: async (categoryId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_sub_categories')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .eq('category_id', categoryId)
        .order('sort_order');

      if (error) throw error;

      const mappedSubCategories = (data || []).map(item => ({
        id: item.id,
        categoryId: item.category_id,
        name: item.name,
        description: item.description,
        sortOrder: item.sort_order,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      set({ subCategories: mappedSubCategories, error: null });
    } catch (error) {
      console.error('Error fetching food sub-categories:', error);
      set({ error: 'Failed to load sub-categories', subCategories: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addGroup: async (group) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_category_groups')
        .insert({
          organization_id: user.user_metadata.organizationId,
          name: group.name,
          description: group.description,
          icon: group.icon,
          color: group.color,
          sort_order: group.sortOrder
        })
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        groups: [...state.groups, data]
      }));

      toast.success('Category group added successfully');
      return data;
    } catch (error) {
      console.error('Error adding category group:', error);
      toast.error('Failed to add category group');
      throw error;
    }
  },
  updateGroup: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_category_groups')
        .update({
          name: updates.name,
          description: updates.description,
          icon: updates.icon,
          color: updates.color,
          sort_order: updates.sortOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        groups: state.groups.map(group =>
          group.id === id ? { ...group, ...data } : group
        )
      }));

      toast.success('Category group updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating category group:', error);
      toast.error('Failed to update category group');
      throw error;
    }
  },

  deleteGroup: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('food_category_groups')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        groups: state.groups.filter(group => group.id !== id),
        categories: state.categories.filter(cat => cat.groupId !== id),
        subCategories: state.subCategories.filter(sub => 
          !state.categories.find(cat => cat.id === sub.categoryId && cat.groupId === id)
        )
      }));

      toast.success('Category group deleted successfully');
    } catch (error) {
      console.error('Error deleting category group:', error);
      toast.error('Failed to delete category group');
      throw error;
    }
  },
  addCategory: async (category) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_categories')
        .insert({
          organization_id: user.user_metadata.organizationId,
          group_id: category.groupId,
          name: category.name,
          description: category.description,
          sort_order: category.sortOrder
        })
        .select()
        .single();

      if (error) throw error;

      const mappedData = {
        id: data.id,
        groupId: data.group_id,
        name: data.name,
        description: data.description,
        sortOrder: data.sort_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      set(state => ({
        categories: [...state.categories, mappedData]
      }));

      toast.success('Category added successfully');
      return mappedData;
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
      throw error;
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_categories')
        .update({
          name: updates.name,
          description: updates.description,
          sort_order: updates.sortOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId)
        .select()
        .single();

      if (error) throw error;

      const mappedData = {
        id: data.id,
        groupId: data.group_id,
        name: data.name,
        description: data.description,
        sortOrder: data.sort_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      set(state => ({
        categories: state.categories.map(category =>
          category.id === id ? { ...category, ...mappedData } : category
        )
      }));

      toast.success('Category updated successfully');
      return mappedData;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      throw error;
    }
  },
  deleteCategory: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('food_categories')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        categories: state.categories.filter(category => category.id !== id),
        subCategories: state.subCategories.filter(sub => sub.categoryId !== id)
      }));

      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      throw error;
    }
  },

  addSubCategory: async (subCategory) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_sub_categories')
        .insert({
          organization_id: user.user_metadata.organizationId,
          category_id: subCategory.categoryId,
          name: subCategory.name,
          description: subCategory.description,
          sort_order: subCategory.sortOrder
        })
        .select()
        .single();

      if (error) throw error;

      const mappedData = {
        id: data.id,
        categoryId: data.category_id,
        name: data.name,
        description: data.description,
        sortOrder: data.sort_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      set(state => ({
        subCategories: [...state.subCategories, mappedData]
      }));

      toast.success('Sub-category added successfully');
      return mappedData;
    } catch (error) {
      console.error('Error adding sub-category:', error);
      toast.error('Failed to add sub-category');
      throw error;
    }
  },

  updateSubCategory: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('food_sub_categories')
        .update({
          name: updates.name,
          description: updates.description,
          sort_order: updates.sortOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId)
        .select()
        .single();

      if (error) throw error;

      const mappedData = {
        id: data.id,
        categoryId: data.category_id,
        name: data.name,
        description: data.description,
        sortOrder: data.sort_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      set(state => ({
        subCategories: state.subCategories.map(subCategory =>
          subCategory.id === id ? { ...subCategory, ...mappedData } : subCategory
        )
      }));

      toast.success('Sub-category updated successfully');
      return mappedData;
    } catch (error) {
      console.error('Error updating sub-category:', error);
      toast.error('Failed to update sub-category');
      throw error;
    }
  },

  deleteSubCategory: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('food_sub_categories')
        .delete()
        .eq('id', id)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        subCategories: state.subCategories.filter(sub => sub.id !== id)
      }));

      toast.success('Sub-category deleted successfully');
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      toast.error('Failed to delete sub-category');
      throw error;
    }
  }
}));