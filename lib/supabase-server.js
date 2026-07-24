import { createClient } from '@supabase/supabase-js';

export const getSupabaseServer = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in environment variables');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: { fetch }
  });
};
