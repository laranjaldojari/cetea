import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UnidadeForm } from "@/components/unidades/UnidadeForm";

export default function NovaUnidadePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/unidades" className="mb-2 inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ChevronLeft className="h-4 w-4" /> Unidades</Link>
        <h1 className="text-xl font-semibold">Nova unidade</h1>
      </div>
      <UnidadeForm />
    </div>
  );
}
