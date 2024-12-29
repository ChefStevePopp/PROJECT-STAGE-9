import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { OperationsSettings } from '@/types/operations';
import toast from 'react-hot-toast';

interface OperationsStore {
  settings: OperationsSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<OperationsSettings>) => Promise<void>;
}

export const useOperationsStore = create<OperationsStore>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('operations_settings')
        .select('*')
        .eq('organization_id', user.user_metadata.organizationId)
        .single();

      if (error) throw error;
      set({ settings: data, error: null });
    } catch (error) {
      console.error('Error fetching operations settings:', error);
      set({ error: 'Failed to load operations settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('operations_settings')
        .upsert({
          organization_id: user.user_metadata.organizationId,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id'
        });

      if (error) throw error;
      
      set(state => ({
        settings: state.settings ? {
          ...state.settings,
          ...updates
        } : updates as OperationsSettings
      }));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving operations settings:', error);
      toast.error('Failed to save settings');
    }
  }
}));