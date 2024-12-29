import { createClient } from '@supabase/supabase-js';
import type { Database } from '../shared/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);