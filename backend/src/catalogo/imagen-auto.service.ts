import { Injectable, Logger } from '@nestjs/common';

/**
 * Mapa de danzas bolivianas conocidas → imagen de Wikimedia Commons.
 * Se usa como fallback instantáneo sin llamada HTTP.
 */
const DANZA_IMAGEN: Record<string, string> = {
  caporales:   'https://upload.wikimedia.org/wikipedia/commons/0/00/Caporales_Or%C3%ADgenes_San_Andres.JPG',
  morenada:    'https://upload.wikimedia.org/wikipedia/commons/4/46/Desfile_de_morenada_02_Carnaval_de_Oruro_2012.JPG',
  tinku:       'https://upload.wikimedia.org/wikipedia/commons/0/03/Tinkus_San_Sim%C3%B3n_Arica.JPG',
  diablada:    'https://upload.wikimedia.org/wikipedia/commons/0/09/Diablada_Oruro_Bolivia_2_febrero_origen.jpg',
  tobas:       'https://upload.wikimedia.org/wikipedia/commons/3/3c/Danseur_dans_une_Tobas%2C_danse_traditionnelle_aymara_de_Bolivie.jpg',
  saya:        'https://upload.wikimedia.org/wikipedia/commons/3/3b/Saya_Afroboliviana_en_movimiento.jpg',
  kullawada:   'https://upload.wikimedia.org/wikipedia/commons/b/bb/Bailarina_de_Kullawada_en_Tiquina2.jpg',
  pujllay:     'https://upload.wikimedia.org/wikipedia/commons/c/c6/Interpretando_Musica_de_Pujllay_en_tarabuco.jpg',
  waca_waca:   'https://upload.wikimedia.org/wikipedia/commons/e/e5/Waca_waca_en_Ilabaya.jpg',
  llamerada:   'https://upload.wikimedia.org/wikipedia/commons/4/48/Llamerada_A.jpg',
  cueca:       'https://upload.wikimedia.org/wikipedia/commons/8/87/Danza_de_la_Cueca_Boliviana_%2826627079173%29.jpg',
  taquirari:   'https://upload.wikimedia.org/wikipedia/commons/2/2b/Bailarines_de_taquirari.jpg',
  auqui_auqui: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Auqui_Auqui.jpg',
};

@Injectable()
export class ImagenAutoService {
  private readonly logger = new Logger(ImagenAutoService.name);

  /**
   * Retorna una imagen_url para el conjunto dado.
   * 1. Si el usuario ya proveyó imagen_url, la devuelve tal cual.
   * 2. Busca por danza en el mapa local (instantáneo, sin red).
   * 3. Busca dinámicamente en Wikimedia Commons API.
   * 4. Si todo falla, devuelve null.
   */
  /** Normaliza texto: minúsculas, sin tildes, sin caracteres especiales */
  private norm(s: string): string {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  async resolverImagen(nombre: string, danza: string, imagenProvista?: string): Promise<string | null> {
    if (imagenProvista) return imagenProvista;

    const textos = [this.norm(danza), this.norm(nombre)];

    // 1. Buscar en mapa local: coincidencia flexible por palabras
    for (const [mapKey, url] of Object.entries(DANZA_IMAGEN)) {
      const mapNorm = mapKey.replace(/_/g, ' ');
      // Coincidencia exacta o parcial bidireccional
      for (const t of textos) {
        if (t === mapNorm || t.includes(mapNorm) || mapNorm.includes(t)) return url;
        // Comparar palabra a palabra: si el 60%+ de palabras del mapa están en el texto
        const mapWords = mapNorm.split(' ');
        const matches = mapWords.filter(w => w.length > 2 && t.includes(w));
        if (matches.length >= Math.ceil(mapWords.length * 0.6)) return url;
      }
    }

    // 3. Búsqueda dinámica en Wikimedia Commons
    const query = `${danza} Bolivia folklore danza`;
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'FolkloreSoft/1.0' },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;

      const data = await res.json() as { query: { search: { title: string }[] } };
      const hits = data?.query?.search ?? [];
      for (const hit of hits) {
        const title = hit.title; // e.g. "File:Caporales.jpg"
        const imgRes = await fetch(
          `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`,
          { headers: { 'User-Agent': 'FolkloreSoft/1.0' }, signal: AbortSignal.timeout(4000) },
        );
        if (!imgRes.ok) continue;
        const imgData = await imgRes.json() as { query: { pages: Record<string, { imageinfo?: { url: string }[] }> } };
        const pages = Object.values(imgData?.query?.pages ?? {});
        const imgUrl = pages[0]?.imageinfo?.[0]?.url;
        if (imgUrl) return imgUrl;
      }
    } catch (e) {
      this.logger.warn(`Wikimedia search failed for "${query}": ${e}`);
    }

    return null;
  }
}
