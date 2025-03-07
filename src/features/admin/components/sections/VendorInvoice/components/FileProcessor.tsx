import React from "react";
import { CSVUploader } from "./CSVUploader";
import { PDFUploader } from "./PDFUploader";
import { PhotoUploader } from "./PhotoUploader";
import { RefreshCw } from "lucide-react";

interface Props {
  fileType: "csv" | "pdf" | "photo";
  onUpload: (data: any) => void;
}

export const FileProcessor: React.FC<Props> = ({ fileType, onUpload }) => {
  switch (fileType) {
    case "csv":
      return <CSVUploader onUpload={onUpload} />;
    case "pdf":
      return <PDFUploader onUpload={onUpload} />;
    case "photo":
      return <PhotoUploader onUpload={onUpload} />;
    default:
      return null;
  }
};
