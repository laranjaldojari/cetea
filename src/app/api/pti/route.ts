import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { criarPtiSchema } from "@/lib/validators/pti";
import { pacienteNoEscopo } from "@/lib/escopo";

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = criarPtiSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  const d = parsed.data;
  if (!(await pacienteNoEscopo(s, d.pacienteId))) return NextResponse.json({ erro: "Paciente fora do escopo" }, { status: 403 });

  const pti = await prisma.pTI.create({
    data: {
      pacienteId: d.pacienteId, titulo: d.titulo, status: d.status,
      inicio: d.inicio ? new Date(d.inicio) : null,
      prazo: d.prazo ? new Date(d.prazo) : null,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "PTI", entidadeId: pti.id } });
  return NextResponse.json({ pti }, { status: 201 });
}
