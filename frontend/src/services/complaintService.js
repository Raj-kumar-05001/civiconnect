import api from "./api";

// GET /api/complaints  -- supports { status, category, department, search }
export async function listComplaints(params = {}) {
  const { data } = await api.get("/complaints", { params });
  return data.complaints;
}

// GET /api/complaints/:id -- returns { complaint, history, feedback }
export async function getComplaint(id) {
  const { data } = await api.get(`/complaints/${id}`);
  return data;
}

// POST /api/complaints  -- multipart form-data, field "photo"
export async function createComplaint({ title, category_id, description, latitude, longitude, photoFile }) {
  const form = new FormData();
  form.append("title", title);
  form.append("category_id", category_id);
  form.append("description", description);
  form.append("latitude", latitude);
  form.append("longitude", longitude);
  if (photoFile) form.append("photo", photoFile);

  const { data } = await api.post("/complaints", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.complaint;
}

// PUT /api/complaints/:id  -- admin only, assigns department + moves to In Progress
export async function assignDepartment(id, department) {
  const { data } = await api.put(`/complaints/${id}`, { department });
  return data.complaint;
}

// POST /api/complaints/:id/status -- multipart if photo attached (Resolved), else plain
export async function addStatusUpdate(id, { status, remarks, photoFile }) {
  if (photoFile) {
    const form = new FormData();
    form.append("status", status);
    if (remarks) form.append("remarks", remarks);
    form.append("photo", photoFile);
    const { data } = await api.post(`/complaints/${id}/status`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.complaint;
  }
  const { data } = await api.post(`/complaints/${id}/status`, { status, remarks });
  return data.complaint;
}

// POST /api/complaints/:id/feedback
export async function submitFeedback(id, { rating, comment }) {
  const { data } = await api.post(`/complaints/${id}/feedback`, { rating, comment });
  return data.feedback;
}

// GET /api/complaints/stats  -- admin only
export async function getStats() {
  const { data } = await api.get("/complaints/stats");
  return data; // { counts, byCategory }
}

// GET /api/categories
export async function listCategories() {
  const { data } = await api.get("/categories");
  return data.categories;
}
