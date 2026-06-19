import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { criarAgendamentoSchema } from "@/lib/validators/agendamento";
import { criarAgendamento, listarPorIntervalo } from "@/server/agenda";

export async function GET(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");
  if (!inicio || !fim) return NextResponse.json({ erro: "Informe inicio e fim" }, { status: 400 });

  const agendamentos = await listarPorIntervalo({
    inicio: new Date(inicio),
    fim: new Date(fim),
    profissionalId: searchParams.get("profissionalId") || undefined,
    unidadeId: s.role !== "ADMIN" ? s.unidadeId : undefined,
  });
  return NextResponse.json({ agendamentos });
}

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = criarAgendamentoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  }

  const r = await criarAgendamento(parsed.data, s.sub);
  if ("erro" in r) {
    return NextResponse.json(
      { erro: "Conflito de horário para este profissional", conflito: r.conflito },
      { status: 409 },
    );
  }
  return NextResponse.json({ agendamento: r.ag }, { status: 201 });
}
