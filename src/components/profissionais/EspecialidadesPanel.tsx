"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

export function EspecialidadesPanel({ iniciais }: { iniciais: { id: string; nome: string }[] }) {
  const [lista, setLista] = useState(iniciais);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function adicionar() {
    if (nome.trim().length < 2) return;
    setErro(""); setSalvando(true);
    const res = await fetch("/api/especialidades", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome }),
    });
    setSalvando(false);
    if (res.ok) { const j = await res.json(); setLista((l) => [...l, j.especialidade].sort((a, b) => a.nome.localeCompare(b.nome))); setNome(""); }
    else { const j = await res.json().catch(() => ({})); setErro(j.erro || "Erro ao adicionar."); }
  }

  return (
    <aside className="rounded-xl border bg-surface p-4">
      <h3 className="text-sm font-semibold">Especialidades</h3>
      <p className="mt-1 text-xs text-ink-soft">{lista.length} cadastrada(s)</p>
      <ul className="mt-3 space-y-1 text-sm">
        {lista.map((e) => <li key={e.id} className="rounded-md bg-surface-2 px-2 py-1">{e.nome}</li>)}
      </ul>
      <div className="mt-3 flex gap-2">
        <input value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Nova especialidade" className="w-full rounded-lg border bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand" />
        <button onClick={adicionar} disabled={salvando} aria-label="Adicionar"
          className="grid w-9 place-items-center rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-60"><Plus className="h-4 w-4" /></button>
      </div>
      {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}
    </aside>
  );
}
