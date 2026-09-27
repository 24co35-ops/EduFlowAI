const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ponytail: null client — callers check isSupabaseConfigured() before use
let supabase = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
  console.log('[Database] Supabase service-role client initialized');
} else {
  console.warn('[Database] Supabase not configured — running in memory/demo fallback mode.');
}

const isSupabaseConfigured = () => Boolean(supabase);

module.exports = { supabase, isSupabaseConfigured };
