// ViewerTabs.tsx
import React from "react";
import { ChefHat, UtensilsCrossed } from "lucide-react";

interface ViewerTabsProps {
  activeTab: "prepared" | "final";
  onTabChange: (tab: "prepared" | "final") => void;
}

export const ViewerTabs: React.FC<ViewerTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: "prepared" as const,
      label: "Mis en Place",
      icon: UtensilsCrossed,
      color: "primary",
    },
    {
      id: "final" as const,
      label: "Final Plates",
      icon: ChefHat,
      color: "green",
    },
  ] as const;

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab ${tab.color} ${activeTab === tab.id ? "active" : ""}`}
        >
          <tab.icon
            className={`w-5 h-5 ${
              activeTab === tab.id ? `text-${tab.color}-400` : "text-current"
            }`}
          />
          {tab.label}
        </button>
      ))}
    </div>
  );
};
