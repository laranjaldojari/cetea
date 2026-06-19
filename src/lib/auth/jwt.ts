import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

const secret = () => {
  const v = process.env.JWT_SECRET;
  if (!v || v.length < 16) throw new Error("JWT_SECRET ausente ou muito curto");
  return new TextEncoder().encode(v);
};

export interface SessionPayload {
  sub: string;        // userId
  role: UserRole;
  instituicaoId: string;
  unidadeId?: string | null;
  nome: string;
}

export async function assinarToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES || "8h")
    .sign(secret());
}

export async function verificarToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
