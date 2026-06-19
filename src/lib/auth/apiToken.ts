import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

const AUD = "cetea-api";
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export interface ApiPayload { sub: string; role: UserRole; instituicaoId: string; unidadeId?: string | null }

export async function assinarApiToken(p: ApiPayload, expira = "1h"): Promise<string> {
  return new SignJWT({ ...p }).setProtectedHeader({ alg: "HS256" }).setAudience(AUD).setIssuedAt().setExpirationTime(expira).sign(secret());
}

export async function verificarBearer(req: Request): Promise<ApiPayload | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { audience: AUD });
    return payload as unknown as ApiPayload;
  } catch {
    return null;
  }
}
