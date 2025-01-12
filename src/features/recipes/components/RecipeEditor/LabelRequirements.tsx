import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import type { Recipe } from "../../types/recipe";
import { mediaService, ALLOWED_LABEL_FILE_TYPES } from "@/lib/media-service";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface LabelRequirementsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

const LABEL_CRITERIA = [
  {
    value: "product-name",
    label: "Product Name",
    icon: "UtensilsCrossed",
    color: "blue",
  },
  {
    value: "date-prepared",
    label: "Date Prepared",
    icon: "Calendar",
    color: "emerald",
  },
  { value: "use-by", label: "Use By Date", icon: "Clock", color: "amber" },
  { value: "prepared-by", label: "Prepared By", icon: "User", color: "purple" },
  { value: "batch-number", label: "Batch Number", icon: "Hash", color: "rose" },
  {
    value: "storage-temp",
    label: "Storage Temperature",
    icon: "Thermometer",
    color: "blue",
  },
  {
    value: "allergens",
    label: "Allergen Warnings",
    icon: "AlertTriangle",
    color: "amber",
  },
  {
    value: "ingredients",
    label: "Ingredients",
    icon: "Soup",
    color: "emerald",
  },
];

export const LabelRequirements: React.FC<LabelRequirementsProps> = ({
  recipe,
  onChange,
}) => {
  const { organization } = useAuth();
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize selected criteria and custom fields
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(
    recipe.label_requirements?.required_fields || [],
  );
  const [customField1, setCustomField1] = useState(
    recipe.label_requirements?.custom_fields?.[0] || "",
  );
  const [customField2, setCustomField2] = useState(
    recipe.label_requirements?.custom_fields?.[1] || "",
  );
  const [labelDescription, setLabelDescription] = useState(
    recipe.label_requirements?.description || "",
  );

  // Check for Brother b-PAC SDK
  useEffect(() => {
    const checkPrinter = async () => {
      if (window.bpac) {
        try {
          const printer = new window.bpac.Printer();
          printer.modelName = "QL-810W";
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

  const toggleCriteria = (value: string) => {
    const newCriteria = selectedCriteria.includes(value)
      ? selectedCriteria.filter((v) => v !== value)
      : [...selectedCriteria, value];

    setSelectedCriteria(newCriteria);
    onChange({
      label_requirements: {
        ...recipe.label_requirements,
        required_fields: newCriteria,
      },
    });
  };

  const updateCustomFields = () => {
    const customFields = [customField1, customField2].filter(Boolean);
    onChange({
      label_requirements: {
        ...recipe.label_requirements,
        custom_fields: customFields,
      },
    });
  };

  const handleLabelImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !organization?.id) {
      console.error("Missing file or organization ID:", {
        file,
        orgId: organization?.id,
      });
      return;
    }

    try {
      console.log("Uploading label template:", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        orgId: organization.id,
      });
      const path = await mediaService.uploadLabelTemplate(
        file,
        organization.id,
      );
      console.log("Upload successful, got path:", path);

      const {
        data: { publicUrl },
      } = supabase.storage.from("label-templates").getPublicUrl(path);
      console.log("Generated public URL:", publicUrl);

      onChange({
        label_requirements: {
          ...recipe.label_requirements,
          example_photo_url: publicUrl,
        },
      });
      toast.success("Label template uploaded successfully");
    } catch (error) {
      console.error("Label upload failed:", error);
      toast.error("Failed to upload label template");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Label Requirements
          </h2>
          <p className="text-gray-400">Configure recipe labeling options</p>
        </div>
      </div>

      {/* Required Fields */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Icons.ListChecks className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Required Fields</h3>
            <p className="text-sm text-gray-400">
              Select information to include on labels
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Labeling Instructions
          </h4>
          <textarea
            value={recipe.label_requirements?.instructions || ""}
            onChange={(e) =>
              onChange({
                label_requirements: {
                  ...recipe.label_requirements,
                  instructions: e.target.value,
                },
              })
            }
            placeholder="Enter detailed instructions for labeling this recipe..."
            className="input w-full h-32"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {LABEL_CRITERIA.map((criteria) => {
            const Icon = Icons[criteria.icon as keyof typeof Icons];
            return (
              <button
                key={criteria.value}
                onClick={() => toggleCriteria(criteria.value)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selectedCriteria.includes(criteria.value)
                    ? `bg-${criteria.color}-500/20 border border-${criteria.color}-500/50`
                    : "bg-gray-800/50 border border-transparent hover:border-gray-700"
                }`}
              >
                <div className={`text-${criteria.color}-400`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-300">{criteria.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Fields */}
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={customField1}
            onChange={(e) => {
              setCustomField1(e.target.value);
              updateCustomFields();
            }}
            placeholder="Add custom field 1..."
            className="input w-full"
          />
          <input
            type="text"
            value={customField2}
            onChange={(e) => {
              setCustomField2(e.target.value);
              updateCustomFields();
            }}
            placeholder="Add custom field 2..."
            className="input w-full"
          />
        </div>
      </div>

      {/* Example Photo */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Icons.Image className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Example Photo</h3>
            <p className="text-sm text-gray-400">Upload a sample label image</p>
          </div>
        </div>

        {recipe.label_requirements?.example_photo_url ? (
          <div className="space-y-4">
            <div className="relative w-full max-w-md">
              <img
                src={recipe.label_requirements.example_photo_url}
                alt="Label example"
                className="w-full rounded-lg"
              />
              <button
                onClick={() =>
                  onChange({
                    label_requirements: {
                      ...recipe.label_requirements,
                      example_photo_url: null,
                    },
                  })
                }
                className="absolute top-2 right-2 p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors"
              >
                <Icons.Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={labelDescription}
              onChange={(e) => {
                setLabelDescription(e.target.value);
                onChange({
                  label_requirements: {
                    ...recipe.label_requirements,
                    description: e.target.value,
                  },
                });
              }}
              placeholder="Add notes about the example photo..."
              className="input w-full h-24"
            />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-700 rounded-lg hover:border-primary-500/50 transition-colors cursor-pointer">
            <Icons.Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">
              Upload an example of a properly labeled container
            </span>
            <span className="text-xs text-gray-500 mt-2">
              Accepted formats: JPG, PNG, WebP, PDF (max 5MB)
            </span>
            <input
              type="file"
              accept={ALLOWED_LABEL_FILE_TYPES.join(",")}
              onChange={handleLabelImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Label Printer Toggle */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Icons.Printer className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Label Printer</h3>
            <p className="text-sm text-gray-400">
              Enable automatic label printing
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={recipe.label_requirements?.use_label_printer}
              onChange={(e) =>
                onChange({
                  label_requirements: {
                    ...recipe.label_requirements,
                    use_label_printer: e.target.checked,
                  },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
