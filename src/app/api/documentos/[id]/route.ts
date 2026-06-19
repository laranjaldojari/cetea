import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  await prisma.documento.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "Documento", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
