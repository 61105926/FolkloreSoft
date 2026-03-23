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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isPublicOnly = PUBLIC_ROUTES.includes(pathname);

  const accessToken = request.cookies.get("accessToken")?.value;

  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnly && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
