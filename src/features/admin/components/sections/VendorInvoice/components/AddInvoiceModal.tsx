import React from "react";
import { X, Plus } from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const AddInvoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { settings } = useOperationsStore();
  const [formData, setFormData] = React.useState({
    vendor: "",
    invoiceNumber: "",
    invoiceDate: "",
    items: [
      {
        itemCode: "",
        productName: "",
        quantity: "",
        unitPrice: "",
        unitOfMeasure: "",
      },
    ],
  });

  if (!isOpen) return null;

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemCode: "",
          productName: "",
          quantity: "",
          unitPrice: "",
          unitOfMeasure: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Add Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Vendor
              </label>
              <select
                value={formData.vendor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, vendor: e.target.value }))
                }
                className="input w-full"
                required
              >
                <option value="">Select vendor...</option>
                {settings?.vendors?.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNumber: e.target.value,
                  }))
                }
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceDate: e.target.value,
                  }))
                }
                className="input w-full"
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Line Items</h3>
              <button onClick={addItem} className="btn-ghost btn-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 bg-gray-800/50 p-4 rounded-lg"
                >
                  <div>
                    <input
                      type="text"
                      value={item.itemCode}
                      onChange={(e) =>
                        updateItem(index, "itemCode", e.target.value)
                      }
                      placeholder="Item Code"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) =>
                        updateItem(index, "productName", e.target.value)
                      }
                      placeholder="Product Name"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      placeholder="Quantity"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", e.target.value)
                      }
                      placeholder="Unit Price"
                      className="input w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={item.unitOfMeasure}
                      onChange={(e) =>
                        updateItem(index, "unitOfMeasure", e.target.value)
                      }
                      className="input flex-1"
                    >
                      <option value="">Unit</option>
                      {settings?.volume_measures?.map((measure) => (
                        <option key={measure} value={measure}>
                          {measure}
                        </option>
                      ))}
                    </select>
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="btn-ghost btn-sm text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-900 p-4 border-t border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button onClick={() => onSave(formData)} className="btn-primary">
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
