import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatarCPF = (cpf?: string | null) =>
  cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—";

export const formatarData = (d?: Date | string | null) =>
  d ? new Intl.DateTimeFormat("pt-BR").format(new Date(d)) : "—";

export function idade(dataNascimento: Date | string): number {
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let i = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) i--;
  return i;
}
