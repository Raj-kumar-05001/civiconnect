import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, X, CheckCircle2 } from "lucide-react";
import AppLayout from "../../components/AppLayout";
import { LocationMap } from "../../components/Map";
import { useCurrentLocation } from "../../hooks/useLiveLocation";
import { listCategories, createComplaint } from "../../services/complaintService";

export default function ReportIssue() {
  const navigate = useNavigate();
  const { coords, loading: locating, error: locError, locate } = useCurrentLocation();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [effectiveCoords, setEffectiveCoords] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    listCategories().then((cats) => {
      setCategories(cats);
      if (cats.length) setCategoryId(cats[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (coords) setEffectiveCoords(coords);
  }, [coords]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const applyManual = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    setEffectiveCoords({ lat, lng });
  };

  const submit = async () => {
    const errs = {};
    if (!title.trim()) errs.title = "Enter a title for the issue.";
    if (!description.trim()) errs.description = "Add a short description.";
    if (!categoryId) errs.category = "Choose a category.";
    if (!effectiveCoords) errs.location = "Share your location before submitting.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const complaint = await createComplaint({
        title,
        category_id: categoryId,
        description,
        latitude: effectiveCoords.lat,
        longitude: effectiveCoords.lng,
        photoFile,
      });
      setSubmittedId(complaint.id);
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Couldn't submit your complaint. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <AppLayout>
        <div className="max-w-[480px] mx-auto mt-16 text-center">
          <div className="w-16 h-16 rounded-full bg-greenLight flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={30} className="text-green" />
          </div>
          <h2 className="font-display text-xl text-navy mb-2">Issue reported</h2>
          <p className="text-inkSoft mb-6">Your complaint has been submitted and saved to the database. You can track it from your dashboard.</p>
          <div className="flex gap-2.5 justify-center">
            <button onClick={() => navigate("/citizen/complaints")} className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-navy text-navy">
              View my complaints
            </button>
            <button onClick={() => navigate("/citizen/dashboard")} className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-amber text-navyDeep">
              Go to dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[620px]">
        <h1 className="font-display text-2xl text-navy mb-1">Report a civic issue</h1>
        <p className="text-inkSoft mb-6 text-sm">
          Give as much detail as you can — a clear photo and an accurate pin help your department resolve it faster.
        </p>

        {submitError && <div className="bg-rustLight text-rust text-sm rounded-lg p-3 mb-4">{submitError}</div>}

        <div className="bg-white rounded-2xl border border-line p-6">
          <label className="block text-sm font-semibold text-navy mb-1.5">Issue title</label>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-1"
            value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pothole near bus stop"
          />
          {errors.title && <p className="text-rust text-xs mb-3">{errors.title}</p>}

          <label className="block text-sm font-semibold text-navy mb-1.5 mt-4">Category</label>
          <select
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-1"
            value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-rust text-xs mb-3">{errors.category}</p>}

          <label className="block text-sm font-semibold text-navy mb-1.5 mt-4">Description</label>
          <textarea
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-1 min-h-[100px]"
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue, when you noticed it, and why it matters."
          />
          {errors.description && <p className="text-rust text-xs mb-3">{errors.description}</p>}

          <label className="block text-sm font-semibold text-navy mb-1.5 mt-4">Photo evidence</label>
          <input id="photo-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="" className="w-full h-[150px] object-cover rounded-lg" />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 bg-black/55 rounded-md text-white p-1.5"
              ><X size={14} /></button>
            </div>
          ) : (
            <label htmlFor="photo-input" className="w-full py-6 border-2 border-dashed border-line rounded-lg bg-paper cursor-pointer flex flex-col items-center gap-2 text-inkSoft text-sm font-medium">
              <Camera size={22} strokeWidth={1.7} /> Choose file to upload
            </label>
          )}

          <label className="block text-sm font-semibold text-navy mb-1.5 mt-4">Location</label>
          <button
            onClick={locate}
            disabled={locating}
            className="w-full px-4 py-3 rounded-lg border flex items-center gap-2.5 text-sm font-semibold"
            style={{
              borderColor: effectiveCoords ? "#2F7A4F" : "#E4E0D4",
              background: effectiveCoords ? "#E7F2EA" : "#fff",
              color: effectiveCoords ? "#2F7A4F" : "#16324A",
            }}
          >
            <MapPin size={17} />
            {locating ? "Locating…" : effectiveCoords ? `Location captured — ${effectiveCoords.lat.toFixed(5)}°, ${effectiveCoords.lng.toFixed(5)}°` : "Use my current location"}
          </button>
          {locError && <p className="text-rust text-xs mt-1.5">{locError}</p>}
          {errors.location && <p className="text-rust text-xs mt-1.5">{errors.location}</p>}

          {locError && (
            <div className="flex gap-2 mt-2.5">
              <input className="flex-1 px-3.5 py-2.5 rounded-lg border border-line text-sm" placeholder="Latitude" value={manualLat} onChange={(e) => setManualLat(e.target.value)} />
              <input className="flex-1 px-3.5 py-2.5 rounded-lg border border-line text-sm" placeholder="Longitude" value={manualLng} onChange={(e) => setManualLng(e.target.value)} />
              <button onClick={applyManual} className="px-4 py-2.5 rounded-lg border border-navy text-navy text-sm font-semibold flex-shrink-0">Set</button>
            </div>
          )}

          {effectiveCoords && (
            <div className="mt-2.5 rounded-lg overflow-hidden border border-line">
              <LocationMap lat={effectiveCoords.lat} lng={effectiveCoords.lng} height={160} />
            </div>
          )}

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold bg-amber text-navyDeep mt-6 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit issue"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
