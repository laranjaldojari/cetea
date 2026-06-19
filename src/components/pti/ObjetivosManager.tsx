"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatarData } from "@/lib/utils";

interface Objetivo {
  id: string; descricao: string; meta: string | null; estrategias: string | null;
  responsavel: string | null; prazo: string | null; percentualExecucao: number;
}

const campoVazio = { descricao: "", meta: "", estrategias: "", responsavel: "", prazo: "", percentualExecucao: 0 };

export function ObjetivosManager({ ptiId, iniciais }: { ptiId: string; iniciais: Objetivo[] }) {
  const router = useRouter();
  const [objetivos, setObjetivos] = useState<Objetivo[]>(iniciais);
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState<any>({ ...campoVazio });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const refresh = () => router.refresh();

  async function adicionar() {
    if (form.descricao.trim() === "") return;
    const res = await fetch(`/api/pti/${ptiId}/objetivos`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { const j = await res.json(); setObjetivos((a) => [...a, j.objetivo]); setForm({ ...campoVazio }); setNovo(false); refresh(); }
  }

  async function patch(id: string, dados: Partial<Objetivo>) {
    const res = await fetch(`/api/pti/objetivos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) });
    if (res.ok) refresh();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este objetivo?")) return;
    const res = await fetch(`/api/pti/objetivos/${id}`, { method: "DELETE" });
    if (res.ok) { setObjetivos((a) => a.filter((o) => o.id !== id)); refresh(); }
  }

  function setLocal(id: string, k: keyof Objetivo, v: any) {
    setObjetivos((a) => a.map((o) => (o.id === id ? { ...o, [k]: v } : o)));
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Objetivos e metas</h2>
        {!novo && <button onClick={() => setNovo(true)} className="flex items-center gap-1.5 text-sm text-brand hover:underline"><Plus className="h-4 w-4" /> Adicionar objetivo</button>}
      </div>

      {novo && (
        <div className="rounded-xl border bg-surface p-4 space-y-3">
          <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Objetivo *" className={inp} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="Meta" className={inp} />
            <input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Responsável" className={inp} />
            <input value={form.estrategias} onChange={(e) => setForm({ ...form, estrategias: e.target.value })} placeholder="Estratégias" className={inp} />
            <input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} className={inp} />
          </div>
          <div className="flex gap-2">
            <button onClick={adicionar} className={btnPrim}>Adicionar</button>
            <button onClick={() => { setNovo(false); setForm({ ...campoVazio }); }} className={btnSec}>Cancelar</button>
          </div>
        </div>
      )}

      {objetivos.length === 0 && !novo && <p className="text-sm text-ink-soft">Nenhum objetivo definido.</p>}

      {objetivos.map((o) => (
        <div key={o.id} className="rounded-xl border bg-surface p-4">
          {editandoId === o.id ? (
            <div className="space-y-3">
              <input value={o.descricao} onChange={(e) => setLocal(o.id, "descricao", e.target.value)} className={inp} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={o.meta ?? ""} onChange={(e) => setLocal(o.id, "meta", e.target.value)} placeholder="Meta" className={inp} />
                <input value={o.responsavel ?? ""} onChange={(e) => setLocal(o.id, "responsavel", e.target.value)} placeholder="Responsável" className={inp} />
                <input value={o.estrategias ?? ""} onChange={(e) => setLocal(o.id, "estrategias", e.target.value)} placeholder="Estratégias" className={inp} />
                <input type="date" value={o.prazo ? o.prazo.slice(0, 10) : ""} onChange={(e) => setLocal(o.id, "prazo", e.target.value)} className={inp} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { patch(o.id, { descricao: o.descricao, meta: o.meta, estrategias: o.estrategias, responsavel: o.responsavel, prazo: o.prazo }); setEditandoId(null); }} className={btnPrim}>Salvar</button>
                <button onClick={() => { setEditandoId(null); refresh(); }} className={btnSec}>Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{o.descricao}</p>
                  {o.meta && <p className="text-sm text-ink-soft">Meta: {o.meta}</p>}
                  {o.estrategias && <p className="text-sm text-ink-soft">Estratégias: {o.estrategias}</p>}
                  <p className="mt-1 text-xs text-ink-soft">{[o.responsavel, o.prazo ? `prazo ${formatarData(o.prazo)}` : null].filter(Boolean).join(" · ") || "—"}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditandoId(o.id)} aria-label="Editar" className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => excluir(o.id)} aria-label="Excluir" className="grid h-8 w-8 place-items-center rounded-lg border text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-ink-soft"><span>Execução</span><span className="tabular-nums">{o.percentualExecucao}%</span></div>
                <input type="range" min={0} max={100} step={5} value={o.percentualExecucao}
                  onChange={(e) => setLocal(o.id, "percentualExecucao", Number(e.target.value))}
                  onMouseUp={(e) => patch(o.id, { percentualExecucao: Number((e.target as HTMLInputElement).value) })}
                  onTouchEnd={(e) => patch(o.id, { percentualExecucao: Number((e.target as HTMLInputElement).value) })}
                  className="mt-1 w-full accent-brand" />
                <div className="mt-1 h-1.5 rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand" style={{ width: `${o.percentualExecucao}%` }} /></div>
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}

const inp = "w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
const btnPrim = "rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark";
const btnSec = "rounded-lg border px-3 py-1.5 text-sm hover:bg-surface-2";
