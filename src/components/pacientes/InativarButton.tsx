"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive } from "lucide-react";

export function InativarButton({ id }: { id: string }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  async function inativar() {
    if (!confirm("Inativar este paciente? O histórico é preservado.")) return;
    setCarregando(true);
    const res = await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
    setCarregando(false);
    if (res.ok) { router.push("/pacientes"); router.refresh(); }
  }
  return (
    <button onClick={inativar} disabled={carregando}
      className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 disabled:opacity-60">
      <Archive className="h-4 w-4" /> Inativar
    </button>
  );
}
