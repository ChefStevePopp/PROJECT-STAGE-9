import React from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Book,
  Clock,
  Package,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  GraduationCap,
  Image,
} from "lucide-react";

interface ViewerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const VIEWER_TABS = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    color: "primary",
  },
  {
    id: "ingredients",
    label: "Ingredients",
    icon: UtensilsCrossed,
    color: "amber",
  },
  { id: "method", label: "Method", icon: Book, color: "blue" },
  { id: "production", label: "Production", icon: Clock, color: "purple" },
  { id: "storage", label: "Storage", icon: Package, color: "emerald" },
  { id: "quality", label: "Quality", icon: CheckCircle2, color: "green" },
  { id: "allergens", label: "Allergens", icon: AlertTriangle, color: "rose" },
  { id: "equipment", label: "Equipment", icon: Wrench, color: "amber" },
  { id: "training", label: "Training", icon: GraduationCap, color: "purple" },
  { id: "media", label: "Media", icon: Image, color: "blue" },
] as const;

export const ViewerSidebar: React.FC<ViewerSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="w-64 flex-shrink-0 h-[calc(100vh-73px)] sticky top-[73px] border-r border-gray-800 py-6">
      <div className="space-y-1 px-3">
        {VIEWER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? `bg-${tab.color}-500/20 text-${tab.color}-400`
                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <tab.icon
                className={`w-4 h-4 ${activeTab === tab.id ? `text-${tab.color}-400` : "text-gray-400"}`}
              />
              {tab.label}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};
