/*
  useLiveLocation.js — real browser geolocation hook.

  getCurrentPosition() -> one-time GPS fix, used on the report form
  (a citizen doesn't need to be tracked continuously, just pinned once
  at the moment they file a complaint).

  watchPosition() -> continuous live tracking, in case you want it for
  something like an admin field-team "currently near this complaint"
  view. Most MCA-scope submissions only need the one-time version below;
  the watch-based hook is included in case you extend the project later.
*/

import { useState, useCallback, useEffect, useRef } from "react";

// One-time location fix (used by ReportIssue.jsx)
export function useCurrentLocation() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported in this browser.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Enable it in your browser settings and try again."
            : "Couldn't get your location. Try again or enter coordinates manually."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { coords, loading, error, locate, setCoords };
}

// Continuous live tracking (optional — for future extension)
export function useWatchLocation(active) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const watchId = useRef(null);

  useEffect(() => {
    if (!active || !navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [active]);

  return { coords, error };
}
