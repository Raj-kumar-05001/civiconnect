import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Building2, Star, ThumbsUp, ThumbsDown, Send, Camera, CheckCircle2, X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import StatusPipeline from "./StatusPipeline";
import { LocationMap } from "./Map";
import { getComplaint, addStatusUpdate, submitFeedback, assignDepartment } from "../services/complaintService";
import { categoryColor } from "../constants";

const DEPTS = ["Road Dept.", "Sanitation Dept.", "Electricity Dept.", "Water Dept.", "Traffic Dept.", "General"];

export default function ComplaintDetailView({ isAdmin, backTo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    getComplaint(id)
      .then(setData)
      .catch(() => setError("Couldn't load this complaint."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <p className="text-inkSoft text-sm">Loading…</p>;
  if (error || !data) return <p className="text-rust text-sm">{error || "Complaint not found."}</p>;

  const { complaint: c, history, feedback } = data;
  const color = categoryColor(c.categories?.name);

  const verify = async (fixed) => {
    setBusy(true);
    try {
      await addStatusUpdate(id, { status: fixed ? "Verified" : "Reopened" });
      load();
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-[720px]">
      <button onClick={() => navigate(backTo)} className="flex items-center gap-1.5 text-inkSoft text-sm font-semibold mb-4 bg-transparent border-none">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="flex justify-between items-start mb-1.5 flex-wrap gap-2.5">
        <div>
          <div className="text-xs text-inkSoft font-semibold">{c.id?.slice(0, 8)}</div>
          <h1 className="font-display text-xl text-navy my-1">{c.title}</h1>
        </div>
        <StatusBadge status={c.status} />
      </div>

      <div className="flex gap-4 text-sm text-inkSoft mb-6 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} /> {c.categories?.name}</span>
        <span className="flex items-center gap-1.5"><Building2 size={14} /> {c.department}</span>
        <span className="flex items-center gap-1.5"><MapPin size={14} /> {Number(c.latitude).toFixed(4)}, {Number(c.longitude).toFixed(4)}</span>
      </div>

      <div className="bg-white rounded-xl border border-line p-5 mb-5">
        <div className="font-semibold text-sm text-navy mb-4">Progress</div>
        <StatusPipeline status={c.status} />
      </div>

      <div className="bg-white rounded-xl border border-line overflow-hidden mb-5">
        <div className="flex justify-between items-center px-5 pt-3.5">
          <div className="font-semibold text-sm text-navy">Location</div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${c.latitude}%2C${c.longitude}`}
            target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-amberDeep"
          >Open in Google Maps ↗</a>
        </div>
        <div className="p-5">
          <div className="rounded-lg overflow-hidden border border-line">
            <LocationMap lat={Number(c.latitude)} lng={Number(c.longitude)} height={220} label={c.title} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
        <div>
          <div className="text-xs font-semibold text-inkSoft mb-2">SUBMITTED PHOTO</div>
          {c.image_url ? (
            <img src={c.image_url} alt="" className="w-full h-[150px] object-cover rounded-lg" />
          ) : (
            <div className="h-[150px] rounded-lg bg-paper border border-dashed border-line flex items-center justify-center text-inkSoft text-xs">No photo</div>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold text-inkSoft mb-2">RESOLUTION PHOTO</div>
          {c.resolution_image_url ? (
            <img src={c.resolution_image_url} alt="" className="w-full h-[150px] object-cover rounded-lg" />
          ) : (
            <div className="h-[150px] rounded-lg bg-paper border border-dashed border-line flex items-center justify-center text-inkSoft text-xs">Not yet uploaded</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-line p-5 mb-5">
        <div className="font-semibold text-sm text-navy mb-1.5">Description</div>
        <p className="text-sm text-ink leading-relaxed m-0">{c.description}</p>
      </div>

      <div className="bg-white rounded-xl border border-line p-5 mb-5">
        <div className="font-semibold text-sm text-navy mb-3.5">Status history</div>
        {history.map((h, i) => (
          <div key={h.id || i} className="flex gap-3" style={{ marginBottom: i === history.length - 1 ? 0 : 16 }}>
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber mt-1" />
              {i < history.length - 1 && <div className="w-0.5 flex-1 bg-line mt-1" />}
            </div>
            <div>
              <div className="font-semibold text-sm text-ink">{h.status} <span className="text-inkSoft font-medium">· {new Date(h.created_at).toLocaleString()}</span></div>
              {h.remarks && <div className="text-sm text-inkSoft mt-0.5">{h.remarks}</div>}
            </div>
          </div>
        ))}
      </div>

      {!isAdmin && c.status === "Resolved" && (
        <div className="bg-[#FFFBF3] border border-amber rounded-xl p-5 mb-5">
          <div className="font-semibold text-[15px] text-navy mb-1.5">Is this issue actually fixed?</div>
          <p className="text-sm text-inkSoft mb-4">Confirm the resolution or reopen it if the problem is still there.</p>
          <div className="flex gap-2.5">
            <button disabled={busy} onClick={() => verify(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-green text-white">
              <ThumbsUp size={16} /> Yes, it's fixed
            </button>
            <button disabled={busy} onClick={() => verify(false)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-rustLight text-rust">
              <ThumbsDown size={16} /> No, reopen it
            </button>
          </div>
        </div>
      )}

      {!isAdmin && c.status === "Verified" && (
        <FeedbackBox complaintId={id} existing={feedback} onSubmitted={load} />
      )}

      {isAdmin && <AdminActions complaint={c} onUpdated={load} />}
    </div>
  );
}

function FeedbackBox({ complaintId, existing, onSubmitted }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || "");
  const [saving, setSaving] = useState(false);

  if (existing) {
    return (
      <div className="bg-white rounded-xl border border-line p-5">
        <div className="font-semibold text-sm text-navy mb-2">Your feedback</div>
        <div className="flex gap-0.5 mb-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={16} fill={n <= existing.rating ? "#E8A33D" : "none"} color={n <= existing.rating ? "#E8A33D" : "#E4E0D4"} />
          ))}
        </div>
        <p className="text-sm text-inkSoft m-0">{existing.comment}</p>
      </div>
    );
  }

  const submit = async () => {
    if (rating === 0) return;
    setSaving(true);
    try {
      await submitFeedback(complaintId, { rating, comment });
      onSubmitted();
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-line p-5">
      <div className="font-semibold text-[15px] text-navy mb-3.5">Rate the resolution</div>
      <div className="flex gap-1.5 mb-3.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} className="bg-transparent border-none p-0">
            <Star size={26} fill={n <= rating ? "#E8A33D" : "none"} color={n <= rating ? "#E8A33D" : "#E4E0D4"} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <textarea className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm min-h-[70px] mb-3" placeholder="Optional comment" value={comment} onChange={(e) => setComment(e.target.value)} />
      <button onClick={submit} disabled={saving || rating === 0} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-amber text-navyDeep disabled:opacity-60">
        <Send size={15} /> Submit feedback
      </button>
    </div>
  );
}

function AdminActions({ complaint, onUpdated }) {
  const [dept, setDept] = useState(complaint.department === "Unassigned" ? "" : complaint.department);
  const [remark, setRemark] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const assign = async () => {
    if (!dept) return;
    setBusy(true);
    try { await assignDepartment(complaint.id, dept); onUpdated(); } finally { setBusy(false); }
  };

  const markResolved = async () => {
    setBusy(true);
    try {
      await addStatusUpdate(complaint.id, { status: "Resolved", remarks: remark, photoFile });
      setRemark(""); setPhotoFile(null); setPhotoPreview(null);
      onUpdated();
    } finally { setBusy(false); }
  };

  const reassign = async () => {
    setBusy(true);
    try { await addStatusUpdate(complaint.id, { status: "In Progress", remarks: remark }); setRemark(""); onUpdated(); } finally { setBusy(false); }
  };

  return (
    <div className="bg-[#FFFBF3] border border-amber rounded-xl p-5 mt-5">
      <div className="font-semibold text-[15px] text-navy mb-4">Admin actions</div>

      {complaint.department === "Unassigned" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-navy mb-1.5">Assign department</label>
          <select className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-3" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Select department…</option>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button disabled={busy} onClick={assign} className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-navy text-white">Assign and move to in progress</button>
        </div>
      )}

      {complaint.status === "In Progress" && (
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Resolution remarks</label>
          <textarea className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm min-h-[70px] mb-3.5" placeholder="What was done to fix this issue?" value={remark} onChange={(e) => setRemark(e.target.value)} />

          <div className="mb-3.5">
            <div className="text-sm font-semibold text-navy mb-1.5">Upload after-fix photo</div>
            <input id="resolve-photo" type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="" className="w-full h-[130px] object-cover rounded-lg" />
                <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-2 right-2 bg-black/55 rounded-md text-white p-1.5"><X size={14} /></button>
              </div>
            ) : (
              <label htmlFor="resolve-photo" className="w-full py-5 border-2 border-dashed border-line rounded-lg bg-white cursor-pointer flex flex-col items-center gap-1.5 text-inkSoft text-sm">
                <Camera size={19} /> Choose file
              </label>
            )}
          </div>
          <button disabled={busy} onClick={markResolved} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-amber text-navyDeep">
            <CheckCircle2 size={16} /> Mark as resolved
          </button>
        </div>
      )}

      {(complaint.status === "Resolved" || complaint.status === "Verified") && (
        <p className="text-sm text-inkSoft m-0">Waiting on citizen verification. No further action needed unless reopened.</p>
      )}

      {complaint.status === "Reopened" && (
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Follow-up remarks</label>
          <textarea className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm min-h-[70px] mb-3.5" value={remark} onChange={(e) => setRemark(e.target.value)} />
          <button disabled={busy} onClick={reassign} className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-navy text-white">Re-assign to department</button>
        </div>
      )}
    </div>
  );
}
