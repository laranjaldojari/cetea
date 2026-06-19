import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { profissionalSchema } from "@/lib/validators/profissional";

const nuloSeVazio = (v?: string | null) => (v && v.trim() !== "" ? v : null);

export async function GET() {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const profissionais = await prisma.profissional.findMany({
    where: { deletedAt: null, ...(s.role !== "ADMIN" && s.unidadeId ? { unidadeId: s.unidadeId } : {}) },
    include: { especialidade: true, _count: { select: { agendaSemanal: true } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json({ profissionais });
}

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = profissionalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  try {
    const profissional = await prisma.profissional.create({
      data: {
        nome: d.nome,
        cpf: d.cpf,
        conselho: nuloSeVazio(d.conselho),
        numeroRegistro: nuloSeVazio(d.numeroRegistro),
        cargaHorariaSemanal: d.cargaHorariaSemanal ?? null,
        ativo: d.ativo,
        especialidadeId: nuloSeVazio(d.especialidadeId),
        unidadeId: nuloSeVazio(d.unidadeId) || s.unidadeId || null,
        agendaSemanal: { create: d.agendaSemanal },
      },
    });
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "Profissional", entidadeId: profissional.id } });
    return NextResponse.json({ profissional }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Já existe profissional com este CPF." }, { status: 409 });
    throw e;
  }
}
