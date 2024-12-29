import React from 'react';
import { Package, Plus, Search, Upload } from 'lucide-react';

const InventoryControl = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Inventory Control</h1>
        <div className="flex gap-4">
          <button className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add Item
          </button>
        </div>
      </header>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Inventory Management</h2>
        {/* Inventory content */}
      </div>
    </div>
  );
};

export {InventoryControl};