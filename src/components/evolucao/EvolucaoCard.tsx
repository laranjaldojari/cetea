"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Paperclip } from "lucide-react";
import { formatarData } from "@/lib/utils";

interface Anexo { id: string; nome: string; url: string; tipo: string }
interface Evol {
  id: string; data: string; tipoAtendimento: string | null; evolucao: string;
  intercorrencias: string | null; conduta: string | null;
  profissionalNome: string; autorNome: string; vinculada: boolean; anexos: Anexo[];
}

export function EvolucaoCard({ ev }: { ev: Evol }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [f, setF] = useState({ evolucao: ev.evolucao, intercorrencias: ev.intercorrencias ?? "", conduta: ev.conduta ?? "", tipoAtendimento: ev.tipoAtendimento ?? "" });
  const [ocupado, setOcupado] = useState(false);

  async function salvar() {
    setOcupado(true);
    const res = await fetch(`/api/evolucao/${ev.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setOcupado(false);
    if (res.ok) { setEditando(false); router.refresh(); }
  }
  async function excluir() {
    if (!confirm("Excluir esta evolução?")) return;
    const res = await fetch(`/api/evolucao/${ev.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <article className="rounded-xl border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{formatarData(ev.data)} · {ev.profissionalNome}</p>
          <p className="text-xs text-ink-soft">{ev.tipoAtendimento || "—"}{ev.vinculada ? " · vinculada ao atendimento" : ""}</p>
        </div>
        {!editando && (
          <div className="flex gap-1">
            <button onClick={() => setEditando(true)} aria-label="Editar" className="grid h-8 w-8 place-items-center rounded-lg border hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
            <button onClick={excluir} aria-label="Excluir" className="grid h-8 w-8 place-items-center rounded-lg border text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      {editando ? (
        <div className="mt-3 space-y-2">
          <textarea value={f.evolucao} onChange={(e) => setF({ ...f, evolucao: e.target.value })} rows={4} className={ta} />
          <div className="grid gap-2 sm:grid-cols-2">
            <textarea value={f.intercorrencias} onChange={(e) => setF({ ...f, intercorrencias: e.target.value })} rows={2} placeholder="Intercorrências" className={ta} />
            <textarea value={f.conduta} onChange={(e) => setF({ ...f, conduta: e.target.value })} rows={2} placeholder="Conduta" className={ta} />
          </div>
          <div className="flex gap-2">
            <button onClick={salvar} disabled={ocupado} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">Salvar</button>
            <button onClick={() => setEditando(false)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-surface-2">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-2 text-sm">
          <p className="whitespace-pre-wrap">{ev.evolucao}</p>
          {ev.intercorrencias && <p><span className="text-ink-soft">Intercorrências:</span> {ev.intercorrencias}</p>}
          {ev.conduta && <p><span className="text-ink-soft">Conduta:</span> {ev.conduta}</p>}
          {ev.anexos.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1">
              {ev.anexos.map((a) => (
                <li key={a.id}><a href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-surface-2"><Paperclip className="h-3 w-3" /> {a.nome}</a></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
const ta = "w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
