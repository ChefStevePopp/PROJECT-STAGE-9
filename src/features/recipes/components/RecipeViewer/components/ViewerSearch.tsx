// ViewerSearch.tsx
import React from "react";
import { Search } from "lucide-react";

interface ViewerSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ViewerSearch: React.FC<ViewerSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="relative">
      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input pl-10 w-full"
      />
    </div>
  );
};
