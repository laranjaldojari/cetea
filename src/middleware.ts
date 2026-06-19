import { NextResponse, type NextRequest } from "next/server";
import { verificarToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";

const ROTAS_PUBLICAS = ["/login", "/api/auth/login", "/api/v1/", "/api-docs"];
const METODOS_MUTANTES = ["POST", "PUT", "PATCH", "DELETE"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const temCookie = Boolean(req.cookies.get(COOKIE_NAME)?.value);

  // Proteção CSRF: requisições mutantes com cookie de sessão devem vir da mesma origem.
  // (APIs v1 usam Bearer, sem cookie, logo não são vetor de CSRF.)
  if (temCookie && METODOS_MUTANTES.includes(req.method) && !pathname.startsWith("/api/v1/")) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ erro: "Origem não permitida (CSRF)" }, { status: 403 });
    }
  }

  if (ROTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(r))) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const sessao = token ? await verificarToken(token) : null;
  if (!sessao) {
    if (pathname.startsWith("/api")) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"] };
