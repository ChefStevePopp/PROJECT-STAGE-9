export interface LabelTemplate {
  id: string;
  name: string;
  fields: string[];
  printerConfig?: {
    width: number;
    height: number;
  };
}

export interface PrinterSettings {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  labelSize: {
    width: number;
    height: number;
  };
}

// Extend the global Window interface to include bpac
declare global {
  interface Window {
    bpac?: any;
  }
}
