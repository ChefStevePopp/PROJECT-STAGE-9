// src/context/SupabaseContext.tsx
import React, { createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

const SupabaseContext = createContext({ supabase });

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SupabaseContext.Provider value={{ supabase }}>
    {children}
  </SupabaseContext.Provider>
);

export const useSupabase = () => useContext(SupabaseContext);
