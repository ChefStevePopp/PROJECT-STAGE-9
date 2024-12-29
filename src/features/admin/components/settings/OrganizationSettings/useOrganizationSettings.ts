import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Organization } from '@/types/organization';
import toast from 'react-hot-toast';

export function useOrganizationSettings() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrganization();
    }
  }, [user]);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      
      // First try to get org from user metadata
      let orgId = user?.user_metadata?.organizationId;
      
      // If not found, try to get from organization_roles
      if (!orgId) {
        const { data: orgRole } = await supabase
          .from('organization_roles')
          .select('organization_id')
          .eq('user_id', user?.id)
          .single();
          
        orgId = orgRole?.organization_id;
      }
      
      if (!orgId) {
        throw new Error('No organization ID found');
      }

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error) throw error;
      
      // Initialize empty settings if none exist
      if (!data.settings) {
        data.settings = {
          business_type: 'restaurant',
          default_timezone: 'America/Toronto',
          multi_unit: false,
          currency: 'CAD',
          date_format: 'MM/DD/YYYY',
          time_format: '12h'
        };
      }
      
      setOrganization(data);
    } catch (error) {
      console.error('Error loading organization:', error);
      toast.error('Failed to load organization settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = (updates: Partial<Organization>) => {
    if (!organization) return;
    setOrganization({ ...organization, ...updates });
  };

  const handleSave = async () => {
    if (!organization) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('organizations')
        .update({
          ...organization,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (error) throw error;
      toast.success('Settings saved successfully');
      await loadOrganization(); // Reload to get fresh data
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    organization,
    isLoading,
    isSaving,
    updateOrganization,
    handleSave
  };
}