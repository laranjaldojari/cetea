"use client";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { hhmm } from "@/lib/date";

interface Item { id: string; titulo: string; quando: string }

export function Notificacoes() {
  const [itens, setItens] = useState<Item[]>([]);
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function carregar() {
    try {
      const res = await fetch("/api/notificacoes/feed");
      if (res.ok) { const j = await res.json(); setItens(j.itens ?? []); }
    } catch { /* silencioso */ }
  }

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 30_000); // atualização periódica
    const fora = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false); };
    document.addEventListener("mousedown", fora);
    return () => { clearInterval(t); document.removeEventListener("mousedown", fora); };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAberto((v) => !v)} aria-label="Notificações" className="relative grid h-9 w-9 place-items-center rounded-lg border hover:bg-surface-2">
        <Bell className="h-4 w-4" />
        {itens.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-accent px-1 text-[10px] font-semibold text-white">{itens.length}</span>}
      </button>
      {aberto && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border bg-surface p-2 shadow-lg">
          <p className="px-2 py-1 text-xs font-medium text-ink-soft">Próximas 24 horas</p>
          {itens.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-ink-soft">Nenhum atendimento próximo.</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {itens.map((i) => (
                <li key={i.id} className="rounded-lg px-2 py-2 text-sm hover:bg-surface-2">
                  <p className="font-medium">{i.titulo}</p>
                  <p className="text-xs text-ink-soft">{new Date(i.quando).toLocaleDateString("pt-BR")} · {hhmm(new Date(i.quando))}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
