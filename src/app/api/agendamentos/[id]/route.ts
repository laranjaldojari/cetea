import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { atualizarAgendamentoSchema } from "@/lib/validators/agendamento";
import { detectarConflito } from "@/server/agenda";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = atualizarAgendamentoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const atual = await prisma.agendamento.findUnique({ where: { id: params.id } });
  if (!atual) return NextResponse.json({ erro: "Agendamento não encontrado" }, { status: 404 });

  const d = parsed.data;
  let dados: any = {};
  switch (d.acao) {
    case "confirmar":
      dados = { status: "CONFIRMADO", confirmadoEm: new Date() };
      break;
    case "realizar":
      dados = { status: "REALIZADO", realizadoEm: new Date() };
      break;
    case "falta":
      dados = { status: "FALTA" };
      break;
    case "cancelar":
      dados = { status: "CANCELADO", canceladoEm: new Date(), motivoCancelamento: d.motivoCancelamento || null };
      break;
    case "reagendar": {
      if (!d.inicio || !d.fim) return NextResponse.json({ erro: "Informe novo início e fim" }, { status: 400 });
      const inicio = new Date(d.inicio);
      const fim = new Date(d.fim);
      if (fim <= inicio) return NextResponse.json({ erro: "Horário final deve ser após o inicial" }, { status: 400 });
      const conflito = await detectarConflito({ profissionalId: atual.profissionalId, inicio, fim, ignorarId: atual.id });
      if (conflito) return NextResponse.json({ erro: "Conflito de horário", conflito }, { status: 409 });
      dados = { inicio, fim, status: "AGENDADO" };
      break;
    }
  }

  const ag = await prisma.agendamento.update({ where: { id: params.id }, data: dados });
  await prisma.auditLog.create({
    data: { userId: s.sub, acao: "UPDATE", entidade: "Agendamento", entidadeId: ag.id, diff: { acao: d.acao } },
  });
  return NextResponse.json({ agendamento: ag });
}
