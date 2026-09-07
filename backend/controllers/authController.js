const { supabaseAdmin, supabaseAuthClient } = require("../config/supabase");

// POST /api/auth/register
// Creates a Supabase Auth user, then a matching row in the public "users" profile table.
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const safeRole = role === "admin" ? "admin" : "citizen";

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .insert({ id: authData.user.id, name, email, role: safeRole })
      .select()
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: "Could not create user profile." });
    }

    res.status(201).json({ user: profile });
  } catch (err) {
    console.error("register error:", err.message);
    res.status(500).json({ error: "Registration failed." });
  }
}

// POST /api/auth/login
// Signs in with Supabase Auth and returns the session token + profile.
// The frontend stores the access_token and sends it as a Bearer token on future requests.
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const { data, error } = await supabaseAuthClient.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role")
      .eq("id", data.user.id)
      .single();

    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: profile,
    });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ error: "Login failed." });
  }
}

// GET /api/auth/me  (requires requireAuth middleware)
async function me(req, res) {
  res.json({ user: req.profile });
}

module.exports = { register, login, me };
