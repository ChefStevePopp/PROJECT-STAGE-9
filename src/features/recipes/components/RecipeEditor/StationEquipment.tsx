import React, { useState } from 'react';
import { 
  ChefHat, 
  Utensils, 
  Clock, 
  Plus, 
  Trash2, 
  AlertTriangle,
  MoveUp,
  MoveDown,
  Link as LinkIcon,
  X
} from 'lucide-react';
import type { Recipe, RecipeEquipment } from '../../types/recipe';

interface StationEquipmentProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const StationEquipment: React.FC<StationEquipmentProps> = ({ recipe, onChange }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<RecipeEquipment | null>(null);

  const addEquipment = () => {
    const newEquipment: RecipeEquipment = {
      id: `equipment-${Date.now()}`,
      name: '',
      station: recipe.primaryStation,
      isRequired: true,
      specifications: '',
      alternatives: []
    };

    onChange({
      equipment: [...(recipe.equipment || []), newEquipment]
    });
  };

  const updateEquipment = (id: string, updates: Partial<RecipeEquipment>) => {
    onChange({
      equipment: (recipe.equipment || []).map(eq =>
        eq.id === id ? { ...eq, ...updates } : eq
      )
    });
  };

  const removeEquipment = (id: string) => {
    onChange({
      equipment: (recipe.equipment || []).filter(eq => eq.id !== id)
    });
  };

  const moveEquipment = (id: string, direction: 'up' | 'down') => {
    const equipment = recipe.equipment || [];
    const index = equipment.findIndex(eq => eq.id === id);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= equipment.length) return;

    const updatedEquipment = [...equipment];
    [updatedEquipment[index], updatedEquipment[newIndex]] = 
    [updatedEquipment[newIndex], updatedEquipment[index]];

    onChange({ equipment: updatedEquipment });
  };

  const addAlternative = (equipmentId: string) => {
    const alternative = prompt('Enter alternative equipment:');
    if (!alternative) return;

    const equipment = (recipe.equipment || []).find(eq => eq.id === equipmentId);
    if (!equipment) return;

    updateEquipment(equipmentId, {
      alternatives: [...(equipment.alternatives || []), alternative]
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Station */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-primary-400" />
          Station Assignment
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Primary Station
            </label>
            <select
              value={recipe.primaryStation}
              onChange={(e) => onChange({ primaryStation: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select primary station</option>
              <option value="grill">Grill</option>
              <option value="saute">Sauté</option>
              <option value="fry">Fry</option>
              <option value="prep">Prep</option>
              <option value="pantry">Pantry</option>
              <option value="pizza">Pizza</option>
              <option value="expo">Expo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Secondary Stations
            </label>
            <select
              multiple
              value={recipe.secondaryStations || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                onChange({ secondaryStations: selected });
              }}
              className="input w-full h-24"
            >
              <option value="grill">Grill</option>
              <option value="saute">Sauté</option>
              <option value="fry">Fry</option>
              <option value="prep">Prep</option>
              <option value="pantry">Pantry</option>
              <option value="pizza">Pizza</option>
              <option value="expo">Expo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            Required Equipment
          </h3>
          <button
            onClick={addEquipment}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </button>
        </div>

        <div className="space-y-4">
          {(recipe.equipment || []).map((equipment, index) => (
            <div
              key={equipment.id}
              className="bg-gray-800/50 rounded-lg p-4 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Equipment Name
                    </label>
                    <input
                      type="text"
                      value={equipment.name}
                      onChange={(e) => updateEquipment(equipment.id, { name: e.target.value })}
                      className="input w-full"
                      placeholder="Enter equipment name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Station
                    </label>
                    <select
                      value={equipment.station}
                      onChange={(e) => updateEquipment(equipment.id, { station: e.target.value })}
                      className="input w-full"
                    >
                      <option value={recipe.primaryStation}>{recipe.primaryStation}</option>
                      {recipe.secondaryStations?.map(station => (
                        <option key={station} value={station}>{station}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {index > 0 && (
                    <button
                      onClick={() => moveEquipment(equipment.id, 'up')}
                      className="btn-ghost p-1"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                  )}
                  {index < (recipe.equipment || []).length - 1 && (
                    <button
                      onClick={() => moveEquipment(equipment.id, 'down')}
                      className="btn-ghost p-1"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeEquipment(equipment.id)}
                    className="btn-ghost p-1 text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Specifications
                </label>
                <textarea
                  value={equipment.specifications || ''}
                  onChange={(e) => updateEquipment(equipment.id, { specifications: e.target.value })}
                  className="input w-full h-20"
                  placeholder="Enter equipment specifications..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={equipment.isRequired}
                    onChange={(e) => updateEquipment(equipment.id, { isRequired: e.target.checked })}
                    className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500"
                  />
                  <span className="text-sm text-gray-300">Required Equipment</span>
                </label>
                <button
                  onClick={() => addAlternative(equipment.id)}
                  className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Alternative
                </button>
              </div>

              {equipment.alternatives && equipment.alternatives.length > 0 && (
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Alternative Equipment
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {equipment.alternatives.map((alt, altIndex) => (
                      <div
                        key={altIndex}
                        className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-1"
                      >
                        <LinkIcon className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-gray-300">{alt}</span>
                        <button
                          onClick={() => {
                            const updatedAlts = equipment.alternatives?.filter((_, i) => i !== altIndex);
                            updateEquipment(equipment.id, { alternatives: updatedAlts });
                          }}
                          className="text-gray-400 hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!equipment.isRequired && equipment.alternatives?.length === 0 && (
                <div className="bg-yellow-500/10 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 font-medium">Missing Alternatives</p>
                      <p className="text-sm text-gray-300 mt-1">
                        This equipment is marked as optional but has no alternatives specified.
                        Please either mark it as required or add alternative equipment options.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Optimization */}
      <div className="card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            Timeline Optimization
          </h3>
          <div className="space-y-4">
            <textarea
              value={recipe.timelineNotes || ''}
              onChange={(e) => onChange({ timelineNotes: e.target.value })}
              className="input w-full h-32"
              placeholder="Share your expertise on optimizing production time. Consider:
- Parallel tasks during longer processes
- Equipment and station utilization
- Prep sequencing for maximum efficiency
- Batch production opportunities
- Critical timing considerations"
            />
          </div>
        </div>

        <div className="space-y-4">
          {(recipe.steps || []).map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4"
            >
              <div className="w-12 text-center">
                <span className="text-xl font-bold text-primary-400">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{step.instruction}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{step.timeInMinutes || 0} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ChefHat className="w-4 h-4" />
                    <span>{(recipe.equipment || []).find(eq => step.equipment?.includes(eq.id))?.station || 'No station'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step.isQualityControlPoint && (
                  <span className="px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs">
                    QC Point
                  </span>
                )}
                {step.isCriticalControlPoint && (
                  <span className="px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs">
                    Critical Point
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};