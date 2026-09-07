import React from "react";
import { Clock, AlertCircle, CheckCircle2, ShieldCheck, RotateCcw } from "lucide-react";

const CONFIG = {
  Submitted: { bg: "#FDF3E4", fg: "#8A6A1F", Icon: Clock },
  "In Progress": { bg: "#E6F1FB", fg: "#185FA5", Icon: AlertCircle },
  Resolved: { bg: "#E7F2EA", fg: "#2F7A4F", Icon: CheckCircle2 },
  Verified: { bg: "#EAF3DE", fg: "#3B6D11", Icon: ShieldCheck },
  Reopened: { bg: "#FBEAE4", fg: "#C1502E", Icon: RotateCcw },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.Submitted;
  const { Icon } = cfg;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      <Icon size={12} strokeWidth={2.5} /> {status}
    </span>
  );
}
