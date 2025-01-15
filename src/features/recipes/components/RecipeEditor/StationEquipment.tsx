import React, { useState } from "react";
import {
  ChefHat,
  Wrench,
  Lightbulb,
  Users,
  Plus,
  Trash2,
  Book,
  GripVertical,
} from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";
import type { Recipe } from "../../types/recipe";

interface StationEquipmentProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

interface EquipmentItem {
  id: string;
  name: string;
}

export const StationEquipment: React.FC<StationEquipmentProps> = ({
  recipe,
  onChange,
}) => {
  const { settings } = useOperationsStore();
  const kitchenStations = settings?.kitchen_stations || [];
  const [newEquipment, setNewEquipment] = useState("");

  const addEquipment = () => {
    if (!newEquipment.trim()) return;
    const newItem: EquipmentItem = {
      id: `eq-${Date.now()}`,
      name: newEquipment.trim(),
    };
    onChange({
      equipment: [...(recipe.equipment || []), newItem],
    });
    setNewEquipment("");
  };

  const removeEquipment = (id: string) => {
    onChange({
      equipment: (recipe.equipment || []).filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Book className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Station Management
            </h2>
            <p className="text-gray-400">
              Configure station assignments and responsibilities
            </p>
          </div>
        </div>
      </div>

      {/* Station Assignment Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Station Assignment
            </h3>
            <p className="text-sm text-gray-400">
              Define production and storage responsibilities
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300">
            <strong className="text-white">Important:</strong> Station
            assignments determine where this item appears in prep lists, task
            assignments, and inventory management. This affects:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-400">
            <li>• Daily prep list organization and task distribution</li>
            <li>• Production scheduling and workflow management</li>
            <li>• Storage location tracking and inventory responsibility</li>
            <li>• Quality control checkpoints and accountability</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Primary Station
            </label>
            <select
              value={recipe.primary_station || ""}
              onChange={(e) => onChange({ primary_station: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select primary station...</option>
              {kitchenStations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Main station responsible for production and quality control
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Secondary Station
            </label>
            <select
              value={recipe.secondary_station || ""}
              onChange={(e) => onChange({ secondary_station: e.target.value })}
              className="input w-full"
            >
              <option value="">Select secondary station...</option>
              {kitchenStations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Backup station for overflow or high-volume periods
            </p>
          </div>
        </div>
      </div>

      {/* Required Equipment Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Required Equipment
            </h3>
            <p className="text-sm text-gray-400">
              List tools and equipment needed for production
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addEquipment()}
              className="input flex-1"
              placeholder="Add equipment item..."
            />
            <button onClick={addEquipment} className="btn-primary px-4">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {(recipe.equipment || []).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg group"
              >
                <GripVertical className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-gray-300">{item.name}</span>
                <button
                  onClick={() => removeEquipment(item.id)}
                  className="text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chef's Notes Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Chef's Notes on Optimization
            </h3>
            <p className="text-sm text-gray-400">
              Tips for efficient production and workflow
            </p>
          </div>
        </div>

        <textarea
          value={recipe.production_notes || ""}
          onChange={(e) => onChange({ production_notes: e.target.value })}
          className="input w-full"
          rows={4}
          placeholder="Enter notes about production efficiency, timing, and workflow optimization..."
        />
      </div>
    </div>
  );
};
