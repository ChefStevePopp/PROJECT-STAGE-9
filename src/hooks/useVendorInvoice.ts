// hooks/useVendorInvoice.ts

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { useOperationsStore } from "@/stores/operationsStore";
import {
  PriceChange,
  CodeChange,
  QuickFilters,
  VendorInvoiceStats,
} from "@/types/vendor-invoice";
import { toast } from "react-hot-toast";

export const useVendorInvoice = () => {
  const { user } = useAuth();
  const { ingredients, updateIngredientCosts } = useMasterIngredientsStore();
  const { settings } = useOperationsStore();

  // State
  const [selectedVendor, setSelectedVendor] = useState("");
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    significantChanges: false,
    codeChanges: false,
    unmatched: false,
    favorites: false,
  });

  // Calculate stats
  const stats: VendorInvoiceStats = useMemo(() => {
    const significantChanges = priceChanges.filter(
      (change) => Math.abs(change.percentChange) > 10,
    );

    const alternateVendors = ingredients.filter((ing) =>
      ing.vendorCodes?.some(
        (code) => code.vendorId !== selectedVendor && code.isActive,
      ),
    );

    return {
      itemsToUpdate: priceChanges.length,
      averageChange:
        priceChanges.reduce((acc, curr) => acc + curr.percentChange, 0) /
          priceChanges.length || 0,
      potentialSavings: alternateVendors.length,
      issueCount: significantChanges.length + codeChanges.length,
      lastInvoiceComparison: 5, // TODO: Implement comparison
      unusualChanges: significantChanges.length,
      alternateVendors: alternateVendors.length,
    };
  }, [priceChanges, codeChanges, ingredients, selectedVendor]);

  // Filtered changes based on search and quick filters
  const filteredChanges = useMemo(() => {
    return priceChanges.filter((change) => {
      if (
        searchTerm &&
        !change.productName.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (
        quickFilters.significantChanges &&
        Math.abs(change.percentChange) <= 10
      ) {
        return false;
      }

      return true;
    });
  }, [priceChanges, searchTerm, quickFilters]);

  // Handlers
  const handleInvoiceImport = useCallback(
    async (data: any[], sheetName: string) => {
      if (!selectedVendor) {
        toast.error("Please select a vendor first");
        return;
      }

      try {
        const newPriceChanges: PriceChange[] = [];
        const newCodeChanges: CodeChange[] = [];
        const unmatchedItems: string[] = [];
        const timestamp = new Date().toISOString();

        for (const row of data) {
          const ingredient = ingredients.find((ing) => {
            // Check current code
            if (ing.vendorCodes?.current?.code === row.itemCode) return true;

            // Check historical codes
            if (
              ing.vendorCodes?.history?.some(
                (code) =>
                  code.code === row.itemCode &&
                  code.vendorId === selectedVendor,
              )
            )
              return true;

            // Name matching as fallback
            return ing.product.toLowerCase() === row.product.toLowerCase();
          });

          if (!ingredient) {
            unmatchedItems.push(row.product);
            continue;
          }

          // Check for code changes
          if (ingredient.vendorCodes?.current?.code !== row.itemCode) {
            newCodeChanges.push({
              ingredientId: ingredient.id,
              productName: ingredient.product,
              oldCode: ingredient.vendorCodes?.current?.code || "",
              newCode: row.itemCode,
              vendorId: selectedVendor,
              invoiceDate: timestamp,
            });
          }

          // Check for price changes
          const oldPrice = ingredient.vendorCodes?.current?.price || 0;
          const newPrice = parseFloat(row.price);

          if (oldPrice !== newPrice) {
            const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;

            newPriceChanges.push({
              ingredientId: ingredient.id,
              productName: ingredient.product,
              oldPrice,
              newPrice,
              percentChange,
              vendorId: selectedVendor,
              invoiceDate: timestamp,
            });
          }
        }

        setPriceChanges(newPriceChanges);
        setCodeChanges(newCodeChanges);

        if (unmatchedItems.length > 0) {
          toast.error(`${unmatchedItems.length} items could not be matched`);
        }

        toast.success("Invoice processed successfully");
      } catch (error) {
        console.error("Error processing invoice:", error);
        toast.error("Failed to process invoice");
      }
    },
    [selectedVendor, ingredients],
  );

  return {
    selectedVendor,
    setSelectedVendor,
    priceChanges,
    codeChanges,
    searchTerm,
    setSearchTerm,
    quickFilters,
    setQuickFilters,
    filteredChanges,
    stats,
    handleInvoiceImport,
  };
};
