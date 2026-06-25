"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { GRUPOS_REGISTRO, ROTULO_TIPO_REGISTRO, TIPOS_ESTRUTURADOS } from "@/lib/validators/prontuario";
import { CamposEstruturados, comporConteudo, VAZIO } from "./estruturado";

const ehEstruturado = (t: string) => (TIPOS_ESTRUTURADOS as readonly string[]).includes(t);

export function NovoRegistro({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState("EVOLUCAO");
  const [conteudo, setConteudo] = useState("");
  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function trocarTipo(novo: string) {
    setTipo(novo);
    setErro("");
    setDados(ehEstruturado(novo) ? VAZIO[novo] : null);
  }

  async function salvar(assinar: boolean) {
    const estruturado = ehEstruturado(tipo);
    const texto = estruturado ? comporConteudo(tipo, dados) : conteudo;
    if (!texto.trim() || (estruturado && texto.split("\n").length < 3)) { setErro("Preencha o conteúdo do registro."); return; }
    setErro(""); setSalvando(true);
    const res = await fetch("/api/prontuario", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pacienteId, tipo, conteudo: texto, ...(estruturado ? { dados } : {}) }),
    });
    if (!res.ok) { setSalvando(false); const j = await res.json().catch(() => ({})); setErro(j.erro || "Não foi possível salvar."); return; }
    const j = await res.json();
    if (assinar) await fetch(`/api/prontuario/${j.registro.id}/assinar`, { method: "POST" });
    setSalvando(false); setConteudo(""); setDados(null); setAberto(false); router.refresh();
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
        <Plus className="h-4 w-4" /> Novo registro
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border bg-surface p-4">
      <label className="block max-w-xs text-sm">
        <span className="text-ink-soft">Tipo de registro</span>
        <select value={tipo} onChange={(e) => trocarTipo(e.target.value)} className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand">
          {GRUPOS_REGISTRO.map((g) => (
            <optgroup key={g.grupo} label={g.grupo}>
              {g.tipos.map((t) => <option key={t} value={t}>{ROTULO_TIPO_REGISTRO[t]}</option>)}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="mt-3">
        {ehEstruturado(tipo) ? (
          <CamposEstruturados tipo={tipo} dados={dados} setDados={setDados} />
        ) : (
          <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={7} placeholder="Conteúdo do registro…"
            className="w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand" />
        )}
      </div>

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => salvar(false)} disabled={salvando} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">Salvar rascunho</button>
        <button onClick={() => salvar(true)} disabled={salvando} className="rounded-lg border px-3 py-2 text-sm hover:bg-surface-2">Salvar e assinar</button>
        <button onClick={() => { setAberto(false); setConteudo(""); setDados(null); setErro(""); }} className="rounded-lg border px-3 py-2 text-sm hover:bg-surface-2">Cancelar</button>
      </div>
    </div>
  );
}
