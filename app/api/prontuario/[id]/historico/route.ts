import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth/session";
import { historicoVersoes } from "@/server/prontuario";
import { prisma } from "@/lib/db";
import { unidadeOk } from "@/lib/escopo";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const reg = await prisma.registroProntuario.findUnique({ where: { id: params.id }, include: { paciente: { select: { unidadeId: true } } } });
  if (!reg || !unidadeOk(s, reg.paciente.unidadeId)) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  const historico = await historicoVersoes(params.id);
  return NextResponse.json({
    historico: historico.map((r) => ({
      id: r.id, versao: r.versao, conteudo: r.conteudo, tipo: r.tipo,
      assinado: r.assinado, assinaturaHash: r.assinaturaHash,
      autor: r.autor?.nome ?? "—", createdAt: r.createdAt,
    })),
  });
}
