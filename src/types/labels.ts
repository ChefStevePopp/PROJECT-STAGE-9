export interface LabelTemplate {
  id: string;
  name: string;
  fields: string[];
  printerConfig?: {
    width: number;
    height: number;
    type: string;
  };
}

export interface PrinterSettings {
  id: string;
  name: string;
  model: 'QL-810W';
  ipAddress?: string;
  labelSize: {
    width: 62;
    height: 29;
  };
  status?: 'online' | 'offline' | 'error';
}