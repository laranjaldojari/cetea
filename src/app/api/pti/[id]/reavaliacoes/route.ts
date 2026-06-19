import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { reavaliacaoSchema } from "@/lib/validators/pti";
import { unidadeOk } from "@/lib/escopo";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = reavaliacaoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  const pti = await prisma.pTI.findUnique({ where: { id: params.id }, select: { paciente: { select: { unidadeId: true } } } });
  if (!pti || !unidadeOk(s, pti.paciente.unidadeId)) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

  const reavaliacao = await prisma.pTIReavaliacao.create({
    data: { ptiId: params.id, resumo: parsed.data.resumo, indicadores: parsed.data.indicadores ?? undefined },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "PTIReavaliacao", entidadeId: reavaliacao.id } });
  return NextResponse.json({ reavaliacao }, { status: 201 });
}
