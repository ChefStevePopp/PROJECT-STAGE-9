// types/vendor-invoice.ts

export interface VendorItemCode {
  code: string;
  vendorId: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
}

export interface PriceChange {
  ingredientId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  percentChange: number;
  vendorId: string;
  invoiceDate: string;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
}

export interface CodeChange {
  ingredientId: string;
  productName: string;
  oldCode: string;
  newCode: string;
  vendorId: string;
  invoiceDate: string;
  handled?: boolean;
  handledBy?: string;
  handledAt?: string;
  action?: 'update' | 'new_item';
  notes?: string;
}

export interface QuickFilters {
  significantChanges: boolean;
  codeChanges: boolean;
  unmatched: boolean;
  favorites: boolean;
}

export interface PriceHistoryEntry {
  price: number;
  date: string;
  invoiceId: string;
  vendorId: string;
  notes?: string;
}

export interface VendorInvoiceStats {
  itemsToUpdate: number;
  averageChange: number;
  potentialSavings: number;
  issueCount: number;
  lastInvoiceComparison?: number;
  unusualChanges?: number;
  alternateVendors?: number;
}