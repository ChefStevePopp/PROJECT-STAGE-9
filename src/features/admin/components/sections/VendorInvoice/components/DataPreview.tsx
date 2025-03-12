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
} from "lucide-react";
import { EditIngredientModal } from "@/features/admin/components/sections/recipe/MasterIngredientList/EditIngredientModal";
import type { MasterIngredient } from "@/types/master-ingredient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface Props {
  data: any[];
  vendorId: string;
  onConfirm: () => void;
  onCancel: () => void;
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
  onConfirm,
  onCancel,
}) => {
  const { user } = useAuth();
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [masterIngredients, setMasterIngredients] = useState<
    MasterIngredient[]
  >([]);
  const [linkingIngredient, setLinkingIngredient] = useState<{
    matches: any[];
    row: any;
  } | null>(null);
  const [newIngredient, setNewIngredient] =
    useState<Partial<MasterIngredient> | null>(null);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);

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

        // Calculate price changes for existing items
        const changes = data
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
      // First ensure all items exist or are explicitly excluded
      const unhandledItems = data.filter(
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
        // Create price change records
        const priceChangeRecords = approvedChanges.map((change) => ({
          organization_id: user?.organization_id,
          vendor_id: vendorId,
          item_code: change.itemCode,
          invoice_date: new Date().toISOString(),
          old_price: change.oldPrice,
          new_price: change.newPrice,
          percent_change: change.changePercent,
          approved: true,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        }));

        // Insert price changes
        const { error: insertError } = await supabase
          .from("vendor_price_changes")
          .insert(priceChangeRecords);

        if (insertError) throw insertError;

        // Update master ingredients prices
        for (const change of approvedChanges) {
          const { error: updateError } = await supabase
            .from("master_ingredients")
            .update({
              current_price: change.newPrice,
              updated_at: new Date().toISOString(),
            })
            .eq("item_code", change.itemCode);

          if (updateError) throw updateError;
        }
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
          <button
            onClick={async () => {
              try {
                // Fetch all master ingredients from the view
                const { data: ingredients, error } = await supabase
                  .from("master_ingredients_with_categories")
                  .select("*");

                if (error) throw error;
                setMasterIngredients(ingredients || []);

                // Recalculate price changes
                const changes = data
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

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-800/50">
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
            {data.map((row, index) => {
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
                      className={isExcluded ? "text-gray-500" : "text-gray-300"}
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
                                    ? { ...p, approved: true, rejected: false }
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
                                    ? { ...p, rejected: true, approved: false }
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
                          <button
                            onClick={() => {
                              setNewIngredient({
                                product: row.product_name,
                                item_code: row.item_code,
                                current_price: parseFloat(row.unit_price),
                                unit_of_measure: row.unit_of_measure,
                                organization_id: user?.organization_id, // Add organization_id
                              });
                            }}
                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                          >
                            + Add New
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                // First try to find by exact item code
                                let { data: matches } = await supabase
                                  .from("master_ingredients_with_categories")
                                  .select("*")
                                  .eq("item_code", row.item_code);

                                // If no match by code, then search by name
                                if (!matches?.length) {
                                  const { data: nameMatches } = await supabase
                                    .from("master_ingredients_with_categories")
                                    .select("*")
                                    .ilike("product", `%${row.product_name}%`)
                                    .limit(10);
                                  matches = nameMatches;
                                }

                                if (!matches?.length) {
                                  toast.error("No matching ingredients found");
                                  return;
                                }

                                setLinkingIngredient({ matches, row });
                              } catch (error) {
                                console.error("Error finding matches:", error);
                                toast.error("Failed to find matches");
                              }
                            }}
                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          >
                            Link Existing
                          </button>
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
                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                          >
                            × Do Not Add
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Records:</span>
          <span className="text-white font-medium">{data.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-400">Excluded Items:</span>
          <span className="text-rose-400 font-medium">
            {excludedItems.length}
          </span>
        </div>
      </div>

      {/* Link Existing Modal */}
      {linkingIngredient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">
                Link Existing Ingredient
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Select the matching ingredient to link
              </p>
            </div>
            <div className="p-4 space-y-2">
              {linkingIngredient.matches.map((match) => (
                <button
                  key={match.id}
                  onClick={async () => {
                    try {
                      // Create vendor code change record
                      const { error: codeError } = await supabase
                        .from("vendor_code_changes")
                        .insert([
                          {
                            organization_id: user?.organization_id,
                            ingredient_id: match.id,
                            vendor_id: vendorId,
                            invoice_date: new Date().toISOString(),
                            old_code: match.item_code,
                            new_code: linkingIngredient.row.item_code,
                            handled: true,
                            handled_by: user?.id,
                            handled_at: new Date().toISOString(),
                            action: "code_change",
                            notes: `Code changed during invoice import from ${match.item_code} to ${linkingIngredient.row.item_code}`,
                          },
                        ]);

                      if (codeError) throw codeError;

                      // Update master ingredient with new code
                      const { error: updateError } = await supabase
                        .from("master_ingredients")
                        .update({
                          item_code: linkingIngredient.row.item_code,
                          updated_at: new Date().toISOString(),
                        })
                        .eq("id", match.id);

                      if (updateError) throw updateError;

                      toast.success("Vendor code updated successfully");
                      setLinkingIngredient(null);

                      // Refresh price changes
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
                      console.error("Error linking ingredient:", error);
                      toast.error("Failed to link ingredient");
                    }
                  }}
                  className="w-full p-4 text-left bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="font-medium text-white">{match.product}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Current Code: {match.item_code} | Category:{" "}
                    {match.category_name}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
              <button
                onClick={() => setLinkingIngredient(null)}
                className="btn-ghost"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
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
