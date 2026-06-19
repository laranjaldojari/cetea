import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guardaApi } from "@/lib/apiGuard";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const g = await guardaApi(req);
  if ("resposta" in g) return g.resposta;
  const p = await prisma.paciente.findFirst({
    where: { id: params.id, deletedAt: null },
    select: {
      id: true, nomeCompleto: true, nomeSocial: true, cpf: true, cns: true, dataNascimento: true, sexo: true,
      status: true, nivelSuporte: true, diagnosticoPrincipal: true, cid10: true, cid11: true, municipio: true, estado: true,
      comorbidades: { select: { descricao: true, cid: true } },
    },
  });
  if (!p) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 });
  return NextResponse.json({ dados: p });
}
