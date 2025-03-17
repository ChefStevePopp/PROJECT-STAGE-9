import { ExcelColumn } from "@/types/excel";
import { PriceChange } from "@/stores/vendorPriceChangesStore";

export const priceHistoryColumns: ExcelColumn[] = [
  {
    key: "created_at",
    name: "Created Date",
    type: "date",
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: "invoice_date",
    name: "Invoice Date",
    type: "date",
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: "vendor_id",
    name: "Vendor",
    type: "text",
    width: 150,
    sortable: true,
    filterable: true,
  },
  {
    key: "item_code",
    name: "Item Code",
    type: "text",
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: "product_name",
    name: "Product",
    type: "text",
    width: 200,
    sortable: true,
    filterable: true,
  },
  {
    key: "old_price",
    name: "Old Price",
    type: "currency",
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: "new_price",
    name: "New Price",
    type: "currency",
    width: 120,
    sortable: true,
    filterable: true,
  },
  {
    key: "change_percent",
    name: "Change %",
    type: "percent",
    width: 120,
    sortable: true,
    filterable: true,
  },
];
