"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { STATUS_PTI, ROTULO_STATUS_PTI } from "@/lib/validators/pti";

export function PtiHeader({ ptiId, statusInicial }: { ptiId: string; statusInicial: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(statusInicial);

  async function mudarStatus(novo: string) {
    setStatus(novo);
    await fetch(`/api/pti/${ptiId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: novo }) });
    router.refresh();
  }
  async function excluir() {
    if (!confirm("Excluir este plano terapêutico e todos os seus objetivos?")) return;
    const res = await fetch(`/api/pti/${ptiId}`, { method: "DELETE" });
    if (res.ok) { router.push("/pti"); router.refresh(); }
  }

  return (
    <div className="flex items-center gap-2">
      <select value={status} onChange={(e) => mudarStatus(e.target.value)} className="rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand">
        {STATUS_PTI.map((s) => <option key={s} value={s}>{ROTULO_STATUS_PTI[s]}</option>)}
      </select>
      <button onClick={excluir} aria-label="Excluir PTI" className="grid h-9 w-9 place-items-center rounded-lg border text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
