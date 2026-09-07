import React, { useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout";
import { listCategories, getStats } from "../../services/complaintService";
import { categoryColor } from "../../constants";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listCategories(), getStats()])
      .then(([cats, stats]) => { setCategories(cats); setByCategory(stats.byCategory || {}); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><p className="text-inkSoft text-sm">Loading…</p></AppLayout>;

  return (
    <AppLayout>
      <h1 className="font-display text-2xl text-navy mb-5">Categories</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categories.map((cat) => {
          const color = categoryColor(cat.name);
          const count = byCategory[cat.name] || 0;
          return (
            <div key={cat.id} className="bg-white rounded-xl border border-line p-5 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <span className="w-3 h-3 rounded-full" style={{ background: color }} />
              </div>
              <div>
                <div className="font-semibold text-sm text-ink">{cat.name}</div>
                <div className="text-xs text-inkSoft">{count} complaints</div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
