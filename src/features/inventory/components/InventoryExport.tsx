import React from "react";
import { Printer, FileDown, BookDown } from "lucide-react";
import { InventoryItem } from "../types";
import { InventoryCount } from "../../../types/inventory";

interface InventoryExportProps {
  inventoryItems: InventoryItem[];
  currentCounts: InventoryCount[];
  filterByCategory?: string;
  filterBySubCategory?: string;
  filterByStorage?: string;
  filterByVendor?: string;
  searchTerm?: string;
}

export const InventoryExport: React.FC<InventoryExportProps> = ({
  inventoryItems,
  currentCounts,
  filterByCategory,
  filterBySubCategory,
  filterByStorage,
  filterByVendor,
  searchTerm,
}) => {
  // Print inventory form
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Filter items based on current filters
    const filteredItems = inventoryItems.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStorage =
        !filterByStorage || item.storage_area === filterByStorage;
      const matchesVendor = !filterByVendor || item.vendor === filterByVendor;
      const matchesCategory =
        !filterByCategory || item.category === filterByCategory;
      const matchesSubCategory =
        !filterBySubCategory || item.sub_category === filterBySubCategory;

      return (
        matchesSearch &&
        matchesStorage &&
        matchesVendor &&
        matchesCategory &&
        matchesSubCategory
      );
    });

    // Group items by category and subcategory for the print view
    const groupedItems = filteredItems.reduce(
      (acc, item) => {
        const category = item.category || "Uncategorized";
        const subCategory = item.sub_category || "General";

        if (!acc[category]) {
          acc[category] = {};
        }

        if (!acc[category][subCategory]) {
          acc[category][subCategory] = [];
        }

        acc[category][subCategory].push(item);
        return acc;
      },
      {} as Record<string, Record<string, InventoryItem[]>>,
    );

    // Generate HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Count Sheet</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .date-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .date-box {
              border: 1px solid #000;
              padding: 10px;
              width: 200px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .category-header {
              font-size: 18px;
              font-weight: bold;
              margin-top: 20px;
              margin-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            .subcategory-header {
              font-size: 16px;
              font-weight: bold;
              margin-top: 15px;
              margin-bottom: 5px;
            }
            .count-column {
              width: 100px;
            }
            .notes-column {
              width: 200px;
            }
            @media print {
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <h1>Inventory Count Sheet</h1>
          <div class="date-section">
            <div>
              <strong>Count Date:</strong>
              <div class="date-box">${new Date().toLocaleDateString()}</div>
            </div>
            <div>
              <strong>Counted By:</strong>
              <div class="date-box"></div>
            </div>
          </div>
          ${Object.entries(groupedItems)
            .map(
              ([category, subCategories]) => `
              <div class="category-header">${category}</div>
              ${Object.entries(subCategories)
                .map(
                  ([subCategory, items]) => `
                  <div class="subcategory-header">${subCategory}</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Unit</th>
                        <th>Storage Location</th>
                        <th class="count-column">Count</th>
                        <th class="notes-column">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items
                        .map(
                          (item) => `
                        <tr>
                          <td>${item.name}</td>
                          <td>${item.unit || ""}</td>
                          <td>${item.storage_area || ""}</td>
                          <td></td>
                          <td></td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                `,
                )
                .join("")}
            `,
            )
            .join("")}
        </body>
      </html>
    `;

    // Write the content to the new window and print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Export blank inventory template
  const handleExportBlank = () => {
    // This will be implemented in the next phase
    console.log("Export blank inventory template");
  };

  // Export inventory with current counts
  const handleExportWithCounts = () => {
    // Filter items based on current filters
    const filteredItems = inventoryItems.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStorage =
        !filterByStorage || item.storage_area === filterByStorage;
      const matchesVendor = !filterByVendor || item.vendor === filterByVendor;
      const matchesCategory =
        !filterByCategory || item.category === filterByCategory;
      const matchesSubCategory =
        !filterBySubCategory || item.sub_category === filterBySubCategory;

      return (
        matchesSearch &&
        matchesStorage &&
        matchesVendor &&
        matchesCategory &&
        matchesSubCategory
      );
    });

    // Create a map of item_id to count for quick lookup
    const countMap = new Map();
    currentCounts.forEach((count) => {
      countMap.set(count.item_id, count);
    });

    // Create worksheet data
    const worksheetData = filteredItems.map((item) => {
      const count = countMap.get(item.id);
      return {
        Item: item.name,
        Unit: item.unit || "",
        "Storage Location": item.storage_area || "",
        Category: item.category || "Uncategorized",
        "Sub-Category": item.sub_category || "General",
        Count: count ? count.quantity : "",
        Notes: count ? count.notes || "" : "",
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Count");

    // Generate filename in snake_case
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const fileName = `inventory_count_with_data_${dateStr}.xlsx`;

    // Export to file
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePrint}
        className="flex items-center gap-1 p-1.5 rounded-lg bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800/50 hover:border hover:border-gray-300/40 transition-colors"
        title="Print Inventory Form"
      >
        <Printer className="w-5 h-5" />
      </button>

      <button
        onClick={handleExportBlank}
        className="flex items-center gap-1 p-1.5 rounded-lg bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800/50 hover:border hover:border-gray-300/40 transition-colors"
        title="Export Blank Inventory"
      >
        <FileDown className="w-5 h-5" />
      </button>

      <button
        onClick={handleExportWithCounts}
        className="flex items-center gap-1 p-1.5 rounded-lg bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800/50 hover:border hover:border-gray-300/40 transition-colors"
        title="Export Inventory with Current Counts"
      >
        <BookDown className="w-5 h-5" />
      </button>
    </div>
  );
};
