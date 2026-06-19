"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { formatarData } from "@/lib/utils";

interface Reav { id: string; resumo: string; data: string }

export function ReavaliacoesPanel({ ptiId, iniciais }: { ptiId: string; iniciais: Reav[] }) {
  const router = useRouter();
  const [lista, setLista] = useState<Reav[]>(iniciais);
  const [aberto, setAberto] = useState(false);
  const [resumo, setResumo] = useState("");

  async function adicionar() {
    if (resumo.trim() === "") return;
    const res = await fetch(`/api/pti/${ptiId}/reavaliacoes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumo }) });
    if (res.ok) { const j = await res.json(); setLista((a) => [{ id: j.reavaliacao.id, resumo, data: j.reavaliacao.data }, ...a]); setResumo(""); setAberto(false); router.refresh(); }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Reavaliações</h2>
        {!aberto && <button onClick={() => setAberto(true)} className="flex items-center gap-1.5 text-sm text-brand hover:underline"><Plus className="h-4 w-4" /> Nova reavaliação</button>}
      </div>
      {aberto && (
        <div className="rounded-xl border bg-surface p-4">
          <textarea value={resumo} onChange={(e) => setResumo(e.target.value)} rows={4} placeholder="Resumo da reavaliação…" className="w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand" />
          <div className="mt-2 flex gap-2">
            <button onClick={adicionar} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">Salvar</button>
            <button onClick={() => { setAberto(false); setResumo(""); }} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-surface-2">Cancelar</button>
          </div>
        </div>
      )}
      {lista.length === 0 && !aberto ? (
        <p className="text-sm text-ink-soft">Nenhuma reavaliação registrada.</p>
      ) : lista.map((r) => (
        <div key={r.id} className="rounded-xl border bg-surface p-4">
          <p className="text-xs text-ink-soft">{formatarData(r.data)}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{r.resumo}</p>
        </div>
      ))}
    </section>
  );
}
