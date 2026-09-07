import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import ComplaintCard from "../../components/ComplaintCard";
import { useAuth } from "../../context/AuthContext";
import { listComplaints } from "../../services/complaintService";

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-line p-5 flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, width: 42, height: 42 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div className="font-display text-2xl font-bold text-navy leading-none">{value}</div>
        <div className="text-xs text-inkSoft mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listComplaints()
      .then(setComplaints)
      .catch(() => setError("Couldn't load your complaints. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: complaints.length,
    Submitted: complaints.filter((c) => c.status === "Submitted").length,
    "In Progress": complaints.filter((c) => c.status === "In Progress").length,
    Resolved: complaints.filter((c) => c.status === "Resolved" || c.status === "Verified").length,
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3.5">
        <div>
          <h1 className="font-display text-2xl text-navy m-0">Hi, {(user?.name || "there").split(" ")[0]}</h1>
          <p className="text-inkSoft mt-1.5 text-sm">Here's what's happening with your reports.</p>
        </div>
        <Link to="/citizen/report" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-amber text-navyDeep">
          <Plus size={16} /> Report a new issue
        </Link>
      </div>

      {error && <div className="bg-rustLight text-rust text-sm rounded-lg p-3 mb-5">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        <StatCard label="Total reports" value={counts.total} Icon={FileText} color="#16324A" />
        <StatCard label="Submitted" value={counts.Submitted} Icon={Clock} color="#8A6A1F" />
        <StatCard label="In progress" value={counts["In Progress"]} Icon={AlertCircle} color="#185FA5" />
        <StatCard label="Resolved" value={counts.Resolved} Icon={CheckCircle2} color="#2F7A4F" />
      </div>

      <h2 className="font-display text-base text-navy mb-3.5">Recent complaints</h2>
      {loading ? (
        <p className="text-inkSoft text-sm">Loading…</p>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-line rounded-xl p-10 text-center">
          <p className="text-inkSoft mb-4">You haven't reported anything yet.</p>
          <Link to="/citizen/report" className="inline-block px-5 py-2.5 rounded-lg font-semibold text-sm bg-amber text-navyDeep">
            Report your first issue
          </Link>
        </div>
      ) : (
        complaints.slice(0, 6).map((c) => <ComplaintCard key={c.id} complaint={c} to={`/citizen/complaints/${c.id}`} />)
      )}
    </AppLayout>
  );
}
