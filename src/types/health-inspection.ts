export interface HealthCertificate {
  number?: string;
  expiryDate?: string;
  imageUrl?: string;
  lastUpdated?: string;
}

export interface InspectionDocument {
  id: string;
  type: 'image' | 'pdf';
  url: string;
  name: string;
}

export interface ActionItem {
  id: string;
  description: string;
  deadline: string;
  completed: boolean;
  severity: 'critical' | 'major' | 'minor';
}

export interface InspectionVisit {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  inspectorName: string;
  notes: string;
  documents: InspectionDocument[];
  actionItems: ActionItem[];
}

export interface HealthInspectionNotification {
  id: string;
  type: 'action_item' | 'deadline' | 'visit' | 'certificate';
  title: string;
  message: string;
  severity?: 'critical' | 'major' | 'minor';
  deadline?: string;
  readBy: string[];
  createdAt: string;
}