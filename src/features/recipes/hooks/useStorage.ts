import { useState, useEffect } from 'react';
import type { Recipe } from '../types/recipe';
import { useOperationsStore } from '@/stores/operationsStore';

export function useStorage(recipe: Recipe) {
  const { settings, fetchSettings } = useOperationsStore();
  const [storage, setStorage] = useState(recipe.storage || {});

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateStorage = (updates: Partial<Recipe['storage']>) => {
    setStorage(prev => ({
      ...prev,
      ...updates
    }));
  };

  return {
    storage,
    updateStorage,
    settings
  };
}