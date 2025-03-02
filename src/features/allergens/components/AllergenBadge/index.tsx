import React from "react";
import {
  Nut,
  Shell,
  CircleDot,
  Leaf,
  Fish,
  Wheat,
  Milk,
  AlertTriangle,
  Egg,
  Flame,
  Citrus,
  type LucideIcon,
} from "lucide-react";
import type { AllergenType } from "../../types";

interface AllergenBadgeProps {
  type: AllergenType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  disableTooltip?: boolean; // New prop to disable tooltip
}

const ALLERGEN_CONFIG: Record<
  AllergenType,
  {
    icon: LucideIcon;
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  peanut: {
    icon: Nut,
    label: "Peanuts",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/50",
  },
  crustacean: {
    icon: Shell,
    label: "Crustaceans",
    bgColor: "bg-rose-500/20",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/50",
  },
  treenut: {
    icon: Nut,
    label: "Tree Nuts",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/50",
  },
  shellfish: {
    icon: Shell,
    label: "Shellfish",
    bgColor: "bg-pink-500/20",
    textColor: "text-pink-400",
    borderColor: "border-pink-500/50",
  },
  sesame: {
    icon: CircleDot,
    label: "Sesame",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/50",
  },
  soy: {
    icon: Leaf,
    label: "Soy",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    borderColor: "border-green-500/50",
  },
  fish: {
    icon: Fish,
    label: "Fish",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/50",
  },
  wheat: {
    icon: Wheat,
    label: "Wheat",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/50",
  },
  milk: {
    icon: Milk,
    label: "Dairy",
    bgColor: "bg-cyan-500/20",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/50",
  },
  sulphite: {
    icon: AlertTriangle,
    label: "Sulphites",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/50",
  },
  egg: {
    icon: Egg,
    label: "Eggs",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/50",
  },
  gluten: {
    icon: Wheat,
    label: "Gluten",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/50",
  },
  mustard: {
    icon: AlertTriangle,
    label: "Mustard",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/50",
  },
  celery: {
    icon: Leaf,
    label: "Celery",
    bgColor: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/50",
  },
  garlic: {
    icon: AlertTriangle,
    label: "Garlic",
    bgColor: "bg-indigo-500/20",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/50",
  },
  onion: {
    icon: AlertTriangle,
    label: "Onion",
    bgColor: "bg-red-500/20",
    textColor: "text-red-400",
    borderColor: "border-red-500/50",
  },
  nitrite: {
    icon: AlertTriangle,
    label: "Nitrites",
    bgColor: "bg-fuchsia-500/20",
    textColor: "text-fuchsia-400",
    borderColor: "border-fuchsia-500/50",
  },
  mushroom: {
    icon: AlertTriangle,
    label: "Mushrooms",
    bgColor: "bg-stone-500/20",
    textColor: "text-stone-400",
    borderColor: "border-stone-500/50",
  },
  hot_pepper: {
    icon: Flame,
    label: "Hot Peppers",
    bgColor: "bg-red-500/20",
    textColor: "text-red-400",
    borderColor: "border-red-500/50",
  },
  citrus: {
    icon: Citrus,
    label: "Citrus",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/50",
  },
  pork: {
    icon: AlertTriangle,
    label: "Pork",
    bgColor: "bg-rose-500/20",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/50",
  },
};

export const AllergenBadge: React.FC<AllergenBadgeProps> = ({
  type,
  size = "md",
  showLabel = false,
  className = "",
  disableTooltip = false,
}) => {
  const config = ALLERGEN_CONFIG[type];
  if (!config) {
    console.warn(`Unknown allergen type: ${type}`);
    return null;
  }

  const Icon = config.icon;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  // Simple version without tooltips or hover effects when disableTooltip is true
  if (disableTooltip) {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <div
          className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center
          ${config.bgColor}
          ${config.textColor}
          border ${config.borderColor}
        `}
        >
          <Icon className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
        </div>

        {showLabel && (
          <span className={`ml-2 text-sm ${config.textColor}`}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  // Full version with tooltips and hover effects
  return (
    <div className={`group relative inline-flex items-center ${className}`}>
      <div
        className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        ${config.bgColor}
        ${config.textColor}
        border ${config.borderColor}
        transition-transform
        hover:scale-110 cursor-help
      `}
      >
        <Icon className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
      </div>

      {showLabel && (
        <span className={`ml-2 text-sm ${config.textColor}`}>
          {config.label}
        </span>
      )}

      {/* Tooltip */}
      <div
        className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-2 py-1 rounded bg-gray-800 text-white text-xs
        whitespace-nowrap
        opacity-0 group-hover:opacity-100
        transition-opacity
        pointer-events-none
        z-10
      "
        role="tooltip"
        aria-label={config.label}
      >
        {config.label}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
                      border-4 border-transparent border-t-gray-800"
        />
      </div>
    </div>
  );
};

export type { AllergenType };
