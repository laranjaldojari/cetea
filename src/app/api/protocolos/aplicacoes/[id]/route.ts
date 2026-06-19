import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { aplicarProtocoloSchema } from "@/lib/validators/protocolo";
import { pontuar, type DefinicaoProtocolo } from "@/server/protocolos";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = aplicarProtocoloSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const atual = await prisma.protocoloAplicacao.findUnique({ where: { id: params.id }, include: { protocolo: true } });
  if (!atual) return NextResponse.json({ erro: "Aplicação não encontrada" }, { status: 404 });

  const resultado = pontuar(atual.protocolo.definicao as unknown as DefinicaoProtocolo, parsed.data.respostas);
  const aplicacao = await prisma.protocoloAplicacao.update({
    where: { id: params.id },
    data: { respostas: parsed.data.respostas, pontuacaoTotal: resultado.pontuacaoTotal, classificacao: resultado.classificacao },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "ProtocoloAplicacao", entidadeId: params.id } });
  return NextResponse.json({ aplicacao, resultado });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  await prisma.protocoloAplicacao.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "ProtocoloAplicacao", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
