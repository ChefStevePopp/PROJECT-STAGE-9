export interface ExcelColumn {
  key: string;
  name: string;
  type:
    | "text"
    | "currency"
    | "percent"
    | "imageUrl"
    | "number"
    | "boolean"
    | "date"
    | "allergen";
  width: number;
  sortable?: boolean;
  filterable?: boolean;
}
