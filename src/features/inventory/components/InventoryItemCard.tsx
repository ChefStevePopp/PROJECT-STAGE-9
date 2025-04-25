import React, { useState, useCallback, useMemo, memo } from "react";
import "./styles.css";
import { COLOR_PALETTE } from "./constants";

interface InventoryItemProps {
  item: any;
  onAddCount: (item: any) => void;
  inventoryCounts: any[];
}

export const InventoryItemCard = memo(
  ({ item, onAddCount, inventoryCounts }: InventoryItemProps) => {
    const [quantity, setQuantity] = useState(item.quantity || 0);
    const [isUpdating, setIsUpdating] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [isCountsExpanded, setIsCountsExpanded] = useState(false);

    const itemColor =
      COLOR_PALETTE[
        Math.abs(item.name?.charCodeAt(0) || 0) % COLOR_PALETTE.length
      ];

    // Format the last updated date if available
    const formattedLastUpdated = useMemo(() => {
      if (!item.lastUpdated) return null;
      try {
        const date = new Date(item.lastUpdated);
        return date.toLocaleString();
      } catch (e) {
        return null;
      }
    }, [item.lastUpdated]);

    // Get counts that match this item's ID - strict matching only
    const itemCounts = useMemo(() => {
      // Safety checks
      if (
        !inventoryCounts ||
        !Array.isArray(inventoryCounts) ||
        !item ||
        !item.id
      ) {
        return [];
      }

      // Normalize the item ID to a clean string without any special characters
      const normalizedItemId = String(item.id).trim();

      // Get all counts where master_ingredient_id matches the item's ID
      // Only include counts that have a valid ID and quantity
      const matchingCounts = inventoryCounts.filter((count) => {
        if (!count || !count.id) return false;

        // Get the ingredient ID from the count record
        const countIngredientId = count.master_ingredient_id;
        const alternativeId = count.masterIngredientId;

        if (!countIngredientId && !alternativeId) return false;

        // Normalize the IDs for comparison
        const normalizedCountId = countIngredientId
          ? String(countIngredientId).trim()
          : null;
        const normalizedAltId = alternativeId
          ? String(alternativeId).trim()
          : null;

        // Check if either ID matches the item's ID
        return (
          (normalizedCountId === normalizedItemId ||
            normalizedAltId === normalizedItemId) &&
          // Ensure this is an actual inventory count record, not just a master ingredient
          count.quantity !== undefined
        );
      });

      if (debugMode) {
        console.log(
          `[${item.name}] (ID: ${normalizedItemId}) has ${matchingCounts.length} matching counts`,
        );
        if (matchingCounts.length > 0) {
          console.log(`First matching count:`, {
            countId: matchingCounts[0]?.id,
            master_ingredient_id: matchingCounts[0]?.master_ingredient_id,
            masterIngredientId: matchingCounts[0]?.masterIngredientId,
            quantity: matchingCounts[0]?.quantity,
          });
        }
      }

      return matchingCounts;
    }, [inventoryCounts, item, debugMode]);

    // Calculate pending counts
    const pendingCounts = useMemo(() => {
      return itemCounts.filter((count) => count.status === "pending").length;
    }, [itemCounts]);

    // Calculate total pending quantity
    const pendingQuantity = useMemo(() => {
      return itemCounts
        .filter((count) => count && count.status === "pending")
        .reduce((sum, count) => {
          // Handle different data types for quantity
          let countQuantity = 0;
          if (typeof count.quantity === "number") {
            countQuantity = count.quantity;
          } else if (typeof count.quantity === "string") {
            countQuantity = parseFloat(count.quantity);
          } else if (count.quantity !== null && count.quantity !== undefined) {
            countQuantity = parseFloat(String(count.quantity));
          }

          return sum + (isNaN(countQuantity) ? 0 : countQuantity);
        }, 0);
    }, [itemCounts]);

    // Calculate total quantity from all counts
    const totalQuantity = useMemo(() => {
      return itemCounts
        .reduce((total, count) => {
          const countQuantity = parseFloat(count.quantity?.toString() || "0");
          return total + (isNaN(countQuantity) ? 0 : countQuantity);
        }, 0)
        .toFixed(2);
    }, [itemCounts]);

    // Handle quantity change and save
    const handleQuantityChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        const newQuantity = isNaN(value) ? 0 : value;
        setQuantity(newQuantity);
      },
      [],
    );

    // Handle saving a new count
    const handleSaveChanges = useCallback(() => {
      if (isUpdating) return; // Prevent double submissions

      setIsUpdating(true);

      // Create a count object and save it
      const countData = {
        master_ingredient_id: item.id,
        masterIngredientId: item.id, // Include both formats for compatibility
        quantity: quantity,
        unitCost: item.unit_cost || item.inventory_unit_cost || 0,
        // totalValue is a generated column in the database, do not include it
        location: item.storage_area || "Main Storage",
        notes: `Count added on ${new Date().toLocaleDateString()}`,
        status: "pending",
      };

      // Call the onAddCount function with the updated item
      onAddCount({ ...item, quantity: quantity });

      // Reset updating state after a short delay
      setTimeout(() => setIsUpdating(false), 300);
    }, [item, quantity, onAddCount, isUpdating]);

    // Toggle debug mode
    const toggleDebugMode = useCallback(() => {
      setDebugMode((prev) => !prev);
    }, []);

    // Toggle counts expanded state
    const toggleCountsExpanded = useCallback(() => {
      setIsCountsExpanded((prev) => !prev);
    }, []);

    return (
      <div className="card overflow-hidden hover:bg-gray-800/80 transition-all duration-200">
        {/* Total Quantity Badge */}
        {itemCounts.length > 0 && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-gray-800/90 text-center text-gray-300 px-3 py-1 text-sm font-medium shadow-lg w-full">
            {totalQuantity} {item.unit || "units"}
            <span className="text-sm text-gray-300"> Counted</span>
          </div>
        )}
        <div className="aspect-square bg-gray-800 relative">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <img
                src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
                alt="Company Logo"
                className="w-full h-full object-contain p-4"
                loading="lazy"
              />
            </div>
          )}
        </div>
        <div className="p-4">
          <h5 className="font-medium text-white mb-2 line-clamp-1">
            {item.name}
          </h5>

          {/* Item Details */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3 text-xs">
            {item.unit && (
              <div className="text-gray-400">
                Inventory Unit:{" "}
                <span className="text-gray-300">{item.unit}</span>
              </div>
            )}
            {item.case_size && (
              <div className="text-gray-400">
                Case: <span className="text-gray-300">{item.case_size}</span>
              </div>
            )}
            {item.unit_cost && (
              <div className="text-gray-400">
                Price:{" "}
                <span className="text-gray-300">
                  ${item.unit_cost.toFixed(2)}
                </span>
              </div>
            )}
            {item.inventory_unit_cost !== undefined && (
              <div className="text-gray-400">
                Inv Unit Cost:{" "}
                <span className="text-gray-300">
                  ${item.inventory_unit_cost.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Count Input */}
          <div className="mb-3">
            <label className="text-sm text-gray-400 block mb-1">Count:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleSaveChanges}
                className="input w-full text-white"
                min="0"
                step="0.01"
                inputMode="decimal"
              />
              <span className="text-gray-400 whitespace-nowrap">
                {item.unit || "units"}
              </span>
            </div>
            {item.inventory_unit_cost !== undefined && (
              <div className="text-right text-xs text-gray-300 mt-1">
                Total: ${(quantity * item.inventory_unit_cost).toFixed(2)}
              </div>
            )}
          </div>

          {/* Last Count Information */}
          {formattedLastUpdated && (
            <div className="mb-3 text-xs">
              <div className="text-gray-400">
                Last counted:{" "}
                <span className="text-gray-300">{formattedLastUpdated}</span>
              </div>
              {item.countedByName && (
                <div className="text-gray-400">
                  Counted by:{" "}
                  <span className="text-gray-300">{item.countedByName}</span>
                </div>
              )}
            </div>
          )}

          {/* Status and Tags */}
          <div className="flex flex-wrap gap-2">
            {item.status && (
              <div
                className={`inline-block px-2 py-1 rounded-md text-xs capitalize
              ${
                item.status === "completed"
                  ? "bg-green-500/20 text-green-400"
                  : item.status === "verified"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-amber-500/20 text-amber-400"
              }`}
              >
                {item.status}
              </div>
            )}
            {item.storage_area && (
              <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                {item.storage_area}
              </div>
            )}
            {item.vendor && (
              <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                {item.vendor}
              </div>
            )}
          </div>

          {/* All Counts Expandable Section */}
          <div className="mt-3 border-t border-gray-700 pt-2">
            <div className="expandable-info-section bg-gray-800">
              <button
                className="expandable-info-header mb-3"
                onClick={toggleCountsExpanded}
                aria-expanded={isCountsExpanded}
              >
                <div className="flex-none text-gray-600 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${isCountsExpanded ? "rotate-90" : ""}`}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h6 className="text-sm font-medium text-white">
                      Count History
                    </h6>
                    <span className="text-xs text-gray-400">
                      {itemCounts.length} total
                    </span>
                  </div>
                  {pendingCounts > 0 && <></>}
                </div>
              </button>

              {isCountsExpanded && (
                <div className="expandable-info-content bg-gray-800">
                  {/* Debug information */}
                  {debugMode && (
                    <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-900 rounded">
                      <div>Item ID: {item.id}</div>
                      <div>Item ID Type: {typeof item.id}</div>
                      <div>Matching Counts: {itemCounts.length}</div>
                      <div>Pending Counts: {pendingCounts}</div>
                      <div>
                        Total Pending Quantity: {pendingQuantity.toFixed(2)}
                      </div>
                      <div>Available Counts: {inventoryCounts.length}</div>
                    </div>
                  )}

                  {/* Show ALL counts that match this item's master_ingredient_id */}
                  {itemCounts.length > 0 ? (
                    itemCounts
                      .sort((a, b) => {
                        // Sort by date, newest first
                        const dateA = new Date(
                          a.count_date || a.created_at || 0,
                        );
                        const dateB = new Date(
                          b.count_date || b.created_at || 0,
                        );
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map((count, index) => {
                        // Parse quantity to ensure it's displayed as a number
                        const displayQuantity = parseFloat(
                          count.quantity?.toString() || "0",
                        );

                        return (
                          <div
                            key={count.id || index}
                            className="text-xs mb-2 p-2 bg-gray-800 rounded border border-gray-700"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-medium">
                                {isNaN(displayQuantity)
                                  ? 0
                                  : displayQuantity.toFixed(2)}{" "}
                                {item.unit || "units"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                                  count.status === "completed"
                                    ? "bg-green-500/20 text-green-400"
                                    : count.status === "verified"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {count.status || "pending"}
                              </span>
                            </div>
                            <div className="mt-1 text-gray-400">
                              Location:{" "}
                              <span className="text-gray-300">
                                {count.location || "Main Storage"}
                              </span>
                            </div>
                            <div className="flex flex-col mt-1">
                              <div className="text-gray-500">
                                Time:{" "}
                                {new Date(
                                  count.count_date ||
                                    count.created_at ||
                                    Date.now(),
                                ).toLocaleTimeString()}{" "}
                                on{" "}
                                {new Date(
                                  count.count_date ||
                                    count.created_at ||
                                    Date.now(),
                                ).toLocaleDateString()}
                              </div>
                              {count.id && (
                                <div className="text-gray-500 font-mono truncate">
                                  ID:{" "}
                                  {(count.id.toString() || "").substring(0, 8)}
                                  ...
                                </div>
                              )}
                            </div>
                            {/* Additional debug info when debug mode is on */}
                            {debugMode && (
                              <>
                                <div className="text-gray-500 text-xs mt-1">
                                  Unit Cost: $
                                  {parseFloat(
                                    count.unitCost || count.unit_cost || 0,
                                  ).toFixed(2)}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  Total Value: $
                                  {parseFloat(
                                    count.totalValue || count.total_value || 0,
                                  ).toFixed(2)}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  masterIngredientId:{" "}
                                  {count.masterIngredientId
                                    ? count.masterIngredientId.substring(0, 8) +
                                      "..."
                                    : "undefined"}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                  master_ingredient_id:{" "}
                                  {count.master_ingredient_id
                                    ? count.master_ingredient_id.substring(
                                        0,
                                        8,
                                      ) + "..."
                                    : "undefined"}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    /* No counts message */
                    <div className="text-xs text-gray-500 italic text-center py-1">
                      No counts for this item
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
