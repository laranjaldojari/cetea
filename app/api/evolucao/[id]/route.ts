import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { editarEvolucaoSchema } from "@/lib/validators/evolucao";
import { unidadeOk } from "@/lib/escopo";

const nulo = (v?: string | null) => (v && v.trim() !== "" ? v : null);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = editarEvolucaoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;

  const atual = await prisma.evolucao.findUnique({ where: { id: params.id }, include: { paciente: { select: { unidadeId: true } } } });
  if (!atual || !unidadeOk(s, atual.paciente.unidadeId)) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

  const evolucao = await prisma.evolucao.update({
    where: { id: params.id },
    data: { evolucao: d.evolucao, tipoAtendimento: nulo(d.tipoAtendimento), intercorrencias: nulo(d.intercorrencias), conduta: nulo(d.conduta) },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "Evolucao", entidadeId: params.id } });
  return NextResponse.json({ evolucao });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const atual = await prisma.evolucao.findUnique({ where: { id: params.id }, include: { paciente: { select: { unidadeId: true } } } });
  if (!atual || !unidadeOk(s, atual.paciente.unidadeId)) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

  await prisma.$transaction([
    prisma.documento.deleteMany({ where: { evolucaoId: params.id } }),
    prisma.evolucao.delete({ where: { id: params.id } }),
  ]);
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "Evolucao", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
