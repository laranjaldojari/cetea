import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth/session";
import { getInstituicao, hexParaRgb } from "@/server/configuracoes";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const PAPEL: Record<string, string> = {
  ADMIN: "Administrador Geral", COORDENADOR: "Coordenador",
  RECEPCAO: "Recepção", PROFISSIONAL: "Profissional", AUDITOR: "Auditor",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await getSessao();
  if (!s) redirect("/login");

  const inst = await getInstituicao(s.instituicaoId);
  const temaCss = inst
    ? `:root{--brand:${hexParaRgb(inst.corPrimaria)};--brand-dark:${hexParaRgb(inst.corSecundaria)};--brand-accent:${hexParaRgb(inst.corAcento)}}`
    : "";

  return (
    <div className="flex h-screen overflow-hidden">
      {temaCss && <style dangerouslySetInnerHTML={{ __html: temaCss }} />}
      <Sidebar nome={inst?.sigla || inst?.nome || "CETEA"} logoUrl={inst?.logoUrl ?? null} role={s.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar nome={s.nome} papel={PAPEL[s.role] ?? s.role} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
