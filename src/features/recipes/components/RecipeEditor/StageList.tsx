import React, { useState } from "react";
import {
  Book,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  PenLine,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  FileDigit,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Recipe, RecipeStage } from "../../types/recipe";

interface StageListProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

const stageColors = [
  "bg-blue-500/20 text-blue-400",
  "bg-green-500/20 text-green-400",
  "bg-purple-500/20 text-purple-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
  "bg-teal-500/20 text-teal-400",
];

const SortableStage: React.FC<{
  stage: RecipeStage;
  index: number;
  onUpdate: (index: number, updates: Partial<RecipeStage>) => void;
  onDelete: (index: number) => void;
}> = ({ stage, index, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stage.id });

  const [isEditing, setIsEditing] = useState(false);
  const [stageName, setStageName] = useState(stage.name);

  const handleSaveName = () => {
    onUpdate(index, { name: stageName });
    setIsEditing(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colorClass = stageColors[index % stageColors.length];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800/50 rounded-lg p-3 mb-2 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="w-5 h-5 text-gray-500 hover:text-gray-400" />
        </div>

        <div className={`w-3 h-3 rounded-full ${colorClass.split(" ")[0]}`} />

        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              className="input py-1 px-2 text-sm bg-gray-800 border-gray-700 w-40"
              placeholder="Stage name..."
              autoFocus
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{stage.name}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <PenLine className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={stage.is_prep_list_task}
            onChange={(e) =>
              onUpdate(index, { is_prep_list_task: e.target.checked })
            }
            className="checkbox"
          />
          <span className="text-xs text-gray-300">Prep List Task</span>
        </label>

        <button
          onClick={() => onDelete(index)}
          className="text-gray-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const StageList: React.FC<StageListProps> = ({ recipe, onChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const handleStageChange = (index: number, updates: Partial<RecipeStage>) => {
    const updatedStages = [...(recipe.stages || [])];
    updatedStages[index] = { ...updatedStages[index], ...updates };
    onChange({ stages: updatedStages });
  };

  const addStage = () => {
    const newStage: RecipeStage = {
      id: `stage-${Date.now()}`,
      name: `Stage ${(recipe.stages || []).length + 1}`,
      is_prep_list_task: false,
      sort_order: (recipe.stages || []).length,
    };

    onChange({
      stages: [...(recipe.stages || []), newStage],
    });
    setIsExpanded(true); // Auto-expand when adding a new stage
  };

  const removeStage = (index: number) => {
    // Get the stage ID that's being removed
    const stageId = recipe.stages[index].id;

    // Update any steps that reference this stage to remove the reference
    const updatedSteps = (recipe.steps || []).map((step) => {
      if (step.stage_id === stageId) {
        return { ...step, stage_id: undefined };
      }
      return step;
    });

    const updatedStages = (recipe.stages || []).filter((_, i) => i !== index);
    onChange({
      stages: updatedStages,
      steps: updatedSteps,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = recipe.stages?.findIndex(
        (stage) => stage.id === active.id,
      );
      const newIndex = recipe.stages?.findIndex(
        (stage) => stage.id === over.id,
      );
      if (oldIndex !== undefined && newIndex !== undefined) {
        const newStages = arrayMove(recipe.stages || [], oldIndex, newIndex);

        // Update sort_order values
        const updatedStages = newStages.map((stage, index) => ({
          ...stage,
          sort_order: index,
        }));

        onChange({ stages: updatedStages });
      }
    }
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="space-y-4 mb-6 expandable-info-section">
      <button
        onClick={toggleExpanded}
        className="expandable-info-header w-full"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FileDigit className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Recipe Stages</h2>
              <p className="text-sm text-gray-400">
                Group your steps into logical stages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {recipe.stages?.length || 0} stages
            </span>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="expandable-info-content">
          <div className="flex justify-end mb-4">
            <button onClick={addStage} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={(recipe.stages || []).map((stage) => stage.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {(recipe.stages || []).map((stage, index) => (
                  <SortableStage
                    key={stage.id}
                    stage={stage}
                    index={index}
                    onUpdate={handleStageChange}
                    onDelete={removeStage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {(!recipe.stages || recipe.stages.length === 0) && (
            <div className="text-center py-4 text-gray-400 bg-gray-800/30 rounded-lg">
              No stages added yet. Click "Add Stage" to begin organizing your
              recipe steps.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StageList;
