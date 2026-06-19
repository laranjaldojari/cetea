import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { especialidadeSchema } from "@/lib/validators/profissional";

export async function GET() {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const especialidades = await prisma.especialidade.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json({ especialidades });
}

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = especialidadeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  try {
    const especialidade = await prisma.especialidade.create({ data: { nome: parsed.data.nome } });
    return NextResponse.json({ especialidade }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Especialidade já existe." }, { status: 409 });
    throw e;
  }
}
