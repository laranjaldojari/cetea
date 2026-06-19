import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { aplicarProtocoloSchema } from "@/lib/validators/protocolo";
import { pontuar, type DefinicaoProtocolo } from "@/server/protocolos";
import { pacienteNoEscopo } from "@/lib/escopo";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = aplicarProtocoloSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  if (!(await pacienteNoEscopo(s, parsed.data.pacienteId))) return NextResponse.json({ erro: "Paciente fora do escopo" }, { status: 403 });

  const protocolo = await prisma.protocolo.findUnique({ where: { id: params.id } });
  if (!protocolo) return NextResponse.json({ erro: "Protocolo não encontrado" }, { status: 404 });

  const resultado = pontuar(protocolo.definicao as unknown as DefinicaoProtocolo, parsed.data.respostas);

  const aplicacao = await prisma.protocoloAplicacao.create({
    data: {
      protocoloId: protocolo.id,
      pacienteId: parsed.data.pacienteId,
      aplicadoPor: s.sub,
      respostas: parsed.data.respostas,
      pontuacaoTotal: resultado.pontuacaoTotal,
      classificacao: resultado.classificacao,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "ProtocoloAplicacao", entidadeId: aplicacao.id } });
  return NextResponse.json({ aplicacao, resultado }, { status: 201 });
}
