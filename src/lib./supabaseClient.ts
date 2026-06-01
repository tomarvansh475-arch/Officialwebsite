import { createClient } from "@supabase/supabase-js";

// Supabase project credentials provided by user
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hfdrdbcqvatfljbotgyf.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_-3ZeaWwV2o4nv6jHBru-4Q_4fI4X24w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
