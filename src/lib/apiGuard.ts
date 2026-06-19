import { NextResponse } from "next/server";
import { verificarBearer, type ApiPayload } from "@/lib/auth/apiToken";
import { limitar, ipDe } from "@/lib/ratelimit";

export async function guardaApi(req: Request): Promise<{ payload: ApiPayload } | { resposta: NextResponse }> {
  const ip = ipDe(req);
  if (!limitar(`v1:${ip}`, 120, 60_000).ok) return { resposta: NextResponse.json({ erro: "Limite de requisições excedido" }, { status: 429 }) };
  const payload = await verificarBearer(req);
  if (!payload) return { resposta: NextResponse.json({ erro: "Token inválido ou ausente" }, { status: 401 }) };
  return { payload };
}
