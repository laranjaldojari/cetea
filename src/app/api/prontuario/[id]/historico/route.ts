import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth/session";
import { historicoVersoes } from "@/server/prontuario";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const historico = await historicoVersoes(params.id);
  return NextResponse.json({
    historico: historico.map((r) => ({
      id: r.id, versao: r.versao, conteudo: r.conteudo, tipo: r.tipo,
      assinado: r.assinado, assinaturaHash: r.assinaturaHash,
      autor: r.autor?.nome ?? "—", createdAt: r.createdAt,
    })),
  });
}
