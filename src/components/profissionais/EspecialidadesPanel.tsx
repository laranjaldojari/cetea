"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface Esp { id: string; nome: string }

export function EspecialidadesPanel({ iniciais }: { iniciais: Esp[] }) {
  const [lista, setLista] = useState<Esp[]>(iniciais);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");

  const ordenar = (l: Esp[]) => [...l].sort((a, b) => a.nome.localeCompare(b.nome));

  async function adicionar() {
    if (nome.trim().length < 2) return;
    setErro(""); setSalvando(true);
    const res = await fetch("/api/especialidades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome }) });
    setSalvando(false);
    if (res.ok) { const j = await res.json(); setLista((l) => ordenar([...l, j.especialidade])); setNome(""); }
    else { const j = await res.json().catch(() => ({})); setErro(j.erro || "Erro ao adicionar."); }
  }

  function iniciarEdicao(e: Esp) { setEditId(e.id); setEditNome(e.nome); setErro(""); }

  async function salvarEdicao(id: string) {
    if (editNome.trim().length < 2) return;
    const res = await fetch(`/api/especialidades/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: editNome }) });
    if (res.ok) { const j = await res.json(); setLista((l) => ordenar(l.map((x) => (x.id === id ? j.especialidade : x)))); setEditId(null); }
    else { const j = await res.json().catch(() => ({})); setErro(j.erro || "Erro ao salvar."); }
  }

  async function excluir(e: Esp) {
    if (!confirm(`Excluir a especialidade "${e.nome}"?`)) return;
    setErro("");
    const res = await fetch(`/api/especialidades/${e.id}`, { method: "DELETE" });
    if (res.ok) setLista((l) => l.filter((x) => x.id !== e.id));
    else { const j = await res.json().catch(() => ({})); setErro(j.erro || "Erro ao excluir."); }
  }

  return (
    <aside className="rounded-xl border bg-surface p-4">
      <h3 className="text-sm font-semibold">Especialidades</h3>
      <p className="mt-1 text-xs text-ink-soft">{lista.length} cadastrada(s)</p>
      <ul className="mt-3 space-y-1 text-sm">
        {lista.map((e) => (
          <li key={e.id} className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1">
            {editId === e.id ? (
              <>
                <input value={editNome} onChange={(ev) => setEditNome(ev.target.value)} onKeyDown={(ev) => ev.key === "Enter" && salvarEdicao(e.id)} autoFocus
                  className="w-full rounded border bg-surface px-1.5 py-0.5 text-sm outline-none focus:border-brand" />
                <button onClick={() => salvarEdicao(e.id)} aria-label="Salvar" className="grid h-6 w-6 place-items-center rounded text-emerald-600 hover:bg-emerald-500/10"><Check className="h-4 w-4" /></button>
                <button onClick={() => setEditId(null)} aria-label="Cancelar" className="grid h-6 w-6 place-items-center rounded text-ink-soft hover:bg-surface"><X className="h-4 w-4" /></button>
              </>
            ) : (
              <>
                <span className="flex-1 truncate">{e.nome}</span>
                <button onClick={() => iniciarEdicao(e)} aria-label="Editar" className="grid h-6 w-6 place-items-center rounded text-ink-soft hover:bg-surface"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => excluir(e)} aria-label="Excluir" className="grid h-6 w-6 place-items-center rounded text-red-600 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
          placeholder="Nova especialidade" className="w-full rounded-lg border bg-surface px-2 py-1.5 text-sm outline-none focus:border-brand" />
        <button onClick={adicionar} disabled={salvando} aria-label="Adicionar" className="grid w-9 place-items-center rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-60"><Plus className="h-4 w-4" /></button>
      </div>
      {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}
    </aside>
  );
}
