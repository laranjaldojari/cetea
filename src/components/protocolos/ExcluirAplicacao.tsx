"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function ExcluirAplicacao({ id }: { id: string }) {
  const router = useRouter();
  async function excluir() {
    if (!confirm("Excluir esta avaliação?")) return;
    const res = await fetch(`/api/protocolos/aplicacoes/${id}`, { method: "DELETE" });
    if (res.ok) { router.push("/protocolos"); router.refresh(); }
  }
  return (
    <button onClick={excluir} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-red-600 hover:bg-red-500/10">
      <Trash2 className="h-4 w-4" /> Excluir
    </button>
  );
}
