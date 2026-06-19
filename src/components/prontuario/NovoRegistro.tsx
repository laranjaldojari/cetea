"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { TIPOS_REGISTRO, ROTULO_TIPO_REGISTRO } from "@/lib/validators/prontuario";

export function NovoRegistro({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<string>("EVOLUCAO");
  const [conteudo, setConteudo] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(assinarDepois: boolean) {
    if (conteudo.trim() === "") { setErro("Escreva o conteúdo."); return; }
    setErro(""); setSalvando(true);
    const res = await fetch("/api/prontuario", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pacienteId, tipo, conteudo }),
    });
    if (!res.ok) { setSalvando(false); setErro("Não foi possível salvar."); return; }
    const j = await res.json();
    if (assinarDepois) await fetch(`/api/prontuario/${j.registro.id}/assinar`, { method: "POST" });
    setSalvando(false); setConteudo(""); setAberto(false); router.refresh();
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        <Plus className="h-4 w-4" /> Novo registro
      </button>
    );
  }

  return (
    <div className="rounded-xl border bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
        <label className="block text-sm">
          <span className="text-ink-soft">Tipo</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand">
            {TIPOS_REGISTRO.map((t) => <option key={t} value={t}>{ROTULO_TIPO_REGISTRO[t]}</option>)}
          </select>
        </label>
      </div>
      <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={6} placeholder="Conteúdo do registro…"
        className="mt-3 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand" />
      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => salvar(false)} disabled={salvando} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">Salvar rascunho</button>
        <button onClick={() => salvar(true)} disabled={salvando} className="rounded-lg border px-3 py-2 text-sm hover:bg-surface-2">Salvar e assinar</button>
        <button onClick={() => { setAberto(false); setConteudo(""); }} className="rounded-lg border px-3 py-2 text-sm hover:bg-surface-2">Cancelar</button>
      </div>
    </div>
  );
}
