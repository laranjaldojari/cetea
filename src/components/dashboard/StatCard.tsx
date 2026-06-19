import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, valor, sub, icon: Icon,
}: { label: string; valor: string | number; sub?: string; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border bg-surface p-4">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-soft">{label}</p>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{valor}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
