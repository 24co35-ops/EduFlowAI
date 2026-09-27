let createClient = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  console.warn('[Database] @supabase/supabase-js module not found — using in-memory demo fallback.');
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (createClient && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    console.log('[Database] Supabase service-role client initialized');
  } catch (err) {
    console.warn('[Database] Supabase client initialization failed:', err.message);
  }
} else {
  console.warn('[Database] Supabase not configured — running in memory/demo fallback mode.');
}

const isSupabaseConfigured = () => Boolean(supabase);

module.exports = { supabase, isSupabaseConfigured };
