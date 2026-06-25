import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { especialidadeSchema } from "@/lib/validators/profissional";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = especialidadeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  try {
    const especialidade = await prisma.especialidade.update({ where: { id: params.id }, data: { nome: parsed.data.nome } });
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "Especialidade", entidadeId: params.id } });
    return NextResponse.json({ especialidade });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Já existe uma especialidade com este nome." }, { status: 409 });
    if (e?.code === "P2025") return NextResponse.json({ erro: "Especialidade não encontrada." }, { status: 404 });
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const emUso = await prisma.profissional.count({ where: { especialidadeId: params.id } });
  if (emUso > 0) {
    return NextResponse.json({ erro: `Em uso por ${emUso} profissional(is). Reatribua-os antes de excluir.` }, { status: 409 });
  }
  await prisma.especialidade.delete({ where: { id: params.id } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "Especialidade", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
