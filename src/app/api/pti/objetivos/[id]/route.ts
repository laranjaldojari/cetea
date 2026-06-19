import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { objetivoSchema } from "@/lib/validators/pti";

const nulo = (v?: string | null) => (v && v.trim() !== "" ? v : null);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = objetivoSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;

  const objetivo = await prisma.pTIObjetivo.update({
    where: { id: params.id },
    data: {
      ...(d.descricao !== undefined ? { descricao: d.descricao } : {}),
      ...(d.meta !== undefined ? { meta: nulo(d.meta) } : {}),
      ...(d.estrategias !== undefined ? { estrategias: nulo(d.estrategias) } : {}),
      ...(d.responsavel !== undefined ? { responsavel: nulo(d.responsavel) } : {}),
      ...(d.prazo !== undefined ? { prazo: d.prazo ? new Date(d.prazo) : null } : {}),
      ...(d.percentualExecucao !== undefined ? { percentualExecucao: d.percentualExecucao } : {}),
    },
  });
  return NextResponse.json({ objetivo });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  await prisma.pTIObjetivo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
