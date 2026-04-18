import { CatalogoClient } from './_components/catalogo-client';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';

export const metadata = {
  title: 'Catálogo de Trajes | FOLCKLORE Bolivia',
  description:
    'Alquila trajes folklóricos bolivianos auténticos. Caporales, Morenada, Tinku, Diablada y más. Cotiza y reserva en línea.',
};

export type VariacionCatalogo = {
  id: number;
  nombre_variacion: string;
  talla: string | null;
  color: string | null;
  precio_alquiler: number | null;
  disponible: number;
  total: number;
};

export type ConjuntoCatalogo = {
  id: number;
  nombre: string;
  danza: string;
  genero: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  variaciones: VariacionCatalogo[];
};

async function getCatalogo(): Promise<ConjuntoCatalogo[]> {
  try {
    const res = await fetch(`${BACKEND}/bot/public/catalogo`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c: ConjuntoCatalogo) => ({
      ...c,
      precio_base: parseFloat(String(c.precio_base)),
      variaciones: c.variaciones.map((v) => ({
        ...v,
        precio_alquiler: v.precio_alquiler ? parseFloat(String(v.precio_alquiler)) : null,
      })),
    }));
  } catch {
    return [];
  }
}

export default async function CatalogoPage() {
  const conjuntos = await getCatalogo();
  return <CatalogoClient conjuntos={conjuntos} />;
}
