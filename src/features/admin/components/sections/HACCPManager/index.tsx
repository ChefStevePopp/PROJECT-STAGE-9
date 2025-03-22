import React, { useState } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  Download,
  Plus,
  Search,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Upload,
} from "lucide-react";

const EmptyState = ({ title, description, icon: Icon }) => (
  <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md mb-6">{description}</p>
    <div className="flex gap-3">
      <button className="btn-primary">
        <Plus className="h-4 w-4 mr-2" />
        Add New Record
      </button>
      <button className="btn-ghost">
        <Upload className="h-4 w-4 mr-2" />
        Import Data
      </button>
    </div>
  </div>
);

const TemperatureCard = ({ title, temp, status, time, location }) => {
  const getStatusColor = () => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-100">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
          {status === "normal"
            ? "Normal"
            : status === "warning"
              ? "Warning"
              : "Critical"}
        </span>
      </div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-bold">{temp}</span>
        <span className="text-gray-400 text-sm">°F</span>
      </div>
      <div className="text-xs text-gray-400 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Last checked: {time}</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
};

const TemperatureLog = ({ title, description, icon: Icon }) => (
  <div className="card p-6">
    <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary-500" />
        </div>
        <h2 className="text-xl font-medium">{title}</h2>
      </div>
      <div className="flex gap-2">
        <button className="btn-ghost">
          <Download className="h-5 w-5 mr-2" />
        </button>
        <button className="btn-ghost">
          <Search className="h-5 w-5 mr-2" />
        </button>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </button>
      </div>
    </div>
    <p className="text-gray-400 mb-6">{description}</p>

    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Recent Readings</h3>
        <button className="text-sm text-primary-500 hover:text-primary-400 flex items-center gap-1">
          View All <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <TemperatureCard
          title="Walk-in Cooler #1"
          temp="38.2"
          status="normal"
          time="Today, 9:15 AM"
          location="Main Kitchen"
        />
        <TemperatureCard
          title="Prep Table Cooler"
          temp="42.7"
          status="warning"
          time="Today, 9:10 AM"
          location="Prep Area"
        />
        <TemperatureCard
          title="Beverage Cooler"
          temp="36.5"
          status="normal"
          time="Today, 9:05 AM"
          location="Bar Area"
        />
        <TemperatureCard
          title="Dessert Cooler"
          temp="39.1"
          status="normal"
          time="Today, 8:55 AM"
          location="Pastry Station"
        />
      </div>
    </div>

    <div className="expandable-info-section">
      <div className="flex items-center gap-2 text-amber-600 p-4">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Temperature Compliance Guidelines</span>
      </div>
      <ul className="text-sm text-gray-400 space-y-2 p-4 pt-0">
        <li className="flex items-start gap-2">
          <span className="text-green-500 font-bold">✓</span>
          <span>
            Refrigerators must maintain temperatures at or below 41°F (5°C)
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-500 font-bold">✓</span>
          <span>Check temperatures at least twice daily</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-500 font-bold">✓</span>
          <span>Document all temperature readings and corrective actions</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-green-500 font-bold">✓</span>
          <span>
            If temperature exceeds 41°F, take immediate corrective action
          </span>
        </li>
      </ul>
    </div>
  </div>
);

export const HACCPManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("fridges");

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/HACCPManager/index.tsx
      </div>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">HACCP Manager</h1>
          <p className="text-gray-400">
            Track and monitor food safety compliance
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Record
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("fridges")}
          className={`tab primary ${activeTab === "fridges" ? "active" : ""}`}
        >
          <Thermometer className="w-5 h-5" />
          Fridges
        </button>
        <button
          onClick={() => setActiveTab("freezers")}
          className={`tab green ${activeTab === "freezers" ? "active" : ""}`}
        >
          <ThermometerSnowflake className="w-5 h-5" />
          Freezers
        </button>
        <button
          onClick={() => setActiveTab("hot-holding")}
          className={`tab amber ${activeTab === "hot-holding" ? "active" : ""}`}
        >
          <ThermometerSun className="w-5 h-5" />
          Hot Holding
        </button>
        <button
          onClick={() => setActiveTab("cold-holding")}
          className={`tab rose ${activeTab === "cold-holding" ? "active" : ""}`}
        >
          <ThermometerSnowflake className="w-5 h-5" />
          Cold Holding
        </button>
        <button
          onClick={() => setActiveTab("diagrams")}
          className={`tab purple ${activeTab === "diagrams" ? "active" : ""}`}
        >
          <ClipboardCheck className="w-5 h-5" />
          Fridge Organization
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "fridges" && (
        <TemperatureLog
          title="Fridge Temperature Logs"
          description="Track and monitor fridge temperatures to ensure food safety compliance."
          icon={Thermometer}
        />
      )}

      {activeTab === "freezers" && (
        <TemperatureLog
          title="Freezer Temperature Logs"
          description="Track and monitor freezer temperatures to ensure food safety compliance."
          icon={ThermometerSnowflake}
        />
      )}

      {activeTab === "hot-holding" && (
        <div className="card p-6">
          <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <Thermometer className="h-5 w-5 text-primary-500" />
              </div>
              <h2 className="text-xl font-medium">Hot Holding Line Checks</h2>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost">
                <Download className="h-5 w-5 mr-2" />
              </button>
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </button>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Monitor hot holding temperatures to maintain food safety standards.
          </p>

          <EmptyState
            title="No Hot Holding Records Yet"
            description="Start tracking hot holding temperatures to ensure food safety compliance. Hot foods must be kept at 135°F (57°C) or above."
            icon={Thermometer}
          />
        </div>
      )}

      {activeTab === "cold-holding" && (
        <div className="card p-6">
          <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <ThermometerSnowflake className="h-5 w-5 text-primary-500" />
              </div>
              <h2 className="text-xl font-medium">Cold Holding Line Checks</h2>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost">
                <Download className="h-5 w-5 mr-2" />
              </button>
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </button>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Monitor cold holding temperatures to maintain food safety standards.
          </p>

          <EmptyState
            title="No Cold Holding Records Yet"
            description="Start tracking cold holding temperatures to ensure food safety compliance. Cold foods must be kept at 41°F (5°C) or below."
            icon={ThermometerSnowflake}
          />
        </div>
      )}

      {activeTab === "diagrams" && (
        <div className="card p-6">
          <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-primary-500" />
              </div>
              <h2 className="text-xl font-medium">
                Fridge Organization Diagrams
              </h2>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Diagram
              </button>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Create and manage visual diagrams for fridge organization.
          </p>

          <EmptyState
            title="No Organization Diagrams Yet"
            description="Create visual diagrams to standardize fridge organization and improve food safety by ensuring proper storage practices."
            icon={ClipboardCheck}
          />
        </div>
      )}
    </div>
  );
};

export default HACCPManager;
