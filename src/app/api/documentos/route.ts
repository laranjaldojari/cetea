import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { podeEscrever } from "@/lib/rbac";
import { salvarArquivo } from "@/server/storage";

const TIPOS = ["LAUDO", "EXAME", "RELATORIO", "RECEITA", "ENCAMINHAMENTO", "OUTRO"];

export async function GET(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");
  const documentos = await prisma.documento.findMany({
    where: { deletedAt: null, ...(pacienteId ? { pacienteId } : {}) },
    orderBy: [{ nome: "asc" }, { versao: "desc" }],
  });
  return NextResponse.json({ documentos });
}

export async function POST(req: Request) {
  const s = await getSessao();
  if (!s) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  if (!podeEscrever(s.role)) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const pacienteId = String(form?.get("pacienteId") || "");
  const tipo = String(form?.get("tipo") || "OUTRO");
  if (!(file instanceof Blob) || !pacienteId) return NextResponse.json({ erro: "Arquivo e paciente são obrigatórios" }, { status: 400 });
  if (!TIPOS.includes(tipo)) return NextResponse.json({ erro: "Tipo inválido" }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ erro: "Arquivo excede 25 MB" }, { status: 400 });

  const nome = (file as any).name || "documento";
  const buffer = Buffer.from(await file.arrayBuffer());
  const salvo = await salvarArquivo(buffer, nome);

  // Versionamento por nome dentro do paciente
  const anterior = await prisma.documento.findFirst({
    where: { pacienteId, nome, deletedAt: null }, orderBy: { versao: "desc" }, select: { versao: true },
  });
  const versao = (anterior?.versao ?? 0) + 1;

  const documento = await prisma.documento.create({
    data: { pacienteId, tipo: tipo as any, nome, url: salvo.key, mimeType: file.type || null, tamanho: salvo.tamanho, versao },
  });
  await prisma.auditLog.create({ data: { userId: s.sub, acao: "CREATE", entidade: "Documento", entidadeId: documento.id } });
  return NextResponse.json({ documento }, { status: 201 });
}
