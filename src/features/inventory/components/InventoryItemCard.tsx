import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
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

    // Calculate pending counts for this item with specific ID comparison logic
    const pendingCounts = useMemo(() => {
      if (!inventoryCounts || !Array.isArray(inventoryCounts)) return 0;

      const pendingItems = inventoryCounts.filter((count) => {
        // Get the count's master ingredient ID
        const countId = count.masterIngredientId || count.master_ingredient_id;
        const itemId = item.id;

        // Try multiple comparison methods
        const exactMatch = countId === itemId;
        const stringMatch = countId?.toString() === itemId?.toString();

        // For debugging specific items
        if (item.name === "2 OZ PORTION CUP" && (exactMatch || stringMatch)) {
          console.log("Match found for 2 OZ PORTION CUP:", {
            countId,
            itemId,
            exactMatch,
            stringMatch,
            count,
          });
        }

        return (exactMatch || stringMatch) && count.status === "pending";
      });

      return pendingItems.length;
    }, [inventoryCounts, item.id, item.name]);

    // Calculate total pending quantity with careful type handling
    const pendingQuantity = useMemo(() => {
      if (!inventoryCounts || !Array.isArray(inventoryCounts)) return 0;

      const pendingItems = inventoryCounts.filter((count) => {
        const countId = count.masterIngredientId || count.master_ingredient_id;
        const itemId = item.id;

        // Try multiple comparison methods
        return (
          (countId === itemId || countId?.toString() === itemId?.toString()) &&
          count.status === "pending"
        );
      });

      // Calculate sum with careful type conversion
      const total = pendingItems.reduce((sum, count) => {
        let countQuantity = 0;

        // Handle different formats of quantity
        if (count.quantity !== undefined && count.quantity !== null) {
          // Convert to number regardless of input type
          countQuantity = parseFloat(count.quantity.toString());
          if (isNaN(countQuantity)) countQuantity = 0;
        }

        return sum + countQuantity;
      }, 0);

      // Debug for specific items
      if (item.name === "2 OZ PORTION CUP" && pendingItems.length > 0) {
        console.log(
          `${item.name} has ${pendingItems.length} counts with total quantity ${total}`,
        );
        console.log(
          "Count details:",
          pendingItems.map((c) => ({
            id: c.id,
            quantity: c.quantity,
            type: typeof c.quantity,
          })),
        );
      }

      return total;
    }, [inventoryCounts, item.id, item.name]);

    // Handle quantity change and save
    const handleQuantityChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        const newQuantity = isNaN(value) ? 0 : value;
        setQuantity(newQuantity);
      },
      [],
    );

    // Save changes when input loses focus
    const handleSaveChanges = useCallback(() => {
      if (isUpdating) return; // Prevent double submissions

      setIsUpdating(true);

      // Create a count object and save it
      const countData = {
        masterIngredientId: item.id,
        quantity: quantity,
        unitCost: item.unit_cost || item.inventory_unit_cost || 0,
        totalValue:
          quantity * (item.unit_cost || item.inventory_unit_cost || 0),
        location: item.storage_area || "Main Storage",
        notes: "",
        status: "pending",
      };

      // Call the onAddCount function with the updated item
      onAddCount({ ...item, quantity: quantity });

      // Reset updating state after a short delay
      setTimeout(() => setIsUpdating(false), 300);
    }, [item, quantity, onAddCount, isUpdating]);

    // Debug specific items when component mounts
    useEffect(() => {
      if (item.name === "2 OZ PORTION CUP") {
        console.log("Rendering 2 OZ PORTION CUP item:", {
          id: item.id,
          idType: typeof item.id,
        });
      }
    }, [item.name, item.id]);

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
                {pendingQuantity.toFixed(2)} counted
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

          {/* Pending Counts List */}
          {inventoryCounts && Array.isArray(inventoryCounts) && (
            <div className="mt-3 border-t border-gray-700 pt-2">
              {inventoryCounts
                .filter((count) => {
                  const countId =
                    count.masterIngredientId || count.master_ingredients_id;
                  const itemId = item.id;
                  return (
                    (countId === itemId ||
                      countId?.toString() === itemId?.toString()) &&
                    count.status === "pending" &&
                    count.quantity > 0
                  );
                })
                .map((count, index) => (
                  <div
                    key={count.id || index}
                    className="text-xs mb-1 p-1 bg-gray-800 rounded"
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {count.quantity} {item.unit || "units"}
                      </span>
                      <span className="text-gray-400">
                        {count.location || "Main Storage"}
                      </span>
                    </div>
                    {count.created_at && (
                      <div className="text-gray-500 text-xs">
                        {new Date(count.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
