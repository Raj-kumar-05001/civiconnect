const { supabaseAdmin } = require("../config/supabase");

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "complaint-images";

// Helper: upload a multer file buffer to Supabase Storage, return its public URL
async function uploadImage(file, folder) {
  if (!file) return null;
  const ext = file.originalname.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// GET /api/complaints
// Citizens see only their own; admins see everything. Supports query filters.
async function listComplaints(req, res) {
  try {
    const { status, category, department, search } = req.query;

    let query = supabaseAdmin
      .from("complaints")
      .select("*, categories(name), users!complaints_user_id_fkey(name, email)")
      .order("created_at", { ascending: false });

    if (req.profile.role !== "admin") {
      query = query.eq("user_id", req.profile.id);
    }
    if (status) query = query.eq("status", status);
    if (department) query = query.eq("department", department);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    let results = data;
    if (category) {
      results = results.filter((c) => c.categories?.name === category);
    }

    res.json({ complaints: results });
  } catch (err) {
    console.error("listComplaints error:", err.message);
    res.status(500).json({ error: "Could not fetch complaints." });
  }
}

// GET /api/complaints/:id
async function getComplaint(req, res) {
  try {
    const { id } = req.params;

    const { data: complaint, error } = await supabaseAdmin
      .from("complaints")
      .select("*, categories(name), users!complaints_user_id_fkey(name, email)")
      .eq("id", id)
      .single();

    if (error || !complaint) return res.status(404).json({ error: "Complaint not found." });

    if (req.profile.role !== "admin" && complaint.user_id !== req.profile.id) {
      return res.status(403).json({ error: "Not authorized to view this complaint." });
    }

    const { data: history } = await supabaseAdmin
      .from("complaint_updates")
      .select("*")
      .eq("complaint_id", id)
      .order("created_at", { ascending: true });

    const { data: feedback } = await supabaseAdmin
      .from("feedback")
      .select("*")
      .eq("complaint_id", id)
      .maybeSingle();

    res.json({ complaint, history: history || [], feedback: feedback || null });
  } catch (err) {
    console.error("getComplaint error:", err.message);
    res.status(500).json({ error: "Could not fetch complaint." });
  }
}

// POST /api/complaints  (multipart/form-data, field "photo")
// Citizen creates a new complaint with title, category_id, description, lat, lng.
async function createComplaint(req, res) {
  try {
    const { title, category_id, description, latitude, longitude } = req.body;

    if (!title || !category_id || !description || !latitude || !longitude) {
      return res.status(400).json({ error: "Title, category, description, and location are all required." });
    }

    const imageUrl = await uploadImage(req.file, "submitted");

    const { data: complaint, error } = await supabaseAdmin
      .from("complaints")
      .insert({
        user_id: req.profile.id,
        category_id,
        title,
        description,
        image_url: imageUrl,
        latitude,
        longitude,
        status: "Submitted",
        department: "Unassigned",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await supabaseAdmin.from("complaint_updates").insert({
      complaint_id: complaint.id,
      status: "Submitted",
      remarks: "Complaint received.",
      updated_by: req.profile.id,
    });

    res.status(201).json({ complaint });
  } catch (err) {
    console.error("createComplaint error:", err.message);
    res.status(500).json({ error: "Could not create complaint." });
  }
}

// PUT /api/complaints/:id  (admin only — used for assigning department)
async function updateComplaint(req, res) {
  try {
    const { id } = req.params;
    const { department } = req.body;

    const { data: complaint, error } = await supabaseAdmin
      .from("complaints")
      .update({ department, status: "In Progress", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await supabaseAdmin.from("complaint_updates").insert({
      complaint_id: id,
      status: "In Progress",
      remarks: `Assigned to ${department}.`,
      updated_by: req.profile.id,
    });

    res.json({ complaint });
  } catch (err) {
    console.error("updateComplaint error:", err.message);
    res.status(500).json({ error: "Could not update complaint." });
  }
}

// POST /api/complaints/:id/status  (multipart/form-data, field "photo" optional)
// Used by: admin marking Resolved (with after-fix photo), admin re-assigning after Reopened,
// and citizen marking Verified or Reopened after checking the fix.
async function addStatusUpdate(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const allowed = ["Submitted", "In Progress", "Resolved", "Verified", "Reopened"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    // Citizens may only move a complaint to Verified or Reopened, and only their own
    if (req.profile.role !== "admin") {
      const { data: existing } = await supabaseAdmin
        .from("complaints")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!existing || existing.user_id !== req.profile.id) {
        return res.status(403).json({ error: "Not authorized to update this complaint." });
      }
      if (!["Verified", "Reopened"].includes(status)) {
        return res.status(403).json({ error: "Citizens can only verify or reopen a resolved complaint." });
      }
    }

    const patch = { status, updated_at: new Date().toISOString() };

    if (status === "Resolved") {
      const resolutionUrl = await uploadImage(req.file, "resolved");
      if (resolutionUrl) patch.resolution_image_url = resolutionUrl;
    }

    const { data: complaint, error } = await supabaseAdmin
      .from("complaints")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    await supabaseAdmin.from("complaint_updates").insert({
      complaint_id: id,
      status,
      remarks: remarks || null,
      updated_by: req.profile.id,
    });

    res.json({ complaint });
  } catch (err) {
    console.error("addStatusUpdate error:", err.message);
    res.status(500).json({ error: "Could not add status update." });
  }
}

// POST /api/complaints/:id/feedback  (citizen only, complaint must be Verified)
async function submitFeedback(req, res) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    const { data: complaint } = await supabaseAdmin
      .from("complaints")
      .select("user_id, status")
      .eq("id", id)
      .single();

    if (!complaint || complaint.user_id !== req.profile.id) {
      return res.status(403).json({ error: "Not authorized to rate this complaint." });
    }
    if (complaint.status !== "Verified") {
      return res.status(400).json({ error: "Feedback can only be submitted after verification." });
    }

    const { data: feedback, error } = await supabaseAdmin
      .from("feedback")
      .upsert({ complaint_id: id, user_id: req.profile.id, rating, comment }, { onConflict: "complaint_id" })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ feedback });
  } catch (err) {
    console.error("submitFeedback error:", err.message);
    res.status(500).json({ error: "Could not submit feedback." });
  }
}

// GET /api/complaints/stats  (admin only — dashboard cards + category chart)
async function getStats(req, res) {
  try {
    const { data: complaints, error } = await supabaseAdmin
      .from("complaints")
      .select("status, categories(name)");

    if (error) return res.status(500).json({ error: error.message });

    const counts = { total: complaints.length, Submitted: 0, "In Progress": 0, Resolved: 0, Verified: 0, Reopened: 0 };
    const byCategory = {};

    complaints.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
      const cat = c.categories?.name || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    res.json({ counts, byCategory });
  } catch (err) {
    console.error("getStats error:", err.message);
    res.status(500).json({ error: "Could not compute stats." });
  }
}

module.exports = {
  listComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  addStatusUpdate,
  submitFeedback,
  getStats,
};
