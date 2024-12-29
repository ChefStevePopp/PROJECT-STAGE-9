export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'recipe-update' | 'inventory-alert' | string;
  attachments?: string[];
}