import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { pacienteSchema } from "@/lib/validators/paciente";
import { dadosEscalares, dadosResponsaveis, dadosComorbidades } from "@/server/paciente";

export async function GET(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? undefined;

  const pacientes = await prisma.paciente.findMany({
    where: {
      deletedAt: null,
      ...(s.role !== "ADMIN" && s.unidadeId ? { unidadeId: s.unidadeId } : {}),
      ...(status ? { status: status as any } : {}),
      ...(q ? { nomeCompleto: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { nomeCompleto: "asc" },
    take: 100,
  });
  return NextResponse.json({ pacientes });
}

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = pacienteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  try {
    const paciente = await prisma.paciente.create({
      data: {
        ...dadosEscalares(d),
        unidadeId: s.role === "ADMIN" ? (d.unidadeId || s.unidadeId || null) : (s.unidadeId || null),
        responsaveis: { create: dadosResponsaveis(d) },
        comorbidades: { create: dadosComorbidades(d) },
      },
    });
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "Paciente", entidadeId: paciente.id } });
    return NextResponse.json({ paciente }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Já existe paciente com este CPF ou CNS." }, { status: 409 });
    throw e;
  }
}
