import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_ACCESS, tokenDeSesion } from '@/lib/sesion-servidor';

const BACKEND = process.env.BACKEND_URL ?? 'http://127.0.0.1:4002';

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = new URL(req.url);
  const target = `${BACKEND}/${path.join('/')}${url.search}`;

  // El token sale de la cookie, no del header que manda el cliente: los
  // componentes reciben el suyo al renderizar la página y nunca se actualiza,
  // así que después de 15 minutos abierta todo respondía "Unauthorized".
  const { token, renovado } = await tokenDeSesion();

  const headers = new Headers();
  const auth = token ? `Bearer ${token}` : req.headers.get('authorization');
  if (auth) headers.set('authorization', auth);
  const ct = req.headers.get('content-type');
  if (ct) headers.set('content-type', ct);

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer();

  try {
    const res = await fetch(target, { method: req.method, headers, body });
    const data = await res.arrayBuffer();
    const respuesta = new NextResponse(data, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
    });
    if (renovado) respuesta.cookies.set('accessToken', renovado, COOKIE_ACCESS);
    return respuesta;
  } catch {
    return NextResponse.json({ message: 'Backend no disponible' }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
