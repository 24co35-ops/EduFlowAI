const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

let createClient = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  console.warn('[Database] @supabase/supabase-js module not found — using in-memory demo fallback.');
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

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
  console.warn('[Database] Supabase not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

const isSupabaseConfigured = () => Boolean(supabase);
// TEMP DEBUG
console.log('[Config] isSupabaseConfigured:', isSupabaseConfigured(), '| SUPABASE_URL set:', Boolean(SUPABASE_URL), '| SUPABASE_SERVICE_ROLE_KEY set:', Boolean(SUPABASE_SERVICE_ROLE_KEY));

module.exports = { supabase, isSupabaseConfigured };
