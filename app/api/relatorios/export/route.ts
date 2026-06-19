import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth/session";
import { gerarCSV } from "@/lib/csv";
import { relatorioPacientes, relatorioAtendimentos, indicadoresTEA, type FiltroRelatorio } from "@/server/relatorios";

export async function GET(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") ?? "";
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");
  const f: FiltroRelatorio = {
    inicio: inicio ? new Date(inicio) : undefined,
    fim: fim ? new Date(fim + "T23:59:59") : undefined,
    unidadeId: s.role !== "ADMIN" ? s.unidadeId : searchParams.get("unidadeId") || undefined,
  };

  let linhas: Record<string, string | number>[] = [];
  if (tipo.startsWith("pac_")) {
    const r = await relatorioPacientes(f);
    if (tipo === "pac_status") linhas = r.porStatus.map((x) => ({ situacao: x.status, total: x.total }));
    if (tipo === "pac_municipio") linhas = r.porMunicipio.map((x) => ({ municipio: x.municipio, total: x.total }));
    if (tipo === "pac_faixa") linhas = r.porFaixaEtaria.map((x) => ({ faixa_etaria: x.faixa, total: x.total }));
  } else if (tipo.startsWith("atd_")) {
    const r = await relatorioAtendimentos(f);
    if (tipo === "atd_profissional") linhas = r.porProfissional.map((x) => ({ profissional: x.profissional, atendimentos: x.total }));
    if (tipo === "atd_especialidade") linhas = r.porEspecialidade.map((x) => ({ especialidade: x.especialidade, atendimentos: x.total }));
    if (tipo === "atd_status") linhas = r.porStatus.map((x) => ({ status: x.status, total: x.total }));
    if (tipo === "atd_unidade") linhas = r.porUnidade.map((x) => ({ unidade: x.unidade, atendimentos: x.total }));
  } else if (tipo.startsWith("ind_")) {
    const r = await indicadoresTEA(f);
    if (tipo === "ind_nivel") linhas = r.porNivelSuporte.map((x) => ({ nivel_suporte: x.nivel, total: x.total }));
    if (tipo === "ind_comorbidades") linhas = r.comorbidades.map((x) => ({ comorbidade: x.descricao, total: x.total }));
  }

  const csv = gerarCSV(linhas);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio_${tipo}.csv"`,
    },
  });
}
