"use client";
import { Printer } from "lucide-react";
export function BotaoImprimir() {
  return (
    <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark no-print">
      <Printer className="h-4 w-4" /> Imprimir / PDF
    </button>
  );
}
