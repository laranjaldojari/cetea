import { Users, UserCheck, Clock, CalendarDays, CalendarCheck, Stethoscope, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { obterIndicadores } from "@/server/dashboard";

const ROTULO_NIVEL: Record<string, string> = {
  NIVEL_1: "Nível 1", NIVEL_2: "Nível 2", NIVEL_3: "Nível 3", NAO_AVALIADO: "Não avaliado",
};

export default async function DashboardPage() {
  const i = await obterIndicadores();
  const maxFaixa = Math.max(1, ...i.porFaixaEtaria.map((f) => f.total));
  const maxNivel = Math.max(1, ...i.porNivelSuporte.map((n) => n.total));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-ink-soft">Indicadores assistenciais do mês corrente.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pacientes cadastrados" valor={i.totalPacientes} icon={Users} />
        <StatCard label="Pacientes ativos" valor={i.ativos} icon={UserCheck} />
        <StatCard label="Fila de espera" valor={i.filaEspera} icon={Clock} />
        <StatCard label="Profissionais ativos" valor={i.profissionaisAtivos} icon={Stethoscope} />
        <StatCard label="Consultas agendadas" valor={i.agendadas} sub="no mês" icon={CalendarDays} />
        <StatCard label="Consultas realizadas" valor={i.realizadas} sub="no mês" icon={CalendarCheck} />
        <StatCard label="Taxa de absenteísmo" valor={`${i.absenteismo}%`} sub="faltas / concluídas" icon={TrendingDown} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-surface p-4">
          <h2 className="text-sm font-medium">Pacientes por faixa etária</h2>
          <ul className="mt-4 space-y-3">
            {i.porFaixaEtaria.map((f) => (
              <li key={f.faixa} className="flex items-center gap-3 text-sm">
                <span className="w-14 text-ink-soft">{f.faixa}</span>
                <div className="h-2.5 flex-1 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(f.total / maxFaixa) * 100}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums">{f.total}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-surface p-4">
          <h2 className="text-sm font-medium">Pacientes por nível de suporte</h2>
          <ul className="mt-4 space-y-3">
            {i.porNivelSuporte.map((n) => (
              <li key={n.nivel} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-ink-soft">{ROTULO_NIVEL[n.nivel]}</span>
                <div className="h-2.5 flex-1 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-brand-accent" style={{ width: `${(n.total / maxNivel) * 100}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums">{n.total}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
