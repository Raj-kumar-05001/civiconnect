const { supabaseAuthClient, supabaseAdmin } = require("../config/supabase");

// Verifies the Supabase access token sent as: Authorization: Bearer <token>
// Attaches req.user = { id, email } and req.profile = { role, name, ... }
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing bearer token." });
    }

    const { data, error } = await supabaseAuthClient.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired session." });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: "User profile not found." });
    }

    req.user = data.user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(500).json({ error: "Authentication check failed." });
  }
}

// Use after requireAuth to restrict a route to admins only
function requireAdmin(req, res, next) {
  if (req.profile?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
