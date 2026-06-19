import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { editarRegistroSchema } from "@/lib/validators/prontuario";
import { unidadeOk } from "@/lib/escopo";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const reg = await prisma.registroProntuario.findUnique({ where: { id: params.id }, include: { paciente: { select: { unidadeId: true } } } });
  if (!reg || !unidadeOk(s, reg.paciente.unidadeId)) return NextResponse.json({ erro: "Registro não encontrado" }, { status: 404 });
  if (reg.assinado) return NextResponse.json({ erro: "Registro assinado é imutável. Crie uma nova versão." }, { status: 409 });

  const body = await req.json().catch(() => null);
  const parsed = editarRegistroSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  const registro = await prisma.registroProntuario.update({
    where: { id: params.id },
    data: { conteudo: parsed.data.conteudo, ...(parsed.data.tipo ? { tipo: parsed.data.tipo } : {}) },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "RegistroProntuario", entidadeId: params.id } });
  return NextResponse.json({ registro });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const reg = await prisma.registroProntuario.findUnique({ where: { id: params.id }, include: { paciente: { select: { unidadeId: true } } } });
  if (!reg || !unidadeOk(s, reg.paciente.unidadeId)) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  if (reg.assinado) return NextResponse.json({ erro: "Registro assinado não pode ser excluído." }, { status: 409 });

  await prisma.registroProntuario.delete({ where: { id: params.id } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "RegistroProntuario", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
