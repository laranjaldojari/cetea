"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_PTI, ROTULO_STATUS_PTI } from "@/lib/validators/pti";

export function NovoPtiForm({ pacientes }: { pacientes: { id: string; nome: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ pacienteId: "", titulo: "", status: "EM_ELABORACAO", inicio: "", prazo: "" });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function salvar() {
    if (!f.pacienteId || f.titulo.trim().length < 2) { setErro("Selecione o paciente e informe um título."); return; }
    setErro(""); setSalvando(true);
    const res = await fetch("/api/pti", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setSalvando(false);
    if (res.ok) { const j = await res.json(); router.push(`/pti/${j.pti.id}`); router.refresh(); }
    else setErro("Não foi possível criar o plano.");
  }

  return (
    <div className="rounded-xl border bg-surface p-4 space-y-3">
      <label className="block text-sm"><span className="text-ink-soft">Paciente *</span>
        <select value={f.pacienteId} onChange={(e) => set("pacienteId", e.target.value)} className={inp}>
          <option value="">Selecione…</option>
          {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select></label>
      <label className="block text-sm"><span className="text-ink-soft">Título *</span>
        <input value={f.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="ex.: PTI 2026 — comunicação e autonomia" className={inp} /></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm"><span className="text-ink-soft">Status</span>
          <select value={f.status} onChange={(e) => set("status", e.target.value)} className={inp}>
            {STATUS_PTI.map((s) => <option key={s} value={s}>{ROTULO_STATUS_PTI[s]}</option>)}
          </select></label>
        <label className="block text-sm"><span className="text-ink-soft">Início</span>
          <input type="date" value={f.inicio} onChange={(e) => set("inicio", e.target.value)} className={inp} /></label>
        <label className="block text-sm"><span className="text-ink-soft">Prazo</span>
          <input type="date" value={f.prazo} onChange={(e) => set("prazo", e.target.value)} className={inp} /></label>
      </div>
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={() => router.back()} className="rounded-lg border px-4 py-2 text-sm hover:bg-surface-2">Cancelar</button>
        <button onClick={salvar} disabled={salvando} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">{salvando ? "Criando…" : "Criar plano"}</button>
      </div>
    </div>
  );
}
const inp = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
