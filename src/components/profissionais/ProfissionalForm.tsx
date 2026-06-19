"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { DIAS_CLINICA } from "@/lib/validators/profissional";

interface Janela { diaSemana: number; horaInicio: string; horaFim: string; }
interface Opcao { id: string; nome: string; }

export function ProfissionalForm({
  inicial, especialidades, unidades,
}: {
  inicial?: any;
  especialidades: Opcao[];
  unidades: Opcao[];
}) {
  const router = useRouter();
  const ehEdicao = Boolean(inicial?.id);

  const [f, setF] = useState({
    nome: inicial?.nome ?? "",
    cpf: inicial?.cpf ?? "",
    conselho: inicial?.conselho ?? "",
    numeroRegistro: inicial?.numeroRegistro ?? "",
    especialidadeId: inicial?.especialidadeId ?? "",
    cargaHorariaSemanal: inicial?.cargaHorariaSemanal?.toString() ?? "",
    unidadeId: inicial?.unidadeId ?? "",
    ativo: inicial?.ativo ?? true,
  });
  const [janelas, setJanelas] = useState<Janela[]>(
    (inicial?.agendaSemanal ?? []).map((j: any) => ({ diaSemana: j.diaSemana, horaInicio: j.horaInicio, horaFim: j.horaFim })),
  );
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));
  const addJanela = (dia: number) => setJanelas((a) => [...a, { diaSemana: dia, horaInicio: "08:00", horaFim: "12:00" }]);
  const setJanela = (idx: number, k: keyof Janela, v: string) =>
    setJanelas((a) => a.map((j, i) => (i === idx ? { ...j, [k]: v } : j)));
  const delJanela = (idx: number) => setJanelas((a) => a.filter((_, i) => i !== idx));

  async function salvar() {
    setErro(""); setSalvando(true);
    const payload = {
      ...f,
      cargaHorariaSemanal: f.cargaHorariaSemanal === "" ? undefined : Number(f.cargaHorariaSemanal),
      agendaSemanal: janelas,
    };
    const url = ehEdicao ? `/api/profissionais/${inicial.id}` : "/api/profissionais";
    const res = await fetch(url, {
      method: ehEdicao ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSalvando(false);
    if (res.ok) { router.push("/profissionais"); router.refresh(); return; }
    const j = await res.json().catch(() => ({}));
    setErro(j.erro || "Não foi possível salvar. Verifique os campos.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-surface p-4">
        <h2 className="mb-4 text-sm font-semibold">Dados do profissional</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm md:col-span-2"><span className="text-ink-soft">Nome *</span>
            <input value={f.nome} onChange={(e) => set("nome", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">CPF *</span>
            <input value={f.cpf} onChange={(e) => set("cpf", e.target.value.replace(/\D/g, ""))} maxLength={11} className={inputCls} placeholder="somente números" /></label>
          <label className="block text-sm"><span className="text-ink-soft">Conselho</span>
            <input value={f.conselho} onChange={(e) => set("conselho", e.target.value)} className={inputCls} placeholder="CRM, CRP, CREFITO…" /></label>
          <label className="block text-sm"><span className="text-ink-soft">Nº de registro</span>
            <input value={f.numeroRegistro} onChange={(e) => set("numeroRegistro", e.target.value)} className={inputCls} /></label>
          <label className="block text-sm"><span className="text-ink-soft">Especialidade</span>
            <select value={f.especialidadeId} onChange={(e) => set("especialidadeId", e.target.value)} className={inputCls}>
              <option value="">—</option>
              {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select></label>
          <label className="block text-sm"><span className="text-ink-soft">Carga horária semanal</span>
            <input type="number" min={0} max={80} value={f.cargaHorariaSemanal} onChange={(e) => set("cargaHorariaSemanal", e.target.value)} className={inputCls} placeholder="horas" /></label>
          <label className="block text-sm"><span className="text-ink-soft">Unidade</span>
            <select value={f.unidadeId} onChange={(e) => set("unidadeId", e.target.value)} className={inputCls}>
              <option value="">—</option>
              {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select></label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" checked={f.ativo} onChange={(e) => set("ativo", e.target.checked)} /> Profissional ativo
          </label>
        </div>
      </section>

      {/* Agenda semanal */}
      <section className="rounded-xl border bg-surface p-4">
        <h2 className="mb-1 text-sm font-semibold">Agenda semanal</h2>
        <p className="mb-4 text-xs text-ink-soft">Defina as janelas de disponibilidade. Elas orientam o agendamento na Agenda.</p>
        <div className="space-y-3">
          {DIAS_CLINICA.map((dia) => {
            const doDia = janelas.map((j, idx) => ({ j, idx })).filter(({ j }) => j.diaSemana === dia.v);
            return (
              <div key={dia.v} className="flex flex-wrap items-center gap-2 border-b pb-3 last:border-0">
                <span className="w-20 text-sm font-medium">{dia.nome}</span>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {doDia.length === 0 && <span className="text-sm text-ink-soft">Indisponível</span>}
                  {doDia.map(({ j, idx }) => (
                    <div key={idx} className="flex items-center gap-1 rounded-lg border px-2 py-1">
                      <input type="time" value={j.horaInicio} onChange={(e) => setJanela(idx, "horaInicio", e.target.value)} className="bg-transparent text-sm outline-none" />
                      <span className="text-ink-soft">–</span>
                      <input type="time" value={j.horaFim} onChange={(e) => setJanela(idx, "horaFim", e.target.value)} className="bg-transparent text-sm outline-none" />
                      <button type="button" onClick={() => delJanela(idx)} aria-label="Remover janela" className="ml-1 text-ink-soft hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addJanela(dia.v)} className="flex items-center gap-1 text-sm text-brand hover:underline"><Plus className="h-3.5 w-3.5" /> Janela</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {erro && <p className="text-sm text-red-600" role="alert">{erro}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="rounded-lg border px-4 py-2 text-sm hover:bg-surface-2">Cancelar</button>
        <button type="button" onClick={salvar} disabled={salvando} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
          {salvando ? "Salvando…" : ehEdicao ? "Salvar alterações" : "Cadastrar profissional"}
        </button>
      </div>
    </div>
  );
}

const inputCls = "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";
