import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { 
  HealthCertificate, 
  InspectionVisit, 
  HealthInspectionNotification 
} from '@/types/health-inspection';
import toast from 'react-hot-toast';

interface HealthInspectionStore {
  certificate: HealthCertificate | null;
  visits: InspectionVisit[];
  notifications: HealthInspectionNotification[];
  isLoading: boolean;
  error: string | null;
  
  fetchInspectionData: (organizationId: string) => Promise<void>;
  updateCertificate: (organizationId: string, certificate: HealthCertificate) => Promise<void>;
  addVisit: (organizationId: string, visit: Omit<InspectionVisit, 'id'>) => Promise<void>;
  updateVisit: (organizationId: string, visitId: string, updates: Partial<InspectionVisit>) => Promise<void>;
  deleteVisit: (organizationId: string, visitId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
}

export const useHealthInspectionStore = create<HealthInspectionStore>((set, get) => ({
  certificate: null,
  visits: [],
  notifications: [],
  isLoading: false,
  error: null,

  fetchInspectionData: async (organizationId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: inspections, error: inspectionsError } = await supabase
        .from('health_inspections')
        .select('*')
        .eq('organization_id', organizationId)
        .order('visit_date', { ascending: false });

      if (inspectionsError) throw inspectionsError;

      const { data: notifications, error: notificationsError } = await supabase
        .from('health_inspection_notifications')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      set({
        visits: inspections || [],
        notifications: notifications || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching health inspection data:', error);
      set({ error: 'Failed to load health inspection data', isLoading: false });
    }
  },

  updateCertificate: async (organizationId, certificate) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          settings: {
            health_certificate: certificate
          }
        })
        .eq('id', organizationId);

      if (error) throw error;
      set({ certificate });
      toast.success('Certificate updated successfully');
    } catch (error) {
      console.error('Error updating certificate:', error);
      toast.error('Failed to update certificate');
    }
  },

  addVisit: async (organizationId, visit) => {
    try {
      const { data, error } = await supabase
        .from('health_inspections')
        .insert([{
          organization_id: organizationId,
          ...visit
        }])
        .select()
        .single();

      if (error) throw error;
      
      set(state => ({
        visits: [...state.visits, data]
      }));
      
      toast.success('Inspection visit added successfully');
    } catch (error) {
      console.error('Error adding visit:', error);
      toast.error('Failed to add inspection visit');
    }
  },

  updateVisit: async (organizationId, visitId, updates) => {
    try {
      const { error } = await supabase
        .from('health_inspections')
        .update(updates)
        .eq('id', visitId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      set(state => ({
        visits: state.visits.map(visit =>
          visit.id === visitId ? { ...visit, ...updates } : visit
        )
      }));

      toast.success('Inspection visit updated successfully');
    } catch (error) {
      console.error('Error updating visit:', error);
      toast.error('Failed to update inspection visit');
    }
  },

  deleteVisit: async (organizationId, visitId) => {
    try {
      const { error } = await supabase
        .from('health_inspections')
        .delete()
        .eq('id', visitId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      set(state => ({
        visits: state.visits.filter(visit => visit.id !== visitId)
      }));

      toast.success('Inspection visit deleted successfully');
    } catch (error) {
      console.error('Error deleting visit:', error);
      toast.error('Failed to delete inspection visit');
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('health_inspection_notifications')
        .update({
          read_by: supabase.auth.getUser().then(({ data }) => [
            ...get().notifications
              .find(n => n.id === notificationId)?.readBy || [],
            data.user?.id
          ])
        })
        .eq('id', notificationId);

      if (error) throw error;

      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === notificationId
            ? {
                ...notification,
                readBy: [
                  ...notification.readBy,
                  supabase.auth.getUser().then(({ data }) => data.user?.id || '')
                ]
              }
            : notification
        )
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  }
}));