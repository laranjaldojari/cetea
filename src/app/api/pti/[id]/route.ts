import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { editarPtiSchema } from "@/lib/validators/pti";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = editarPtiSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;

  const pti = await prisma.pTI.update({
    where: { id: params.id },
    data: {
      ...(d.titulo ? { titulo: d.titulo } : {}),
      ...(d.status ? { status: d.status } : {}),
      ...(d.inicio !== undefined ? { inicio: d.inicio ? new Date(d.inicio) : null } : {}),
      ...(d.prazo !== undefined ? { prazo: d.prazo ? new Date(d.prazo) : null } : {}),
    },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "PTI", entidadeId: params.id } });
  return NextResponse.json({ pti });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  await prisma.pTI.delete({ where: { id: params.id } }); // cascata em objetivos/reavaliações
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "PTI", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
