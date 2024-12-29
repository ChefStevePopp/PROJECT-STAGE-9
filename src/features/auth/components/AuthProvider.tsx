import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/config/routes';
import { LoadingLogo } from '@/features/shared/components';
import type { User } from '@supabase/supabase-js';
import type { Organization } from '@/types/organization';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  isDev: boolean;
  hasAdminAccess: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        fetchOrganization(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchOrganization(session.user.id);
        } else {
          setUser(null);
          setOrganization(null);
          navigate(ROUTES.AUTH.SIGN_IN);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchOrganization = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No organization found, create one
          const { data: newOrg, error: createError } = await supabase
            .from('organizations')
            .insert({
              name: `${user?.email?.split('@')[0]}'s Organization`,
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

          if (createError) throw createError;
          setOrganization(newOrg);
        } else {
          throw error;
        }
      } else {
        setOrganization(data);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast.error('Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setOrganization(null);
      navigate(ROUTES.AUTH.SIGN_IN);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const isDev = Boolean(
    user?.user_metadata?.system_role === 'dev' ||
    user?.user_metadata?.role === 'dev'
  );

  const hasAdminAccess = Boolean(
    isDev ||
    user?.user_metadata?.role === 'owner' ||
    user?.user_metadata?.role === 'admin'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingLogo message="Loading..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      isLoading,
      isDev,
      hasAdminAccess,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}