export interface ExcelColumn {
  key: string;
  name: string;
  type: 'text' | 'currency' | 'percent' | 'imageUrl' | 'number' | 'boolean';
  width?: number;
}