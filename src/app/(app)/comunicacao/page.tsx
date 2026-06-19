import { CheckCircle2, XCircle, Clock, Mail, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSessao } from "@/lib/auth/session";
import { formatarData } from "@/lib/utils";
import { hhmm } from "@/lib/date";
import { configStatus, estatisticasFila } from "@/server/notificacoes";
import { ProcessarButton } from "@/components/comunicacao/ProcessarButton";

export const dynamic = "force-dynamic";

const COR: Record<string, string> = {
  PENDENTE: "text-amber-600", ENVIADA: "text-emerald-600", ENTREGUE: "text-emerald-600", FALHA: "text-red-600",
};

export default async function ComunicacaoPage() {
  const s = await getSessao();
  if (s && s.role !== "ADMIN" && s.role !== "COORDENADOR") {
    return <div className="rounded-xl border bg-surface p-8 text-center text-ink-soft">Acesso restrito à coordenação.</div>;
  }
  const cfg = configStatus();
  const stats = await estatisticasFila();
  const recentes = await prisma.notificacao.findMany({ orderBy: { agendadaPara: "desc" }, take: 20 });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Comunicação</h1>
          <p className="text-sm text-ink-soft">Lembretes automáticos por WhatsApp e e-mail (7 dias, 1 dia e 2 horas antes).</p>
        </div>
        <ProcessarButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-surface p-4"><div className="flex items-center gap-2 text-amber-600"><Clock className="h-4 w-4" /><span className="text-sm">Pendentes</span></div><p className="mt-1 text-2xl font-semibold tabular-nums">{stats.pendentes}</p></div>
        <div className="rounded-xl border bg-surface p-4"><div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /><span className="text-sm">Enviadas</span></div><p className="mt-1 text-2xl font-semibold tabular-nums">{stats.enviadas}</p></div>
        <div className="rounded-xl border bg-surface p-4"><div className="flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" /><span className="text-sm">Falhas</span></div><p className="mt-1 text-2xl font-semibold tabular-nums">{stats.falhas}</p></div>
      </div>

      <section className="rounded-xl border bg-surface p-4">
        <h2 className="text-sm font-semibold">Configuração dos canais</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-soft" /> E-mail (SMTP): <strong className={cfg.email ? "text-emerald-600" : "text-amber-600"}>{cfg.email ? "configurado" : "não configurado"}</strong></li>
          <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-ink-soft" /> WhatsApp: <strong className={cfg.whatsapp ? "text-emerald-600" : "text-amber-600"}>{cfg.whatsapp ? "configurado" : "não configurado"}</strong></li>
        </ul>
        {cfg.simulacao && <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700">Modo simulação ativo (NOTIF_SIMULAR=true): os envios são apenas registrados no log e marcados como enviados.</p>}
        {!cfg.simulacao && (!cfg.email || !cfg.whatsapp) && <p className="mt-2 text-xs text-ink-soft">Defina as variáveis SMTP_* e WHATSAPP_* no ambiente (ou NOTIF_SIMULAR=true para testar). Agende a rota /api/notificacoes/processar em um cron do Dokploy com o header x-cron-secret.</p>}
      </section>

      <section className="rounded-xl border bg-surface">
        <h2 className="border-b px-4 py-3 text-sm font-semibold">Fila recente</h2>
        {recentes.length === 0 ? <p className="px-4 py-8 text-center text-sm text-ink-soft">Nenhuma notificação na fila.</p> : (
          <ul>
            {recentes.map((n) => (
              <li key={n.id} className="flex items-center justify-between border-b px-4 py-2.5 text-sm last:border-0">
                <span className="flex items-center gap-2">
                  {n.canal === "EMAIL" ? <Mail className="h-4 w-4 text-ink-soft" /> : <MessageCircle className="h-4 w-4 text-ink-soft" />}
                  {n.destino}
                </span>
                <span className="flex items-center gap-3 text-ink-soft">
                  <span>{formatarData(n.agendadaPara)} {hhmm(new Date(n.agendadaPara))}</span>
                  <span className={`font-medium ${COR[n.status]}`}>{n.status.toLowerCase()}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
