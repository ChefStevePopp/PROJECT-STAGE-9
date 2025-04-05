import React, { useState, useEffect } from "react";
import { Layers, ChevronDown, Package, Box } from "lucide-react";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";

interface PrepSystemSelectorProps {
  taskId: string;
  currentSystem?: "par" | "as_needed" | "scheduled_production" | "hybrid";
  onSelectSystem: (
    taskId: string,
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => Promise<void>;
  onUpdateAmount?: (taskId: string, amount: number) => Promise<void>;
  onUpdatePar?: (taskId: string, par: number) => Promise<void>;
  onUpdateCurrent?: (taskId: string, current: number) => Promise<void>;
  masterIngredientId?: string;
}

export const PrepSystemSelector: React.FC<PrepSystemSelectorProps> = ({
  taskId,
  currentSystem = "as_needed",
  onSelectSystem,
  onUpdateAmount,
  onUpdatePar,
  onUpdateCurrent,
  masterIngredientId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [parLevel, setParLevel] = useState<number | undefined>(undefined);
  const [currentLevel, setCurrentLevel] = useState<number | undefined>(
    undefined,
  );
  const [casesAmount, setCasesAmount] = useState<number>(0);
  const [unitsAmount, setUnitsAmount] = useState<number>(0);
  const [masterIngredient, setMasterIngredient] = useState<any>(null);

  const { ingredients, fetchIngredients } = useMasterIngredientsStore();

  // Fetch master ingredients if needed
  useEffect(() => {
    if (masterIngredientId && ingredients.length === 0) {
      fetchIngredients();
    }
  }, [masterIngredientId, ingredients.length, fetchIngredients]);

  // Find the master ingredient data when ingredients are loaded
  useEffect(() => {
    if (masterIngredientId && ingredients.length > 0) {
      const ingredient = ingredients.find(
        (ing) => ing.id === masterIngredientId,
      );
      if (ingredient) {
        setMasterIngredient(ingredient);
        console.log("Found master ingredient:", ingredient);

        // If we have case size data and we're in as_needed mode, pre-populate with 1 case
        if (
          ingredient.units_per_case &&
          currentSystem === "as_needed" &&
          !amount
        ) {
          setCasesAmount(1);
          setAmount(ingredient.units_per_case);
        }
      }
    }
  }, [masterIngredientId, ingredients, currentSystem, amount]);

  const handleSelectSystem = async (
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => {
    setIsLoading(true);
    try {
      await onSelectSystem(taskId, system);
      if (system === "par" || system === "as_needed" || system === "hybrid") {
        setShowAmountInput(true);
      } else {
        setShowAmountInput(false);
      }
    } catch (error) {
      console.error("Error setting prep system:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleUpdateAmount = async () => {
    if (!amount || !onUpdateAmount) return;
    setIsLoading(true);
    try {
      await onUpdateAmount(taskId, amount);
    } catch (error) {
      console.error("Error updating amount:", error);
    } finally {
      setIsLoading(false);
      setShowAmountInput(false);
    }
  };

  const handleUpdatePar = async () => {
    if (!parLevel || !onUpdatePar) return;
    setIsLoading(true);
    try {
      await onUpdatePar(taskId, parLevel);
    } catch (error) {
      console.error("Error updating PAR level:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCurrent = async () => {
    if (currentLevel === undefined || !onUpdateCurrent) return;
    setIsLoading(true);
    try {
      await onUpdateCurrent(taskId, currentLevel);
    } catch (error) {
      console.error("Error updating current level:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCasesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cases = parseInt(e.target.value) || 0;
    setCasesAmount(cases);

    // Calculate total amount based on cases and units per case
    if (masterIngredient && masterIngredient.units_per_case) {
      const totalAmount = cases * masterIngredient.units_per_case + unitsAmount;
      setAmount(totalAmount);
    } else {
      // If no master ingredient data, just use the cases value
      setAmount(cases);
    }
  };

  const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const units = parseInt(e.target.value) || 0;
    setUnitsAmount(units);

    // Calculate total amount based on cases and units
    if (masterIngredient && masterIngredient.units_per_case) {
      const totalAmount = casesAmount * masterIngredient.units_per_case + units;
      setAmount(totalAmount);
    } else {
      // If no master ingredient data, just add to the cases value
      setAmount(casesAmount + units);
    }
  };

  const getSystemLabel = (system: string) => {
    switch (system) {
      case "par":
        return "PAR-based";
      case "as_needed":
        return "As Needed";
      case "scheduled_production":
        return "Scheduled";
      case "hybrid":
        return "Hybrid";
      default:
        return "Select System";
    }
  };

  return (
    <div className="relative">
      <button
        data-task-id={taskId}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded hover:bg-gray-700 transition-colors"
        disabled={isLoading}
      >
        <Layers className="w-3 h-3" />
        <span>{getSystemLabel(currentSystem)}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          <div className="py-1">
            <button
              onClick={() => handleSelectSystem("par")}
              className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentSystem === "par" ? "text-blue-400" : "text-white"}`}
            >
              <Layers className="w-4 h-4" />
              PAR-based
            </button>
            <button
              data-prep-selector={taskId}
              onClick={() => {
                handleSelectSystem("as_needed");
                if (currentSystem === "as_needed") {
                  setShowAmountInput(true);
                }
              }}
              className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentSystem === "as_needed" ? "text-blue-400" : "text-white"}`}
            >
              <Layers className="w-4 h-4" />
              As Needed
            </button>
            <button
              onClick={() => handleSelectSystem("scheduled_production")}
              className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentSystem === "scheduled_production" ? "text-blue-400" : "text-white"}`}
            >
              <Layers className="w-4 h-4" />
              Scheduled
            </button>
            <button
              onClick={() => handleSelectSystem("hybrid")}
              className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentSystem === "hybrid" ? "text-blue-400" : "text-white"}`}
            >
              <Layers className="w-4 h-4" />
              Hybrid
            </button>
          </div>
        </div>
      )}

      {showAmountInput && (
        <div className="absolute z-10 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg p-3">
          <h4 className="text-sm font-medium text-white mb-2">
            {currentSystem === "par" ? "Set PAR Levels" : "Set Required Amount"}
          </h4>

          {currentSystem === "par" ? (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  PAR Level
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={parLevel || ""}
                    onChange={(e) => setParLevel(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-l px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter PAR level"
                  />
                  <button
                    onClick={handleUpdatePar}
                    className="bg-blue-500/30 text-blue-300 px-3 py-1 rounded-r hover:bg-blue-500/50 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Current Level
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={currentLevel || ""}
                    onChange={(e) =>
                      setCurrentLevel(parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-l px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter current level"
                  />
                  <button
                    onClick={handleUpdateCurrent}
                    className="bg-green-500/30 text-green-300 px-3 py-1 rounded-r hover:bg-green-500/50 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <button
                  onClick={() => setShowAmountInput(false)}
                  className="w-full bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div>
              {masterIngredient && masterIngredient.units_per_case ? (
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center text-xs text-gray-400 mb-1">
                      <Package className="w-3 h-3 mr-1" />
                      Cases ({masterIngredient.units_per_case}{" "}
                      {masterIngredient.unit_of_measure || "units"}/case)
                    </label>
                    <input
                      type="number"
                      value={casesAmount || ""}
                      onChange={handleCasesChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter cases"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-xs text-gray-400 mb-1">
                      <Box className="w-3 h-3 mr-1" />
                      Units ({masterIngredient.unit_of_measure || "units"})
                    </label>
                    <input
                      type="number"
                      value={unitsAmount || ""}
                      onChange={handleUnitsChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter units"
                      min="0"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-700 mt-2">
                    <div className="text-xs text-gray-400 mb-2">
                      Total: {amount || 0}{" "}
                      {masterIngredient.unit_of_measure || "units"}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateAmount}
                        className="flex-1 bg-amber-500/30 text-amber-300 px-3 py-1 rounded hover:bg-amber-500/50 transition-colors"
                      >
                        Set Amount
                      </button>
                      <button
                        onClick={() => setShowAmountInput(false)}
                        className="flex-1 bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex">
                    <input
                      type="number"
                      value={amount || ""}
                      onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-l px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                    <button
                      onClick={handleUpdateAmount}
                      className="bg-amber-500/30 text-amber-300 px-3 py-1 rounded-r hover:bg-amber-500/50 transition-colors"
                    >
                      Set
                    </button>
                  </div>

                  <div className="mt-2">
                    <button
                      onClick={() => setShowAmountInput(false)}
                      className="w-full bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
