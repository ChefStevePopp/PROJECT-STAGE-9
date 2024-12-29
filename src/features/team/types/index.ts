export interface TeamMemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  punchId: string;
  avatar: string;
  departments: string[];
  roles: string[];
  locations: string[];
  kitchenRole?: string;
  lastUpdated?: string;
}

export interface TeamStore {
  members: TeamMemberData[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
  importTeam: (data: any[]) => Promise<void>;
  clearTeam: () => Promise<void>;
  saveTeam: () => Promise<void>;
  updateMember: (id: string, updates: Partial<TeamMemberData>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}