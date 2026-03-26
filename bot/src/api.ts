import axios from 'axios';

const API = process.env.API_URL ?? 'http://localhost:3001';

export interface ConjuntoResumen {
  id: number;
  nombre: string;
  danza: string;
  precio_base: string;
  imagen_url: string | null;
  variaciones: { instancias: { estado: string }[] }[];
}

export async function getConjuntos(): Promise<ConjuntoResumen[]> {
  try {
    const { data } = await axios.get<ConjuntoResumen[]>(`${API}/catalogo/conjuntos`);
    return data;
  } catch {
    return [];
  }
}

export function calcularStock(c: ConjuntoResumen) {
  const all = c.variaciones.flatMap((v) => v.instancias);
  return {
    disponibles: all.filter((i) => i.estado === 'DISPONIBLE').length,
    reservados:  all.filter((i) => i.estado === 'RESERVADO').length,
    alquilados:  all.filter((i) => i.estado === 'ALQUILADO').length,
    total:       all.length,
  };
}
