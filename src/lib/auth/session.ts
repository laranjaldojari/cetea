import { cookies } from "next/headers";
import { assinarToken, verificarToken, type SessionPayload } from "./jwt";

export const COOKIE_NAME = "cetea_session";

export async function criarSessao(payload: SessionPayload) {
  const token = await assinarToken(payload);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function encerrarSessao() {
  cookies().delete(COOKIE_NAME);
}

export async function getSessao(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verificarToken(token);
}
