import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { profissionalSchema } from "@/lib/validators/profissional";

const nuloSeVazio = (v?: string | null) => (v && v.trim() !== "" ? v : null);

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const profissional = await prisma.profissional.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { agendaSemanal: { orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }] } },
  });
  if (!profissional) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ profissional });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = profissionalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  try {
    const [, profissional] = await prisma.$transaction([
      prisma.agendaProfissional.deleteMany({ where: { profissionalId: params.id } }),
      prisma.profissional.update({
        where: { id: params.id },
        data: {
          nome: d.nome,
          cpf: d.cpf,
          conselho: nuloSeVazio(d.conselho),
          numeroRegistro: nuloSeVazio(d.numeroRegistro),
          cargaHorariaSemanal: d.cargaHorariaSemanal ?? null,
          ativo: d.ativo,
          especialidadeId: nuloSeVazio(d.especialidadeId),
          ...(d.unidadeId ? { unidadeId: d.unidadeId } : {}),
          agendaSemanal: { create: d.agendaSemanal },
        },
      }),
    ]);
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "UPDATE", entidade: "Profissional", entidadeId: params.id } });
    return NextResponse.json({ profissional });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Já existe profissional com este CPF." }, { status: 409 });
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  await prisma.profissional.update({ where: { id: params.id }, data: { deletedAt: new Date(), ativo: false } });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "DELETE", entidade: "Profissional", entidadeId: params.id } });
  return NextResponse.json({ ok: true });
}
