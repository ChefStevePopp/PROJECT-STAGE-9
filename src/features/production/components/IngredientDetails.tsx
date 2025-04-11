import React from "react";
import { Task } from "@/types/tasks";

interface IngredientDetailsProps {
  task: Task;
  masterIngredientData: any;
}

export const IngredientDetails: React.FC<IngredientDetailsProps> = ({
  task,
  masterIngredientData,
}) => {
  if (!task.master_ingredient_id && !task.master_ingredient_name) {
    return null;
  }

  return (
    <div className="mb-3 p-3 rounded-lg bg-gray-800/70 border border-gray-700/70 shadow-inner">
      <div className="grid grid-cols-2 gap-4 mb-2 pb-2 border-b border-gray-700/50">
        <h4 className="text-sm font-medium text-white">
          Ingredient Information
        </h4>
        <h4 className="border-l border-gray-700/50 pl-4 text-sm font-medium text-white">
          Production Requirements
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column - Ingredient Details */}
        <div className="grid grid-cols-1 gap-2">
          {/* Ingredient Name */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Name:</span>
              <span className="text-sm font-medium text-white">
                {task.master_ingredient_name ||
                  masterIngredientData?.name ||
                  masterIngredientData?.product ||
                  (task.master_ingredient_id
                    ? `Ingredient ID: ${task.master_ingredient_id}`
                    : "Unknown Ingredient")}
              </span>
            </div>
            {/* Case Size & Units */}
            {(task.case_size || masterIngredientData?.case_size) && (
              <div className="text-xs text-amber-200/70 ml-2">
                Case size:{" "}
                {task.case_size || masterIngredientData?.case_size || "N/A"},
                Units per case:{" "}
                {task.units_per_case ||
                  masterIngredientData?.units_per_case ||
                  "N/A"}
              </div>
            )}
          </div>

          {/* Storage Location */}
          {(task.storage_area || masterIngredientData?.storage_area) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Storage:</span>
              <span className="text-sm text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {task.storage_area || masterIngredientData?.storage_area}
              </span>
            </div>
          )}

          {/* Case Size & Units section removed - moved to be under the ingredient name */}

          {/* Unit of Measure */}
          {(task.unit_of_measure || masterIngredientData?.unit_of_measure) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Unit:</span>
              <span className="text-sm text-green-300">
                {task.unit_of_measure || masterIngredientData?.unit_of_measure}
              </span>
            </div>
          )}

          {/* Par Level */}
          {(task.par !== undefined ||
            masterIngredientData?.par !== undefined) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Par Level:</span>
              <span className="text-sm text-purple-300">
                {task.par !== undefined ? task.par : masterIngredientData?.par}
              </span>
            </div>
          )}

          {/* Current Amount */}
          {(task.current !== undefined ||
            masterIngredientData?.current !== undefined) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Current Amount:</span>
              <span className="text-sm text-orange-300">
                {task.current !== undefined
                  ? task.current
                  : masterIngredientData?.current}
              </span>
            </div>
          )}
        </div>

        {/* Right Column - Amount Needed */}
        <div className="grid grid-cols-1 gap-2 border-l border-gray-700/50 pl-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Amount Needed:</span>
            {task.amount_required ? (
              <span className="text-sm font-medium text-yellow-300">
                {task.amount_required}{" "}
                {task.prep_unit_measure ||
                  task.unit_of_measure ||
                  masterIngredientData?.unit_of_measure ||
                  "units"}
              </span>
            ) : (
              <span className="text-sm text-gray-500 italic">
                Not specified
              </span>
            )}
            <span className="text-xs text-blue-300/70 mt-1">
              This is the total amount needed for today's production
            </span>
          </div>

          {task.cases_required && task.units_per_case && (
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-xs text-gray-400">
                Cases and Units needed in total:
              </span>
              <span className="text-sm font-medium text-yellow-300">
                {task.amount_required}{" "}
                {task.prep_unit_measure ||
                  task.unit_of_measure ||
                  masterIngredientData?.unit_of_measure ||
                  "units"}
              </span>
              <span className="text-sm text-yellow-200/80">
                ({task.cases_required}{" "}
                {task.cases_required === 1 ? "case" : "cases"}
                {task.units_required
                  ? ` + ${task.units_required} ${task.units_required === 1 ? "unit" : "units"}`
                  : ""}
                )
              </span>
              <span className="text-xs text-blue-300/70 mt-1">
                This breakdown helps with inventory management and ordering
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
