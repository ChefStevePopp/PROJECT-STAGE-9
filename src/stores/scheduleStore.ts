import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getShifts, testConnection, type Shift } from '../lib/7shifts';

interface ScheduleState {
  shifts: Shift[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  accessToken: string;
  companyId: string;
  locationId: string;
  syncSchedule: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  setCredentials: (credentials: { accessToken: string; companyId: string; locationId: string }) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      shifts: [],
      isLoading: false,
      error: null,
      lastSync: null,
      accessToken: '39373134666131382d653765382d343134362d613331612d613034356638616666373232',
      companyId: '7140',
      locationId: '11975',

      setCredentials: (credentials) => {
        set(credentials);
      },

      syncSchedule: async () => {
        const { accessToken, companyId, locationId } = get();
        set({ isLoading: true, error: null });
        
        try {
          const shifts = await getShifts({ accessToken, companyId, locationId });
          set({
            shifts,
            lastSync: new Date().toISOString(),
            error: null
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sync schedule';
          set({ error: errorMessage });
          console.error('Error syncing schedule:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      testConnection: async () => {
        const { accessToken, companyId, locationId } = get();
        try {
          return await testConnection({ accessToken, companyId, locationId });
        } catch (error) {
          console.error('Connection test failed:', error);
          return false;
        }
      }
    }),
    {
      name: 'schedule-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        companyId: state.companyId,
        locationId: state.locationId,
        lastSync: state.lastSync
      })
    }
  )
);