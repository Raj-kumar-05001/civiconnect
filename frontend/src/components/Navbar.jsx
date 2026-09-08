import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Plus, FileText, LayoutGrid, LogOut, Menu, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const role = user.role;

  const citizenLinks = [
    { to: "/citizen/dashboard", label: "Dashboard", icon: Home },
    { to: "/citizen/report", label: "Report issue", icon: Plus },
    { to: "/citizen/complaints", label: "My complaints", icon: FileText },
  ];
  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/admin/complaints", label: "All complaints", icon: FileText },
    { to: "/admin/categories", label: "Categories", icon: LayoutGrid },
  ];
  const links = role === "admin" ? adminLinks : citizenLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const content = (
    <div className="w-60 bg-navy h-screen flex flex-col p-4 box-border flex-shrink-0">
      <Link to="/" className="flex items-center gap-2 px-2 mb-9">
        <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center flex-shrink-0">
          <MapPin size={18} className="text-navyDeep" strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-lg text-white">
          Civic<span className="text-amber">Connect</span>
        </span>
      </Link>

      <div className="px-2 pb-5 border-b border-white/10 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {(user.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-sm font-semibold truncate">{user.name}</div>
            <div className="text-white/50 text-xs capitalize">{role} account</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {links.map((l) => {
          const active = location.pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: active ? "rgba(232,163,61,0.15)" : "transparent", color: active ? "#E8A33D" : "rgba(255,255,255,0.75)" }}
            >
              <l.icon size={17} strokeWidth={2.2} /> {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />
      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-white/60 hover:text-white"
      >
        <LogOut size={17} strokeWidth={2.2} /> Log out
      </button>
    </div>
  );

   return (
    <>
      <div className="hidden md:flex md:flex-col h-full flex-shrink-0">{content}</div>

      <div className="flex md:hidden items-center justify-between bg-navy px-4 py-3.5 sticky top-0 z-30 w-full flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center">
            <MapPin size={15} className="text-navyDeep" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-white">CivicConnect</span>
        </Link>
        <button onClick={() => setOpen(true)} className="text-white">
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[9999] flex md:hidden">
          <div className="w-60 h-full">{content}</div>
          <div onClick={() => setOpen(false)} className="flex-1 bg-black/40" />
        </div>
      )}
    </>
  );
}
