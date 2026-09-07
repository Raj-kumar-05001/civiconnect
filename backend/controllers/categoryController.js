const { supabaseAdmin } = require("../config/supabase");

// GET /api/categories
async function listCategories(req, res) {
  const { data, error } = await supabaseAdmin.from("categories").select("*").order("name");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ categories: data });
}

// POST /api/categories  (admin only)
async function createCategory(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Category name is required." });

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({ name, description })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ category: data });
}

module.exports = { listCategories, createCategory };
