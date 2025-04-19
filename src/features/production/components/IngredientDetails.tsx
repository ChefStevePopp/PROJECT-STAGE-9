import React from "react";
import {
  Clock,
  User,
  CheckCircle,
  GripVertical,
  ChevronDown,
  ChevronUp,
  MapPin,
  Award,
  Users,
  RefreshCw,
  Package,
  Thermometer,
  Scale,
  Gauge,
  Database,
  ChefHat,
  CalendarClock,
  Play,
  Pause,
  Carrot,
  CookingPot,
  NotebookPen,
  ListTodo,
  Calculator,
  AlertCircle,
  ShoppingCart,
  Image as ImageIcon,
} from "lucide-react";
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

  // Get image URL from masterIngredientData if available
  const imageUrl = masterIngredientData?.image_url || null;

  return (
    <div className="mb-3 p-2 rounded-lg bg-gray-800/70 border border-gray-700/70 shadow-inner">
      {/* Header section with two column headers */}
      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center">
              <div className="flex items-center gap-2 text-lg text-gray-400 bg-slate-700/30 p-2 border border-orange-500/30 rounded-lg mb-2 w-full">
                <div className="w-8 h-8 flex items-center justify-center bg-slate-700/30 rounded-full border border-slate-300/50 mr-2">
                  <Carrot className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-m text-white pl-1 p-1 font-medium">
                  Ingredient Information
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <div className="flex items-center gap-2 text-lg text-gray-400 bg-slate-700/30 p-2 border border-emerald-500/30 rounded-lg mb-2 w-full">
                <div className="w-8 h-8 flex items-center justify-center bg-slate-700/30 rounded-full border border-slate-300/50 mr-2">
                  <CookingPot className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-m text-white pl-1 p-1 font-medium">
                  Production Requirements
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content with two distinct columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* LEFT COLUMN - Ingredient Information */}
          <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 shadow-lg">
            {/* Ingredient Name Banner */}
            <div className="flex items-center justify-between bg-slate-700/30 p-2 rounded-lg border border-orange-500/30 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-slate-400/20 rounded-full border border-slate-300/30">
                  <Package className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Name</span>
                  <span className="text-sm font-medium text-white">
                    {task.master_ingredient_name ||
                      masterIngredientData?.name ||
                      masterIngredientData?.product ||
                      (task.master_ingredient_id
                        ? `Ingredient ID: ${task.master_ingredient_id}`
                        : "Unknown Ingredient")}
                  </span>
                </div>
              </div>
            </div>

            {/* Case Size & Units */}
            {(task.case_size || masterIngredientData?.case_size) && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30 border border-orange-500/30 mb-3">
                <div className="w-8 h-8 flex items-center justify-center bg-slate-400/20 rounded-full border border-slate-300/30">
                  <ShoppingCart className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300">
                    Case Information
                  </span>
                  <span className="flex flex-col text-sm">
                    <span className="text-white">
                      {task.case_size ||
                        masterIngredientData?.case_size ||
                        "N/A"}
                    </span>
                    <span className="text-xs italic text-primary-500">
                      {task.units_per_case ||
                        masterIngredientData?.units_per_case ||
                        "N/A"}{" "}
                      units per case
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Grid of Ingredient Properties as Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Image Card (Replacing Unit Card) */}
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-700/30 border border-orange-500/30 col-span-1 md:col-span-2 overflow-hidden">
                {imageUrl ? (
                  <div className="w-full h-32 rounded-md overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={
                        task.master_ingredient_name ||
                        masterIngredientData?.name ||
                        "Ingredient"
                      }
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/api/placeholder/400/320";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-slate-800/50 rounded-md flex flex-col items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-600 mb-2" />
                    <span className="text-xs text-slate-500">
                      No image available
                    </span>
                  </div>
                )}
              </div>
              {/* Par Level */}
              {(task.par !== undefined ||
                masterIngredientData?.par !== undefined) && (
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30">
                  <div className="w-7 h-7 flex items-center justify-center bg-purple-500/30 rounded-full border border-purple-400/50 mb-1">
                    <Gauge className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-gray-400">Par Level</span>
                  <span className="text-sm font-medium text-center">
                    {task.par !== undefined
                      ? task.par
                      : masterIngredientData?.par}{" "}
                    {task.unit_of_measure ||
                      masterIngredientData?.unit_of_measure}
                  </span>
                </div>
              )}

              {/* Current Amount */}
              {(task.current !== undefined ||
                masterIngredientData?.current !== undefined) && (
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30">
                  <div className="w-7 h-7 flex items-center justify-center bg-orange-500/30 rounded-full border border-orange-400/50 mb-1">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-gray-400">Current</span>
                  <span className="text-sm font-medium text-center">
                    {task.current !== undefined
                      ? task.current
                      : masterIngredientData?.current}{" "}
                    {task.unit_of_measure ||
                      masterIngredientData?.unit_of_measure}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Production Requirements */}
          <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 shadow-lg">
            {/* Amount Needed Card */}
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-slate-700/30 text-slate-300 border border-emerald-500/40 mb-3">
              <div className="w-8 h-8 flex items-center justify-center bg-slate-700/30 rounded-full border border-slate-400/50 mb-2">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-400">Amount Needed</span>
              {task.amount_required ? (
                <>
                  <span className="text-2xl font-bold">
                    {task.amount_required}
                  </span>
                  <span className="text-sm">
                    {task.prep_unit_measure ||
                      task.unit_of_measure ||
                      masterIngredientData?.unit_of_measure ||
                      "units"}
                  </span>
                  <span className="text-xs text-blue-300/70 mt-1 text-center">
                    Total needed for today's production
                  </span>
                </>
              ) : (
                <span className="text-lg text-white italic my-3">
                  Not specified
                </span>
              )}
            </div>

            {/* Cases Breakdown Card */}
            {task.cases_required && task.units_per_case && (
              <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/30 rounded-full border border-blue-400/50 mb-1">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-400">
                  Cases & Units Breakdown
                </span>
                <span className="text-lg font-medium">
                  {task.cases_required}{" "}
                  {task.cases_required === 1 ? "case" : "cases"}
                </span>
                {task.units_required && (
                  <span className="text-sm">
                    + {task.units_required}{" "}
                    {task.units_required === 1 ? "unit" : "units"}
                  </span>
                )}
                <span className="text-xs text-blue-300/70 mt-1 text-center">
                  Helps with inventory management and ordering
                </span>
              </div>
            )}
            {/* Storage Location */}
            {(task.storage_area || masterIngredientData?.storage_area) && (
              <div className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors bg-slate-700/30 text-slate-400 border border-emerald-500/40">
                <div className="w-8 h-8 flex items-center justify-center bg-slate-700/30 rounded-full border border-slate-400/50 mb-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-xs text-emerald-300">
                  Sourcing Location
                </span>
                <span className="text-sm text-white font-medium text-center">
                  {task.storage_area || masterIngredientData?.storage_area}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
