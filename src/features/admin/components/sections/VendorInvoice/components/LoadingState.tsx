import React from "react";
import { SectionLoadingLogo } from "@/components";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading vendor invoice data...",
}) => {
  return (
    <div className="flex items-center justify-center w-full h-64">
      <SectionLoadingLogo section="invoice" message={message} className="p-8" />
    </div>
  );
};
