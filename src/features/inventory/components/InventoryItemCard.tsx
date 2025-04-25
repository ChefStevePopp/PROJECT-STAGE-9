import React, { useState, useCallback, useMemo, memo } from "react";
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

    // Get counts that match this item's ID - FIXED COMPARISON LOGIC
    const itemCounts = useMemo(() => {
      if (!inventoryCounts || !Array.isArray(inventoryCounts)) return [];
      if (!item.id) return [];

      // Convert item ID to string once for comparison
      const itemIdStr = item.id.toString();

      return inventoryCounts.filter((count) => {
        // Check both possible property names
        const countIngredientId =
          count.masterIngredientId || count.master_ingredient_id;

        if (!countIngredientId) return false;

        // Convert count ID to string for comparison
        const countIdStr = countIngredientId.toString();

        return countIdStr === itemIdStr;
      });
    }, [inventoryCounts, item.id]);

    // Calculate pending counts - only those with status "pending"
    const pendingCounts = useMemo(() => {
      return itemCounts.filter((count) => count.status === "pending").length;
    }, [itemCounts]);

    // Calculate total pending quantity
    const pendingQuantity = useMemo(() => {
      return itemCounts
        .filter((count) => count.status === "pending")
        .reduce((sum, count) => {
          const countQuantity = parseFloat(count.quantity?.toString() || "0");
          return sum + (isNaN(countQuantity) ? 0 : countQuantity);
        }, 0);
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
        quantity: quantity,
        unitCost: item.unit_cost || item.inventory_unit_cost || 0,
        totalValue:
          quantity * (item.unit_cost || item.inventory_unit_cost || 0),
        location: item.storage_area || "Main Storage",
        notes: `Count added on ${new Date().toLocaleDateString()}`,
        status: "pending",
      };

      // Call the onAddCount function with the updated item
      onAddCount({ ...item, quantity: quantity });

      // Reset updating state after a short delay
      setTimeout(() => setIsUpdating(false), 300);
    }, [item, quantity, onAddCount, isUpdating]);

    return (
      <div className="card overflow-hidden hover:bg-gray-800/80 transition-all duration-200">
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
            {/* Pending Quantity Badge */}
            {pendingQuantity > 0 && (
              <div className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400">
                {pendingQuantity.toFixed(2)} {item.unit || "units"} counted
              </div>
            )}
            {item.status && (
              <div
                className={`inline-block px-2 py-1 rounded-md text-xs font-medium capitalize
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
              <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                {item.storage_area}
              </div>
            )}
            {item.vendor && (
              <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                {item.vendor}
              </div>
            )}
          </div>

          {/* All Counts List */}
          <div className="mt-3 border-t border-gray-700 pt-2">
            <div className="flex justify-between items-center mb-2">
              <h6 className="text-sm font-medium text-white">All Counts</h6>
              <span className="text-xs text-gray-400">
                {itemCounts.length} total
              </span>
            </div>

            {/* Display helpful debug information only in development */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-gray-500 mb-2">
                <div>Item ID: {item.id}</div>
                <div>Matching Counts: {itemCounts.length}</div>
              </div>
            )}

            {/* Show ALL counts that match this item's master_ingredient_id */}
            {itemCounts.length > 0 ? (
              itemCounts
                .sort((a, b) => {
                  // Sort by date, newest first
                  const dateA = new Date(a.count_date || a.created_at || 0);
                  const dateB = new Date(b.count_date || b.created_at || 0);
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

                      <div className="flex justify-between mt-1">
                        <span className="text-gray-500">
                          Date:{" "}
                          {new Date(
                            count.count_date || count.created_at || Date.now(),
                          ).toLocaleDateString()}
                        </span>
                        {count.id && (
                          <span className="text-gray-500 font-mono truncate">
                            ID: {(count.id.toString() || "").substring(0, 8)}...
                          </span>
                        )}
                      </div>

                      {process.env.NODE_ENV === "development" && (
                        <>
                          <div className="text-gray-500 text-xs mt-1">
                            Unit Cost: $
                            {parseFloat(count.unit_cost || 0).toFixed(2)}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            Total Value: $
                            {parseFloat(count.total_value || 0).toFixed(2)}
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

            {/* Pending counts summary */}
            {pendingCounts > 0 && (
              <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 p-2 rounded">
                <div className="font-semibold">
                  {pendingCounts} pending count{pendingCounts !== 1 ? "s" : ""}{" "}
                  totaling {pendingQuantity.toFixed(2)} {item.unit || "units"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
