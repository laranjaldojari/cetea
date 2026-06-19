"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DIAS, MESES, diasDaSemana, gradeDoMes, inicioDaSemana, inicioDoDia,
  mesmasData, horas, comHora, hhmm,
} from "@/lib/date";
import { AppointmentModal, type OpcaoSimples } from "./AppointmentModal";
import { AppointmentDetail, type AgendamentoView } from "./AppointmentDetail";

type Visao = "mes" | "semana" | "dia";

const COR_STATUS: Record<string, string> = {
  AGENDADO: "bg-brand/15 text-brand border-brand/30",
  CONFIRMADO: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  REALIZADO: "bg-zinc-500/15 text-zinc-600 border-zinc-500/30",
  FALTA: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  CANCELADO: "bg-red-500/10 text-red-600 border-red-500/20 line-through opacity-70",
};
const HORAS = horas(7, 19);

export function Calendar({
  pacientes, profissionais, unidadeId, filaEspera,
}: {
  pacientes: OpcaoSimples[];
  profissionais: OpcaoSimples[];
  unidadeId: string;
  filaEspera: OpcaoSimples[];
}) {
  const [visao, setVisao] = useState<Visao>("semana");
  const [cursor, setCursor] = useState(() => new Date());
  const [profFiltro, setProfFiltro] = useState("");
  const [ags, setAgs] = useState<AgendamentoView[]>([]);
  const [criar, setCriar] = useState<Date | null>(null);
  const [detalhe, setDetalhe] = useState<AgendamentoView | null>(null);
  const [carregando, setCarregando] = useState(false);

  const intervalo = useCallback(() => {
    if (visao === "dia") {
      const ini = inicioDoDia(cursor);
      return [ini, new Date(ini.getTime() + 86400000)] as const;
    }
    if (visao === "semana") {
      const ini = inicioDaSemana(cursor);
      return [ini, new Date(ini.getTime() + 7 * 86400000)] as const;
    }
    const grade = gradeDoMes(cursor);
    return [grade[0], new Date(grade[41].getTime() + 86400000)] as const;
  }, [visao, cursor]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [ini, fim] = intervalo();
    const q = new URLSearchParams({ inicio: ini.toISOString(), fim: fim.toISOString() });
    if (profFiltro) q.set("profissionalId", profFiltro);
    const res = await fetch(`/api/agendamentos?${q.toString()}`);
    const j = await res.json().catch(() => ({ agendamentos: [] }));
    setAgs(j.agendamentos ?? []);
    setCarregando(false);
  }, [intervalo, profFiltro]);

  useEffect(() => { carregar(); }, [carregar]);

  function navegar(dir: number) {
    const x = new Date(cursor);
    if (visao === "dia") x.setDate(x.getDate() + dir);
    else if (visao === "semana") x.setDate(x.getDate() + dir * 7);
    else x.setMonth(x.getMonth() + dir);
    setCursor(x);
  }

  async function reagendar(agId: string, novoInicio: Date, duracaoMs: number) {
    const fim = new Date(novoInicio.getTime() + duracaoMs);
    const res = await fetch(`/api/agendamentos/${agId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "reagendar", inicio: novoInicio.toISOString(), fim: fim.toISOString() }),
    });
    if (res.status === 409) alert("Conflito de horário para este profissional.");
    carregar();
  }

  function onDrop(dia: Date, hora: number, e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("agId");
    const dur = Number(e.dataTransfer.getData("dur")) || 3600000;
    if (id) reagendar(id, comHora(dia, hora), dur);
  }

  const titulo =
    visao === "mes"
      ? `${MESES[cursor.getMonth()]} de ${cursor.getFullYear()}`
      : visao === "semana"
      ? (() => { const d = diasDaSemana(cursor); return `${d[0].getDate()}–${d[6].getDate()} ${MESES[d[6].getMonth()]}`; })()
      : `${cursor.getDate()} de ${MESES[cursor.getMonth()]}`;

  return (
    <div className="space-y-4">
      {/* Barra de controle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => navegar(-1)} aria-label="Anterior" className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-surface-2"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCursor(new Date())} className="rounded-lg border px-3 py-2 text-sm hover:bg-surface-2">Hoje</button>
          <button onClick={() => navegar(1)} aria-label="Próximo" className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-surface-2"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <h2 className="text-base font-semibold capitalize">{titulo}</h2>

        <div className="ml-auto flex items-center gap-2">
          <select value={profFiltro} onChange={(e) => setProfFiltro(e.target.value)}
            className="rounded-lg border bg-surface px-2 py-2 text-sm outline-none focus:border-brand">
            <option value="">Todos os profissionais</option>
            {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
          <div className="flex rounded-lg border p-0.5 text-sm">
            {(["mes", "semana", "dia"] as Visao[]).map((v) => (
              <button key={v} onClick={() => setVisao(v)}
                className={cn("rounded-md px-3 py-1.5 capitalize", visao === v ? "bg-brand text-white" : "hover:bg-surface-2")}>
                {v === "mes" ? "Mês" : v}
              </button>
            ))}
          </div>
          <button onClick={() => setCriar(comHora(cursor, 8))}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            <Plus className="h-4 w-4" /> Agendar
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        {/* Calendário */}
        <div className={cn("rounded-xl border bg-surface", carregando && "opacity-60")}>
          {visao === "mes" ? (
            <GradeMes cursor={cursor} ags={ags} onDia={(d) => { setCursor(d); setVisao("dia"); }} onEvento={setDetalhe} />
          ) : (
            <GradeHoras
              dias={visao === "dia" ? [inicioDoDia(cursor)] : diasDaSemana(cursor)}
              ags={ags} onSlot={(d, h) => setCriar(comHora(d, h))} onEvento={setDetalhe} onDrop={onDrop}
            />
          )}
        </div>

        {/* Fila de espera */}
        <aside className="rounded-xl border bg-surface p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4 text-brand-accent" /> Fila de espera</h3>
          <p className="mt-1 text-xs text-ink-soft">{filaEspera.length} aguardando</p>
          <ul className="mt-3 space-y-2">
            {filaEspera.length === 0 && <li className="text-sm text-ink-soft">Ninguém na fila.</li>}
            {filaEspera.map((p) => (
              <li key={p.id}>
                <button onClick={() => setCriar(comHora(cursor, 8))}
                  className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-surface-2">
                  {p.nome}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {criar && (
        <AppointmentModal pacientes={pacientes} profissionais={profissionais} unidadeId={unidadeId}
          inicioSugerido={criar} onClose={() => setCriar(null)} onSalvo={() => { setCriar(null); carregar(); }} />
      )}
      {detalhe && (
        <AppointmentDetail ag={detalhe} onClose={() => setDetalhe(null)}
          onMudou={() => { setDetalhe(null); carregar(); }} />
      )}
    </div>
  );
}

// ---------- Grade por horas (semana / dia) ----------
function GradeHoras({
  dias, ags, onSlot, onEvento, onDrop,
}: {
  dias: Date[];
  ags: AgendamentoView[];
  onSlot: (d: Date, h: number) => void;
  onEvento: (a: AgendamentoView) => void;
  onDrop: (d: Date, h: number, e: React.DragEvent) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Cabeçalho dos dias */}
        <div className="grid border-b" style={{ gridTemplateColumns: `56px repeat(${dias.length}, 1fr)` }}>
          <div />
          {dias.map((d) => {
            const hoje = mesmasData(d, new Date());
            return (
              <div key={d.toISOString()} className={cn("border-l p-2 text-center text-sm", hoje && "text-brand font-semibold")}>
                <div className="text-xs text-ink-soft">{DIAS[(d.getDay() + 6) % 7]}</div>
                <div>{d.getDate()}</div>
              </div>
            );
          })}
        </div>
        {/* Linhas de hora */}
        {HORAS.map((h) => (
          <div key={h} className="grid border-b last:border-0" style={{ gridTemplateColumns: `56px repeat(${dias.length}, 1fr)` }}>
            <div className="p-2 text-right text-xs text-ink-soft">{String(h).padStart(2, "0")}:00</div>
            {dias.map((d) => {
              const eventos = ags.filter((a) => { const i = new Date(a.inicio); return mesmasData(i, d) && i.getHours() === h; });
              return (
                <div key={d.toISOString() + h} onClick={() => onSlot(d, h)}
                  onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(d, h, e)}
                  className="min-h-[52px] border-l p-1 hover:bg-surface-2/60">
                  {eventos.map((a) => (
                    <div key={a.id} draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("agId", a.id);
                        e.dataTransfer.setData("dur", String(new Date(a.fim).getTime() - new Date(a.inicio).getTime()));
                      }}
                      onClick={(e) => { e.stopPropagation(); onEvento(a); }}
                      className={cn("mb-1 cursor-pointer rounded-md border px-2 py-1 text-xs", COR_STATUS[a.status])}>
                      <div className="font-medium truncate">{a.paciente.nomeSocial || a.paciente.nomeCompleto}</div>
                      <div className="opacity-80">{hhmm(new Date(a.inicio))} · {a.tipo.toLowerCase()}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Grade do mês ----------
function GradeMes({
  cursor, ags, onDia, onEvento,
}: {
  cursor: Date;
  ags: AgendamentoView[];
  onDia: (d: Date) => void;
  onEvento: (a: AgendamentoView) => void;
}) {
  const grade = gradeDoMes(cursor);
  return (
    <div>
      <div className="grid grid-cols-7 border-b text-center text-xs text-ink-soft">
        {DIAS.map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {grade.map((d) => {
          const doMes = d.getMonth() === cursor.getMonth();
          const hoje = mesmasData(d, new Date());
          const eventos = ags.filter((a) => mesmasData(new Date(a.inicio), d));
          return (
            <div key={d.toISOString()} onClick={() => onDia(d)}
              className={cn("min-h-[96px] border-b border-l p-1.5 text-sm hover:bg-surface-2/60", !doMes && "bg-surface-2/40 text-ink-soft")}>
              <div className={cn("mb-1 text-right text-xs", hoje && "inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white")}>{d.getDate()}</div>
              <div className="space-y-1">
                {eventos.slice(0, 3).map((a) => (
                  <div key={a.id} onClick={(e) => { e.stopPropagation(); onEvento(a); }}
                    className={cn("truncate rounded px-1.5 py-0.5 text-[11px]", COR_STATUS[a.status])}>
                    {hhmm(new Date(a.inicio))} {a.paciente.nomeSocial || a.paciente.nomeCompleto}
                  </div>
                ))}
                {eventos.length > 3 && <div className="text-[11px] text-ink-soft">+{eventos.length - 3} mais</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
