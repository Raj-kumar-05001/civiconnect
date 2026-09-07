import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Construction, Trash2, Lightbulb, Droplets, TrafficCone, TreePine } from "lucide-react";
import Footer from "../components/Footer";
import StatusPipeline from "../components/StatusPipeline";

const CATEGORIES = [
  { name: "Road Damage", Icon: Construction, color: "#C1502E" },
  { name: "Garbage/Waste", Icon: Trash2, color: "#6B7A3F" },
  { name: "Streetlight", Icon: Lightbulb, color: "#C9821F" },
  { name: "Water Leakage", Icon: Droplets, color: "#2A6F97" },
  { name: "Traffic Signal", Icon: TrafficCone, color: "#C1502E" },
  { name: "Fallen Tree", Icon: TreePine, color: "#2F7A4F" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper font-sans">
      <header className="flex items-center justify-between px-6 md:px-[6vw] py-5 sticky top-0 bg-paper/90 backdrop-blur border-b border-line z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center">
            <MapPin size={18} className="text-navyDeep" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg text-navy">
            Civic<span className="text-amber">Connect</span>
          </span>
        </div>
        <div className="flex gap-2.5">
          <Link to="/login" className="px-4 py-2.5 rounded-lg font-semibold text-sm text-navy">
            Log in
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-amber text-navyDeep">
            Report an issue
          </Link>
        </div>
      </header>

      <section className="px-6 md:px-[6vw] py-16 max-w-[1240px] mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white border border-line px-3.5 py-1.5 rounded-full text-xs font-semibold text-inkSoft mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" /> Live civic reporting platform
          </div>
          <h1 className="font-display text-[clamp(34px,4.4vw,56px)] leading-[1.06] text-navy font-bold tracking-tight mb-5">
            See a problem
            <br />
            on your street?
            <br />
            <span className="text-amberDeep">Report it in a minute.</span>
          </h1>
          <p className="text-lg text-inkSoft leading-relaxed max-w-md mb-8">
            Potholes, garbage, broken streetlights, water leaks — snap a photo, drop a real GPS pin, and track every
            step until it's actually fixed.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold bg-amber text-navyDeep">
              Get started <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold border border-navy text-navy">
              I'm an administrator
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-line p-6 shadow-xl">
          <div className="font-display font-semibold text-navy mb-4">How a complaint moves</div>
          <StatusPipeline status="In Progress" />
        </div>
      </section>

      <section className="px-6 md:px-[6vw] py-14 max-w-[1240px] mx-auto">
        <h2 className="font-display text-2xl text-navy mb-6">What you can report</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {CATEGORIES.map(({ name, Icon, color }) => (
            <div key={name} className="bg-white border border-line rounded-xl p-4 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={18} color={color} />
              </div>
              <span className="text-sm font-semibold text-ink">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
