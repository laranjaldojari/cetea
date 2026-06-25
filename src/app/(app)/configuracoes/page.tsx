import { getSessao } from "@/lib/auth/session";
import { getInstituicao } from "@/server/configuracoes";
import { ConfiguracoesForm } from "@/components/configuracoes/ConfiguracoesForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const s = await getSessao();
  if (!s || s.role !== "ADMIN") {
    return <div className="rounded-xl border bg-surface p-8 text-center text-ink-soft">Apenas o administrador acessa as configurações.</div>;
  }
  const instituicao = await getInstituicao(s.instituicaoId);
  if (!instituicao) return <div className="rounded-xl border bg-surface p-8 text-center text-ink-soft">Instituição não encontrada.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Configurações</h1>
        <p className="text-sm text-ink-soft">Personalize a identidade, a aparência e os parâmetros do sistema.</p>
      </div>
      <ConfiguracoesForm inicial={instituicao} />
    </div>
  );
}
