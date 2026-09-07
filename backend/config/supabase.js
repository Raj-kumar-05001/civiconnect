require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing Supabase env vars. Copy .env.example to .env and fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

// Service-role client: used by the backend for privileged operations
// (bypasses Row Level Security). Never expose this key to the frontend.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client: used only to verify a citizen/admin's JWT on incoming requests.
const supabaseAuthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = { supabaseAdmin, supabaseAuthClient };
