import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  Plus,
  X,
  FileText,
  Calendar,
  Tag,
  ShoppingCart,
  DollarSign,
  Search,
  AlertCircle,
  CircleDollarSign,
  Trash2,
  Check,
  ClipboardList,
} from "lucide-react";
import { SectionLoadingLogo } from "@/components";
import { useOperationsStore } from "@/stores/operationsStore";
import { supabase } from "@/lib/supabase";
import { MasterIngredient } from "@/types/master-ingredient";
import toast from "react-hot-toast";

interface Props {
  onSubmit: (data: any[], invoiceDate: Date) => void;
  onCancel: () => void;
}

export const ManualInvoiceForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const { settings } = useOperationsStore();
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    items: [
      {
        itemCode: "",
        productName: "",
        quantity: "1",
        unitPrice: "",
        unitOfMeasure: "",
      },
    ],
  });

  // State for ingredient search
  const [searchResults, setSearchResults] = useState<
    Record<number, MasterIngredient[]>
  >({});
  const [isSearching, setIsSearching] = useState<Record<number, boolean>>({});
  const [showDropdown, setShowDropdown] = useState<Record<number, string>>({});
  const dropdownRefs = useRef<Record<string | number, HTMLDivElement | null>>(
    {},
  );
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemCode: "",
          productName: "",
          quantity: "1",
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
    console.log(`Updating item ${index}, field ${field} to value: ${value}`);

    // Create a new items array
    const newItems = [...formData.items];

    // Create a new item object
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Create a new form data object
    const newFormData = {
      ...formData,
      items: newItems,
    };

    // Update the state
    setFormData(newFormData);

    // Trigger search when product name or item code changes
    if (field === "productName" || field === "itemCode") {
      // Debounce the search to prevent too many requests
      const timeoutId = setTimeout(() => {
        searchIngredients(index, field, value);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  };

  // Search for ingredients as user types
  const searchIngredients = async (
    index: number,
    field: string,
    query: string,
  ) => {
    // Only show dropdown and search when we have at least 2 characters
    if (query.length >= 2) {
      setShowDropdown((prev) => ({ ...prev, [index]: field }));
      setIsSearching((prev) => ({ ...prev, [index]: true }));

      try {
        // Log the query to help debug
        console.log(`Searching for ${field} with query: ${query}`);

        let { data: ingredients, error } = await supabase
          .from("master_ingredients")
          .select("*")
          .or(
            field === "productName"
              ? `product.ilike.%${query}%`
              : `item_code.ilike.%${query}%`,
          )
          .limit(10);

        // Log the query and results for debugging
        console.log(
          `Query: ${field === "productName" ? `product.ilike.%${query}%` : `item_code.ilike.%${query}%`}`,
        );
        console.log("Search results:", ingredients);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log(`Found ${ingredients?.length || 0} results`);
        setSearchResults((prev) => ({ ...prev, [index]: ingredients || [] }));
      } catch (error) {
        console.error("Error searching ingredients:", error);
        toast.error("Failed to search ingredients");
      } finally {
        setIsSearching((prev) => ({ ...prev, [index]: false }));
      }
    } else if (query.length < 2) {
      // Clear results but don't close dropdown if user is still typing
      setSearchResults((prev) => ({ ...prev, [index]: [] }));
    }
  };

  // Select an ingredient from search results
  const selectIngredient = (index: number, ingredient: MasterIngredient) => {
    console.log("Selecting ingredient:", ingredient);
    console.log("Current form data before update:", formData);

    try {
      // Create direct copies of the data
      const newItems = [...formData.items];

      // Create a completely new item object - but preserve the existing unitPrice
      // This is critical for price history integrity
      newItems[index] = {
        itemCode: ingredient.item_code || "",
        productName: ingredient.product || "",
        quantity: newItems[index].quantity || "1",
        unitPrice: newItems[index].unitPrice || "", // Keep existing price if any
        unitOfMeasure: ingredient.case_size || "",
      };

      console.log("Updated item at index", index, ":", newItems[index]);

      // Create a completely new form data object
      const newFormData = {
        ...formData,
        items: newItems,
      };

      console.log("Setting new form data:", newFormData);

      // Update the state directly
      setFormData(newFormData);

      // Close the dropdown immediately
      setShowDropdown({});

      // Add visual feedback that the selection was successful
      const inputElement = inputRefs.current[`${index}-productName`];
      if (inputElement) {
        // Briefly highlight the input to show it was updated
        inputElement.classList.add("bg-blue-500/20");
        setTimeout(() => {
          inputElement.classList.remove("bg-blue-500/20");
        }, 300);
      }

      // Force update the input values directly
      const productNameInput = inputRefs.current[`${index}-productName`];
      const itemCodeInput = inputRefs.current[`${index}-itemCode`];

      if (productNameInput) {
        productNameInput.value = ingredient.product || "";
      }

      if (itemCodeInput) {
        itemCodeInput.value = ingredient.item_code || "";
      }

      // Focus on the unit price field instead of quantity
      setTimeout(() => {
        const unitPriceInputs = document.querySelectorAll(
          'input[placeholder="0.00"]',
        );
        if (unitPriceInputs && unitPriceInputs.length > index) {
          (unitPriceInputs[index] as HTMLInputElement).focus();
        }
      }, 50);

      // Notify user of successful selection with modified message
      toast.success(`Selected ${ingredient.product} - please enter price`);
    } catch (error) {
      console.error("Error in selectIngredient:", error);
      toast.error("Failed to select ingredient");
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdowns if clicking outside
      let shouldCloseDropdowns = true;

      // Check if click is inside any dropdown reference or input reference
      Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
        if (ref && ref.contains(event.target as Node)) {
          shouldCloseDropdowns = false;
        }
      });

      // Also check if click is inside any input reference
      Object.entries(inputRefs.current).forEach(([key, ref]) => {
        if (ref && ref.contains(event.target as Node)) {
          shouldCloseDropdowns = false;
        }
      });

      // If clicking outside all dropdowns and inputs, close them all
      if (shouldCloseDropdowns) {
        setShowDropdown({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update dropdown position when window is resized
  const handleResize = useCallback(() => {
    // Force a re-render to update dropdown positions
    setShowDropdown((prev) => ({ ...prev }));
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Handle creating a new ingredient
  const handleCreateNewIngredient = (index: number) => {
    const item = formData.items[index];
    toast.success(`You would create a new ingredient: ${item.productName}`);
    // In a real implementation, this would open a modal to create a new ingredient
    // For now, we'll just close the dropdown
    setShowDropdown((prev) => ({ ...prev, [index]: "" }));
  };

  // State for verification
  const [verifiedItems, setVerifiedItems] = useState<Record<number, boolean>>(
    {},
  );

  // Toggle verification for an item
  const toggleVerification = (index: number) => {
    setVerifiedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Add a new item after the current one
  const addItemAfter = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index + 1, 0, {
      itemCode: "",
      productName: "",
      quantity: "1",
      unitPrice: "",
      unitOfMeasure: "",
    });

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.invoiceDate) {
      toast.error("Please enter an invoice date");
      return;
    }

    // Check if all items are verified
    const unverifiedItems = formData.items.filter(
      (item, index) =>
        item.itemCode &&
        item.productName &&
        item.unitPrice &&
        !verifiedItems[index],
    );

    if (unverifiedItems.length > 0) {
      toast.error("Please verify all items before submitting");
      return;
    }

    // Transform the data to match the format expected by DataPreview
    const transformedData = formData.items
      .filter(
        (item, index) =>
          item.itemCode &&
          item.productName &&
          item.unitPrice &&
          verifiedItems[index],
      ) // Filter out empty and unverified items
      .map((item) => ({
        item_code: item.itemCode,
        product_name: item.productName,
        unit_price: parseFloat(item.unitPrice) || 0,
        unit_of_measure: item.unitOfMeasure,
        quantity: parseFloat(item.quantity) || 1,
      }));

    if (transformedData.length === 0) {
      toast.error(
        "Please add and verify at least one item with code, name, and price",
      );
      return;
    }

    // Convert the invoice date string to a Date object
    const invoiceDate = new Date(formData.invoiceDate);

    // Pass the transformed data to the review handler
    onSubmit(transformedData, invoiceDate);
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 shadow-lg overflow-hidden">
      <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-400" />
          Manual Invoice Entry
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-6 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-blue-400" />
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
              className="input w-full bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
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
              className="input w-full bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex justify-between items-center bg-gray-800/30 px-4 py-3 rounded-t-lg border-t border-l border-r border-gray-700">
            <h3 className="text-large font-medium text-gray-300 flex items-center">
              <ClipboardList className="w-4 h-4 mr-2 text-amber-500" />
              Products Received
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="btn-ghost text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 focus:ring-primary-500/50 border border-primary-500/30 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="border-l border-r border-gray-700 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 bg-gray-800 p-3 border-b border-gray-700 border-t border-gray-700 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <div className="px-2 col-span-4 md:col-span-4 sm:col-span-3">
                Product Name
              </div>
              <div className="px-2 text-center col-span-2 md:col-span-2 sm:col-span-2">
                Item Code
              </div>
              <div className="px-2 text-center col-span-1 md:col-span-1 sm:col-span-1">
                Qty
              </div>
              <div className="px-2 text-center col-span-2 md:col-span-2 sm:col-span-2">
                Unit Price
              </div>
              <div className="px-2 text-center col-span-2 md:col-span-2 sm:col-span-2">
                Case Size
              </div>
              <div className="px-2 text-center col-span-1 md:col-span-1 sm:col-span-2 text-right">
                Actions
              </div>
            </div>

            {/* Table Body */}
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden bg-gray-900/50">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-3 p-3 ${index % 2 === 0 ? "bg-gray-800/20" : "bg-gray-800/10"} border-b border-gray-800 hover:bg-gray-800/30 transition-colors relative items-center`}
                >
                  {/* Product Name Field - First Column */}
                  <div
                    className="px-1 relative col-span-4 md:col-span-4 sm:col-span-3"
                    ref={(el) =>
                      (dropdownRefs.current[`${index}-product`] = el)
                    }
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) =>
                          updateItem(index, "productName", e.target.value)
                        }
                        placeholder="Product Name"
                        className="input w-full bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-9 pr-8"
                        ref={(el) => {
                          inputRefs.current[`${index}-productName`] = el;
                        }}
                        onFocus={() => {
                          // Only show dropdown if we have at least 2 characters
                          if (item.productName.length >= 2) {
                            setShowDropdown((prev) => ({
                              ...prev,
                              [index]: "productName",
                            }));
                            searchIngredients(
                              index,
                              "productName",
                              item.productName,
                            );
                          }
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {isSearching[index] ? (
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                        ) : (
                          <Search className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Dropdown for Product Name - Using Portal */}
                    {showDropdown[index] === "productName" &&
                      ReactDOM.createPortal(
                        <div
                          className="fixed mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto z-50"
                          style={{
                            width:
                              inputRefs.current[`${index}-productName`]
                                ?.offsetWidth || "100%",
                            top:
                              inputRefs.current[
                                `${index}-productName`
                              ]?.getBoundingClientRect().bottom + 5 || "100%",
                            left:
                              inputRefs.current[
                                `${index}-productName`
                              ]?.getBoundingClientRect().left || 0,
                          }}
                        >
                          {searchResults[index]?.length > 0 ? (
                            <ul className="py-1">
                              {searchResults[index].map((ingredient) => (
                                <li
                                  key={ingredient.id}
                                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300 text-sm"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log(
                                      "Dropdown item clicked for ingredient:",
                                      ingredient,
                                    );
                                    selectIngredient(index, ingredient);
                                  }}
                                >
                                  <div className="font-medium">
                                    {ingredient.product}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {ingredient.item_code}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-gray-400 text-sm mb-2">
                                No ingredients found
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCreateNewIngredient(index)}
                                className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-md hover:bg-blue-600/30"
                              >
                                Create New Ingredient
                              </button>
                            </div>
                          )}
                        </div>,
                        document.body,
                      )}
                  </div>

                  {/* Item Code Field - Second Column */}
                  <div
                    className="px-1 relative col-span-2 md:col-span-2 sm:col-span-2"
                    ref={(el) => (dropdownRefs.current[`${index}-code`] = el)}
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) =>
                          updateItem(index, "itemCode", e.target.value)
                        }
                        placeholder="Item Code"
                        className="input w-full bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-9 pr-8"
                        ref={(el) => {
                          inputRefs.current[`${index}-itemCode`] = el;
                        }}
                        onFocus={() => {
                          // Only show dropdown if we have at least 2 characters
                          if (item.itemCode.length >= 2) {
                            setShowDropdown((prev) => ({
                              ...prev,
                              [index]: "itemCode",
                            }));
                            searchIngredients(index, "itemCode", item.itemCode);
                          }
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {isSearching[index] ? (
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                        ) : (
                          <Search className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Dropdown for Item Code - Using Portal */}
                    {showDropdown[index] === "itemCode" &&
                      ReactDOM.createPortal(
                        <div
                          className="fixed mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto z-50"
                          style={{
                            width:
                              inputRefs.current[`${index}-itemCode`]
                                ?.offsetWidth || "100%",
                            top:
                              inputRefs.current[
                                `${index}-itemCode`
                              ]?.getBoundingClientRect().bottom + 5 || "100%",
                            left:
                              inputRefs.current[
                                `${index}-itemCode`
                              ]?.getBoundingClientRect().left || 0,
                          }}
                        >
                          {searchResults[index]?.length > 0 ? (
                            <ul className="py-1">
                              {searchResults[index].map((ingredient) => (
                                <li
                                  key={ingredient.id}
                                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300 text-sm"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log(
                                      "Dropdown item clicked for ingredient (item code):",
                                      ingredient,
                                    );
                                    selectIngredient(index, ingredient);
                                  }}
                                >
                                  <div className="font-medium">
                                    {ingredient.item_code}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {ingredient.product}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-gray-400 text-sm mb-2">
                                No ingredients found
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCreateNewIngredient(index)}
                                className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-md hover:bg-blue-600/30"
                              >
                                Create New Ingredient
                              </button>
                            </div>
                          )}
                        </div>,
                        document.body,
                      )}
                  </div>

                  {/* Quantity Field */}
                  <div className="px-1 col-span-1 md:col-span-1 sm:col-span-1">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      placeholder="Qty"
                      className="input w-full bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-9"
                      min="0"
                      max="9999"
                    />
                  </div>

                  {/* Unit Price Field */}
                  <div className="px-1 relative col-span-2 md:col-span-2 sm:col-span-2">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", e.target.value)
                      }
                      placeholder="0.00"
                      className="input w-full bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-8 h-9"
                    />
                  </div>

                  {/* Case Size Field */}
                  <div className="px-1 col-span-2 md:col-span-2 sm:col-span-2">
                    <input
                      type="text"
                      value={item.unitOfMeasure}
                      onChange={(e) =>
                        updateItem(index, "unitOfMeasure", e.target.value)
                      }
                      placeholder="Case Size"
                      className="input w-full bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-9"
                      readOnly={false}
                    />
                  </div>

                  {/* Action buttons - verify, add, remove */}
                  <div className="px-1 col-span-1 md:col-span-1 sm:col-span-2 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => toggleVerification(index)}
                      className={`${verifiedItems[index] ? "text-green-400 bg-green-500/20" : "text-gray-400 bg-gray-700/20"} hover:bg-gray-600/30 rounded-full p-1.5 flex items-center justify-center transition-colors`}
                      title={verifiedItems[index] ? "Verified" : "Verify item"}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => addItemAfter(index)}
                      className="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-full p-1.5 flex items-center justify-center"
                      title="Add item after this one"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-full p-1.5 flex items-center justify-center"
                        title="Remove item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-b border-l border-r border-gray-700 rounded-b-lg"></div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Import Invoice
          </button>
        </div>
      </form>
    </div>
  );
};
