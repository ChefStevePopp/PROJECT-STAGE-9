import React from "react";
import { AlertTriangle, Save, X } from "lucide-react";

interface Props {
  data: any[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const DataPreview: React.FC<Props> = ({ data, onConfirm, onCancel }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Review Import Data</h3>
          <p className="text-sm text-gray-400">
            Please verify the mapped data before proceeding
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-ghost">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Confirm Import
          </button>
        </div>
      </div>

      <div className="bg-blue-500/10 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-1">Please Review</p>
            <p>
              Review the mapped data below before confirming. Make sure item
              codes, product names, and prices are correctly mapped. You can
              cancel and adjust the template if needed.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                Item Code
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                Product Name
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">
                Unit Price
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                Unit of Measure
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-800/50">
                <td className="px-4 py-2 text-sm text-gray-300">
                  {row.item_code}
                </td>
                <td className="px-4 py-2 text-sm text-gray-300">
                  {row.product_name}
                </td>
                <td className="px-4 py-2 text-sm text-gray-300 text-right">
                  $
                  {typeof row.unit_price === "number"
                    ? row.unit_price.toFixed(2)
                    : row.unit_price}
                </td>
                <td className="px-4 py-2 text-sm text-gray-300">
                  {row.unit_of_measure}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Records:</span>
          <span className="text-white font-medium">{data.length}</span>
        </div>
      </div>
    </div>
  );
};
