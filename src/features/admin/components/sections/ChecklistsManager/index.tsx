import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  Sunrise,
  ClipboardCheck,
  Sunset,
  CookingPot,
  ChefHat,
  CircleHelp,
  FileText,
  ListChecks,
  Utensils,
  Calendar,
  BarChart,
  Edit,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { usePrepListTemplateStore } from "../../../../../stores/prepListTemplateStore";
import PrepListTemplateForm from "./components/PrepListTemplateForm";
import OpeningChecklists from "./components/OpeningChecklists";
import ClosingChecklists from "./components/ClosingChecklists";
import SpecSheets from "./components/SpecSheets";
import PrepListBuilder from "./components/PrepListBuilder";

export const ChecklistsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("prep-templates");
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    string | undefined
  >(undefined);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const { templates, fetchTemplates, deleteTemplate, isLoading } =
    usePrepListTemplateStore();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateTemplate = () => {
    setSelectedTemplateId(undefined);
    setShowTemplateForm(true);
  };

  const handleEditTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setShowTemplateForm(true);
  };

  const handleCloseForm = () => {
    setShowTemplateForm(false);
    setSelectedTemplateId(undefined);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "prep":
        return "bg-blue-500/20 text-blue-400";
      case "production":
        return "bg-green-500/20 text-green-400";
      case "opening":
        return "bg-amber-500/20 text-amber-400";
      case "closing":
        return "bg-rose-500/20 text-rose-400";
      default:
        return "bg-purple-500/20 text-purple-400";
    }
  };

  const getPrepSystemIcon = (prepSystem: string) => {
    switch (prepSystem) {
      case "par":
        return <BarChart className="h-4 w-4" />;
      case "as_needed":
        return <Calendar className="h-4 w-4" />;
      case "hybrid":
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <style jsx>{`
        /* Expandable info section */
        .expandable-info-section {
          @apply bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700 w-[98%];
        }

        .expandable-info-header {
          @apply w-full p-4 flex items-center justify-between text-left focus:outline-none hover:bg-gray-800/40 transition-colors duration-200;
        }

        .expandable-info-content {
          @apply px-4 pb-4 pt-0 ml-8 w-full;
        }
      `}</style>
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/ChecklistsManager/index.tsx
      </div>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Checklists & Spec Sheets
          </h1>
          <p className="text-gray-400">
            Create and manage operational checklists and specifications
          </p>
        </div>
      </header>
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("opening")}
          className={`tab primary ${activeTab === "opening" ? "active" : ""}`}
        >
          <Sunrise className="w-5 h-5" />
          Opening Checklists
        </button>
        <button
          onClick={() => setActiveTab("closing")}
          className={`tab green ${activeTab === "closing" ? "active" : ""}`}
        >
          <Sunset className="w-5 h-5" />
          Closing Checklists
        </button>
        <button
          onClick={() => setActiveTab("spec-sheets")}
          className={`tab amber ${activeTab === "spec-sheets" ? "active" : ""}`}
        >
          <FileText className="w-5 h-5" />
          Spec Sheets
        </button>
        <button
          onClick={() => setActiveTab("list-builder")}
          className={`tab rose ${activeTab === "list-builder" ? "active" : ""}`}
        >
          <ListChecks className="w-5 h-5" />
          Prep List Builder
        </button>
        <button
          onClick={() => setActiveTab("prep-templates")}
          className={`tab purple ${activeTab === "prep-templates" ? "active" : ""}`}
        >
          <Utensils className="w-5 h-5" />
          List Modules
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "opening" && <OpeningChecklists />}
      {activeTab === "closing" && <ClosingChecklists />}
      {activeTab === "spec-sheets" && <SpecSheets />}
      {activeTab === "list-builder" && (
        <PrepListBuilder defaultShowCreationTool={false} />
      )}
      {activeTab === "prep-templates" && (
        <div className="card p-6">
          {showTemplateForm ? (
            <PrepListTemplateForm
              templateId={selectedTemplateId}
              onClose={handleCloseForm}
            />
          ) : (
            <>
              <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      List Modules
                    </h2>
                    <p className="text-gray-400">
                      Create and manage list modules for building daily prep
                      lists. Add list items in the Prep List Builder tab.
                    </p>
                  </div>
                </div>
                <button className="btn-primary" onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Module
                </button>
              </div>

              {/* Expandable Info Section */}
              <div className="expandable-info-section mb-6">
                <button
                  className="expandable-info-header"
                  onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                >
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-amber-400 mr-2" />
                    <h3 className="text-xl font-medium text-white">
                      What is a List Module?
                    </h3>
                  </div>
                  <div className="ml-auto">
                    {isInfoExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400 transform transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400 transform transition-transform duration-200" />
                    )}
                  </div>
                </button>
                {isInfoExpanded && (
                  <div className="expandable-info-content">
                    <p className="text-gray-400 mb-6">
                      A list module equates to a single line of a hand-written
                      prep list or check list. By making your lists modular, you
                      create your lists on the fly like your would
                      traditionally, but with the efficiency of drag and drop.
                      The best part, no writing the prep list from scratch each
                      time! Modules can include both free-standing list items
                      and items linked to recipes or prep items.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-white mb-3">
                          Features
                        </h4>
                        <ul className="space-y-2 text-gray-400">
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                            Create modules for different stations and shifts
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                            Link list items to recipes and prep items
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                            Set item sequence and estimated times
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                            Support for SCHEDULE by DAY prep systems
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                            Support for PAR-based inventory prep systems
                          </li>
                          <li className="flex items-start">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                            Support for As-Needed prep systems
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium text-white mb-3">
                          Module Categories
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <ChefHat className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-gray-400">
                              Prep - Daily preparation tasks
                            </span>
                          </div>
                          <div className="flex items-center">
                            <CookingPot className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-gray-400">
                              Production - Service preparation
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Sunrise className="h-4 w-4 text-amber-500 mr-2" />
                            <span className="text-gray-400">
                              Opening - Start of day procedures
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Sunset className="h-4 w-4 text-rose-500 mr-2" />
                            <span className="text-gray-400">
                              Closing - End of day procedures
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <div
                        key={template.id}
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                        onClick={() => handleEditTemplate(template.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-medium text-white">
                            {template.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeClass(template.category)}`}
                          >
                            {template.category.charAt(0).toUpperCase() +
                              template.category.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">
                          {template.description || `${template.title} module`}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            {getPrepSystemIcon(template.prep_system)}
                            {template.prep_system === "par"
                              ? "PAR-based"
                              : template.prep_system === "as_needed"
                                ? "As-Needed"
                                : template.prep_system ===
                                    "scheduled_production"
                                  ? "Scheduled Production"
                                  : "Hybrid"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {template.tasks
                              ? `${template.tasks.length} items`
                              : "0 items"}
                          </span>
                          {template.station && (
                            <span className="text-xs text-gray-500">
                              Station: {template.station}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-700">
                          <button
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTemplate(template.id);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const duplicatedTemplate = {
                                ...template,
                                id: undefined,
                                title: `${template.title} (Copy)`,
                                created_at: undefined,
                                updated_at: undefined,
                              };
                              setSelectedTemplateId(undefined);
                              setShowTemplateForm(true);
                              // Pass the duplicated template data to the form
                              usePrepListTemplateStore.setState({
                                currentTemplate: duplicatedTemplate,
                              });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "Are you sure you want to delete this module?",
                                )
                              ) {
                                deleteTemplate(template.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 bg-gray-800/50 p-8 rounded-lg border border-dashed border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <Utensils className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400 mb-2">
                          No list modules found
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          Create your first module to get started
                        </p>
                        <button
                          className="btn-primary"
                          onClick={handleCreateTemplate}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Module
                        </button>
                      </div>
                    </div>
                  )}

                  {templates.length > 0 && (
                    <div
                      className="bg-gray-800/50 p-4 rounded-lg border border-dashed border-gray-700 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-center"
                      onClick={handleCreateTemplate}
                    >
                      <div className="text-center">
                        <Plus className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-500">Create New Module</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChecklistsManager;
