import Link from "next/link";
import { Download, Printer } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { relatorioPacientes, relatorioAtendimentos, indicadoresTEA, type FiltroRelatorio } from "@/server/relatorios";
import { ROTULO_STATUS_PTI } from "@/lib/validators/pti";

export const dynamic = "force-dynamic";

const ROTULO_NIVEL: Record<string, string> = { NIVEL_1: "Nível 1", NIVEL_2: "Nível 2", NIVEL_3: "Nível 3", NAO_AVALIADO: "Não avaliado" };

function Barras({ dados, rotulo }: { dados: { label: string; total: number }[]; rotulo?: (s: string) => string }) {
  const max = Math.max(1, ...dados.map((d) => d.total));
  return (
    <ul className="space-y-2">
      {dados.map((d) => (
        <li key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 truncate text-ink-soft">{rotulo ? rotulo(d.label) : d.label}</span>
          <div className="h-2.5 flex-1 rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand" style={{ width: `${(d.total / max) * 100}%` }} /></div>
          <span className="w-10 text-right tabular-nums">{d.total}</span>
        </li>
      ))}
    </ul>
  );
}

function Card({ titulo, exportTipo, query, children }: { titulo: string; exportTipo?: string; query: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{titulo}</h2>
        {exportTipo && (
          <a href={`/api/relatorios/export?tipo=${exportTipo}&${query}`} className="flex items-center gap-1 text-xs text-brand hover:underline">
            <Download className="h-3.5 w-3.5" /> CSV/Excel
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function RelatoriosPage({ searchParams }: { searchParams: { inicio?: string; fim?: string } }) {
  const s = await getSessao();
  const f: FiltroRelatorio = {
    inicio: searchParams.inicio ? new Date(searchParams.inicio) : undefined,
    fim: searchParams.fim ? new Date(searchParams.fim + "T23:59:59") : undefined,
    unidadeId: s?.role !== "ADMIN" ? s?.unidadeId : undefined,
  };
  const query = new URLSearchParams({ ...(searchParams.inicio ? { inicio: searchParams.inicio } : {}), ...(searchParams.fim ? { fim: searchParams.fim } : {}) }).toString();

  const [pac, atd, ind] = await Promise.all([relatorioPacientes(f), relatorioAtendimentos(f), indicadoresTEA(f)]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Relatórios gerenciais</h1>
          <p className="text-sm text-ink-soft">Indicadores assistenciais e de prestação de contas.</p>
        </div>
        <div className="flex items-end gap-2">
          <form className="flex items-end gap-2" action="/relatorios">
            <label className="text-xs text-ink-soft">Início<input type="date" name="inicio" defaultValue={searchParams.inicio} className="mt-1 block rounded-lg border bg-surface px-2 py-1.5 text-sm" /></label>
            <label className="text-xs text-ink-soft">Fim<input type="date" name="fim" defaultValue={searchParams.fim} className="mt-1 block rounded-lg border bg-surface px-2 py-1.5 text-sm" /></label>
            <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">Filtrar</button>
          </form>
          <Link href={`/relatorios/imprimir?${query}`} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-surface-2"><Printer className="h-4 w-4" /> PDF</Link>
        </div>
      </div>

      {/* KPIs / BI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Pacientes", v: pac.total },
          { l: "Atendimentos no período", v: atd.total },
          { l: "Tempo médio de tratamento", v: `${ind.tempoMedioTratamentoDias} d` },
          { l: "Frequência média/ativo", v: ind.frequenciaMediaPorPacienteAtivo },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border bg-surface p-4"><p className="text-sm text-ink-soft">{k.l}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{k.v}</p></div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card titulo="Pacientes por situação" exportTipo="pac_status" query={query}><Barras dados={pac.porStatus.map((x) => ({ label: x.status, total: x.total }))} rotulo={(s) => ROTULO_STATUS_PTI[s] ?? s.replace("FILA_ESPERA", "Fila de espera").replace("_", " ")} /></Card>
        <Card titulo="Pacientes por faixa etária" exportTipo="pac_faixa" query={query}><Barras dados={pac.porFaixaEtaria.map((x) => ({ label: x.faixa, total: x.total }))} /></Card>
        <Card titulo="Pacientes por município" exportTipo="pac_municipio" query={query}><Barras dados={pac.porMunicipio.slice(0, 8).map((x) => ({ label: x.municipio, total: x.total }))} /></Card>
        <Card titulo="Atendimentos por profissional" exportTipo="atd_profissional" query={query}><Barras dados={atd.porProfissional.slice(0, 8).map((x) => ({ label: x.profissional, total: x.total }))} /></Card>
        <Card titulo="Atendimentos por especialidade" exportTipo="atd_especialidade" query={query}><Barras dados={atd.porEspecialidade.map((x) => ({ label: x.especialidade, total: x.total }))} /></Card>
        <Card titulo="Atendimentos por situação" exportTipo="atd_status" query={query}><Barras dados={atd.porStatus.map((x) => ({ label: x.status, total: x.total }))} rotulo={(s) => s.toLowerCase()} /></Card>
        <Card titulo="Indicadores TEA — nível de suporte" exportTipo="ind_nivel" query={query}><Barras dados={ind.porNivelSuporte.map((x) => ({ label: x.nivel, total: x.total }))} rotulo={(s) => ROTULO_NIVEL[s] ?? s} /></Card>
        <Card titulo="Comorbidades" exportTipo="ind_comorbidades" query={query}>
          {ind.comorbidades.length ? <Barras dados={ind.comorbidades.slice(0, 8).map((x) => ({ label: x.descricao, total: x.total }))} /> : <p className="text-sm text-ink-soft">Sem registros.</p>}
        </Card>
      </div>
    </div>
  );
}
