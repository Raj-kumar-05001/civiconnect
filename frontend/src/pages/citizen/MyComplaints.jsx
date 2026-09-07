import React, { useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout";
import ComplaintCard from "../../components/ComplaintCard";
import { STATUSES } from "../../constants";
import { listComplaints } from "../../services/complaintService";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listComplaints(filter === "All" ? {} : { status: filter })
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-navy mb-5">My complaints</h1>
      <div className="flex gap-2 mb-5 flex-wrap">
        {["All", ...STATUSES, "Reopened"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3.5 py-1.5 rounded-full text-sm font-semibold border"
            style={{
              borderColor: filter === s ? "#16324A" : "#E4E0D4",
              background: filter === s ? "#16324A" : "#fff",
              color: filter === s ? "#fff" : "#5B6572",
            }}
          >{s}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-inkSoft text-sm">Loading…</p>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-line rounded-xl p-9 text-center text-inkSoft">No complaints match this filter.</div>
      ) : (
        complaints.map((c) => <ComplaintCard key={c.id} complaint={c} to={`/citizen/complaints/${c.id}`} />)
      )}
    </AppLayout>
  );
}
