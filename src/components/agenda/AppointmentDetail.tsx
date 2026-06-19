"use client";
import { useState } from "react";
import { X, Check, CalendarCheck, UserX, Ban } from "lucide-react";
import { hhmm } from "@/lib/date";

export interface AgendamentoView {
  id: string;
  tipo: string;
  status: string;
  inicio: string;
  fim: string;
  observacao?: string | null;
  paciente: { nomeCompleto: string; nomeSocial?: string | null };
  profissional: { nome: string };
}

const ROTULO_STATUS: Record<string, string> = {
  AGENDADO: "Agendado", CONFIRMADO: "Confirmado", REALIZADO: "Realizado", FALTA: "Falta", CANCELADO: "Cancelado",
};

export function AppointmentDetail({
  ag, onClose, onMudou,
}: { ag: AgendamentoView; onClose: () => void; onMudou: () => void }) {
  const [carregando, setCarregando] = useState(false);
  const encerrado = ag.status === "REALIZADO" || ag.status === "CANCELADO";

  async function executar(acao: string, extra: Record<string, unknown> = {}) {
    setCarregando(true);
    const res = await fetch(`/api/agendamentos/${ag.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao, ...extra }),
    });
    setCarregando(false);
    if (res.ok) onMudou();
  }

  function cancelar() {
    const motivo = window.prompt("Motivo do cancelamento (opcional):") ?? "";
    executar("cancelar", { motivoCancelamento: motivo });
  }

  const inicio = new Date(ag.inicio);
  const fim = new Date(ag.fim);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
            {ROTULO_STATUS[ag.status]}
          </span>
          <button onClick={onClose} aria-label="Fechar" className="text-ink-soft hover:text-ink"><X className="h-5 w-5" /></button>
        </div>

        <h2 className="font-semibold">{ag.paciente.nomeSocial || ag.paciente.nomeCompleto}</h2>
        <p className="mt-1 text-sm text-ink-soft">{ag.tipo.toLowerCase()} · {ag.profissional.nome}</p>
        <p className="mt-2 text-sm">
          {inicio.toLocaleDateString("pt-BR")} · {hhmm(inicio)}–{hhmm(fim)}
        </p>
        {ag.observacao && <p className="mt-2 rounded-lg bg-surface-2 p-2 text-sm text-ink-soft">{ag.observacao}</p>}

        {!encerrado && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {ag.status === "AGENDADO" && (
              <button disabled={carregando} onClick={() => executar("confirmar")}
                className="flex items-center justify-center gap-1.5 rounded-lg border py-2 hover:bg-surface-2">
                <Check className="h-4 w-4" /> Confirmar
              </button>
            )}
            <button disabled={carregando} onClick={() => executar("realizar")}
              className="flex items-center justify-center gap-1.5 rounded-lg border py-2 hover:bg-surface-2">
              <CalendarCheck className="h-4 w-4" /> Realizado
            </button>
            <button disabled={carregando} onClick={() => executar("falta")}
              className="flex items-center justify-center gap-1.5 rounded-lg border py-2 hover:bg-surface-2">
              <UserX className="h-4 w-4" /> Falta
            </button>
            <button disabled={carregando} onClick={cancelar}
              className="flex items-center justify-center gap-1.5 rounded-lg border py-2 text-red-600 hover:bg-red-500/10">
              <Ban className="h-4 w-4" /> Cancelar
            </button>
          </div>
        )}
        <p className="mt-3 text-xs text-ink-soft">Dica: arraste o evento na grade para reagendar.</p>
      </div>
    </div>
  );
}
