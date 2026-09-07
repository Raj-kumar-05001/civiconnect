import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return setError("Enter your full name.");
    if (!email.trim()) return setError("Enter your email address.");
    if (!password || password.length < 6) return setError("Password must be at least 6 characters.");
    setError("");
    setLoading(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/citizen/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-5">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="flex items-center justify-center gap-2 mb-7">
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center">
            <MapPin size={18} className="text-navyDeep" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg text-white">
            Civic<span className="text-amber">Connect</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl border border-line p-8">
          <h1 className="font-display text-xl text-navy mb-1.5">Create your account</h1>
          <p className="text-inkSoft text-sm mb-6">Register as a citizen to start reporting civic issues.</p>

          {error && <div className="bg-rustLight text-rust text-sm rounded-lg p-3 mb-4">{error}</div>}

          <label className="block text-sm font-semibold text-navy mb-1.5">Full name</label>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />

          <label className="block text-sm font-semibold text-navy mb-1.5">Email address</label>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-4"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />

          <label className="block text-sm font-semibold text-navy mb-1.5">Password</label>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm mb-6"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-amber text-navyDeep disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-center mt-4">
            <Link to="/" className="text-xs text-inkSoft">← Back to home</Link>
          </p>
        </div>

        <p className="text-center mt-4 text-sm text-white/70">
          Already registered? <Link to="/login" className="text-amber font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
