import React, { useState, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Trash2, 
  Save,
  Plus,
  AlertTriangle,
  Youtube,
  MoveUp,
  MoveDown,
  Camera
} from 'lucide-react';
import { useRecipeStore } from '@/stores/recipeStore';
import { useMasterIngredientsStore } from '@/stores/masterIngredientsStore';
import { usePreparedItemsStore } from '@/stores/preparedItemsStore';
import { AllergenList, AllergenBadge } from '@/features/allergens/components';
import type { Recipe, RecipeIngredient } from '@/types';
import toast from 'react-hot-toast';

const STORAGE_AREAS = [
  'Walk-in Cooler',
  'Walk-in Freezer',
  'Dry Storage',
  'Line Cooler',
  'Prep Station'
];

const CONTAINER_TYPES = [
  'Cambro',
  'Hotel Pan',
  'Lexan',
  'Sheet Pan',
  'Deli Container'
];

const SHELF_LIFE_OPTIONS = [
  '1 Day',
  '2 Days',
  '3 Days',
  '5 Days',
  '1 Week',
  '2 Weeks',
  '1 Month'
];

const ALLERGENS = [
  'peanut',
  'crustacean',
  'treenut',
  'shellfish',
  'sesame',
  'soy',
  'fish',
  'wheat',
  'milk',
  'sulphite',
  'egg',
  'gluten',
  'mustard',
  'celery',
  'garlic',
  'onion',
  'nitrite',
  'mushroom',
  'hot_pepper',
  'citrus',
  'pork'
];

interface RecipeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  isOpen,
  onClose,
  recipe: initialRecipe
}) => {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const { updateRecipe, deleteRecipe } = useRecipeStore();
  const { ingredients: masterIngredients } = useMasterIngredientsStore();
  const { items: preparedItems } = usePreparedItemsStore();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setRecipe(prev => ({
          ...prev,
          imageUrl: e.target?.result as string
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setRecipe(prev => ({
          ...prev,
          imageUrl: canvas.toDataURL('image/jpeg')
        }));
        stopCapture();
      }
    }
  };

  const handleVideoUrlChange = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    
    if (videoId) {
      setRecipe(prev => ({
        ...prev,
        videoUrl: `https://www.youtube.com/embed/${videoId}`
      }));
    } else {
      toast.error('Please enter a valid YouTube URL');
    }
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngredients = [...recipe.ingredients];
    const ingredient = newIngredients[index];

    if (field === 'name') {
      if (ingredient.type === 'raw') {
        const inventoryItem = masterIngredients.find(item => item.uniqueId === value);
        if (inventoryItem) {
          ingredient.cost = inventoryItem.pricePerRatioUnit;
        }
      } else {
        const preparedItem = preparedItems.find(item => item.product === value);
        if (preparedItem) {
          ingredient.cost = preparedItem.finalCost;
          ingredient.preparedItemId = preparedItem.id;
        }
      }
    }

    ingredient[field] = value;
    setRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          id: `ing-${Date.now()}`,
          type: 'raw',
          name: '',
          quantity: '',
          unit: 'g',
          notes: '',
          cost: 0
        }
      ]
    }));
  };

  const removeIngredient = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = value;
    setRecipe(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const moveInstruction = (index: number, direction: 'up' | 'down') => {
    const newInstructions = [...recipe.instructions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newInstructions[index], newInstructions[newIndex]] = 
    [newInstructions[newIndex], newInstructions[index]];
    setRecipe(prev => ({ ...prev, instructions: newInstructions }));
  };

  const handleSave = async () => {
    try {
      await updateRecipe(recipe.id, {
        ...recipe,
        lastUpdated: new Date().toISOString()
      });
      toast.success('Recipe saved successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe(recipe.id);
      toast.success('Recipe deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete recipe');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">Edit Recipe</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-ghost text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Recipe Name
                </label>
                <input
                  type="text"
                  value={recipe.name}
                  onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={recipe.description}
                  onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
                  className="input w-full h-24"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative group">
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-600" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="btn-primary"
                    >
                      <ImageIcon className="w-5 h-5 mr-2" />
                      {recipe.imageUrl ? 'Change Image' : 'Add Image'}
                    </button>
                  </div>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  YouTube Video URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={recipe.videoUrl || ''}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    className="input flex-1"
                  />
                  <button className="btn-ghost">
                    <Youtube className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Recipe Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={recipe.prepTime}
                  onChange={(e) => setRecipe(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                  className="input w-full"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  value={recipe.cookTime}
                  onChange={(e) => setRecipe(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                  className="input w-full"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Recipe Unit Ratio
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipe.recipeUnitRatio}
                    onChange={(e) => setRecipe(prev => ({ ...prev, recipeUnitRatio: e.target.value }))}
                    className="input flex-1"
                    placeholder="e.g., 4 servings"
                    required
                  />
                  <select
                    value={recipe.unitType}
                    onChange={(e) => setRecipe(prev => ({ ...prev, unitType: e.target.value }))}
                    className="input w-24"
                    required
                  >
                    <option value="servings">servings</option>
                    <option value="portions">portions</option>
                    <option value="pieces">pieces</option>
                    <option value="g">grams</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">liters</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Ingredients</h3>
              <button
                onClick={addIngredient}
                className="btn-ghost"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Ingredient
              </button>
            </div>
            
            <div className="space-y-4">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  className="grid grid-cols-6 gap-4 bg-gray-800/50 p-4 rounded-lg"
                >
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Ingredient
                    </label>
                    <select
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Select ingredient</option>
                      {ingredient.type === 'raw' ? (
                        masterIngredients.map((item) => (
                          <option key={item.uniqueId} value={item.uniqueId}>
                            {item.product}
                          </option>
                        ))
                      ) : (
                        preparedItems.map((item) => (
                          <option key={item.id} value={item.product}>
                            {item.product}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      className="input w-full"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Unit
                    </label>
                    <select
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="l">Liters (l)</option>
                      <option value="unit">Units</option>
                      <option value="tbsp">Tablespoon</option>
                      <option value="tsp">Teaspoon</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={ingredient.notes || ''}
                      onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                      className="input w-full"
                      placeholder="Optional notes"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => removeIngredient(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Instructions</h3>
              <button
                onClick={addInstruction}
                className="btn-ghost"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Step
              </button>
            </div>
            
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <span className="text-gray-400 mt-2">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="input w-full h-24"
                      placeholder={`Step ${index + 1}`}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveInstruction(index, 'up')}
                        className="text-gray-400 hover:text-white"
                      >
                        <MoveUp className="w-5 h-5" />
                      </button>
                    )}
                    {index < recipe.instructions.length - 1 && (
                      <button
                        onClick={() => moveInstruction(index, 'down')}
                        className="text-gray-400 hover:text-white"
                      >
                        <MoveDown className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeInstruction(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage & Handling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Storage & Handling</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Storage Area
                </label>
                <select
                  value={recipe.storageArea}
                  onChange={(e) => setRecipe(prev => ({ ...prev, storageArea: e.target.value }))}
                  className="input w-full"
                  required
                >
                  <option value="">Select storage area...</option>
                  {STORAGE_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Container Type
                </label>
                <select
                  value={recipe.containerType}
                  onChange={(e) => setRecipe(prev => ({ ...prev, containerType: e.target.value }))}
                  className="input w-full"
                  required
                >
                  <option value="">Select container type...</option>
                  {CONTAINER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Storage Container
                </label>
                <input
                  type="text"
                  value={recipe.container}
                  onChange={(e) => setRecipe(prev => ({ ...prev, container: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Shelf Life
                </label>
                <select
                  value={recipe.shelfLife}
                  onChange={(e) => setRecipe(prev => ({ ...prev, shelfLife: e.target.value }))}
                  className="input w-full"
                  required
                >
                  <option value="">Select shelf life...</option>
                  {SHELF_LIFE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Allergens */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Allergens</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {ALLERGENS.map(allergen => (
                <label key={allergen} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={recipe.allergens.includes(allergen)}
                    onChange={(e) => {
                      setRecipe(prev => ({
                        ...prev,
                        allergens: e.target.checked
                          ? [...prev.allergens, allergen]
                          : prev.allergens.filter(a => a !== allergen)
                      }));
                    }}
                    className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500 focus:ring-primary-500"
                  />
                  <AllergenBadge type={allergen} showLabel />
                </label>
              ))}
            </div>

            {/* Allergen Warning */}
            {recipe.allergens.length > 0 && (
              <div className="mt-4 bg-red-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h4 className="font-medium">Allergen Warning</h4>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  This recipe contains the following allergens:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recipe.allergens.map(allergen => (
                    <AllergenBadge 
                      key={allergen} 
                      type={allergen}
                      showLabel
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-4 text-red-400 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-xl font-bold">Delete Recipe</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-ghost bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Delete Recipe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};