import { useEffect } from 'react';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';

export function useFoodCategories(majorGroup: string | null, category: string | null) {
  const { 
    groups,
    categories,
    subCategories,
    fetchGroups,
    fetchCategories,
    fetchSubCategories,
    isLoading,
    error
  } = useFoodRelationshipsStore();

  // Fetch major groups on mount
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Fetch categories when major group changes
  useEffect(() => {
    if (majorGroup) {
      fetchCategories(majorGroup);
    }
  }, [majorGroup, fetchCategories]);

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (category) {
      fetchSubCategories(category);
    }
  }, [category, fetchSubCategories]);

  // Filter categories based on selected major group
  const filteredCategories = majorGroup
    ? categories.filter(cat => cat.groupId === majorGroup)
    : [];

  // Filter sub-categories based on selected category
  const filteredSubCategories = category
    ? subCategories.filter(sub => sub.categoryId === category)
    : [];

  // Get names for selected items
  const selectedGroup = groups.find(g => g.id === majorGroup);
  const selectedCategory = categories.find(c => c.id === category);
  const selectedSubCategory = subCategories.find(s => s.categoryId === category);

  return {
    groups,
    categories: filteredCategories,
    subCategories: filteredSubCategories,
    selectedGroup,
    selectedCategory,
    selectedSubCategory,
    isLoading,
    error
  };
}