import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { categoryColor } from "../constants";

export default function ComplaintCard({ complaint, to }) {
  const c = complaint;
  const color = categoryColor(c.categories?.name || c.category);
  const categoryName = c.categories?.name || c.category || "Other";

  return (
    <Link
      to={to}
      className="flex items-center gap-3.5 p-3.5 rounded-xl border border-line bg-white mb-2.5 hover:border-amber hover:shadow-sm transition-all"
    >
      {c.image_url ? (
        <img src={c.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <MoreHorizontal size={18} color={color} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-ink truncate">{c.title}</div>
        <div className="text-xs text-inkSoft mt-0.5">
          {(c.id || "").toString().slice(0, 8)} · {categoryName} · {new Date(c.created_at || c.date).toLocaleDateString()}
        </div>
      </div>
      <StatusBadge status={c.status} />
      <ChevronRight size={18} className="text-inkSoft hidden sm:block" />
    </Link>
  );
}
