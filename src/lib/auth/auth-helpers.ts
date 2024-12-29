import { supabase } from '../supabase';

export async function initializeUserOrganization(userId: string, email: string): Promise<string> {
  try {
    // First check if user already has an organization
    const { data: existingRole } = await supabase
      .from('organization_roles')
      .select('organization_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRole?.organization_id) {
      return existingRole.organization_id;
    }

    // Create new organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: `${email.split('@')[0]}'s Organization`,
        owner_id: userId,
        settings: {
          business_type: 'restaurant',
          default_timezone: 'America/Toronto',
          multi_unit: false,
          currency: 'CAD',
          date_format: 'MM/DD/YYYY',
          time_format: '12h'
        }
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Create owner role
    const { error: roleError } = await supabase
      .from('organization_roles')
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: 'owner'
      });

    if (roleError) throw roleError;

    return org.id;
  } catch (error) {
    console.error('Error initializing organization:', error);
    throw error;
  }
}

export async function getUserOrganization(userId: string) {
  try {
    const { data, error } = await supabase
      .from('organization_roles')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          settings
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user organization:', error);
    throw error;
  }
}