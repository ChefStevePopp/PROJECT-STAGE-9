export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  points: number;
  specialties: string[];
  certifications: string[];
  schedule: {
    start: string;
    end: string;
  };
}

export interface TeamMemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wages: number[];
  punchId: string;
  locations: string[];
  departments: string[];
  roles: string[];
  avatar: string;
  lastUpdated: string;
}

export interface TeamStore {
  members: TeamMemberData[];
  isLoading: boolean;
  isImporting: boolean;
  importTeam: (data: any[]) => Promise<void>;
  clearTeam: () => void;
  saveTeam: () => Promise<void>;
  updateMember: (id: string, updates: Partial<TeamMemberData>) => void;
  deleteMember: (id: string) => void;
}