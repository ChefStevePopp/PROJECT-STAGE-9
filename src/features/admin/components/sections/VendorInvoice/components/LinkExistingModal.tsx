import React from "react";
import { X } from "lucide-react";
import type { MasterIngredient } from "@/types/master-ingredient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ingredient: MasterIngredient) => void;
  matches: MasterIngredient[];
}

export const LinkExistingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
  matches,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-lg font-medium text-white">
            Link Existing Ingredient
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Select the matching ingredient to link
          </p>
        </div>
        <div className="p-4 space-y-2">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => onSelect(match)}
              className="w-full p-4 text-left bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="font-medium text-white">{match.product}</div>
              <div className="text-sm text-gray-400 mt-1">
                Current Code: {match.item_code} | Category:{" "}
                {match.category_name}
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
