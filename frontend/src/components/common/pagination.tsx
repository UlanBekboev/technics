"use client";

import { cn } from "@/lib/utils";

export function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const pages: (number | "…")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }
  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium disabled:opacity-40 hover:bg-secondary transition-colors"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        ←
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors px-2",
              p === current
                ? "bg-primary text-primary-foreground"
                : "border hover:bg-secondary"
            )}
            style={p !== current ? { borderColor: "hsl(var(--border))" } : {}}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium disabled:opacity-40 hover:bg-secondary transition-colors"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        →
      </button>
    </div>
  );
}
