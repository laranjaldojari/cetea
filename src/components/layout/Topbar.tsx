"use client";
import { Search, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Notificacoes } from "./Notificacoes";

export function Topbar({ nome, papel }: { nome: string; papel: string }) {
  const router = useRouter();
  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-surface px-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input placeholder="Buscar pacientes, profissionais…"
          className="w-full rounded-lg border bg-surface-2 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Notificacoes />
        <ThemeToggle />
        <Link href="/conta" className="ml-1 hidden rounded-lg px-2 py-1 text-right hover:bg-surface-2 sm:block">
          <p className="text-sm font-medium leading-none">{nome}</p>
          <p className="text-xs text-ink-soft">{papel}</p>
        </Link>
        <button onClick={sair} aria-label="Sair" className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-surface-2">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
