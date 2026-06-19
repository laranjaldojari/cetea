import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { objetivoSchema } from "@/lib/validators/pti";
import { unidadeOk } from "@/lib/escopo";


const nulo = (v?: string | null) => (v && v.trim() !== "" ? v : null);

async function objetivoNoEscopo(s: any, id: string) {
  const o = await prisma.pTIObjetivo.findUnique({ where: { id }, select: { pti: { select: { paciente: { select: { unidadeId: true } } } } } });
  return o ? unidadeOk(s, o.pti.paciente.unidadeId) : false;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = objetivoSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;
  if (!(await objetivoNoEscopo(s, params.id))) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

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
  if (!(await objetivoNoEscopo(s, params.id))) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  await prisma.pTIObjetivo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
