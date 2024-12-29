import { create } from 'zustand';
import type { AdminStore, Stats, Activity, Alert } from '../types';

export const useAdminStore = create<AdminStore>((set) => ({
  stats: {
    activeStaff: 12,
    lowStockItems: 8,
    pendingTasks: 15,
    prepCompletion: 85,
  },
  activities: [
    {
      id: '1',
      type: 'recipe',
      message: 'New recipe added: Classic Beef Bourguignon',
      user: 'Sarah Chen',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'inventory',
      message: 'Updated stock levels for produce items',
      user: 'Michael Rodriguez',
      timestamp: new Date().toISOString(),
    },
  ],
  alerts: [
    {
      id: '1',
      type: 'critical',
      message: 'Critical low stock: Fresh herbs',
      details: 'Action required within 24 hours',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'warning',
      message: 'Equipment maintenance due',
      details: 'Scheduled maintenance for main grill',
      timestamp: new Date().toISOString(),
    },
  ],
  calendarFeedUrl: null,
  defaultRecipeImage: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=2000&q=80',
  
  setStats: (stats) => set({ stats }),
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities].slice(0, 50),
  })),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 20),
  })),
  setCalendarFeedUrl: (url) => set({ calendarFeedUrl: url }),
  setDefaultRecipeImage: (url) => set({ defaultRecipeImage: url })
}));