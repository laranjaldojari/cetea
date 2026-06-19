"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export function ProcessarButton() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState("");
  async function processar() {
    setCarregando(true); setMsg("");
    const res = await fetch("/api/notificacoes/processar", { method: "POST" });
    setCarregando(false);
    if (res.ok) { const j = await res.json(); setMsg(`Processadas ${j.processadas} · enviadas ${j.enviadas} · falhas ${j.falhas}`); router.refresh(); }
    else setMsg("Sem permissão ou erro ao processar.");
  }
  return (
    <div className="flex items-center gap-3">
      <button onClick={processar} disabled={carregando} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
        <Send className="h-4 w-4" /> {carregando ? "Processando…" : "Processar fila agora"}
      </button>
      {msg && <span className="text-sm text-ink-soft">{msg}</span>}
    </div>
  );
}
