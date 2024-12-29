import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export async function handleAuthStateChange(
  user: User,
  set: (state: any) => void
) {
  try {
    // Check if user is a dev from metadata
    const isDev = Boolean(
      user.user_metadata?.system_role === 'dev' ||
      user.user_metadata?.role === 'dev'
    );
    
    // Admin access is granted to devs and organization owners/admins
    const hasAdminAccess = Boolean(
      isDev ||
      user.user_metadata?.role === 'owner' ||
      user.user_metadata?.role === 'admin'
    );

    // Get organization info
    const { data: orgRole } = await supabase
      .from('organization_roles')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    set({
      user,
      organizationId: orgRole?.organization_id || user.user_metadata?.organizationId || null,
      isDev,
      hasAdminAccess,
      error: null
    });
  } catch (error) {
    console.error('Error handling auth state change:', error);
    throw error;
  }
}