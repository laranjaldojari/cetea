import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { gerarSelo } from "@/server/prontuario";
import { unidadeOk } from "@/lib/escopo";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const reg = await prisma.registroProntuario.findUnique({ where: { id: params.id }, include: { paciente: { select: { unidadeId: true } } } });
  if (!reg || !unidadeOk(s, reg.paciente.unidadeId)) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  if (reg.assinado) return NextResponse.json({ erro: "Registro já assinado." }, { status: 409 });

  const quando = new Date();
  const selo = gerarSelo({ conteudo: reg.conteudo, autorId: s.sub, quando });
  const registro = await prisma.registroProntuario.update({
    where: { id: params.id },
    data: { assinado: true, assinaturaHash: selo },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "RegistroProntuario", entidadeId: params.id, diff: { acao: "assinar" } } });
  return NextResponse.json({ registro });
}
