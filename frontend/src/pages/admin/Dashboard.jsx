import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import StatusBadge from "../../components/StatusBadge";
import { ComplaintsMap } from "../../components/Map";
import { getStats, listComplaints } from "../../services/complaintService";
import { categoryColor } from "../../constants";

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-line p-5 flex items-center gap-3.5">
      <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, width: 42, height: 42 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div className="font-display text-2xl font-bold text-navy leading-none">{value}</div>
        <div className="text-xs text-inkSoft mt-1">{label}</div>
      </div>
    </div>
  );
}

function CategoryBarChart({ data }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div>
      {entries.map(([name, value]) => (
        <div key={name} className="flex items-center gap-3 mb-3">
          <div className="w-[100px] text-xs text-inkSoft font-medium flex-shrink-0">{name}</div>
          <div className="flex-1 bg-paper rounded h-4 overflow-hidden">
            <div className="h-full rounded transition-all" style={{ width: `${(value / max) * 100}%`, background: categoryColor(name) }} />
          </div>
          <div className="w-6 text-xs font-bold text-navy text-right">{value}</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), listComplaints()])
      .then(([s, c]) => { setStats(s); setComplaints(c); })
      .finally(() => setLoading(false));
  }, []);

  const mapPoints = complaints
    .filter((c) => c.latitude && c.longitude)
    .map((c) => ({ id: c.id, title: c.title, category: c.categories?.name, status: c.status, lat: Number(c.latitude), lng: Number(c.longitude) }));

  const recent = [...complaints].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  if (loading) return <AppLayout><p className="text-inkSoft text-sm">Loading…</p></AppLayout>;

  const counts = stats?.counts || {};

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-navy mb-1">Admin dashboard</h1>
      <p className="text-inkSoft text-sm mb-6">City-wide overview of civic complaints.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        <StatCard label="Total" value={counts.total || 0} Icon={FileText} color="#16324A" />
        <StatCard label="Submitted" value={counts.Submitted || 0} Icon={Clock} color="#8A6A1F" />
        <StatCard label="In progress" value={counts["In Progress"] || 0} Icon={AlertCircle} color="#185FA5" />
        <StatCard label="Resolved" value={counts.Resolved || 0} Icon={CheckCircle2} color="#2F7A4F" />
        <StatCard label="Verified" value={counts.Verified || 0} Icon={ShieldCheck} color="#3B6D11" />
      </div>

      <div className="bg-white rounded-xl border border-line p-5 mb-6">
        <div className="font-semibold text-[15px] text-navy mb-3.5">Complaint locations</div>
        <ComplaintsMap complaints={mapPoints} height={340} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-line p-5">
          <div className="font-semibold text-[15px] text-navy mb-4">Complaints by category</div>
          <CategoryBarChart data={stats?.byCategory} />
        </div>
        <div className="bg-white rounded-xl border border-line p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-[15px] text-navy">Recent complaints</div>
            <Link to="/admin/complaints" className="text-xs font-semibold text-amberDeep">View all</Link>
          </div>
          {recent.map((c) => (
            <Link key={c.id} to={`/admin/complaints/${c.id}`} className="flex justify-between items-center py-2.5 border-b border-line last:border-0">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink truncate">{c.title}</div>
                <div className="text-xs text-inkSoft mt-0.5">{c.id.slice(0, 8)} · {c.department}</div>
              </div>
              <StatusBadge status={c.status} />
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
