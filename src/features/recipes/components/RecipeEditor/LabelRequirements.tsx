import React, { useState, useEffect } from "react";
import {
  Printer,
  Upload,
  Download,
  Settings,
  AlertTriangle,
} from "lucide-react";
import type { Recipe } from "../../types/recipe";
import { mediaService } from "@/lib/media-service";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface LabelRequirementsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

interface PrinterConfig {
  width: number;
  height: number;
  dpi: number;
  model: string;
}

const BROTHER_QL810W: PrinterConfig = {
  width: 62, // 62mm
  height: 29, // 29mm
  dpi: 300,
  model: "QL-810W",
};

export const LabelRequirements: React.FC<LabelRequirementsProps> = ({
  recipe,
  onChange,
}) => {
  const { organization } = useAuth();
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check for Brother b-PAC SDK
  useEffect(() => {
    const checkPrinter = async () => {
      if (window.bpac) {
        try {
          const printer = new window.bpac.Printer();
          printer.modelName = BROTHER_QL810W.model;
          const isReady = await printer.isPrinterReady();
          setIsPrinterConnected(isReady);
        } catch (error) {
          console.error("Printer check failed:", error);
          setIsPrinterConnected(false);
        }
      }
    };

    checkPrinter();
  }, []);

  const handleLabelImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !organization?.id) return;

    try {
      const url = await mediaService.uploadLabelTemplate(file, organization.id);
      onChange({ label_image_url: url });
      toast.success("Label template uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload label template");
    }
  };

  const printLabel = async () => {
    if (!window.bpac) {
      toast.error("Brother b-PAC SDK not found");
      return;
    }

    try {
      setIsGenerating(true);
      const printer = new window.bpac.Printer();
      printer.modelName = BROTHER_QL810W.model;

      if (!(await printer.isPrinterReady())) {
        throw new Error("Printer not ready");
      }

      printer.startJob();
      printer.setMediaById("102", "29"); // 62mm x 29mm
      printer.clearFormat();

      // Add recipe name
      printer.setFont("Arial", 10);
      printer.addText(recipe.name);

      // Add date
      const date = new Date().toLocaleDateString();
      printer.addText(`Date: ${date}`);

      // Add yield
      if (recipe.yield_amount) {
        printer.addText(`Yield: ${recipe.yield_amount}`);
      }

      const success = await printer.print();
      if (success) {
        toast.success("Label printed successfully");
      } else {
        throw new Error("Print failed");
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print label");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Printer className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">
              Label Requirements
            </h2>
            <p className="text-sm text-gray-400">
              Configure recipe labeling options
            </p>
          </div>
        </div>
      </div>

      {/* Label Preview */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          Label Preview
        </h3>

        {recipe.label_image_url ? (
          <div className="relative w-[248px] h-[116px] bg-white rounded-lg overflow-hidden">
            <img
              src={recipe.label_image_url}
              alt="Label preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => onChange({ label_image_url: null })}
              className="absolute top-2 right-2 p-1 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-[248px] h-[116px] border-2 border-dashed border-gray-700 rounded-lg hover:border-purple-500/50 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">Upload label template</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLabelImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Printer Status */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Label Printer</h3>
          <button
            onClick={() => window.open("ms-settings:printers")}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {!window.bpac ? (
          <div className="flex items-start gap-3 bg-amber-500/10 text-amber-400 p-4 rounded-lg">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Brother b-PAC SDK Required</p>
              <p className="text-sm mt-1">
                Please install the Brother b-PAC SDK to enable label printing.
                <a
                  href="https://support.brother.com/g/b/downloadlist.aspx?c=us&lang=en&prod=lpql810weus&os=10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-amber-200 ml-1"
                >
                  Download SDK
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${isPrinterConnected ? "bg-emerald-400" : "bg-gray-400"}`}
              />
              <span className="text-sm text-gray-300">
                {isPrinterConnected ? "Printer Connected" : "Printer Not Found"}
              </span>
            </div>
            <button
              onClick={printLabel}
              disabled={!isPrinterConnected || isGenerating}
              className="btn-primary text-sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isGenerating ? "Printing..." : "Print Label"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
