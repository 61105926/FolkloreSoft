import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/conjuntos",
  "/componentes",
  "/instancias",
  "/sucursales",
  "/venta",
  "/alquiler",
  "/caja",
  "/garantias",
  "/cliente",
  "/eventos-folkloricos",
  "/entrada-folklorica",
  "/usuario",
  "/configuracion",
];

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas en segundos

/** Decodifica el campo `exp` del JWT sin verificar firma (solo lectura). */
function jwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    // atob está disponible en Edge runtime
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicOnly = PUBLIC_ROUTES.includes(pathname);

  const accessToken  = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const nowSec = Math.floor(Date.now() / 1000);
  const exp    = accessToken ? jwtExp(accessToken) : null;
  // Token válido si existe y no vence en los próximos 60 segundos
  const tokenValido = !!accessToken && !!exp && exp > nowSec + 60;

  // ── Intentar renovar si el token está vencido pero hay refreshToken ─────────
  if (!tokenValido && refreshToken && isProtected) {
    try {
      const res = await fetch(`${BACKEND}/auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refreshToken=${refreshToken}` },
      });

      if (res.ok) {
        const body = (await res.json()) as { accessToken: string };
        const response = NextResponse.next();
        response.cookies.set("accessToken", body.accessToken, {
          httpOnly: true,
          secure: process.env.COOKIE_SECURE === "true",
          sameSite: "strict",
          maxAge: ACCESS_COOKIE_MAX_AGE,
          path: "/",
        });
        return response;
      }
    } catch {
      // Si el backend no responde, caer al redirect de login
    }
  }

  // ── Proteger rutas ───────────────────────────────────────────────────────────
  if (isProtected && !tokenValido && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtected && !tokenValido && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si llegó aquí con token vencido pero refreshToken existe pero falló → login
  if (isProtected && !tokenValido) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnly && tokenValido) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
