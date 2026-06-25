import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { editarRegistroSchema } from "@/lib/validators/prontuario";
import { unidadeOk } from "@/lib/escopo";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const anterior = await prisma.registroProntuario.findUnique({ where: { id: params.id }, include: { paciente: { select: { unidadeId: true } } } });
  if (!anterior || !unidadeOk(s, anterior.paciente.unidadeId)) return NextResponse.json({ erro: "Registro não encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = editarRegistroSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });

  // Nova versão nasce como rascunho (não assinada), preservando a anterior intacta.
  const registro = await prisma.registroProntuario.create({
    data: {
      pacienteId: anterior.pacienteId,
      autorId: s.sub,
      tipo: parsed.data.tipo ?? anterior.tipo,
      conteudo: parsed.data.conteudo,
      dados: parsed.data.dados !== undefined ? parsed.data.dados : (anterior.dados ?? undefined),
      versao: anterior.versao + 1,
      versaoAnteriorId: anterior.id,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "RegistroProntuario", entidadeId: registro.id, diff: { novaVersaoDe: anterior.id } } });
  return NextResponse.json({ registro }, { status: 201 });
}
