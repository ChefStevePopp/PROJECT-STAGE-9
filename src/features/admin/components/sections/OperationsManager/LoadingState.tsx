import React from "react";
import { LoadingLogo } from "@/components/LoadingLogo";

export const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingLogo message="Loading..." />
    </div>
  );
};
