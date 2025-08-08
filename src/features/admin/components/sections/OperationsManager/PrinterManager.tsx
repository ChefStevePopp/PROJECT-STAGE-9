import React, { useState } from "react";
import {
  Printer,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { PrinterSettings } from "../../../admin/types/labels";
import toast from "react-hot-toast";

interface PrinterManagerProps {
  printers: PrinterSettings[];
  onUpdate: (printers: PrinterSettings[]) => void;
}

interface NetworkSetupDialogProps {
  onClose: () => void;
  onSave: (ipAddress: string) => Promise<void>;
}

const SUPPORTED_LABEL_SIZES = [
  { width: 62, height: 29, name: "Standard Address (DK-11209)" },
  { width: 62, height: 100, name: "Shipping (DK-11202)" },
];

const NetworkSetupDialog: React.FC<NetworkSetupDialogProps> = ({
  onClose,
  onSave,
}) => {
  const [ipAddress, setIpAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!ipAddress) return;
    setIsSubmitting(true);
    try {
      await onSave(ipAddress);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-white mb-4">
          Configure Network Printer
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="input w-full"
              placeholder="192.168.1.100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={!ipAddress || isSubmitting}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrinterManager: React.FC<PrinterManagerProps> = ({
  printers,
  onUpdate,
}) => {
  const [isAddingPrinter, setIsAddingPrinter] = useState(false);

  const testConnection = async (ipAddress: string): Promise<boolean> => {
    if (typeof window !== "undefined" && (window as any).bpac) {
      try {
        const printer = new (window as any).bpac.Printer();
        printer.modelName = "QL-810W";
        printer.port = "NET";
        printer.ipAddress = ipAddress;
        return await printer.isPrinterReady();
      } catch {
        return false;
      }
    }
    return false;
  };

  const testPrinter = async (printer: PrinterSettings) => {
    if (typeof window !== "undefined" && (window as any).bpac) {
      try {
        const p = new (window as any).bpac.Printer();
        p.modelName = "QL-810W";
        p.port = "NET";
        p.ipAddress = printer.ipAddress;

        if (await p.isPrinterReady()) {
          // Create test label
          p.startJob();
          p.setMediaById("102", "29"); // 62mm x 29mm
          p.clearFormat();

          p.setFontSize(10);
          p.addText("Test Print - Memphis Fire BBQ");
          p.addText(new Date().toLocaleString());

          const success = await p.print();
          if (success) {
            toast.success("Test print sent successfully");
          } else {
            toast.error("Print failed");
          }
        } else {
          toast.error("Printer not ready");
        }
      } catch (error) {
        toast.error("Printer error");
      }
    } else {
      toast.error("Brother b-PAC SDK not found");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-white">
            Label Printer Setup
          </h3>
          <p className="text-sm text-gray-400">
            Configure Brother QL-810W printer
          </p>
        </div>
        {printers.length === 0 && (
          <button
            onClick={() => setIsAddingPrinter(true)}
            className="btn-primary"
          >
            <Printer className="w-4 h-4 mr-2" />
            Add Printer
          </button>
        )}
      </div>

      {/* Printers List */}
      <div className="space-y-4">
        {printers.map((printer) => (
          <div key={printer.id} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Printer className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{printer.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Wifi className="w-4 h-4" />
                    {printer.ipAddress}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => testPrinter(printer)}
                  className="btn-ghost"
                >
                  Test Print
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SDK Warning */}
      {(typeof window === "undefined" || !(window as any).bpac) && (
        <div className="bg-yellow-500/10 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium">
                Brother SDK Not Found
              </p>
              <p className="text-sm text-gray-300 mt-1">
                The Brother b-PAC SDK is required for label printing. Please
                install it from the Brother website.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Network Setup Dialog */}
      {isAddingPrinter && (
        <NetworkSetupDialog
          onClose={() => setIsAddingPrinter(false)}
          onSave={async (ipAddress) => {
            if (await testConnection(ipAddress)) {
              const newPrinter = {
                id: `printer-${Date.now()}`,
                name: "QL-810W Label Printer",
                model: "QL-810W",
                ipAddress,
                labelSize: {
                  width: 62,
                  height: 29,
                },
              };
              onUpdate([...printers, newPrinter]);
              setIsAddingPrinter(false);
              toast.success("Printer configured successfully");
            } else {
              toast.error("Could not connect to printer");
            }
          }}
        />
      )}
    </div>
  );
};
