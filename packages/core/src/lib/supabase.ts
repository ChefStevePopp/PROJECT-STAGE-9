import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmlna3d0c3F2cnZhaGZwcnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNDY5NzAsImV4cCI6MjA0NzcyMjk3MH0.8iDPpzIxyoiUs2K9scek0lEbkc463uwXTaeOL3LpQgg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);