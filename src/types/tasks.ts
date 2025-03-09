export interface Task {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  due_date: string;
  assignee_id?: string;
  station?: string;
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
}

export interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (
    task: Omit<Task, "id" | "organization_id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (id: string, assigneeId: string) => Promise<void>;
  completeTask: (id: string, completedBy: string) => Promise<void>;
}
