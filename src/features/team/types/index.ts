export interface TeamMember {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  kitchen_role?: string;
  station?: string;
  punch_id?: string;
  status: "active" | "inactive";
  start_date?: string;
  certifications?: string[];
  allergies?: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface TeamStore {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
  createTeamMember: (member: Omit<TeamMember, "id">) => Promise<void>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  importTeamMembers: (data: any[]) => Promise<void>;
}
