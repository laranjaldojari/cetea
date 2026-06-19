"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
export function ExcluirDoc({ id }: { id: string }) {
  const router = useRouter();
  async function excluir() {
    if (!confirm("Excluir este documento?")) return;
    const res = await fetch(`/api/documentos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }
  return <button onClick={excluir} aria-label="Excluir" className="grid h-8 w-8 place-items-center rounded-lg border text-red-600 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>;
}
