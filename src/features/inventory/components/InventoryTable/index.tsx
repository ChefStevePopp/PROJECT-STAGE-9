import React from 'react';
import { Package, AlertTriangle, XCircle } from 'lucide-react';
import type { InventoryItem } from '../../types';

interface InventoryTableProps {
  items: InventoryItem[];
  onImportExcel: (file: File) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onImportExcel }) => {
  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return <Package className="w-4 h-4 text-green-400" />;
      case 'low-stock':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'out-of-stock':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Inventory</h2>
        <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
          Import Excel
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && onImportExcel(e.target.files[0])}
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3">Item</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Quantity</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-700 text-gray-300">
                <td className="py-4">{item.name}</td>
                <td className="py-4">{item.category}</td>
                <td className="py-4">{item.quantity}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span>{item.status}</span>
                  </div>
                </td>
                <td className="py-4">{item.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { InventoryTable };