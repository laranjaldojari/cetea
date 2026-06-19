"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, CalendarDays, Stethoscope, Building2,
  ClipboardList, ListChecks, FileText, BarChart3, FolderArchive, Activity, MessageCircle, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/profissionais", label: "Profissionais", icon: Stethoscope },
  { href: "/unidades", label: "Unidades", icon: Building2 },
  { href: "/prontuario", label: "Prontuário", icon: FileText },
  { href: "/evolucao", label: "Evolução", icon: Activity },
  { href: "/protocolos", label: "Protocolos", icon: ClipboardList },
  { href: "/pti", label: "Plano Terapêutico", icon: ListChecks },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/comunicacao", label: "Comunicação", icon: MessageCircle },
  { href: "/documentos", label: "Documentos", icon: FolderArchive },
];

export function Sidebar() {
  const pathname = usePathname();
  const [recolhido, setRecolhido] = useState(false);

  return (
    <aside className={cn("flex flex-col border-r bg-surface transition-all", recolhido ? "w-16" : "w-64")}>
      <div className="flex h-14 items-center gap-2 border-b px-4 text-brand">
        <Activity className="h-6 w-6 shrink-0" />
        {!recolhido && <span className="font-semibold tracking-tight">CETEA</span>}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {MENU.map(({ href, label, icon: Icon }) => {
          const ativo = pathname.startsWith(href);
          return (
            <Link key={href} href={href} title={label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                ativo ? "bg-brand/10 text-brand font-medium" : "text-ink-soft hover:bg-surface-2 hover:text-ink"
              )}>
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!recolhido && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button onClick={() => setRecolhido((v) => !v)}
        className="m-2 flex items-center justify-center gap-2 rounded-lg border py-2 text-sm text-ink-soft hover:bg-surface-2">
        <ChevronLeft className={cn("h-4 w-4 transition-transform", recolhido && "rotate-180")} />
        {!recolhido && "Recolher"}
      </button>
    </aside>
  );
}
