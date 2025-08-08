export interface Task {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  due_date: string;
  assignee_id?: string | null;
  default_station?: string;
  station?: string | null; // Deprecated: Use default_station instead - kept for backward compatibility
  kitchen_station_id?: string; // ID of the kitchen station this task is assigned to
  kitchen_station?: string | null; // Name of the kitchen station this task is assigned to
  priority: "low" | "medium" | "high";
  estimated_time: number; // in minutes
  actual_time?: number; // in minutes
  completed: boolean;
  completed_at?: string;
  completed_by?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  recipe_id?: string;
  notes?: string;
  tags?: string[];
  prep_list_template_id?: string; // Reference to a prep list template if this task is part of a prep list
  prep_list_id?: string; // Reference to a specific prep list instance
  sequence?: number; // Order in the prep list
  assignment_type?: "direct" | "lottery" | "station"; // Whether this task is directly assigned, available for lottery, or assigned to a station
  lottery?: boolean; // Whether this task is available for lottery
  requires_certification?: string[]; // List of certification IDs required to perform this task
  claimed_at?: string | null; // When the task was claimed in lottery mode
  claimed_by?: string | null; // Who claimed the task in lottery mode
  prep_system?: "par" | "as_needed" | "scheduled_production" | "hybrid"; // The prep system used for this task
  par_level?: number; // Target quantity for PAR-based tasks
  current_level?: number; // Current quantity for PAR-based tasks
  amount_required?: number; // Amount required to be prepared
  cases_required?: number; // Number of full cases required
  units_required?: number; // Number of individual units required (in addition to cases)
  permission_level?: "all" | "station" | "assigned"; // Who can view this task
  status?: "pending" | "in_progress" | "completed"; // Current status of the task
  template_id?: string; // Reference to the template this task was created from
  master_ingredient_id?: string; // Reference to a master ingredient
  master_ingredient_name?: string; // Name of the master ingredient
  case_size?: string; // Case size from master ingredient
  units_per_case?: string; // Units per case from master ingredient
  storage_area?: string; // Storage area from master ingredient
  unit_of_measure?: string; // Unit of measure from master ingredient
  prep_unit_measure?: string; // Unit of measure for prep tasks
  isLate?: boolean; // Whether this task is late
  daysLate?: number; // Number of days this task is late
  is_catering_event?: boolean; // Whether this task is a catering event
  auto_advance?: boolean; // Whether this task should automatically advance to the next day if not completed
  source?: "prep_list" | "catering" | "manual" | "production" | string; // Source of the task (prep list, catering event, manual entry, etc.)
  source_name?: string; // Name of the source (e.g., prep list name, catering event name)
  source_id?: string; // ID of the source (e.g., prep list ID, catering event ID)
  assigning_team_member_id?: string; // ID of the team member who assigned/created this task
}

export interface TaskStore {
  tasks: Task[];
  lotteryTasks: Task[]; // Tasks available for lottery assignment
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (
    task: Omit<Task, "id" | "organization_id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (id: string, assigneeId: string) => Promise<void>;
  assignToStation: (id: string, stationId: string) => Promise<void>;
  setTaskForLottery: (id: string) => Promise<void>;
  claimLotteryTask: (id: string, userId: string) => Promise<void>;
  completeTask: (id: string, completedBy: string) => Promise<void>;
}

export interface PrepListTemplate {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  category: "opening" | "closing" | "prep" | "production" | "custom";
  prep_system: "par" | "as_needed" | "scheduled_production" | "hybrid";
  station?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  tasks?: PrepListTemplateTask[];
  tags?: string[];
  par_levels?: Record<string, number>; // For PAR-based templates
  schedule_days?: number[]; // For As-Needed templates (days of week: 0-6)
  advance_days?: number; // For As-Needed templates (how many days in advance)
  recipe_id?: string; // Reference to an associated recipe
  prep_stage?: string; // Reference to a specific prep stage within the recipe
  master_ingredient_id?: string; // Reference to an associated master ingredient
  kitchen_role?: string; // Reference to a kitchen role
  kitchen_stations?: string[]; // Kitchen stations that have access to this template
  auto_advance?: boolean; // Whether tasks from this template should automatically advance to the next day if not completed
  estimated_time?: number; // Estimated time in minutes for the template
}

export interface PrepListTemplateTask {
  id: string;
  template_id: string;
  title: string;
  description?: string;
  sequence: number; // Order in the template
  estimated_time?: number; // in minutes
  station?: string;
  recipe_id?: string; // Optional reference to a recipe
  prep_item_id?: string; // Optional reference to a prepared item
  required: boolean; // Whether this task is required for completion
  created_at?: string;
  updated_at?: string;
  par_level?: number; // Target quantity for PAR-based tasks
  current_level?: number; // Current quantity for PAR-based tasks
  schedule_days?: number[]; // Specific days this task should appear (0-6)
  kitchen_station?: string; // Kitchen station this task is associated with
  team_member_role?: string; // Role required for this task (LINE, COLD PREP, etc.)
  assignee_id?: string; // Specific person assigned to this task
  measurement_type?: "par" | "2day" | "prep_item" | "task"; // Type of measurement for this task
  on_hand?: number; // Current quantity on hand (for 2day measurement)
  amount_required?: number; // Amount required (for 2day measurement)
  organization_id?: string; // Reference to the organization this task belongs to
  due_date?: string; // Due date for this task
  status?: string; // Status of the task (pending, in_progress, completed)
  auto_advance?: boolean; // Whether this task should automatically advance to the next day if not completed
  assigning_team_member_id?: string; // ID of the team member who assigned/created this task
}

export interface PrepList {
  id: string;
  organization_id: string;
  template_id?: string; // Legacy reference to the template this prep list is based on
  template_ids?: string[]; // Array of template IDs this prep list is based on
  title: string;
  description?: string;
  date: string;
  prep_system: "par" | "as_needed" | "scheduled_production" | "hybrid";
  status: "draft" | "active" | "completed" | "archived";
  assigned_to?: string; // User ID or station
  completed_at?: string;
  completed_by?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  tasks?: Task[]; // References to actual task instances
  notes?: string;
  inventory_snapshot?: Record<string, number>; // For PAR-based lists
  scheduled_for?: string; // Date this prep is scheduled for (might be different from creation date)
  viewer_team_members?: string[]; // Team members who can view this prep list
  kitchen_stations?: string[]; // Kitchen stations that have access to this prep list
}

export interface PrepListStore {
  templates: PrepListTemplate[];
  prepLists: PrepList[];
  isLoading: boolean;
  error: string | null;
  // Template operations
  fetchTemplates: () => Promise<void>;
  createTemplate: (
    template: Omit<
      PrepListTemplate,
      "id" | "organization_id" | "created_at" | "updated_at"
    >,
  ) => Promise<void>;
  updateTemplate: (
    id: string,
    updates: Partial<PrepListTemplate>,
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  // Template task operations
  addTaskToTemplate: (
    templateId: string,
    task: Omit<
      PrepListTemplateTask,
      "id" | "template_id" | "created_at" | "updated_at"
    >,
  ) => Promise<void>;
  updateTemplateTask: (
    taskId: string,
    updates: Partial<PrepListTemplateTask>,
  ) => Promise<void>;
  removeTaskFromTemplate: (taskId: string) => Promise<void>;
  reorderTemplateTasks: (
    templateId: string,
    taskIds: string[],
  ) => Promise<void>;
  // Prep list operations
  fetchPrepLists: (filters?: {
    date?: string;
    status?: PrepList["status"];
    assignedTo?: string;
  }) => Promise<void>;
  createPrepList: (
    prepList: Omit<
      PrepList,
      "id" | "organization_id" | "created_at" | "updated_at"
    >,
  ) => Promise<void>;
  updatePrepList: (id: string, updates: Partial<PrepList>) => Promise<void>;
  deletePrepList: (id: string) => Promise<void>;
  generatePrepListFromTemplate: (
    templateId: string,
    date: string,
    assignedTo?: string,
  ) => Promise<void>;
  completePrepList: (id: string, completedBy: string) => Promise<void>;
}
