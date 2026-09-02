// ─── Status Badge Component ───────────────────────────────────────────────────
export default function StatusBadge({ status }) {
  const map = {
    open:        { label: 'Open',         cls: 'badge-solid-emerald' },
    in_progress: { label: 'In Progress',  cls: 'badge-solid-amber'   },
    closed:      { label: 'Closed',       cls: 'badge-solid-rose'    },
    active:      { label: 'Active',       cls: 'badge-solid-emerald' },
    frozen:      { label: 'Frozen',       cls: 'badge-solid-blue'    },
    pending:     { label: 'Pending',      cls: 'badge-solid-amber'   },
    shortlisted: { label: 'Shortlisted',  cls: 'badge-solid-emerald' },
    rejected:    { label: 'Rejected',     cls: 'badge-solid-rose'    },
    approved:    { label: 'Approved',     cls: 'badge-solid-emerald' },
    completed:   { label: 'Completed',    cls: 'badge-solid-emerald' },
    visited:     { label: 'Visited',      cls: 'badge-solid-slate'   },
    upcoming:    { label: 'Upcoming',     cls: 'badge-solid-blue'    },
    cleared:     { label: 'Cleared ✓',   cls: 'badge-solid-emerald' },
  };
  const cfg = map[status] || { label: status, cls: 'badge-solid-slate' };
  return (
    <span className={`${cfg.cls} px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1`}>
      {cfg.label}
    </span>
  );
}
