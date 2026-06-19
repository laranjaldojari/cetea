import { prisma } from "@/lib/db";

const SIMULAR = process.env.NOTIF_SIMULAR === "true";

export function configStatus() {
  return {
    email: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    whatsapp: Boolean(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN),
    simulacao: SIMULAR,
  };
}

async function enviarEmail(destino: string, assunto: string, conteudo: string) {
  if (SIMULAR || !process.env.SMTP_HOST) { console.log(`[SIMULA EMAIL] ${destino}: ${conteudo}`); if (!SIMULAR && !process.env.SMTP_HOST) throw new Error("SMTP não configurado"); return; }
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({ from: process.env.SMTP_USER, to: destino, subject: assunto, text: conteudo });
}

async function enviarWhatsApp(destino: string, conteudo: string) {
  if (SIMULAR || !process.env.WHATSAPP_API_URL) { console.log(`[SIMULA WHATSAPP] ${destino}: ${conteudo}`); if (!SIMULAR && !process.env.WHATSAPP_API_URL) throw new Error("WhatsApp não configurado"); return; }
  // Payload genérico — adapte ao provedor escolhido (Meta Cloud API, Z-API, etc.)
  const res = await fetch(process.env.WHATSAPP_API_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}` },
    body: JSON.stringify({ to: destino, message: conteudo }),
  });
  if (!res.ok) throw new Error(`WhatsApp API ${res.status}`);
}

/** Processa lembretes pendentes cuja hora de envio já chegou. */
export async function processarPendentes(limite = 50) {
  const pendentes = await prisma.notificacao.findMany({
    where: { status: "PENDENTE", agendadaPara: { lte: new Date() } },
    take: limite,
  });

  let enviadas = 0, falhas = 0;
  for (const n of pendentes) {
    try {
      if (n.canal === "EMAIL") await enviarEmail(n.destino, "Lembrete de atendimento — CETEA", n.conteudo);
      else await enviarWhatsApp(n.destino, n.conteudo);
      await prisma.notificacao.update({ where: { id: n.id }, data: { status: "ENVIADA", enviadaEm: new Date() } });
      enviadas++;
    } catch (e: any) {
      await prisma.notificacao.update({ where: { id: n.id }, data: { status: "FALHA", erro: String(e?.message ?? e).slice(0, 300) } });
      falhas++;
    }
  }
  return { processadas: pendentes.length, enviadas, falhas };
}

export async function estatisticasFila() {
  const [pendentes, enviadas, falhas] = await Promise.all([
    prisma.notificacao.count({ where: { status: "PENDENTE" } }),
    prisma.notificacao.count({ where: { status: "ENVIADA" } }),
    prisma.notificacao.count({ where: { status: "FALHA" } }),
  ]);
  return { pendentes, enviadas, falhas };
}
