import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Save,
  X,
  Check,
  RefreshCw,
  Download,
  Trash2,
} from "lucide-react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { ColumnMapping } from "@/types/csv-mappings";
import { useCSVMappingsStore } from "@/stores/csvMappingsStore";
import { supabase } from "@/lib/supabase";

interface CSVConfigurationProps {
  onSaveMapping: (mapping: ColumnMapping) => void;
  onClose: () => void;
  csvFile?: File | null;
  savedMappings?: ColumnMapping[];
  organizationId?: string;
}

export const CSVConfiguration: React.FC<CSVConfigurationProps> = ({
  onSaveMapping,
  onClose,
  csvFile,
  savedMappings = [],
  organizationId,
}) => {
  // Get the current user and organization
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orgId, setOrgId] = useState<string>("");

  // CSV Mappings store
  const { mappings, loading, fetchMappings, saveMapping, deleteMapping } =
    useCSVMappingsStore();

  // Fetch current user and organization
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);

      if (organizationId) {
        setOrgId(organizationId);
      } else if (data.user) {
        // Get the user's organization if not provided
        const { data: orgData } = await supabase
          .from("organization_roles")
          .select("organization_id")
          .eq("user_id", data.user.id)
          .single();

        if (orgData) {
          setOrgId(orgData.organization_id);
        }
      }
    };

    getUser();
  }, [organizationId]);

  // Fetch saved mappings when organization ID is available
  useEffect(() => {
    if (orgId) {
      fetchMappings(orgId, "schedule");
    }
  }, [orgId, fetchMappings]);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [formatType, setFormatType] = useState<
    "standard" | "weekly" | "custom"
  >("standard");
  const [mappingName, setMappingName] = useState("");
  const [selectedMapping, setSelectedMapping] = useState<ColumnMapping | null>(
    null,
  );
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({
    id: crypto.randomUUID(),
    name: "",
    format: "standard",
    employeeNameField: "",
    roleField: "",
    dateField: "",
    startTimeField: "",
    endTimeField: "",
    breakDurationField: "",
    notesField: "",
  });

  // Parse CSV file when it changes
  useEffect(() => {
    if (!csvFile) return;

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      preview: 5, // Just get a few rows for preview
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error("Error parsing CSV:", results.errors);
          toast.error("Error parsing CSV file");
          return;
        }

        setPreviewData(results.data);
        if (results.data.length > 0) {
          setHeaders(Object.keys(results.data[0]));

          // Try to auto-detect format
          const headerSet = new Set(Object.keys(results.data[0]));
          const hasWeekdays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].some((day) => headerSet.has(day));

          if (hasWeekdays) {
            setFormatType("weekly");
            // Auto-map weekday fields
            const newMapping: Partial<ColumnMapping> = {
              ...mapping,
              format: "weekly",
            };

            [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].forEach((day) => {
              if (headerSet.has(day)) {
                const fieldName = (day.toLowerCase() +
                  "Field") as keyof ColumnMapping;
                newMapping[fieldName] = day;
              }
            });

            // Try to find employee name field
            if (headerSet.has("Name")) {
              newMapping.employeeNameField = "Name";
            } else if (headerSet.has("Employee")) {
              newMapping.employeeNameField = "Employee";
            } else if (headerSet.has("Employee Name")) {
              newMapping.employeeNameField = "Employee Name";
            }

            setMapping(newMapping);
          } else {
            // Check for standard format
            const hasStandardFields =
              [
                headerSet.has("date") || headerSet.has("Date"),
                headerSet.has("start_time") ||
                  headerSet.has("Start Time") ||
                  headerSet.has("Start"),
                headerSet.has("end_time") ||
                  headerSet.has("End Time") ||
                  headerSet.has("End"),
              ].filter(Boolean).length >= 2;

            if (hasStandardFields) {
              setFormatType("standard");
              // Auto-map standard fields
              const newMapping: Partial<ColumnMapping> = {
                ...mapping,
                format: "standard",
              };

              // Map date field
              if (headerSet.has("Date")) newMapping.dateField = "Date";
              else if (headerSet.has("date")) newMapping.dateField = "date";
              else if (headerSet.has("Shift Date"))
                newMapping.dateField = "Shift Date";

              // Map start time field
              if (headerSet.has("Start Time"))
                newMapping.startTimeField = "Start Time";
              else if (headerSet.has("start_time"))
                newMapping.startTimeField = "start_time";
              else if (headerSet.has("Start"))
                newMapping.startTimeField = "Start";

              // Map end time field
              if (headerSet.has("End Time"))
                newMapping.endTimeField = "End Time";
              else if (headerSet.has("end_time"))
                newMapping.endTimeField = "end_time";
              else if (headerSet.has("End")) newMapping.endTimeField = "End";

              // Try to find employee name field
              if (headerSet.has("Name")) {
                newMapping.employeeNameField = "Name";
              } else if (headerSet.has("Employee")) {
                newMapping.employeeNameField = "Employee";
              } else if (headerSet.has("Employee Name")) {
                newMapping.employeeNameField = "Employee Name";
              }

              // Try to find role field
              if (headerSet.has("Role")) {
                newMapping.roleField = "Role";
              } else if (headerSet.has("Position")) {
                newMapping.roleField = "Position";
              } else if (headerSet.has("Job")) {
                newMapping.roleField = "Job";
              }

              setMapping(newMapping);
            } else {
              // Default to custom if we can't detect
              setFormatType("custom");
            }
          }
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse CSV file");
      },
    });
  }, [csvFile]);

  // Update mapping when format type changes
  useEffect(() => {
    setMapping((prev) => ({
      ...prev,
      format: formatType,
    }));
  }, [formatType]);

  // Update mapping when selected mapping changes
  useEffect(() => {
    if (selectedMapping) {
      setMapping(selectedMapping);
      setFormatType(selectedMapping.format);
      setMappingName(selectedMapping.name);
    }
  }, [selectedMapping]);

  const handleSaveMapping = async () => {
    if (!mappingName.trim()) {
      toast.error("Please enter a name for this mapping");
      return;
    }

    // Validate required fields based on format
    if (formatType === "standard") {
      if (
        !mapping.employeeNameField ||
        !mapping.dateField ||
        !mapping.startTimeField ||
        !mapping.endTimeField
      ) {
        toast.error("Please map all required fields");
        return;
      }
    } else if (formatType === "weekly") {
      if (!mapping.employeeNameField) {
        toast.error("Please map the employee name field");
        return;
      }

      // Check if at least one day is mapped
      const hasDayMapping = [
        mapping.mondayField,
        mapping.tuesdayField,
        mapping.wednesdayField,
        mapping.thursdayField,
        mapping.fridayField,
        mapping.saturdayField,
        mapping.sundayField,
      ].some(Boolean);

      if (!hasDayMapping) {
        toast.error("Please map at least one day of the week");
        return;
      }
    }

    const finalMapping: ColumnMapping = {
      ...(mapping as ColumnMapping),
      name: mappingName,
    };

    // Save to database if organization ID is available
    if (orgId) {
      const success = await saveMapping(orgId, "schedule", null, finalMapping);
      if (success) {
        toast.success("Mapping saved to database");
      }
    }

    // Also call the original onSaveMapping for backward compatibility
    onSaveMapping(finalMapping);
  };

  // Handle deleting a mapping
  const handleDeleteMapping = async (mappingId: string) => {
    if (confirm("Are you sure you want to delete this mapping?")) {
      await deleteMapping(mappingId);
    }
  };

  // Helper to determine if a field should be shown based on format
  const shouldShowField = (field: keyof ColumnMapping): boolean => {
    if (field === "employeeNameField") return true; // Always show employee name field
    if (field === "roleField") return formatType !== "weekly";

    // Standard format fields
    if (
      [
        "dateField",
        "startTimeField",
        "endTimeField",
        "breakDurationField",
        "notesField",
      ].includes(field)
    ) {
      return formatType === "standard" || formatType === "custom";
    }

    // Weekly format fields
    if (
      [
        "mondayField",
        "tuesdayField",
        "wednesdayField",
        "thursdayField",
        "fridayField",
        "saturdayField",
        "sundayField",
      ].includes(field)
    ) {
      return formatType === "weekly" || formatType === "custom";
    }

    return false;
  };

  const renderFieldSelector = (
    label: string,
    field: keyof ColumnMapping,
    required = false,
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        className="input w-full"
        value={(mapping[field] as string) || ""}
        onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
      >
        <option value="">-- Select Field --</option>
        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">CSV Configuration</h3>
          <p className="text-sm text-gray-400">
            Map your CSV columns to the required fields
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button onClick={handleSaveMapping} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Mapping
          </button>
        </div>
      </div>

      {/* CSV Preview */}
      {previewData && previewData.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="text-white font-medium mb-2">CSV Preview</h4>
          <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-400"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {previewData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-700/30">
                    {headers.map((header) => (
                      <td
                        key={`${index}-${header}`}
                        className="px-4 py-2 text-sm text-gray-300"
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mapping Configuration */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Mapping Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Mapping Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="e.g., 7shifts Export, Weekly Schedule"
              value={mappingName}
              onChange={(e) => setMappingName(e.target.value)}
            />
          </div>

          {/* Format Type */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Format Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formatType"
                  value="standard"
                  checked={formatType === "standard"}
                  onChange={() => setFormatType("standard")}
                  className="mr-2"
                />
                <span className="text-gray-300">Standard</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formatType"
                  value="weekly"
                  checked={formatType === "weekly"}
                  onChange={() => setFormatType("weekly")}
                  className="mr-2"
                />
                <span className="text-gray-300">Weekly</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="formatType"
                  value="custom"
                  checked={formatType === "custom"}
                  onChange={() => setFormatType("custom")}
                  className="mr-2"
                />
                <span className="text-gray-300">Custom</span>
              </label>
            </div>
          </div>
        </div>

        {/* Saved Mappings */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Load Saved Mapping
          </label>
          <div className="flex gap-2 flex-wrap">
            {loading ? (
              <div className="text-gray-400">Loading saved mappings...</div>
            ) : mappings && mappings.length > 0 ? (
              mappings.map((savedMapping) => {
                const mapping =
                  savedMapping.column_mapping as unknown as ColumnMapping;
                return (
                  <div key={savedMapping.id} className="flex items-center">
                    <button
                      onClick={() => setSelectedMapping(mapping)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${selectedMapping?.id === mapping.id ? "bg-primary-500/20 text-primary-400 border border-primary-500/50" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                    >
                      {mapping.name}
                    </button>
                    <button
                      onClick={() => handleDeleteMapping(savedMapping.id)}
                      className="ml-1 p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700"
                      title="Delete mapping"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            ) : savedMappings.length > 0 ? (
              // Fallback to prop-based mappings if no database mappings
              savedMappings.map((savedMapping) => (
                <button
                  key={savedMapping.id}
                  onClick={() => setSelectedMapping(savedMapping)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${selectedMapping?.id === savedMapping.id ? "bg-primary-500/20 text-primary-400 border border-primary-500/50" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                >
                  {savedMapping.name}
                </button>
              ))
            ) : (
              <div className="text-gray-400">No saved mappings found</div>
            )}
          </div>
        </div>

        {/* Field Mapping */}
        <div className="space-y-6">
          <h4 className="text-white font-medium">Field Mapping</h4>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderFieldSelector("Employee Name", "employeeNameField", true)}
            {formatType !== "weekly" &&
              renderFieldSelector("Role/Position", "roleField")}
          </div>

          {/* Format-specific fields */}
          {formatType === "standard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderFieldSelector("Date", "dateField", true)}
              {renderFieldSelector("Start Time", "startTimeField", true)}
              {renderFieldSelector("End Time", "endTimeField", true)}
              {renderFieldSelector("Break Duration", "breakDurationField")}
              {renderFieldSelector("Notes", "notesField")}
            </div>
          )}

          {formatType === "weekly" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {renderFieldSelector("Monday", "mondayField")}
                {renderFieldSelector("Tuesday", "tuesdayField")}
                {renderFieldSelector("Wednesday", "wednesdayField")}
                {renderFieldSelector("Thursday", "thursdayField")}
                {renderFieldSelector("Friday", "fridayField")}
                {renderFieldSelector("Saturday", "saturdayField")}
                {renderFieldSelector("Sunday", "sundayField")}
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 flex items-start gap-3">
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-blue-400 mb-1">
                    Weekly Format Information
                  </p>
                  <p className="mb-2">
                    For weekly format, we expect each day column to contain
                    shift information in a format like:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400 ml-2">
                    <li>
                      "10am - 6pm (COLD PREP)" - Time range with role in
                      parentheses
                    </li>
                    <li>"Off" or empty cell - No shift scheduled</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {formatType === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFieldSelector("Date", "dateField")}
              {renderFieldSelector("Start Time", "startTimeField")}
              {renderFieldSelector("End Time", "endTimeField")}
              {renderFieldSelector("Role/Position", "roleField")}
              {renderFieldSelector("Break Duration", "breakDurationField")}
              {renderFieldSelector("Notes", "notesField")}
              {/* Weekly fields */}
              {renderFieldSelector("Monday", "mondayField")}
              {renderFieldSelector("Tuesday", "tuesdayField")}
              {renderFieldSelector("Wednesday", "wednesdayField")}
              {renderFieldSelector("Thursday", "thursdayField")}
              {renderFieldSelector("Friday", "fridayField")}
              {renderFieldSelector("Saturday", "saturdayField")}
              {renderFieldSelector("Sunday", "sundayField")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
