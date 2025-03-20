import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Save,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Ban,
  RefreshCw,
  Plus,
  Boxes,
  Umbrella,
  Trash2,
  Link,
} from "lucide-react";
import { motion } from "framer-motion";
import { EditIngredientModal } from "@/features/admin/components/sections/recipe/MasterIngredientList/EditIngredientModal";
import { LinkExistingIngredientModal } from "./LinkExistingIngredientModal";
import type { MasterIngredient } from "@/types/master-ingredient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";

interface Props {
  data: any[];
  vendorId: string;
  invoiceDate?: Date;
  onConfirm: () => void;
  onCancel: () => void;
  onDateChange?: (date: Date) => void;
}

interface PriceChange {
  itemCode: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  approved?: boolean;
  rejected?: boolean;
}

export const DataPreview: React.FC<Props> = ({
  data,
  vendorId,
  invoiceDate,
  onConfirm,
  onCancel,
  onDateChange,
}) => {
  const { user } = useAuth();
  const { bulkUpdatePrices } = useMasterIngredientsStore();
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [masterIngredients, setMasterIngredients] = useState<
    MasterIngredient[]
  >([]);
  const [linkingIngredient, setLinkingIngredient] = useState<{
    matches: MasterIngredient[];
    row: any;
  } | null>(null);
  const [newIngredient, setNewIngredient] =
    useState<Partial<MasterIngredient> | null>(null);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);
  const [dateConfirmed, setDateConfirmed] = useState<boolean>(true);

  // Find price changes and existing items on component mount
  useEffect(() => {
    const findPriceChanges = async () => {
      try {
        // Get all master ingredients from the view
        const { data: ingredients, error } = await supabase
          .from("master_ingredients_with_categories")
          .select("*");

        if (error) throw error;
        setMasterIngredients(ingredients || []);

        // Remove duplicate item codes, keeping only the first occurrence
        const uniqueItemsMap = new Map();
        data.forEach((item) => {
          if (!uniqueItemsMap.has(item.item_code)) {
            uniqueItemsMap.set(item.item_code, item);
          }
        });
        const uniqueItems = Array.from(uniqueItemsMap.values());

        // Calculate price changes for existing items
        const changes = uniqueItems
          .map((item) => {
            const current = ingredients?.find(
              (p) => p.item_code === item.item_code.toString(),
            );

            if (!current) return null;

            const oldPrice = current.current_price;
            const newPrice = parseFloat(item.unit_price);
            const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

            return {
              itemCode: item.item_code,
              oldPrice,
              newPrice,
              changePercent,
            };
          })
          .filter(Boolean);

        setPriceChanges(changes);
      } catch (error) {
        console.error("Error finding price changes:", error);
        toast.error("Failed to check price changes");
      }
    };

    findPriceChanges();
  }, [data]);

  const handleConfirm = async () => {
    try {
      // Remove duplicate item codes, keeping only the first occurrence
      const uniqueItemsMap = new Map();
      data.forEach((item) => {
        if (!uniqueItemsMap.has(item.item_code)) {
          uniqueItemsMap.set(item.item_code, item);
        }
      });
      const uniqueItems = Array.from(uniqueItemsMap.values());

      // First ensure all items exist or are explicitly excluded
      const unhandledItems = uniqueItems.filter(
        (row) =>
          !masterIngredients.find(
            (mi) => mi.item_code === row.item_code.toString(),
          ) && !excludedItems.includes(row.item_code.toString()),
      );

      if (unhandledItems.length > 0) {
        toast.error("Please handle all new items before confirming");
        return;
      }

      // Record approved price changes
      const approvedChanges = priceChanges.filter((change) => change.approved);

      // Update all prices that were approved
      if (approvedChanges.length > 0) {
        try {
          // Use the bulkUpdatePrices method from the store
          const priceUpdates = approvedChanges.map((change) => ({
            itemCode: change.itemCode,
            newPrice: change.newPrice,
          }));

          await bulkUpdatePrices(priceUpdates);

          // Create price change records for history
          const priceChangeRecords = approvedChanges.map((change) => {
            // Find the matching ingredient to get its ID
            const matchingIngredient = masterIngredients.find(
              (mi) => mi.item_code === change.itemCode.toString(),
            );

            // Ensure percent_change is never null (default to 0 if calculation results in null/undefined/NaN)
            const safePercentChange = isNaN(change.changePercent)
              ? 0
              : change.changePercent;

            return {
              organization_id: user?.user_metadata?.organizationId,
              vendor_id: vendorId,
              item_code: change.itemCode,
              ingredient_id: matchingIngredient?.id,
              invoice_date: invoiceDate
                ? invoiceDate.toISOString()
                : new Date().toISOString(),
              old_price: change.oldPrice,
              new_price: change.newPrice,
              percent_change: safePercentChange,
              approved: true,
              approved_by: user?.id,
              approved_at: new Date().toISOString(),
            };
          });

          // Insert price changes into history
          const { error: insertError } = await supabase
            .from("vendor_price_changes")
            .insert(priceChangeRecords);

          if (insertError) throw insertError;
        } catch (updateError) {
          console.error("Error updating prices:", updateError);
          toast.error("Failed to update ingredient prices");
          throw updateError;
        }
      }

      // Record the import in the vendor_imports table
      try {
        const importRecord = {
          organization_id: user?.user_metadata?.organizationId,
          vendor_id: vendorId,
          import_type: "csv", // This could be dynamic based on the import type
          file_name: `${vendorId.toLowerCase()}_import_${invoiceDate ? invoiceDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}.csv`,
          items_count: uniqueItems.length, // Use unique items count instead of all data
          price_changes: approvedChanges.length,
          new_items: uniqueItems.filter(
            (row) =>
              !masterIngredients.find(
                (mi) => mi.item_code === row.item_code.toString(),
              ),
          ).length,
          status: "completed",
          created_by: user?.id,
        };

        await supabase.from("vendor_imports").insert([importRecord]);
      } catch (importError) {
        console.error("Error recording import:", importError);
        // Don't fail the whole operation if just the import record fails
      }

      onConfirm();
      toast.success("Changes processed successfully");
    } catch (error) {
      console.error("Error processing changes:", error);
      toast.error("Failed to process changes");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Review Import Data</h3>
          <p className="text-sm text-gray-400">
            Please verify the mapped data before proceeding
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 mr-4">
            <label htmlFor="invoice-date" className="text-sm text-gray-400">
              Invoice Date:
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                id="invoice-date"
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm text-white"
                value={
                  invoiceDate
                    ? invoiceDate.toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime()) && onDateChange) {
                    onDateChange(newDate);
                    setDateConfirmed(false);
                    // Set a small timeout to show the animation after user selects a date
                    setTimeout(() => setDateConfirmed(true), 300);
                  }
                }}
              />
              {dateConfirmed && (
                <motion.div
                  className="ml-2 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                // Fetch all master ingredients from the view
                const { data: ingredients, error } = await supabase
                  .from("master_ingredients_with_categories")
                  .select("*");

                if (error) throw error;
                setMasterIngredients(ingredients || []);

                // Remove duplicate item codes, keeping only the first occurrence
                const uniqueItemsMap = new Map();
                data.forEach((item) => {
                  if (!uniqueItemsMap.has(item.item_code)) {
                    uniqueItemsMap.set(item.item_code, item);
                  }
                });
                const uniqueItems = Array.from(uniqueItemsMap.values());

                // Recalculate price changes
                const changes = uniqueItems
                  .map((item) => {
                    const current = ingredients?.find(
                      (p) => p.item_code === item.item_code.toString(),
                    );

                    if (!current) return null;

                    const oldPrice = current.current_price;
                    const newPrice = parseFloat(item.unit_price);
                    const changePercent =
                      ((newPrice - oldPrice) / oldPrice) * 100;

                    return {
                      itemCode: item.item_code,
                      oldPrice,
                      newPrice,
                      changePercent,
                    };
                  })
                  .filter(Boolean);

                setPriceChanges(changes);
                toast.success("Data refreshed");
              } catch (error) {
                console.error("Error refreshing data:", error);
                toast.error("Failed to refresh data");
              }
            }}
            className="btn-ghost"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button onClick={onCancel} className="btn-ghost">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                Item Code
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                Product Name
              </th>

              <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">
                Current Price
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">
                New Price
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">
                Change
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {/* Create a map to track seen item codes */}
            {(() => {
              const seenItemCodes = new Set();
              return data.map((row, index) => {
                // Skip duplicate item codes after the first occurrence
                if (seenItemCodes.has(row.item_code)) {
                  return null;
                }
                seenItemCodes.add(row.item_code);

                const matchingIngredient = masterIngredients.find(
                  (mi) => mi.item_code === row.item_code.toString(),
                );
                const isExisting = matchingIngredient !== undefined;
                const priceChange = priceChanges.find(
                  (p) => p.itemCode === row.item_code,
                );
                const hasChange =
                  priceChange && Math.abs(priceChange.changePercent) > 0;
                const nameMismatch =
                  isExisting && matchingIngredient.product !== row.product_name;
                const isExcluded = excludedItems.includes(
                  row.item_code.toString(),
                );

                return (
                  <tr
                    key={index}
                    className={`
                      ${isExisting ? "bg-gray-800/50" : ""} 
                      ${hasChange ? "bg-amber-500/5" : ""} 
                      ${nameMismatch ? "bg-blue-500/5" : ""}
                      ${isExcluded ? "bg-gray-900/80 opacity-60" : ""}
                    `}
                  >
                    <td
                      className={`px-4 py-2 text-sm ${isExcluded ? "text-gray-500 line-through" : "text-gray-300"}`}
                    >
                      {row.item_code}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm ${isExcluded ? "text-gray-500 line-through" : "text-gray-300"}`}
                    >
                      {row.product_name}
                      {nameMismatch && !isExcluded && (
                        <div className="text-xs text-blue-400 mt-1">
                          Current name: {matchingIngredient.product}
                        </div>
                      )}
                      {isExcluded && (
                        <div className="text-xs text-rose-400 mt-1">
                          Excluded from import
                        </div>
                      )}
                    </td>

                    <td
                      className={`px-4 py-2 text-sm text-right ${isExcluded ? "text-gray-500" : ""}`}
                    >
                      {isExisting ? (
                        <span
                          className={
                            isExcluded ? "text-gray-500" : "text-gray-300"
                          }
                        >
                          ${matchingIngredient.current_price.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm text-right ${isExcluded ? "text-gray-500" : ""}`}
                    >
                      <span
                        className={
                          isExcluded ? "text-gray-500" : "text-gray-300"
                        }
                      >
                        ${parseFloat(row.unit_price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {hasChange && !isExcluded && (
                        <span
                          className={`inline-flex items-center gap-1 ${priceChange.changePercent > 0 ? "text-rose-400" : "text-emerald-400"}`}
                        >
                          {priceChange.changePercent > 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {Math.abs(priceChange.changePercent).toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        {isExcluded ? (
                          <button
                            onClick={() => {
                              setExcludedItems((prev) =>
                                prev.filter(
                                  (item) => item !== row.item_code.toString(),
                                ),
                              );
                              toast.success(
                                `Item ${row.item_code} restored to import`,
                              );
                            }}
                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          >
                            Restore
                          </button>
                        ) : isExisting ? (
                          <>
                            <button
                              onClick={() =>
                                setPriceChanges((prev) =>
                                  prev.map((p) =>
                                    p.itemCode === row.item_code
                                      ? {
                                          ...p,
                                          approved: true,
                                          rejected: false,
                                        }
                                      : p,
                                  ),
                                )
                              }
                              className={`p-1 rounded-lg transition-colors ${
                                priceChange?.approved
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setPriceChanges((prev) =>
                                  prev.map((p) =>
                                    p.itemCode === row.item_code
                                      ? {
                                          ...p,
                                          rejected: true,
                                          approved: false,
                                        }
                                      : p,
                                  ),
                                )
                              }
                              className={`p-1 rounded-lg transition-colors ${
                                priceChange?.rejected
                                  ? "bg-rose-500/20 text-rose-400"
                                  : "hover:bg-rose-500/10 text-gray-400 hover:text-rose-400"
                              }`}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            {/* Option 1: Add (Single Ingredient Import) */}
                            <button
                              onClick={() => {
                                setNewIngredient({
                                  product: row.product_name,
                                  item_code: row.item_code,
                                  current_price: parseFloat(row.unit_price),
                                  unit_of_measure: row.unit_of_measure,
                                  organization_id: user?.organization_id,
                                });
                              }}
                              className="p-1 rounded-lg transition-colors hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400"
                              title="Add as Single Ingredient"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            {/* Option 2: Add to Code Group */}
                            <button
                              onClick={() => {
                                // Code to add to code group would go here
                                toast.info(
                                  `Adding ${row.product_name} to Code Group`,
                                );
                                // This would typically navigate to or open the Code Group manager
                                // with this item pre-selected
                              }}
                              className="p-1 rounded-lg transition-colors hover:bg-amber-500/20 text-gray-400 hover:text-amber-400"
                              title="Add to Code Group"
                            >
                              <Boxes className="w-4 h-4" />
                            </button>

                            {/* Option 3: Add to Umbrella Group */}
                            <button
                              onClick={() => {
                                // Code to add to umbrella group would go here
                                toast.info(
                                  `Adding ${row.product_name} to Umbrella Group`,
                                );
                                // This would typically navigate to or open the Umbrella Group manager
                                // with this item pre-selected
                              }}
                              className="p-1 rounded-lg transition-colors hover:bg-blue-500/20 text-gray-400 hover:text-blue-400"
                              title="Add to Umbrella Group"
                            >
                              <Umbrella className="w-4 h-4" />
                            </button>

                            {/* Option 4: Discard */}
                            <button
                              onClick={() => {
                                // Add this item to the excluded items list
                                setExcludedItems((prev) => [
                                  ...prev,
                                  row.item_code.toString(),
                                ]);
                                toast.success(
                                  `Item ${row.item_code} excluded from import`,
                                );
                              }}
                              className="p-1 rounded-lg transition-colors hover:bg-rose-500/20 text-gray-400 hover:text-rose-400"
                              title="Discard Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Link Existing button - keeping this functionality */}
                            <button
                              onClick={() => {
                                // Mark the item as excluded temporarily
                                setExcludedItems((prev) => [
                                  ...prev,
                                  row.item_code.toString(),
                                ]);

                                // Set up the linking ingredient state
                                setLinkingIngredient({
                                  row,
                                  matches: masterIngredients
                                    .filter((ingredient) =>
                                      ingredient.product
                                        .toLowerCase()
                                        .includes(
                                          row.product_name.toLowerCase(),
                                        ),
                                    )
                                    .slice(0, 10),
                                });
                              }}
                              className="p-1 rounded-lg transition-colors hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400"
                              title="Link to Existing Ingredient"
                            >
                              <Link className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              });
            })().filter(Boolean)}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Records:</span>
          <span className="text-white font-medium">
            {new Set(data.map((item) => item.item_code)).size}
            {data.length > new Set(data.map((item) => item.item_code)).size && (
              <span className="text-xs text-gray-500 ml-2">
                ({data.length} total with{" "}
                {data.length - new Set(data.map((item) => item.item_code)).size}{" "}
                duplicates removed)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-400">Excluded Items:</span>
          <span className="text-rose-400 font-medium">
            {excludedItems.length}
          </span>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleConfirm}
            className="btn-primary"
            disabled={data.some(
              (row) =>
                !masterIngredients.find(
                  (mi) => mi.item_code === row.item_code.toString(),
                ) && !excludedItems.includes(row.item_code.toString()),
            )}
            title={
              data.some(
                (row) =>
                  !masterIngredients.find(
                    (mi) => mi.item_code === row.item_code.toString(),
                  ) && !excludedItems.includes(row.item_code.toString()),
              )
                ? "Please handle all new items before confirming"
                : ""
            }
          >
            <Save className="w-4 h-4 mr-2" />
            Confirm Import
          </button>
        </div>
      </div>

      {/* Link Existing Modal */}
      {linkingIngredient && (
        <LinkExistingIngredientModal
          isOpen={true}
          onClose={() => {
            // Remove from excluded items when closed
            setExcludedItems((prev) =>
              prev.filter(
                (item) => item !== linkingIngredient.row.item_code.toString(),
              ),
            );
            setLinkingIngredient(null);
          }}
          newItemCode={linkingIngredient.row.item_code}
          newItemName={linkingIngredient.row.product_name}
          vendorId={vendorId}
          onSuccess={() => {
            // Refresh the data after successful linking
            toast.success(
              `Successfully linked ${linkingIngredient.row.item_code} to existing ingredient`,
            );
            // Refresh the data
            const refreshData = async () => {
              const { data: ingredients } = await supabase
                .from("master_ingredients_with_categories")
                .select("*");
              setMasterIngredients(ingredients || []);
            };
            refreshData();
            setLinkingIngredient(null);
          }}
        />
      )}

      {/* New Ingredient Modal */}
      {newIngredient && (
        <EditIngredientModal
          ingredient={
            {
              ...newIngredient,
              organization_id: user?.user_metadata?.organizationId, // Get from user_metadata
            } as MasterIngredient
          }
          onClose={() => setNewIngredient(null)}
          onSave={async (ingredient) => {
            try {
              // Log the current auth state
              console.log("Auth state during save:", {
                user,
                organizationId: user?.user_metadata?.organizationId,
              });

              if (!user?.user_metadata?.organizationId) {
                throw new Error("Organization ID is required");
              }

              const dataToSave = {
                ...ingredient,
                organization_id: user.user_metadata.organizationId, // Use correct path
              };

              console.log("Saving with data:", dataToSave);

              const { error } = await supabase
                .from("master_ingredients")
                .insert([dataToSave]);

              if (error) {
                console.error("Supabase insert error:", error);
                throw error;
              }

              toast.success("Ingredient added successfully");
              setNewIngredient(null);

              // Refresh price changes to update the list
              const { data: currentPrices } = await supabase
                .from("master_ingredients_with_categories")
                .select("id, item_code, current_price")
                .in(
                  "item_code",
                  data.map((item) => item.item_code),
                );

              if (currentPrices) {
                const changes = data
                  .map((item) => {
                    const current = currentPrices.find(
                      (p) => p.item_code === item.item_code,
                    );
                    if (!current) return null;
                    const oldPrice = current.current_price;
                    const newPrice = parseFloat(item.unit_price);
                    const changePercent =
                      ((newPrice - oldPrice) / oldPrice) * 100;
                    return {
                      itemCode: item.item_code,
                      oldPrice,
                      newPrice,
                      changePercent,
                    };
                  })
                  .filter(Boolean);
                setPriceChanges(changes);
              }
            } catch (error) {
              console.error("Error adding ingredient:", error);
              toast.error("Failed to add ingredient");
            }
          }}
        />
      )}
    </div>
  );
};
