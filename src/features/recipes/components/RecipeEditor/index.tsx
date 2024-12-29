import React, { useState, useEffect } from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import { useRecipeStore } from '../../stores/recipeStore';
import BasicInformation from './BasicInformation';
import { ProductionSpecs } from './ProductionSpecs';
import { LabelRequirements } from './LabelRequirements';
import { InstructionEditor } from './InstructionEditor';
import { StationEquipment } from './StationEquipment';
import { StorageProtocols } from './StorageProtocols';
import { QualityStandards } from './QualityStandards';
import { AllergenControl } from './AllergenControl';
import { MediaManager } from './MediaManager';
import { TrainingModule } from './TrainingModule';
import { VersionHistory } from './VersionHistory';
import type { Recipe } from '../../types/recipe';
import { useOperationsStore } from '@/stores/operationsStore';
import toast from 'react-hot-toast';

// Utility function to create a new recipe
const createNewRecipe = (organizationId: string): Omit<Recipe, 'id'> => ({
  organization_id: organizationId,
  type: 'prepared',
  status: 'draft',
  name: '',
  description: '',
  station: '',
  prep_time: 0,
  cook_time: 0,
  rest_time: 0,
  total_time: 0,
  recipe_unit_ratio: '1',
  unit_type: '',
  yield_amount: 0,
  yield_unit: '',
  cost_per_unit: 0,
  labor_cost_per_hour: 0,
  total_cost: 0,
  target_cost_percent: 0,
  // JSONB fields with default values
  ingredients: [],
  steps: [],
  equipment: [],
  quality_standards: {},
  allergens: {
    contains: [],
    mayContain: [],
    crossContactRisk: []
  },
  media: [],
  training: {},
  versions: [],
  version: '1.0'
});

interface RecipeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe?: Recipe;
  organizationId: string;
  mode: 'create' | 'edit';
}

const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  isOpen,
  onClose,
  recipe: initialRecipe,
  organizationId,
  mode
}) => {
  const [activeTab, setActiveTab] = useState('recipe');
  const [isLoading, setIsLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | Omit<Recipe, 'id'>>(() =>
    initialRecipe || createNewRecipe(organizationId)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { createRecipe, updateRecipe } = useRecipeStore();
  const { settings, fetchSettings } = useOperationsStore();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchSettings()
        .catch(error => {
          console.error('Error fetching settings:', error);
          toast.error('Failed to load settings');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, fetchSettings]);

  const handleChange = (updates: Partial<Recipe>) => {
    setRecipe(prev => prev ? { ...prev, ...updates } : null);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!recipe) return;
    try {
      if (mode === 'create') {
        await createRecipe(recipe as Recipe);
        toast.success('Recipe created successfully');
      } else {
        if (!('id' in recipe)) {
          toast.error('Cannot update recipe: No ID found');
          return;
        }
        await updateRecipe(recipe.id, recipe);
        toast.success('Recipe updated successfully');
      }
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error(`Error ${mode}ing recipe:`, error);
      toast.error(`Failed to ${mode} recipe`);
    }
  };

  const tabs = [
    { id: 'recipe', label: 'Recipe Information' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'production', label: 'Production' },
    { id: 'labels', label: 'Labels' }, 
    { id: 'storage', label: 'Storage' },
    { id: 'stations', label: 'Stations & Equipment' },
    { id: 'quality', label: 'Quality Standards' },
    { id: 'allergens', label: 'Allergens' },
    { id: 'media', label: 'Media' },
    { id: 'training', label: 'Training' },
    { id: 'versions', label: 'Versions' }
  ];

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <header className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'create' ? 'Create Recipe' : 'Edit Recipe'}
          </h2>
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-5 h-5 mr-2" />
              {mode === 'create' ? 'Create Recipe' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2 px-6 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'recipe' && (
            <BasicInformation
              recipe={recipe}
              onChange={handleChange}
              settings={settings}
            />
          )}
          {activeTab === 'production' && (
            <ProductionSpecs
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'instructions' && (
            <InstructionEditor
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'stations' && (
            <StationEquipment
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'storage' && (
            <StorageProtocols
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'quality' && (
            <QualityStandards
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'allergens' && (
            <AllergenControl
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'media' && (
            <MediaManager
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'training' && (
            <TrainingModule
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'versions' && (
            <VersionHistory
              recipe={recipe}
              onChange={handleChange}
            />
          )}
          {activeTab === 'labels' && (
            <LabelRequirements
              recipe={recipe}
              onChange={handleChange}
  />
)}
        </div>
      </div>
    </div>
  );
};

export { RecipeEditorModal };