import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const PAPEL: Record<string, string> = {
  ADMIN: "Administrador Geral", COORDENADOR: "Coordenador",
  RECEPCAO: "Recepção", PROFISSIONAL: "Profissional", AUDITOR: "Auditor",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await getSessao();
  if (!s) redirect("/login");
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar nome={s.nome} papel={PAPEL[s.role] ?? s.role} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
