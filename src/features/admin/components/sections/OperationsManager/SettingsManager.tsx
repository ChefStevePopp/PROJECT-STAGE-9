import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  AlertTriangle,
  Printer,
  Settings2,
  Tag,
} from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";
import { LabelTemplateEditor } from "./LabelTemplateEditor";
import { PrinterManager } from "./PrinterManager";
import type { LabelTemplate } from "@/types/labels";
import toast from "react-hot-toast";

interface SettingsManagerProps {
  group: {
    id: string;
    name: string;
    icon: React.ComponentType;
    color: string;
    description: string;
    categories: { id: string; label: string }[];
  };
  activeCategory: string | null;
  settings: any | null;
  onAddItem: (name: string) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  group,
  activeCategory,
  settings,
  onAddItem,
}) => {
  // State declarations
  const [editingItem, setEditingItem] = useState<{
    index: number;
    value: string;
  } | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(
    null,
  );
  const { updateSettings } = useOperationsStore();

  const isLabelCategory =
    activeCategory?.startsWith("label_") ||
    activeCategory?.startsWith("printer_");

  const handleAddItem = async () => {
    if (!newItemName.trim() || !activeCategory) return;

    try {
      const updatedSettings = { ...settings };

      if (isLabelCategory) {
        switch (activeCategory) {
          case "label_templates":
            if (!updatedSettings.label_templates) {
              updatedSettings.label_templates = [];
            }
            updatedSettings.label_templates.push({
              id: `template-${Date.now()}`,
              name: newItemName.trim(),
              fields: ["product_name", "date", "team_member"],
              printerConfig: {
                width: 62,
                height: 29,
                type: "brother_ql810w",
              },
            });
            break;

          case "required_label_fields":
            if (!updatedSettings.required_label_fields) {
              updatedSettings.required_label_fields = [];
            }
            updatedSettings.required_label_fields.push(newItemName.trim());
            break;

          case "printer_settings":
            // Printer settings are handled by PrinterManager component
            break;
        }

        // Only update settings directly for label categories
        await updateSettings(updatedSettings);
      } else {
        // For non-label categories, use the onAddItem callback
        await onAddItem(newItemName.trim());
      }

      setNewItemName("");
      setIsAddingItem(false);
      toast.success("Item added successfully");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  const handleUpdateItem = async (index: number, newValue: string) => {
    if (!activeCategory) return;

    try {
      const updatedSettings = { ...settings };

      if (isLabelCategory) {
        switch (activeCategory) {
          case "label_templates":
            updatedSettings.label_templates[index].name = newValue;
            break;
          case "required_label_fields":
            updatedSettings.required_label_fields[index] = newValue;
            break;
        }
      } else {
        updatedSettings[activeCategory][index] = newValue;
      }

      await updateSettings(updatedSettings);
      setEditingItem(null);
      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleUpdateTemplate = async (template: LabelTemplate) => {
    try {
      const updatedSettings = { ...settings };
      const index = updatedSettings.label_templates.findIndex(
        (t: LabelTemplate) => t.id === template.id,
      );

      if (index !== -1) {
        updatedSettings.label_templates[index] = template;
        await updateSettings(updatedSettings);
        toast.success("Template updated successfully");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  };

  const handleDeleteItem = async (index: number) => {
    if (
      !activeCategory ||
      !window.confirm("Are you sure you want to delete this item?")
    )
      return;

    try {
      const updatedSettings = { ...settings };

      if (isLabelCategory) {
        switch (activeCategory) {
          case "label_templates":
            updatedSettings.label_templates.splice(index, 1);
            break;
          case "required_label_fields":
            updatedSettings.required_label_fields.splice(index, 1);
            break;
        }
      } else {
        updatedSettings[activeCategory].splice(index, 1);
      }

      await updateSettings(updatedSettings);
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const renderLabelContent = () => {
    switch (activeCategory) {
      case "label_templates":
        if (editingTemplate) {
          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="btn-ghost"
                >
                  <X className="w-4 h-4 mr-2" />
                  Back to Templates
                </button>
              </div>
              <LabelTemplateEditor
                template={editingTemplate}
                onSave={(updatedTemplate) => {
                  handleUpdateTemplate(updatedTemplate);
                  setEditingTemplate(null);
                }}
                onCancel={() => setEditingTemplate(null)}
              />
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {settings?.label_templates?.map(
              (template: LabelTemplate, index: number) => (
                <div
                  key={template.id}
                  className="bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium text-white">
                      {template.name}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="btn-ghost text-sm"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="btn-ghost text-sm text-rose-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.fields.map((field: string) => (
                      <span
                        key={field}
                        className="px-2 py-1 bg-gray-600 rounded-full text-sm text-gray-200"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        );

      case "required_label_fields":
        return (
          <div className="space-y-4">
            <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <Tag className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 font-medium">Required Fields</p>
                  <p className="text-sm text-gray-300 mt-1">
                    These fields will be included on all label templates for
                    food safety compliance.
                  </p>
                </div>
              </div>
            </div>

            {settings?.required_label_fields?.map(
              (field: string, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg"
                >
                  <span className="text-white">{field}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem({ index, value: field })}
                      className="text-gray-400 hover:text-primary-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="text-gray-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        );

      case "printer_settings":
        return (
          <PrinterManager
            printers={settings?.printer_settings || []}
            onUpdate={(printers) => {
              updateSettings({
                ...settings,
                printer_settings: printers,
              });
            }}
          />
        );

      default:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.isArray(settings?.[activeCategory || ""]) &&
              settings[activeCategory || ""].map(
                (item: string, index: number) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 group w-full"
                  >
                    {editingItem?.index === index ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingItem.value}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              value: e.target.value,
                            })
                          }
                          className="input flex-1 min-w-0"
                          autoFocus
                        />
                        <div className="flex-shrink-0 flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleUpdateItem(index, editingItem.value)
                            }
                            className="text-green-400 hover:text-green-300"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-gray-300 truncate">{item}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={() =>
                              setEditingItem({ index, value: item })
                            }
                            className="text-gray-400 hover:text-primary-400"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ),
              )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{group.name}</h3>
          <p className="text-gray-400 mt-1">{group.description}</p>
        </div>
        {(!isLabelCategory || activeCategory === "required_label_fields") && (
          <button onClick={() => setIsAddingItem(true)} className="btn-ghost">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        )}
        {activeCategory === "label_templates" && (
          <button
            onClick={() => {
              setEditingTemplate({
                id: `template-${Date.now()}`,
                name: "New Template",
                fields: ["product_name", "date", "team_member"],
                printerConfig: {
                  width: 62,
                  height: 29,
                  type: "brother_ql810w",
                },
              });
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </button>
        )}
      </div>

      {isAddingItem && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="input flex-1"
              placeholder="Enter item name"
              autoFocus
            />
            <button
              onClick={handleAddItem}
              className="btn-primary"
              disabled={!newItemName.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button
              onClick={() => {
                setIsAddingItem(false);
                setNewItemName("");
              }}
              className="btn-ghost"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {renderLabelContent()}

      {(!settings?.[activeCategory || ""] ||
        settings[activeCategory || ""].length === 0) &&
        !isLabelCategory && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-400">
              No items found. Add some using the button above.
            </p>
          </div>
        )}
    </div>
  );
};
