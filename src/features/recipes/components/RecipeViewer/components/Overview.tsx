import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Printer,
  Image,
  UtensilsCrossed,
  Calendar,
  Clock,
  User,
  Hash,
  Thermometer,
  Soup,
  Book,
  FileText,
  ClipboardList,
  Shield,
  Wrench,
} from "lucide-react";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";
import type { Recipe } from "../../../types/recipe";

interface OverviewProps {
  recipe: Recipe;
}

export const Overview: React.FC<OverviewProps> = ({ recipe }) => {
  const labelRequirements = recipe.label_requirements || {};
  const useLabelPrinter = recipe.use_label_printer || false;

  // Map of field IDs to their icons and colors
  const fieldIcons = {
    "product-name": { icon: UtensilsCrossed, color: "text-blue-400" },
    "date-prepared": { icon: Calendar, color: "text-emerald-400" },
    "use-by": { icon: Clock, color: "text-amber-400" },
    "prepared-by": { icon: User, color: "text-purple-400" },
    "batch-number": { icon: Hash, color: "text-rose-400" },
    "storage-temp": { icon: Thermometer, color: "text-blue-400" },
    allergens: { icon: AlertTriangle, color: "text-amber-400" },
    ingredients: { icon: Soup, color: "text-emerald-400" },
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      {recipe.description && (
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Book className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Description</h3>
              <p className="text-sm text-gray-400">
                Recipe overview and details
              </p>
            </div>
          </div>
          <p className="text-gray-300">{recipe.description}</p>
        </div>
      )}

      {/* Recipe Stats and Required Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recipe Stats */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Recipe Stats</h3>
              <p className="text-sm text-gray-400">
                Key metrics and specifications
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Prep Time</div>
              <div className="text-lg font-medium text-white">
                {recipe.prep_time} min
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Cook Time</div>
              <div className="text-lg font-medium text-white">
                {recipe.cook_time} min
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Yield</div>
              <div className="text-lg font-medium text-white">
                {recipe.yield_amount} {recipe.yield_unit}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Station</div>
              <div className="text-lg font-medium text-white">
                {recipe.station || "Not Specified"}
              </div>
            </div>
          </div>
        </div>

        {/* Required Certifications */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                Required Certifications
              </h3>
              <p className="text-sm text-gray-400">Training requirements</p>
            </div>
          </div>
          <div className="space-y-2">
            {recipe.training?.certificationRequired?.length > 0 ? (
              recipe.training.certificationRequired.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-300 bg-gray-900/50 rounded-lg px-3 py-2"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  {cert}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 bg-gray-900/50 rounded-lg">
                No certifications required
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Production Notes and Required Equipment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Production Notes */}
        {recipe.production_notes && (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">
                  Production Notes
                </h3>
                <p className="text-sm text-gray-400">
                  Additional production information
                </p>
              </div>
            </div>
            <p className="text-gray-300">{recipe.production_notes}</p>
          </div>
        )}

        {/* Required Equipment */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                Required Equipment
              </h3>
              <p className="text-sm text-gray-400">
                Tools and equipment needed
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {recipe.equipment?.length > 0 ? (
              recipe.equipment.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-gray-300 bg-gray-900/50 rounded-lg px-3 py-2"
                >
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  {item.name}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 bg-gray-900/50 rounded-lg">
                No equipment specified
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Label Requirements */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Printer className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Label Requirements
            </h3>
            <p className="text-sm text-gray-400">
              Label specifications and printing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Left Column - Example Photo */}
          <div>
            <div className="text-sm font-medium text-gray-300 mb-3">
              Label Example
            </div>
            {labelRequirements.example_photo_url ? (
              <div className="relative aspect-video bg-gray-900/50 rounded-lg overflow-hidden">
                <img
                  src={labelRequirements.example_photo_url}
                  alt="Label example"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No label example available</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Required Fields */}
          <div>
            <div className="text-sm font-medium text-gray-300 mb-3">
              Required Fields
            </div>
            <div className="space-y-2">
              {labelRequirements.required_fields?.map((field) => {
                const IconConfig = fieldIcons[field] || {
                  icon: CheckCircle2,
                  color: "text-gray-400",
                };
                const Icon = IconConfig.icon;
                return (
                  <div
                    key={field}
                    className="flex items-center gap-2 text-gray-300 bg-gray-900/50 rounded-lg px-3 py-2"
                  >
                    <Icon className={`w-4 h-4 ${IconConfig.color}`} />
                    {field
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </div>
                );
              })}
              {(!labelRequirements.required_fields ||
                labelRequirements.required_fields.length === 0) && (
                <div className="text-center py-4 text-gray-400 bg-gray-900/50 rounded-lg">
                  No required fields specified
                </div>
              )}
            </div>
            {useLabelPrinter && (
              <button className="btn-primary w-full mt-4">
                <Printer className="w-4 h-4 mr-2" />
                Print Label
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
