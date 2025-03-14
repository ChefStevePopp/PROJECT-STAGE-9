import React from "react";
import { VendorInvoiceManager } from "./VendorInvoiceManager";
import { MultiCodeManager } from "./components/MultiCodeManager";
import { ItemCodeGroupManager } from "./components/ItemCodeGroupManager";
import { UmbrellaIngredientManager } from "./components/UmbrellaIngredientManager";
import { PriceHistory } from "./components/PriceHistory";
import { PriceHistoryView } from "./components/PriceHistoryView";
import { VendorAnalytics } from "./components/VendorAnalytics";
import { ImportHistory } from "./components/ImportHistory";
import { ImportSettings } from "./components/ImportSettings";

export const VendorInvoiceIndex = () => {
  return <VendorInvoiceManager />;
};

// Export all components for easy access
export {
  VendorInvoiceManager,
  MultiCodeManager,
  ItemCodeGroupManager,
  UmbrellaIngredientManager,
  PriceHistory,
  PriceHistoryView,
  VendorAnalytics,
  ImportHistory,
  ImportSettings,
};
