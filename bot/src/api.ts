import axios from 'axios';

const API     = process.env.API_URL     ?? 'http://localhost:3001';
const BOT_KEY = process.env.BOT_API_KEY ?? 'folklosoft-bot-key';

// ── Catálogo ──────────────────────────────────────────────────────────────────

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

// ── Bot API (endpoints internos del backend) ──────────────────────────────────

export interface ReservaConsulta {
  id: number;
  codigo: string;
  estado: string;
  fecha_entrega: string;
  fecha_devolucion: string;
  total: string | number;
  total_pagado: string | number;
  nombre_evento_ext: string | null;
  evento: { nombre: string } | null;
  cliente: { nombre: string; celular: string | null };
  prendas: {
    modelo: string;
    total: number;
    subtotal: string | number;
    variacion: { nombre_variacion: string; talla?: string | null } | null;
  }[];
  participantes: {
    nombre: string;
    devuelto: boolean;
    instanciaConjunto: { codigo: string } | null;
  }[];
  garantias: {
    tipo: string;
    descripcion: string | null;
    valor: string | number | null;
    retenida: boolean;
  }[];
}

export async function consultarReserva(q: string): Promise<ReservaConsulta | null> {
  try {
    const { data } = await axios.get<ReservaConsulta | null>(
      `${API}/bot/consulta-reserva`,
      { params: { q, key: BOT_KEY } },
    );
    return data;
  } catch {
    return null;
  }
}

export interface CotizacionResult {
  conjunto: string;
  danza: string;
  imagen_url: string | null;
  precio_unitario: number;
  cantidad: number;
  dias: number;
  subtotal: number;
  anticipo_minimo: number;
  variaciones: { id: number; nombre_variacion: string; talla?: string | null; _count: { instancias: number } }[];
}

export async function cotizar(conjuntoId: number, cantidad: number, dias: number): Promise<CotizacionResult | null> {
  try {
    const { data } = await axios.get<CotizacionResult | null>(
      `${API}/bot/cotizacion`,
      { params: { conjuntoId, cantidad, dias, key: BOT_KEY } },
    );
    return data;
  } catch {
    return null;
  }
}

export interface StatsHoy {
  entregas: number;
  devoluciones: number;
  nuevasReservas: number;
  totalDeuda: number;
  deudas: number;
  vencidos: number;
}

export async function statsHoy(): Promise<StatsHoy> {
  try {
    const { data } = await axios.get<StatsHoy>(
      `${API}/bot/stats-hoy`,
      { params: { key: BOT_KEY } },
    );
    return data;
  } catch {
    return { entregas: 0, devoluciones: 0, nuevasReservas: 0, totalDeuda: 0, deudas: 0, vencidos: 0 };
  }
}

export interface ContratoVencer {
  codigo: string;
  fecha_devolucion: string;
  cliente: { nombre: string; celular: string | null };
  participantes: { nombre: string }[];
}

export async function porVencer(horas = 48): Promise<ContratoVencer[]> {
  try {
    const { data } = await axios.get<ContratoVencer[]>(
      `${API}/bot/por-vencer`,
      { params: { horas, key: BOT_KEY } },
    );
    return data;
  } catch {
    return [];
  }
}

export async function cancelarReserva(
  codigo: string,
  ci: string,
): Promise<{ codigo: string; cliente: { nombre: string } } | null> {
  try {
    const { data } = await axios.post(
      `${API}/bot/cancelar-reserva`,
      { codigo, ci, key: BOT_KEY },
    );
    return data;
  } catch {
    return null;
  }
}
