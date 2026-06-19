import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { objetivoSchema } from "@/lib/validators/pti";

const nulo = (v?: string | null) => (v && v.trim() !== "" ? v : null);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = objetivoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;

  const objetivo = await prisma.pTIObjetivo.create({
    data: {
      ptiId: params.id, descricao: d.descricao, meta: nulo(d.meta), estrategias: nulo(d.estrategias),
      responsavel: nulo(d.responsavel), prazo: d.prazo ? new Date(d.prazo) : null, percentualExecucao: d.percentualExecucao,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "PTIObjetivo", entidadeId: objetivo.id } });
  return NextResponse.json({ objetivo }, { status: 201 });
}
