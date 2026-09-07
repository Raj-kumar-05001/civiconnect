/*
  Map.jsx — real, live OpenStreetMap component using Leaflet + react-leaflet.
  This is for your ACTUAL frontend project (frontend/src/components/Map.jsx
  per the folder structure in the project doc). It shows real map tiles,
  real street names, real zoom/pan — unlike the schematic placeholder used
  in the in-chat demo, which can't load external map tiles.

  Install first:
    npm install leaflet react-leaflet

  Two exports:
    <LocationMap lat={..} lng={..} height={220} />
      -> single pinned location. Use on the citizen report form preview
         and on the complaint details "Location" card.

    <ComplaintsMap complaints={[...]} onSelect={(c) => ...} height={340} />
      -> multiple pins, auto-fitted to show every complaint. Use on the
         admin dashboard "Complaint locations" card.
*/

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* -----------------------------------------------------------------
   Colored pin icons (matches the CivicConnect category palette)
   Leaflet's default marker image paths break under Vite/CRA bundlers,
   so we build our own SVG-based icons instead of relying on the
   default marker PNGs.
----------------------------------------------------------------- */
const CATEGORY_COLORS = {
  "Road Damage": "#C1502E",
  "Garbage/Waste": "#6B7A3F",
  "Streetlight": "#C9821F",
  "Water Leakage": "#2A6F97",
  "Sanitation": "#2A6F97",
  "Traffic Signal": "#C1502E",
  "Fallen Tree": "#2F7A4F",
  "Other": "#5B6572",
};

function pinIcon(color = "#16324A") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.75 17 27 17 27s17-14.25 17-27C34 7.6 26.4 0 17 0z" fill="${color}"/>
      <circle cx="17" cy="17" r="7" fill="#fff"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "cc-map-pin",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  });
}

/* -----------------------------------------------------------------
   Single pinned location
----------------------------------------------------------------- */
export function LocationMap({ lat, lng, height = 220, zoom = 16, label }) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#5B6572", fontSize: 13.5, background: "#F7F5EF", borderRadius: 10 }}>
        No location set yet.
      </div>
    );
  }
  return (
    <div style={{ height, borderRadius: 10, overflow: "hidden" }}>
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={pinIcon("#C1502E")}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
}

/* -----------------------------------------------------------------
   Multiple complaint pins, auto-fitted to bounds
----------------------------------------------------------------- */
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

export function ComplaintsMap({ complaints, onSelect, height = 340 }) {
  const valid = (complaints || []).filter((c) => typeof c.lat === "number" && typeof c.lng === "number");

  if (valid.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#5B6572", fontSize: 13.5, background: "#F7F5EF", borderRadius: 12 }}>
        No complaint locations to show yet.
      </div>
    );
  }

  const points = valid.map((c) => [c.lat, c.lng]);
  const center = points[0];

  return (
    <div style={{ height, borderRadius: 12, overflow: "hidden" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {valid.map((c) => (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={pinIcon(CATEGORY_COLORS[c.category] || CATEGORY_COLORS.Other)}
            eventHandlers={{ click: () => onSelect && onSelect(c) }}
          >
            <Popup>
              <strong>{c.title}</strong>
              <br />
              {c.category} · {c.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
