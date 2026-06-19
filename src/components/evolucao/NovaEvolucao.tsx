"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { TIPOS_DOC } from "@/lib/validators/evolucao";
import { paraInputLocal } from "@/lib/date";

interface Opcao { id: string; nome: string }
interface AgendamentoOpc { id: string; label: string; tipo: string }
interface Anexo { tipo: string; nome: string; url: string }

export function NovaEvolucao({
  pacienteId, profissionais, agendamentos,
}: { pacienteId: string; profissionais: Opcao[]; agendamentos: AgendamentoOpc[] }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState({
    profissionalId: "", agendamentoId: "", data: paraInputLocal(new Date()),
    tipoAtendimento: "", evolucao: "", intercorrencias: "", conduta: "",
  });
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  function vincular(id: string) {
    const ag = agendamentos.find((a) => a.id === id);
    setF((p) => ({ ...p, agendamentoId: id, tipoAtendimento: ag ? ag.tipo : p.tipoAtendimento }));
  }

  async function salvar() {
    if (!f.profissionalId || f.evolucao.trim() === "") { setErro("Informe o profissional e a evolução."); return; }
    setErro(""); setSalvando(true);
    const res = await fetch("/api/evolucao", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pacienteId, ...f,
        data: f.data ? new Date(f.data).toISOString() : undefined,
        anexos: anexos.filter((a) => a.nome && a.url),
      }),
    });
    setSalvando(false);
    if (res.ok) { setAberto(false); router.refresh(); return; }
    const j = await res.json().catch(() => ({}));
    setErro(j.erro || "Não foi possível salvar.");
  }

  if (!aberto) {
    return <button onClick={() => setAberto(true)} className="flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"><Plus className="h-4 w-4" /> Registrar sessão</button>;
  }

  return (
    <div className="rounded-xl border bg-surface p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="text-ink-soft">Profissional *</span>
          <select value={f.profissionalId} onChange={(e) => set("profissionalId", e.target.value)} className={inp}>
            <option value="">Selecione…</option>
            {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select></label>
        <label className="block text-sm"><span className="text-ink-soft">Data e hora</span>
          <input type="datetime-local" value={f.data} onChange={(e) => set("data", e.target.value)} className={inp} /></label>
        <label className="block text-sm"><span className="text-ink-soft">Vincular a atendimento (opcional)</span>
          <select value={f.agendamentoId} onChange={(e) => vincular(e.target.value)} className={inp}>
            <option value="">Sem vínculo</option>
            {agendamentos.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select></label>
        <label className="block text-sm"><span className="text-ink-soft">Tipo de atendimento</span>
          <input value={f.tipoAtendimento} onChange={(e) => set("tipoAtendimento", e.target.value)} className={inp} placeholder="ex.: Terapia ocupacional" /></label>
      </div>

      <label className="block text-sm"><span className="text-ink-soft">Evolução *</span>
        <textarea value={f.evolucao} onChange={(e) => set("evolucao", e.target.value)} rows={4} className={inp} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm"><span className="text-ink-soft">Intercorrências</span>
          <textarea value={f.intercorrencias} onChange={(e) => set("intercorrencias", e.target.value)} rows={2} className={inp} /></label>
        <label className="block text-sm"><span className="text-ink-soft">Conduta</span>
          <textarea value={f.conduta} onChange={(e) => set("conduta", e.target.value)} rows={2} className={inp} /></label>
      </div>

      {/* Anexos (por URL nesta fase) */}
      <div>
        <p className="text-sm text-ink-soft">Anexos</p>
        <div className="mt-1 space-y-2">
          {anexos.map((a, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <select value={a.tipo} onChange={(e) => setAnexos((arr) => arr.map((x, j) => j === i ? { ...x, tipo: e.target.value } : x))} className="rounded-lg border bg-surface px-2 py-2 text-sm">
                {TIPOS_DOC.map((t) => <option key={t} value={t}>{t.toLowerCase()}</option>)}
              </select>
              <input placeholder="Nome" value={a.nome} onChange={(e) => setAnexos((arr) => arr.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))} className="flex-1 rounded-lg border bg-surface px-2 py-2 text-sm" />
              <input placeholder="URL" value={a.url} onChange={(e) => setAnexos((arr) => arr.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} className="flex-1 rounded-lg border bg-surface px-2 py-2 text-sm" />
              <button onClick={() => setAnexos((arr) => arr.filter((_, j) => j !== i))} className="grid w-9 place-items-center rounded-lg border text-ink-soft hover:bg-surface-2"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={() => setAnexos((a) => [...a, { tipo: "OUTRO", nome: "", url: "" }])} className="flex items-center gap-1.5 text-sm text-brand hover:underline"><Plus className="h-4 w-4" /> Adicionar anexo</button>
        </div>
        <p className="mt-1 text-xs text-ink-soft">Upload de arquivos (fotos/documentos) chega na fase de Documentos; por ora, informe a URL.</p>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex gap-2">
        <button onClick={salvar} disabled={salvando} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">{salvando ? "Salvando…" : "Salvar evolução"}</button>
        <button onClick={() => setAberto(false)} className="rounded-lg border px-3 py-2 text-sm hover:bg-surface-2">Cancelar</button>
      </div>
    </div>
  );
}
const inp = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
