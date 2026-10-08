import { cookies } from "next/headers";

/**
 * Token de sesión para las rutas que hablan con el backend.
 *
 * Los componentes reciben el accessToken como prop cuando el servidor renderiza
 * la página, y esa copia nunca se actualiza. Como el token dura 15 minutos, una
 * pantalla abierta un rato largo empieza a mandar un token vencido y el backend
 * responde "Unauthorized" sin más explicación.
 *
 * Por eso las rutas de /api leen la cookie en vez de confiar en lo que mande el
 * cliente, y la renuevan con el refreshToken cuando hace falta.
 */

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:4002";

/** Lee el `exp` del JWT sin verificar la firma: sólo para saber si venció. */
function expiracion(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as { exp?: number };
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

export interface SesionServidor {
  /** Token a usar en el Authorization. `null` si no hay sesión utilizable. */
  token: string | null;
  /** Token recién emitido: hay que devolverlo en la cookie de la respuesta. */
  renovado: string | null;
}

export async function tokenDeSesion(): Promise<SesionServidor> {
  const store = await cookies();
  const access = store.get("accessToken")?.value ?? null;
  const refresh = store.get("refreshToken")?.value ?? null;

  // Se renueva 60s antes de vencer para no perder una petición por el camino
  const exp = access ? expiracion(access) : null;
  const vigente = !!access && !!exp && exp > Math.floor(Date.now() / 1000) + 60;
  if (vigente) return { token: access, renovado: null };

  if (!refresh) return { token: access, renovado: null };

  try {
    const res = await fetch(`${BACKEND}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refresh}` },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return { token: access, renovado: null };
    const body = (await res.json()) as { accessToken?: string };
    if (!body.accessToken) return { token: access, renovado: null };
    return { token: body.accessToken, renovado: body.accessToken };
  } catch {
    // Si el refresh no responde se sigue con el token que haya: que decida el backend
    return { token: access, renovado: null };
  }
}

/** Opciones con las que el middleware guarda la cookie; se replican al renovar. */
export const COOKIE_ACCESS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 8,
  path: "/",
};
