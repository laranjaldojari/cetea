import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { criarEvolucaoSchema } from "@/lib/validators/evolucao";

const nulo = (v?: string | null) => (v && v.trim() !== "" ? v : null);

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = criarEvolucaoSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ erro: "Dados inválidos", detalhes: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;

  try {
    const evolucao = await prisma.evolucao.create({
      data: {
        pacienteId: d.pacienteId,
        profissionalId: d.profissionalId,
        autorId: s.sub,
        agendamentoId: nulo(d.agendamentoId),
        data: d.data ? new Date(d.data) : new Date(),
        tipoAtendimento: nulo(d.tipoAtendimento),
        evolucao: d.evolucao,
        intercorrencias: nulo(d.intercorrencias),
        conduta: nulo(d.conduta),
        documentos: { create: d.anexos.map((a) => ({ tipo: a.tipo, nome: a.nome, url: a.url, pacienteId: d.pacienteId })) },
      },
    });
    // Se vinculada a um agendamento, garante status REALIZADO
    if (d.agendamentoId) {
      await prisma.agendamento.update({ where: { id: d.agendamentoId }, data: { status: "REALIZADO", realizadoEm: new Date() } }).catch(() => {});
    }
    await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "Evolucao", entidadeId: evolucao.id } });
    return NextResponse.json({ evolucao }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ erro: "Este atendimento já possui uma evolução registrada." }, { status: 409 });
    throw e;
  }
}
