import React, { useMemo, useState } from "react";
import {
  ChefHat,
  Clock,
  Scale,
  CircleDollarSign,
  DollarSign,
  Warehouse,
  AlertTriangle,
  Info,
  BookKey,
  BookUser,
  Archive,
  CircleUser,
  FileEdit,
  CheckCircle,
  ImageOff,
  RefreshCw, // Added for UPDATED badge
  Utensils,
} from "lucide-react";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";
import type { Recipe } from "../../types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  laborRate?: number;
  className?: string;
}

const LABOR_RATE_PER_HOUR = 20;

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onClick,
  laborRate = LABOR_RATE_PER_HOUR,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  // Calculate if the recipe is new (less than 1 month old)
  const isNew = useMemo(() => {
    if (!recipe.created_at) return false;
    const createdDate = new Date(recipe.created_at);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return createdDate > oneMonthAgo;
  }, [recipe.created_at]);

  // Check if recipe has versions and if it's the first version
  const isFirstVersion = useMemo(() => {
    return (
      !recipe.versions ||
      recipe.versions.length === 0 ||
      (recipe.versions.length === 1 && recipe.versions[0].version === "1.0")
    );
  }, [recipe.versions]);

  // Calculate if the recipe was recently updated (less than 2 months old, but not new)
  // Also check if it has more than one version
  const isUpdated = useMemo(() => {
    // If it's a new recipe or has no modification date, it's not updated
    if (isNew || !recipe.modified_at) return false;

    // If it has more than one version, it's been updated
    if (recipe.versions && recipe.versions.length > 1) return true;

    // Otherwise check the modification date
    const modifiedDate = new Date(recipe.modified_at);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    return modifiedDate > twoMonthsAgo;
  }, [isNew, recipe.modified_at, recipe.versions]);

  // Find the primary image in the media array
  const primaryMedia = useMemo(
    () => recipe.media?.find((m) => m.is_primary),
    [recipe.media],
  );

  // The image src to display
  const imageSrc = useMemo(() => {
    if (imageError) return null;

    // First try to use primary media from the array
    if (primaryMedia?.type === "image" && primaryMedia?.url) {
      return primaryMedia.url;
    }

    // Second, fall back to the image_url field if it exists
    if (recipe.image_url) {
      return recipe.image_url;
    }

    // Finally, use a default image
    return "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=2000&q=80";
  }, [primaryMedia, recipe.image_url, imageError]);

  // Memoize unique categories and stations
  const { uniqueCategories, uniqueStations } = useMemo(
    () => ({
      uniqueCategories: Array.from(new Set([recipe.sub_category])).filter(
        Boolean,
      ),
      uniqueStations: Array.from(new Set([recipe.station])).filter(Boolean),
    }),
    [recipe.sub_category, recipe.station],
  );

  // Memoize color schemes
  const colorSchemes = useMemo(
    () => [
      "bg-red-500/20 text-red-400 border-red-500/50",
      "bg-green-500/20 text-green-400 border-green-500/50",
      "bg-blue-500/20 text-blue-400 border-blue-500/50",
      "bg-purple-500/20 text-purple-400 border-purple-500/50",
      "bg-pink-500/20 text-pink-400 border-pink-500/50",
      "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
      "bg-orange-500/20 text-orange-400 border-orange-500/50",
      "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
      "bg-rose-500/20 text-rose-400 border-rose-500/50",
    ],
    [],
  );

  // Memoize color getter function
  const getColorForValue = useMemo(
    () => (value: string, type: "category" | "station") => {
      const collection =
        type === "category" ? uniqueCategories : uniqueStations;
      const index = collection.indexOf(value);
      return index >= 0
        ? colorSchemes[index % colorSchemes.length]
        : colorSchemes[0];
    },
    [uniqueCategories, uniqueStations, colorSchemes],
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const totalTime = recipe.prep_time + recipe.cook_time;
  const laborCost = (totalTime / 60) * laborRate;

  const Badge = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${className}`}
    >
      {children}
    </span>
  );

  return (
    <div
      onClick={onClick}
      className={`w-full text-left bg-gray-800/50 rounded-xl transition-all duration-200 
                 shadow-lg relative group overflow-hidden border border-gray-700/50 ${className} cursor-pointer`}
      aria-label={`Recipe card for ${recipe.name}`}
      role="button"
      tabIndex={0}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-xl group">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 via-gray-900/50 to-transparent z-10" />
        {!imageError && imageSrc ? (
          <img
            src={imageSrc}
            alt={recipe.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <ImageOff className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Recipe Type Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-3 py-1.5 rounded-full bg-gray-900/90 border border-gray-700 flex items-center gap-2">
            {recipe.type === "prepared" ? (
              <ChefHat className="w-3.5 h-3.5 text-blue-400" />
            ) : recipe.type === "final" ? (
              <Utensils className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 text-amber-400"
              >
                <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
                <line x1="12" y1="22" x2="12" y2="13"></line>
                <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path>
              </svg>
            )}
            <span className="text-xs font-medium text-gray-300">
              {recipe.type === "prepared"
                ? "Prep Item"
                : recipe.type === "final"
                  ? "Final Plate"
                  : "Receiving Item"}
            </span>
          </div>
        </div>

        {/* NEW Badge - Positioned below Recipe Type Badge */}
        {isNew && (
          <div className="absolute top-14 left-4 z-20">
            <div className="px-3 py-1.5 rounded-full bg-red-500/40 text-grey-300 border border-red-700 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">NEW</span>
            </div>
          </div>
        )}

        {/* UPDATED Badge - Only shown if the recipe is not new but was recently updated */}
        {isUpdated && (
          <div className="absolute top-14 left-4 z-20">
            <div className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-700 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">UPDATED</span>
            </div>
          </div>
        )}

        {/* Recipe Status Badge */}
        {recipe.status && (
          <div className="absolute top-4 right-4 z-20">
            <div
              className={`p-1.5 rounded-full ${
                recipe.status === "approved"
                  ? "bg-green-500/20 text-green-400"
                  : recipe.status === "draft"
                    ? "bg-amber-500/20 text-amber-400"
                    : recipe.status === "archived"
                      ? "bg-gray-500/20 text-gray-400"
                      : "bg-gray-900/90 text-gray-300"
              } border border-gray-700`}
            >
              {recipe.status === "approved" ? (
                <CheckCircle size={16} />
              ) : recipe.status === "draft" ? (
                <FileEdit size={16} />
              ) : recipe.status === "archived" ? (
                <Archive size={16} />
              ) : (
                <Info size={16} />
              )}
            </div>
          </div>
        )}

        {/* Title & Shelf Life */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-300">
              {recipe.storage?.shelf_life_duration
                ? `${recipe.storage.shelf_life_duration} ${recipe.storage.shelf_life_unit || "days"}`
                : "No shelf life specified"}
              <span className="text-xs text-gray-600"> SHELF LIFE</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-2">
        {/* Classification - Split into two columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Duty Station */}
          <div>
            <div className="text-xs font-display font-bold border-t border-gray-700/50 pt-3 text-gray-500 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-primary-400/80" /> DUTY STATION
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-300">
                {recipe.station_name || "Unassigned"}
              </span>
            </div>
          </div>

          {/* Recipe Class */}
          <div>
            <div className="text-xs font-display font-bold border-t border-gray-700/50 pt-3 text-gray-500 flex items-center gap-2">
              <BookUser className="w-4 h-4 text-primary-400/80" /> RECIPE CLASS
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-300">
                {recipe.sub_category_name || "Uncategorized"}
              </span>
            </div>
          </div>
        </div>

        {/* Storage Info - Split into two columns */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Storage Area */}
          <div>
            <div className="text-xs font-display font-bold border-t border-gray-700/50 pt-3 text-gray-500 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-green-400/60" /> STORAGE AREA
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-300">
                {recipe.storage?.primary_area || "Walk-in Cooler"}
              </span>
            </div>
          </div>

          {/* Storage Container */}
          <div>
            <div className="text-xs font-display font-bold border-t border-gray-700/50 pt-3 text-gray-500 flex items-center gap-2">
              <Archive className="w-4 h-4 text-green-400/60" /> STORAGE
              CONTAINER
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-300">
                {recipe.storage?.container || "Cambro"}{" "}
                {recipe.storage?.container_type
                  ? `(${recipe.storage.container_type})`
                  : "(22 Qt)"}
              </span>
            </div>
          </div>
        </div>

        {/* Recipe Units & Cost - Split into two columns */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Recipe Units */}
          <div>
            <div className="text-xs font-display font-bold border-t border-gray-700/50 pt-3 text-gray-500 flex items-center gap-2">
              <BookKey className="w-4 h-4 text-amber-500/80" /> RECIPE UNITS
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-300">
                {recipe.recipe_unit_ratio || "1"}{" "}
                <span className="text-xs text-gray-400">by</span>{" "}
                {recipe.unit_type || "unit"}
              </span>
            </div>
          </div>

          {/* Cost */}
          <div>
            <div className="text-xs font-display font-bold border-t border-gray-700/50 pt-3 text-gray-500 flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-amber-500/80" /> COST
              PER RU
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-300">
                {formatCurrency(recipe.cost_per_unit || 0)}
                <span className="text-xs text-gray-400"> per </span>
                {recipe.unit_type || "unit"}
              </span>
            </div>
          </div>
        </div>

        {/* Time & Labor - Split into two columns */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Prep Time */}
          <div>
            <div className="text-xs font-display font-bold border-t border-gray-700/50 pt-3 text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500/80" /> PREP TIME
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-200">{totalTime} mins</span>
            </div>
          </div>

          {/* Labor Cost */}
          <div>
            <div className="text-xs font-display font-bold border-t border-gray-700/50 pt-3 text-gray-500 flex items-center gap-2">
              <CircleUser className="w-4 h-4 text-rose-500/80" /> LABOUR COST
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-200">
                {formatCurrency(laborCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Allergens */}
        {recipe.allergenInfo?.contains?.length > 0 && (
          <div className="pt-3 border-t border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold font-display text-gray-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-lime-400" /> DECLARED
                ALLERGENS
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recipe.allergenInfo.contains.map((allergen) => {
                // Extract allergen key without prefix if needed
                const allergenKey = allergen.startsWith("allergen_")
                  ? allergen.substring(9)
                  : allergen;

                // Format the label - replace underscores with spaces and capitalize
                const formattedLabel = allergenKey
                  .replace(/_/g, " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");

                return (
                  <div
                    key={allergen}
                    className="inline-flex items-center mr-2 mb-1"
                  >
                    <span className="text-xs text-slate-400 px-2 py-1 bg-slate-500/10 rounded-lg border border-slate-500/30">
                      {formattedLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-primary-500/50 opacity-0 hover:opacity-100 transition-opacity" />
      {/* View Button - Hidden on mobile, full width on larger screens */}
      <div className="p-4 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent double triggering
            onClick();
          }}
          className="w-full hidden md:flex justify-center px-4 py-2 bg-gray-700/70 hover:bg-primary-800/80 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-medium items-center gap-2 relative z-40"
        >
          <Info className="w-4 h-4" />
          View Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
