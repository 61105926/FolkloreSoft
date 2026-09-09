import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Puente hacia los endpoints de firma de QZ.
 *
 * El proxy genérico (/api/backend) sólo reenvía el header Authorization si el
 * cliente lo manda, y estas llamadas salen de lib/impresion.ts, que no tiene el
 * token a mano. Acá se lee la cookie del lado del servidor y se arma el Bearer,
 * así el backend sigue exigiendo autenticación.
 */

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:4002";

const RUTAS: Record<string, { ruta: string; metodo: "GET" | "POST" }> = {
  estado: { ruta: "qz/estado", metodo: "GET" },
  certificate: { ruta: "qz/certificate", metodo: "GET" },
  sign: { ruta: "qz/sign", metodo: "POST" },
};

async function manejar(req: NextRequest, accion: string) {
  const destino = RUTAS[accion];
  if (!destino || destino.metodo !== req.method) {
    return NextResponse.json({ message: "Acción desconocida" }, { status: 404 });
  }

  const token = (await cookies()).get("accessToken")?.value;
  const headers = new Headers();
  if (token) headers.set("authorization", `Bearer ${token}`);
  headers.set("content-type", "application/json");

  const body = req.method === "POST" ? await req.text() : undefined;

  try {
    const res = await fetch(`${BACKEND}/${destino.ruta}`, {
      method: destino.metodo,
      headers,
      body,
      cache: "no-store",
    });
    const texto = await res.text();
    return new NextResponse(texto, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ message: "Backend no disponible" }, { status: 503 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ accion: string }> }) {
  return manejar(req, (await params).accion);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ accion: string }> }) {
  return manejar(req, (await params).accion);
}
