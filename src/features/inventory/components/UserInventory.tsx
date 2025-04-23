import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { createClient } from "@supabase/supabase-js";
import {
  Image,
  Search,
  Package,
  Info,
  PieChart,
  Filter,
  MapPin,
  Truck,
  Apple,
  Carrot,
  Plus,
  Minus,
  Edit,
  Save,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { Database } from "../../../types/supabase";
import { useInventoryStore } from "../../../stores/inventoryStore";
import toast from "react-hot-toast";

type InventoryItem = {
  id: string;
  name: string;
  image_url?: string;
  major_category?: string;
  category?: string;
  sub_category?: string;
  quantity?: number;
  unit?: string;
  organization_id: string;
  unit_cost?: number;
  total_value?: number;
  storage_area?: string;
  status?: string;
  vendor?: string;
  case_size?: string;
  units_per_case?: number;
  unit_of_measure?: string;
  inventory_unit_cost?: number;
};

// Define color palette for dynamic assignment to categories
const COLOR_PALETTE = [
  { bg: "bg-amber-500/20", text: "text-amber-400" },
  { bg: "bg-blue-500/20", text: "text-blue-400" },
  { bg: "bg-green-500/20", text: "text-green-400" },
  { bg: "bg-purple-500/20", text: "text-purple-400" },
  { bg: "bg-rose-500/20", text: "text-rose-400" },
  { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  { bg: "bg-orange-500/20", text: "text-orange-400" },
  { bg: "bg-red-500/20", text: "text-red-400" },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Item Card Component with Simplified Count Functionality
const InventoryItemCard = memo(
  ({
    item,
    onAddCount,
  }: {
    item: InventoryItem;
    onAddCount: (item: InventoryItem) => void;
  }) => {
    const [quantity, setQuantity] = useState(item.quantity || 0);
    const [isUpdating, setIsUpdating] = useState(false);
    const itemColor =
      COLOR_PALETTE[Math.abs(item.name.charCodeAt(0)) % COLOR_PALETTE.length];

    // Handle quantity change and save
    const handleQuantityChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        const newQuantity = isNaN(value) ? 0 : value;
        setQuantity(newQuantity);
      },
      [],
    );

    // Save changes when input loses focus
    const handleSaveChanges = useCallback(() => {
      setIsUpdating(true);

      // Create a count object and save it
      const countData = {
        masterIngredientId: item.id,
        quantity: quantity,
        unitCost: item.unit_cost || 0,
        totalValue: quantity * (item.unit_cost || 0),
        location: item.storage_area || "Main Storage",
        notes: "",
        status: "pending",
      };

      // Call the onAddCount function with the updated item
      onAddCount({ ...item, quantity: quantity });

      // Reset updating state after a short delay
      setTimeout(() => setIsUpdating(false), 300);
    }, [item, quantity, onAddCount]);

    return (
      <div className="card overflow-hidden hover:bg-gray-800/80 transition-all duration-200">
        <div className="aspect-square bg-gray-800 relative">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <img
                src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
                alt="Company Logo"
                className="w-full h-full object-contain p-4"
                loading="lazy"
              />
            </div>
          )}
        </div>
        <div className="p-4">
          <h5 className="font-medium text-white mb-2 line-clamp-1">
            {item.name}
          </h5>

          {/* Item Details */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3 text-xs">
            {item.unit && (
              <div className="text-gray-400">
                Unit: <span className="text-gray-300">{item.unit}</span>
              </div>
            )}
            {item.case_size && (
              <div className="text-gray-400">
                Case: <span className="text-gray-300">{item.case_size}</span>
              </div>
            )}
            {item.unit_cost && (
              <div className="text-gray-400">
                Price:{" "}
                <span className="text-gray-300">
                  ${item.unit_cost.toFixed(2)}
                </span>
              </div>
            )}
            {item.inventory_unit_cost !== undefined && (
              <div className="text-gray-400">
                Inv Unit Cost:{" "}
                <span className="text-gray-300">
                  ${item.inventory_unit_cost.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Count Input */}
          <div className="mb-3">
            <label className="text-sm text-gray-400 block mb-1">Count:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleSaveChanges}
                className="input w-full text-white"
                min="0"
                step="0.01"
                inputMode="decimal"
              />
              <span className="text-gray-400 whitespace-nowrap">
                {item.unit || "units"}
              </span>
            </div>
            {item.inventory_unit_cost !== undefined && (
              <div className="text-right text-xs text-gray-300 mt-1">
                Total: ${(quantity * item.inventory_unit_cost).toFixed(2)}
              </div>
            )}
          </div>

          {/* Status and Tags */}
          <div className="flex flex-wrap gap-2">
            {item.status && (
              <div
                className={`inline-block px-2 py-1 rounded-md text-xs font-medium capitalize
              ${
                item.status === "completed"
                  ? "bg-green-500/20 text-green-400"
                  : item.status === "verified"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-amber-500/20 text-amber-400"
              }`}
              >
                {item.status}
              </div>
            )}
            {item.storage_area && (
              <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                {item.storage_area}
              </div>
            )}
            {item.vendor && (
              <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                {item.vendor}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

// Count Entry Component
const CountEntryItem = memo(
  ({ count, onUpdate, onDelete, masterIngredients }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [quantity, setQuantity] = useState(count.quantity);
    const [location, setLocation] = useState(count.location || "Main Storage");
    const [notes, setNotes] = useState(count.notes || "");

    const ingredient = masterIngredients.find(
      (ing) => ing.id === count.masterIngredientId,
    );

    const handleSave = () => {
      onUpdate(count.id, {
        quantity,
        location,
        notes,
        totalValue: quantity * count.unitCost,
      });
      setIsEditing(false);
    };

    return (
      <div className="card p-4 mb-2">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <h4 className="font-medium text-white">{ingredient?.name}</h4>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="text-green-400 hover:text-green-300"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Quantity ({ingredient?.unit || "units"})
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="input w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input w-full"
                rows={2}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-white">{ingredient?.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-300">
                    {count.quantity} {ingredient?.unit || "units"}
                  </span>
                  {count.status === "completed" && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(count.id)}
                  className="text-rose-400 hover:text-rose-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Location:</span>
                <span className="text-gray-300 ml-1">
                  {count.location || "Main Storage"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Value:</span>
                <span className="text-gray-300 ml-1">
                  ${(count.quantity * count.unitCost).toFixed(2)}
                </span>
              </div>
            </div>

            {count.notes && (
              <div className="mt-2 text-sm">
                <span className="text-gray-400">Notes:</span>
                <p className="text-gray-300 mt-1">{count.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

// Category Header Component
const CategoryHeader = memo(
  ({ title, colorIndex }: { title: string; colorIndex: number }) => {
    const color = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];

    return (
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/30">
        <div
          className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}
        >
          <Package className={`w-5 h-5 ${color.text}`} />
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
    );
  },
);

// Subcategory Header Component
const SubcategoryHeader = memo(
  ({ title, colorIndex }: { title: string; colorIndex: number }) => {
    const color = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];

    return (
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-6 h-6 rounded-lg ${color.bg} flex items-center justify-center`}
        >
          <Package className={`w-3 h-3 ${color.text}`} />
        </div>
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
    );
  },
);

// Stats Card Component
const StatCard = memo(
  ({
    icon,
    title,
    value,
    bgColor,
    textColor,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    bgColor: string;
    textColor: string;
  }) => {
    return (
      <div className="card p-6 cursor-pointer transition-all hover:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
      </div>
    );
  },
);

// Add Count Modal
const AddCountModal = memo(({ item, onClose, onSave }) => {
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState(item.storage_area || "Main Storage");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    onSave({
      masterIngredientId: item.id,
      quantity,
      unitCost: item.unit_cost || 0,
      totalValue: quantity * (item.unit_cost || 0),
      location,
      notes,
      status: "pending",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            Add Inventory Count
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Item</label>
            <div className="input bg-gray-700 p-3 rounded-md">{item.name}</div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Quantity ({item.unit || "units"})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input w-full"
              min="0"
              step="0.01"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="btn-ghost order-2 sm:order-1 mt-2 sm:mt-0"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary order-1 sm:order-2"
              disabled={quantity <= 0}
            >
              Save Count
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export const UserInventory: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false); // Start with no loading screen
  const [backgroundLoading, setBackgroundLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByStorage, setFilterByStorage] = useState<string>("");
  const [filterByVendor, setFilterByVendor] = useState<string>("");
  const [filterByCategory, setFilterByCategory] = useState<string>("");
  const [filterBySubCategory, setFilterBySubCategory] = useState<string>("");
  const [showStats, setShowStats] = useState(false);
  const [categories, setCategories] = useState<{
    [majorCategory: string]: {
      [category: string]: {
        [subCategory: string]: InventoryItem[];
      };
    };
  }>({});
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showCountsPanel, setShowCountsPanel] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [storageLocations, setStorageLocations] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [subCategoryList, setSubCategoryList] = useState<string[]>([]);
  const [filteredSubCategoryList, setFilteredSubCategoryList] = useState<
    string[]
  >([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Get inventory store
  const {
    items: inventoryCounts,
    isLoading: countsLoading,
    fetchItems: fetchCounts,
    addCount,
    updateCount,
    deleteCount,
    loadingProgress,
    totalItems,
    isBackgroundLoading,
    lastFetched,
  } = useInventoryStore();

  // Initial data loading - start immediately with no loading screen
  useEffect(() => {
    // Start loading data immediately
    fetchCounts();
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      // Fetch master ingredients with joined category information
      const { data, error } = await supabase
        .from("master_ingredients_with_categories")
        .select("*")
        .order("product", { ascending: true });

      if (error) throw error;

      if (data) {
        console.log(
          `Fetched ${data.length} master ingredients with categories`,
        );

        // Process data in chunks to improve perceived performance
        const chunkSize = 50; // Process 50 items at a time
        const chunks = [];

        // Split data into chunks
        for (let i = 0; i < data.length; i += chunkSize) {
          chunks.push(data.slice(i, i + chunkSize));
        }

        // Process first chunk immediately to show some data
        if (chunks.length > 0) {
          const firstChunk = chunks[0];
          const initialProcessedData = firstChunk.map((item) => ({
            id: item.id,
            name: item.product,
            image_url: item.image_url,
            major_category: item.major_group_name || "Uncategorized",
            category: item.category_name || "Uncategorized",
            sub_category:
              item.sub_category_name || item.storage_area || "General",
            organization_id: item.organization_id,
            storage_area: item.storage_area,
            unit: item.unit_of_measure,
            unit_cost: item.current_price || 0,
            quantity: 0,
            total_value: 0,
            status: "pending",
            vendor: item.vendor,
            case_size: item.case_size,
            units_per_case: item.units_per_case,
            inventory_unit_cost: item.inventory_unit_cost,
          }));

          // Set initial data to make the list scrollable
          setInventoryItems(initialProcessedData as InventoryItem[]);
          organizeByCategories(initialProcessedData as InventoryItem[]);

          // Process remaining chunks with small delays to keep UI responsive
          if (chunks.length > 1) {
            let processedItems = [...initialProcessedData];

            // Process remaining chunks with setTimeout to avoid blocking the main thread
            const processNextChunk = (index) => {
              if (index >= chunks.length) {
                // All chunks processed, finalize data
                setInventoryItems(processedItems as InventoryItem[]);
                organizeByCategories(processedItems as InventoryItem[]);

                // Extract filter data from the complete dataset
                const storageLocations = Array.from(
                  new Set(
                    data.map((item) => item.storage_area).filter(Boolean),
                  ),
                ).sort();
                setStorageLocations(storageLocations as string[]);

                const vendors = Array.from(
                  new Set(data.map((item) => item.vendor).filter(Boolean)),
                ).sort();
                setVendors(vendors as string[]);

                const categories = Array.from(
                  new Set(
                    data.map((item) => item.category_name).filter(Boolean),
                  ),
                ).sort();
                setCategoryList(categories as string[]);

                const subCategories = Array.from(
                  new Set(
                    data.map((item) => item.sub_category_name).filter(Boolean),
                  ),
                ).sort();
                setSubCategoryList(subCategories as string[]);

                // Background loading is complete
                setBackgroundLoading(false);
                return;
              }

              // Process this chunk
              const chunk = chunks[index];
              const chunkData = chunk.map((item) => ({
                id: item.id,
                name: item.product,
                image_url: item.image_url,
                major_category: item.major_group_name || "Uncategorized",
                category: item.category_name || "Uncategorized",
                sub_category:
                  item.sub_category_name || item.storage_area || "General",
                organization_id: item.organization_id,
                storage_area: item.storage_area,
                unit: item.unit_of_measure,
                unit_of_measure: item.unit_of_measure,
                unit_cost: item.current_price || 0,
                quantity: 0,
                total_value: 0,
                status: "pending",
                vendor: item.vendor,
                case_size: item.case_size,
                units_per_case: item.units_per_case,
                inventory_unit_cost: item.inventory_unit_cost,
              }));

              // Update processed items
              processedItems = [...processedItems, ...chunkData];

              // Update UI with current progress
              setInventoryItems(processedItems as InventoryItem[]);
              organizeByCategories(processedItems as InventoryItem[]);

              // Process next chunk
              setTimeout(() => processNextChunk(index + 1), 50);
            };

            // Start processing remaining chunks
            setTimeout(() => processNextChunk(1), 50);
          } else {
            // Only one chunk, we're already done
            const storageLocations = Array.from(
              new Set(data.map((item) => item.storage_area).filter(Boolean)),
            ).sort();
            setStorageLocations(storageLocations as string[]);

            const vendors = Array.from(
              new Set(data.map((item) => item.vendor).filter(Boolean)),
            ).sort();
            setVendors(vendors as string[]);

            const categories = Array.from(
              new Set(data.map((item) => item.category_name).filter(Boolean)),
            ).sort();
            setCategoryList(categories as string[]);

            const subCategories = Array.from(
              new Set(
                data.map((item) => item.sub_category_name).filter(Boolean),
              ),
            ).sort();
            setSubCategoryList(subCategories as string[]);

            setBackgroundLoading(false);
          }
        } else {
          // No data
          setBackgroundLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      setBackgroundLoading(false);
    }
  };

  const organizeByCategories = useCallback((items: InventoryItem[]) => {
    console.log(`Organizing ${items.length} items by categories`);
    const categorized = items.reduce(
      (acc, item) => {
        const majorCategory = item.major_category || "Uncategorized";
        const category = item.category || "Uncategorized";
        const subCategory = item.sub_category || "Uncategorized";

        if (!acc[majorCategory]) {
          acc[majorCategory] = {};
        }

        if (!acc[majorCategory][category]) {
          acc[majorCategory][category] = {};
        }

        if (!acc[majorCategory][category][subCategory]) {
          acc[majorCategory][category][subCategory] = [];
        }

        acc[majorCategory][category][subCategory].push(item);
        return acc;
      },
      {} as {
        [majorCategory: string]: {
          [category: string]: {
            [subCategory: string]: InventoryItem[];
          };
        };
      },
    );

    // Log the structure to help debug
    const categoryCount = Object.keys(categorized).length;
    let totalSubcategories = 0;
    let totalItems = 0;

    Object.values(categorized).forEach((categoryObj) => {
      Object.values(categoryObj).forEach((subCategoryObj) => {
        Object.values(subCategoryObj).forEach((items) => {
          totalSubcategories++;
          totalItems += items.length;
        });
      });
    });

    console.log(
      `Organized into ${categoryCount} major categories, ${totalSubcategories} subcategories, ${totalItems} total items`,
    );

    setCategories(categorized);
  }, []);

  // Update subcategory list when category filter changes
  useEffect(() => {
    if (!filterByCategory) {
      // If no category is selected, show all subcategories
      setFilteredSubCategoryList(subCategoryList);
    } else {
      // Filter subcategories based on selected category
      const filteredSubcategories: string[] = [];

      Object.entries(categories).forEach(([majorCategory, categoryObj]) => {
        if (categoryObj[filterByCategory]) {
          Object.keys(categoryObj[filterByCategory]).forEach((subCategory) => {
            if (!filteredSubcategories.includes(subCategory)) {
              filteredSubcategories.push(subCategory);
            }
          });
        }
      });

      setFilteredSubCategoryList(filteredSubcategories);

      // If current subcategory is not in the filtered list, reset it
      if (
        filterBySubCategory &&
        !filteredSubcategories.includes(filterBySubCategory)
      ) {
        setFilterBySubCategory("");
      }
    }
  }, [filterByCategory, categories, subCategoryList, filterBySubCategory]);

  const filteredCategories = useMemo(() => {
    if (
      !searchTerm &&
      !filterByStorage &&
      !filterByVendor &&
      !filterByCategory &&
      !filterBySubCategory
    )
      return categories;

    const filtered: typeof categories = {};

    Object.entries(categories).forEach(([majorCategory, categoryObj]) => {
      Object.entries(categoryObj).forEach(([category, subCategoryObj]) => {
        Object.entries(subCategoryObj).forEach(([subCategory, items]) => {
          const filteredItems = items.filter((item) => {
            // Apply search term filter
            const matchesSearch =
              !searchTerm ||
              item.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Apply storage location filter
            const matchesStorage =
              !filterByStorage || item.storage_area === filterByStorage;

            // Apply vendor filter
            const matchesVendor =
              !filterByVendor || item.vendor === filterByVendor;

            // Apply category filter
            const matchesCategory =
              !filterByCategory || category === filterByCategory;

            // Apply subcategory filter
            const matchesSubCategory =
              !filterBySubCategory || subCategory === filterBySubCategory;

            return (
              matchesSearch &&
              matchesStorage &&
              matchesVendor &&
              matchesCategory &&
              matchesSubCategory
            );
          });

          if (filteredItems.length > 0) {
            if (!filtered[majorCategory]) filtered[majorCategory] = {};
            if (!filtered[majorCategory][category])
              filtered[majorCategory][category] = {};
            filtered[majorCategory][category][subCategory] = filteredItems;
          }
        });
      });
    });

    return filtered;
  }, [
    categories,
    searchTerm,
    filterByStorage,
    filterByVendor,
    filterByCategory,
    filterBySubCategory,
  ]);

  // Calculate total inventory value
  const totalInventoryValue = useMemo(() => {
    return inventoryCounts.reduce((sum, count) => {
      return sum + count.quantity * count.unitCost;
    }, 0);
  }, [inventoryCounts]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    if (!inventoryItems || inventoryItems.length === 0) return [];

    // First get category counts
    const stats = inventoryItems.reduce(
      (acc, item) => {
        const category = item.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Sort categories by count in descending order
    const sortedCategories = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count], index) => ({
        category,
        count,
        ...COLOR_PALETTE[index % COLOR_PALETTE.length],
      }));

    return sortedCategories;
  }, [inventoryItems]);

  // Handle adding a new count
  const handleAddCount = useCallback(
    (updatedItem) => {
      // Create a count object with the updated quantity
      const countData = {
        masterIngredientId: updatedItem.id,
        quantity: updatedItem.quantity || 0,
        unitCost: updatedItem.unit_cost || 0,
        totalValue: (updatedItem.quantity || 0) * (updatedItem.unit_cost || 0),
        location: updatedItem.storage_area || "Main Storage",
        notes: "",
        status: "pending",
      };

      // Add or update the count in the store
      addCount(countData);

      // Show a toast notification
      toast.success(`Updated count for ${updatedItem.name}`);
    },
    [addCount],
  );

  // Handle saving a new count
  const handleSaveCount = useCallback(
    (countData) => {
      addCount(countData);
      toast.success(`Count added for ${selectedItem?.name}`);
    },
    [addCount, selectedItem],
  );

  // Get counts for the current inventory
  const currentCounts = useMemo(
    () =>
      inventoryCounts.filter((count) => {
        // If we're filtering, only show counts for items that match the filter
        if (
          searchTerm ||
          filterByStorage ||
          filterByVendor ||
          filterByCategory ||
          filterBySubCategory
        ) {
          const matchingItem = inventoryItems.find(
            (item) => item.id === count.masterIngredientId,
          );
          if (!matchingItem) return false;

          // Apply the same filters as for the items
          const matchesSearch =
            !searchTerm ||
            matchingItem.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStorage =
            !filterByStorage || matchingItem.storage_area === filterByStorage;
          const matchesVendor =
            !filterByVendor || matchingItem.vendor === filterByVendor;
          const matchesCategory =
            !filterByCategory || matchingItem.category === filterByCategory;
          const matchesSubCategory =
            !filterBySubCategory ||
            matchingItem.sub_category === filterBySubCategory;

          return (
            matchesSearch &&
            matchesStorage &&
            matchesVendor &&
            matchesCategory &&
            matchesSubCategory
          );
        }

        return true;
      }),
    [
      inventoryCounts,
      searchTerm,
      filterByStorage,
      filterByVendor,
      filterByCategory,
      filterBySubCategory,
      inventoryItems,
    ],
  );

  // Count summary stats
  const countStats = useMemo(
    () => ({
      totalCounts: currentCounts.length,
      totalItems: new Set(currentCounts.map((c) => c.masterIngredientId)).size,
      pendingCounts: currentCounts.filter((c) => c.status === "pending").length,
      completedCounts: currentCounts.filter((c) => c.status === "completed")
        .length,
    }),
    [currentCounts],
  );

  const handleRefreshData = useCallback(() => {
    setBackgroundLoading(true);
    fetchCounts();
    fetchInventoryItems();
    setLastRefreshTime(new Date());
  }, [fetchCounts, fetchInventoryItems]);

  return (
    <div className="p-6 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col p-3 gap-4 mb-4 sticky top-0 rounded-lg z-10 bg-gray-900 shadow-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-3xl font-bold text-white">
                Kitchen Inventory
              </h1>
              {lastRefreshTime && (
                <div className="hidden md:block text-xs text-gray-400">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Mobile Header */}
            <div className="flex md:hidden items-center gap-2 mt-3">
              {/* Search Icon for Mobile */}
              <button
                onClick={() => {
                  // Toggle a mobile search input
                  const newValue = !showMobileSearch;
                  setShowMobileSearch(newValue);
                  // Focus the input when shown
                  if (newValue) {
                    setTimeout(() => {
                      const searchInput = document.getElementById(
                        "mobile-search-input",
                      );
                      if (searchInput) searchInput.focus();
                    }, 100);
                  }
                }}
                className={`p-2 rounded-lg ${searchTerm ? "bg-blue-500/30 text-blue-300" : "bg-gray-800/50 text-gray-400"}`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Filter Icons for Mobile - No Dropdowns */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`p-2 rounded-lg ${filterByStorage || filterByVendor || filterByCategory || filterBySubCategory ? "bg-amber-500/30 text-amber-300" : "bg-gray-800/50 text-gray-400"}`}
              >
                <Filter className="w-5 h-5" />
              </button>

              {/* Toggle Counts Panel Button */}
              <button
                onClick={() => setShowCountsPanel(!showCountsPanel)}
                className={`p-2 rounded-lg flex items-center gap-1.5 ${showCountsPanel ? "bg-primary-500/30 text-primary-300" : "bg-gray-800/50 text-gray-400"}`}
              >
                <Package className="w-5 h-5" />
                {currentCounts.length > 0 && (
                  <span className="text-white text-xs">
                    {currentCounts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center gap-3 w-auto">
              <div className="relative w-64">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="input pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                {/* Storage Location Filter */}
                <div className="relative">
                  <button
                    title="Storage Location"
                    className={`p-1.5 rounded-lg ${filterByStorage ? "bg-amber-500/30 text-amber-300 border border-amber-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
                  >
                    <MapPin className="w-5 h-5" />
                    {filterByStorage && (
                      <span className="text-xs">{filterByStorage}</span>
                    )}
                  </button>
                  <select
                    value={filterByStorage}
                    onChange={(e) => setFilterByStorage(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    aria-label="Select storage location"
                  >
                    <option value="">All Locations</option>
                    {storageLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendor Filter */}
                <div className="relative">
                  <button
                    title="Vendor"
                    className={`p-1.5 rounded-lg ${filterByVendor ? "bg-purple-500/30 text-purple-300 border border-purple-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
                  >
                    <Truck className="w-5 h-5" />
                    {filterByVendor && (
                      <span className="text-xs">{filterByVendor}</span>
                    )}
                  </button>
                  <select
                    value={filterByVendor}
                    onChange={(e) => setFilterByVendor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    aria-label="Select vendor"
                  >
                    <option value="">All Vendors</option>
                    {vendors.map((vendor) => (
                      <option key={vendor} value={vendor}>
                        {vendor}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <button
                    title="Category"
                    className={`p-1.5 rounded-lg ${filterByCategory ? "bg-blue-500/30 text-blue-300 border border-blue-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
                  >
                    <Apple className="w-5 h-5" />
                    {filterByCategory && (
                      <span className="text-xs">{filterByCategory}</span>
                    )}
                  </button>
                  <select
                    value={filterByCategory}
                    onChange={(e) => setFilterByCategory(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    aria-label="Select category"
                  >
                    <option value="">All Categories</option>
                    {categoryList.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category Filter */}
                <div className="relative">
                  <button
                    title="Sub Category"
                    className={`p-1.5 rounded-lg ${filterBySubCategory ? "bg-green-500/30 text-green-300 border border-green-500/50" : "bg-gray-800/50 text-gray-400 border border-gray-700"}`}
                  >
                    <Carrot className="w-5 h-5" />
                    {filterBySubCategory && (
                      <span className="text-xs">{filterBySubCategory}</span>
                    )}
                  </button>
                  <select
                    value={filterBySubCategory}
                    onChange={(e) => setFilterBySubCategory(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    aria-label="Select sub category"
                  >
                    <option value="">All Sub Categories</option>
                    {filteredSubCategoryList.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                {(filterByStorage ||
                  filterByVendor ||
                  filterByCategory ||
                  filterBySubCategory ||
                  searchTerm) && (
                  <button
                    onClick={() => {
                      setFilterByStorage("");
                      setFilterByVendor("");
                      setFilterByCategory("");
                      setFilterBySubCategory("");
                      setSearchTerm("");
                    }}
                    title="Clear All Filters"
                    className="p-1.5 rounded-lg bg-rose-500/30 text-rose-300 border border-rose-500/50"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Toggle Counts Panel Button */}
              <button
                onClick={() => setShowCountsPanel(!showCountsPanel)}
                className={`btn ${showCountsPanel ? "btn-primary" : "btn-outline-primary"}`}
              >
                {showCountsPanel ? "Hide Counts" : "Show Counts"}
                <span className="ml-2 text-white text-xs px-2 py-0.5 rounded-full bg-blue-600">
                  {currentCounts.length}
                </span>
              </button>

              {/* Stats Toggle Button - Desktop Only */}
              <button
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => setShowStats(!showStats)}
              >
                <Info className="w-5 h-5" />
                <span>{showStats ? "Hide" : "Show"} Stats</span>
              </button>
            </div>
          </div>

          {/* Mobile Search Input - Conditional */}
          {showMobileSearch && (
            <div className="md:hidden mt-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="mobile-search-input"
                  type="text"
                  placeholder="Search inventory..."
                  className="input pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Mobile Filters Panel - Conditional */}
          {showMobileFilters && (
            <div className="md:hidden card p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Storage Location
                  </label>
                  <select
                    className="input w-full"
                    value={filterByStorage}
                    onChange={(e) => setFilterByStorage(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {storageLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Vendor
                  </label>
                  <select
                    className="input w-full"
                    value={filterByVendor}
                    onChange={(e) => setFilterByVendor(e.target.value)}
                  >
                    <option value="">All Vendors</option>
                    {vendors.map((vendor) => (
                      <option key={vendor} value={vendor}>
                        {vendor}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Category
                  </label>
                  <select
                    className="input w-full"
                    value={filterByCategory}
                    onChange={(e) => setFilterByCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categoryList.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">
                    Sub Category
                  </label>
                  <select
                    className="input w-full"
                    value={filterBySubCategory}
                    onChange={(e) => setFilterBySubCategory(e.target.value)}
                  >
                    <option value="">All Sub Categories</option>
                    {filteredSubCategoryList.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-ghost-red w-full mt-2"
                  onClick={() => {
                    setFilterByStorage("");
                    setFilterByVendor("");
                    setFilterByCategory("");
                    setFilterBySubCategory("");
                    setSearchTerm("");
                    setShowMobileFilters(false);
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Desktop Advanced Filters Panel - Hidden on Mobile */}
          <div className="hidden md:block card p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-2">
                  Storage Location
                </label>
                <select
                  className="input w-full"
                  value={filterByStorage}
                  onChange={(e) => setFilterByStorage(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {storageLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-2">
                  Vendor
                </label>
                <select
                  className="input w-full"
                  value={filterByVendor}
                  onChange={(e) => setFilterByVendor(e.target.value)}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-2">
                  Category
                </label>
                <select
                  className="input w-full"
                  value={filterByCategory}
                  onChange={(e) => setFilterByCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categoryList.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-400 block mb-2">
                  Sub Category
                </label>
                <select
                  className="input w-full"
                  value={filterBySubCategory}
                  onChange={(e) => setFilterBySubCategory(e.target.value)}
                >
                  <option value="">All Sub Categories</option>
                  {filteredSubCategoryList.map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn-ghost-red"
                onClick={() => {
                  setFilterByStorage("");
                  setFilterByVendor("");
                  setFilterByCategory("");
                  setFilterBySubCategory("");
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Stats - Toggleable and Hidden on Mobile */}
        {showStats && (
          <div className="mb-6 card p-4 hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryStats.map(({ category, count, bg, text }) => (
                <StatCard
                  key={category}
                  icon={<Package className={`w-6 h-6 ${text}`} />}
                  title={category}
                  value={count}
                  bgColor={bg}
                  textColor={text}
                />
              ))}

              <StatCard
                icon={<PieChart className="w-6 h-6 text-amber-400" />}
                title="Total Value"
                value={`$${totalInventoryValue.toFixed(2)}`}
                bgColor="bg-amber-500/20"
                textColor="text-amber-400"
              />
            </div>
          </div>
        )}

        {/* Inventory Counts Panel */}
        {showCountsPanel && (
          <div className="mb-6 card p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-xl font-semibold text-white">
                Current Inventory Counts
              </h3>
              <div className="flex flex-wrap gap-2">
                <div className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                  Total: {countStats.totalCounts} counts
                </div>
                <div className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                  Items: {countStats.totalItems}
                </div>
                <div className="text-sm bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full">
                  Pending: {countStats.pendingCounts}
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2">
              {currentCounts.length > 0 ? (
                currentCounts.map((count) => (
                  <CountEntryItem
                    key={count.id}
                    count={count}
                    onUpdate={updateCount}
                    onDelete={deleteCount}
                    masterIngredients={inventoryItems}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>
                    No inventory counts found. Add counts by clicking the +
                    button on items.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <LoadingScreen
            progress={loadingProgress}
            total={totalItems}
            message="Loading inventory items..."
          />
        ) : (
          <div className="space-y-12">
            {/* Small, non-intrusive loading indicator */}
            {/* Show loading indicator for both background data fetching states */}
            {(backgroundLoading || isBackgroundLoading) &&
              inventoryItems.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-3 text-sm text-gray-400 flex items-center gap-2 z-20">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-500"></div>
                  <span>
                    {isBackgroundLoading
                      ? "Refreshing data..."
                      : `${inventoryItems.length} items loaded`}
                  </span>
                </div>
              )}

            {/* Last updated time for mobile */}
            {lastFetched && (
              <div className="md:hidden text-center text-xs text-gray-400 mb-4">
                Last updated: {new Date(lastFetched).toLocaleTimeString()}
              </div>
            )}

            {/* Last updated time moved to header */}

            {Object.entries(filteredCategories).map(
              ([majorCategory, categoryObj], majorIndex) => (
                <div key={majorCategory} className="mb-8">
                  <CategoryHeader
                    title={majorCategory}
                    colorIndex={majorIndex}
                  />

                  <div className="space-y-8">
                    {Object.entries(categoryObj).map(
                      ([category, subCategoryObj], categoryIndex) => (
                        <div key={category} className="mb-6">
                          <SubcategoryHeader
                            title={category}
                            colorIndex={categoryIndex}
                          />

                          <div className="space-y-6">
                            {Object.entries(subCategoryObj).map(
                              ([subCategory, items], subCategoryIndex) => (
                                <div key={subCategory} className="mb-4">
                                  <h4 className="text-md font-medium text-gray-300 mb-3">
                                    {subCategory}
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {items.map((item) => (
                                      <InventoryItemCard
                                        key={item.id}
                                        item={item}
                                        onAddCount={handleAddCount}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ),
            )}

            {Object.keys(filteredCategories).length === 0 && (
              <div className="card p-8 text-center">
                <h3 className="text-lg font-medium text-white mb-2">
                  {backgroundLoading
                    ? "Loading inventory items..."
                    : searchTerm ||
                        filterByStorage ||
                        filterByVendor ||
                        filterByCategory ||
                        filterBySubCategory
                      ? "No matching items found"
                      : "No inventory items available"}
                </h3>
                <p className="text-gray-400">
                  {backgroundLoading
                    ? "You can use the filters above while data loads"
                    : searchTerm ||
                        filterByStorage ||
                        filterByVendor ||
                        filterByCategory ||
                        filterBySubCategory
                      ? "Try adjusting your filter criteria"
                      : "Add items to your inventory to see them here"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Count Modal */}
      {showCountModal && selectedItem && (
        <AddCountModal
          item={selectedItem}
          onClose={() => setShowCountModal(false)}
          onSave={handleSaveCount}
        />
      )}
    </div>
  );
};
