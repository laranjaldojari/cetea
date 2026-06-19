import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { pacienteSchema } from "@/lib/validators/paciente";
import { dadosEscalares, dadosResponsaveis, dadosComorbidades } from "@/server/paciente";
import { unidadeOk } from "@/lib/escopo";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const paciente = await prisma.paciente.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { responsaveis: true, comorbidades: true },
  });
  if (!paciente) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });
  if (!unidadeOk(s, paciente.unidadeId)) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });
  return NextResponse.json({ paciente });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = pacienteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const alvo = await prisma.paciente.findUnique({ where: { id: params.id }, select: { unidadeId: true } });
  if (!alvo || !unidadeOk(s, alvo.unidadeId)) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });

  try {
    // Substitui aninhados (deleteMany + create) e atualiza escalares em transação.
    const [, , paciente] = await prisma.$transaction([
      prisma.responsavel.deleteMany({ where: { pacienteId: params.id } }),
      prisma.comorbidade.deleteMany({ where: { pacienteId: params.id } }),
      prisma.paciente.update({
        where: { id: params.id },
        data: {
          ...dadosEscalares(d),
          ...(d.unidadeId ? { unidadeId: d.unidadeId } : {}),
          responsaveis: { create: dadosResponsaveis(d) },
          comorbidades: { create: dadosComorbidades(d) },
        },
      }),
    ]);
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "Paciente", entidadeId: params.id } });
    return NextResponse.json({ paciente });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Já existe paciente com este CPF ou CNS." }, { status: 409 });
    throw e;
  }
}

// Inativação lógica (preserva histórico p/ auditoria/LGPD)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const alvo = await prisma.paciente.findUnique({ where: { id: params.id }, select: { unidadeId: true } });
  if (!alvo || !unidadeOk(s, alvo.unidadeId)) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });
  await prisma.paciente.update({ where: { id: params.id }, data: { deletedAt: new Date(), status: "INATIVO" } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "Paciente", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
