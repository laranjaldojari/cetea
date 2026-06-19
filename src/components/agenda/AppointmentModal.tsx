"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { paraInputLocal } from "@/lib/date";
import { TIPOS } from "@/lib/validators/agendamento";

const ROTULO_TIPO: Record<string, string> = {
  CONSULTA: "Consulta", AVALIACAO: "Avaliação", REAVALIACAO: "Reavaliação", TERAPIA: "Terapia",
};

export interface OpcaoSimples { id: string; nome: string; }

export function AppointmentModal({
  pacientes, profissionais, unidadeId, inicioSugerido, onClose, onSalvo,
}: {
  pacientes: OpcaoSimples[];
  profissionais: OpcaoSimples[];
  unidadeId: string;
  inicioSugerido: Date;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const fimSugerido = new Date(inicioSugerido.getTime() + 60 * 60 * 1000);
  const [form, setForm] = useState({
    pacienteId: "", profissionalId: "", tipo: "CONSULTA",
    inicio: paraInputLocal(inicioSugerido), fim: paraInputLocal(fimSugerido), observacao: "",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(""); setSalvando(true);
    const res = await fetch("/api/agendamentos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, unidadeId, inicio: new Date(form.inicio).toISOString(), fim: new Date(form.fim).toISOString() }),
    });
    setSalvando(false);
    if (res.ok) { onSalvo(); return; }
    const j = await res.json().catch(() => ({}));
    setErro(res.status === 409 ? "Conflito de horário para este profissional." : j.erro || "Não foi possível salvar.");
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Novo agendamento</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-ink-soft hover:text-ink"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-ink-soft">Paciente</span>
            <select value={form.pacienteId} onChange={(e) => set("pacienteId", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 outline-none focus:border-brand">
              <option value="">Selecione…</option>
              {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-ink-soft">Profissional</span>
            <select value={form.profissionalId} onChange={(e) => set("profissionalId", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 outline-none focus:border-brand">
              <option value="">Selecione…</option>
              {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-ink-soft">Tipo</span>
            <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}
              className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 outline-none focus:border-brand">
              {TIPOS.map((t) => <option key={t} value={t}>{ROTULO_TIPO[t]}</option>)}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-ink-soft">Início</span>
              <input type="datetime-local" value={form.inicio} onChange={(e) => set("inicio", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 outline-none focus:border-brand" />
            </label>
            <label className="block">
              <span className="text-ink-soft">Fim</span>
              <input type="datetime-local" value={form.fim} onChange={(e) => set("fim", e.target.value)}
                className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 outline-none focus:border-brand" />
            </label>
          </div>

          <label className="block">
            <span className="text-ink-soft">Observação</span>
            <textarea value={form.observacao} onChange={(e) => set("observacao", e.target.value)} rows={2}
              className="mt-1 w-full rounded-lg border bg-surface px-3 py-2 outline-none focus:border-brand" />
          </label>

          {erro && <p className="text-red-600" role="alert">{erro}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="rounded-lg border px-3 py-2 hover:bg-surface-2">Cancelar</button>
            <button onClick={salvar} disabled={salvando}
              className="rounded-lg bg-brand px-3 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60">
              {salvando ? "Salvando…" : "Agendar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
