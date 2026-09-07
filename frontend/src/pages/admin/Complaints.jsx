import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import ComplaintCard from "../../components/ComplaintCard";
import { STATUSES } from "../../constants";
import { listComplaints, listCategories } from "../../services/complaintService";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { listCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (query) params.search = query;
    if (status !== "All") params.status = status;
    if (category !== "All") params.category = category;
    const t = setTimeout(() => {
      listComplaints(params).then(setComplaints).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, status, category]);

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-navy mb-5">All complaints</h1>

      <div className="flex gap-2.5 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-3 text-inkSoft" />
          <input
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-line text-sm"
            placeholder="Search by title" value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="px-3.5 py-2.5 rounded-lg border border-line text-sm w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
          <option>Reopened</option>
        </select>
        <select className="px-3.5 py-2.5 rounded-lg border border-line text-sm w-44" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          {categories.map((c) => <option key={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="text-xs text-inkSoft mb-3">{complaints.length} result{complaints.length !== 1 ? "s" : ""}</div>

      {loading ? (
        <p className="text-inkSoft text-sm">Loading…</p>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-line rounded-xl p-9 text-center text-inkSoft">No complaints match your filters.</div>
      ) : (
        complaints.map((c) => <ComplaintCard key={c.id} complaint={c} to={`/admin/complaints/${c.id}`} />)
      )}
    </AppLayout>
  );
}
