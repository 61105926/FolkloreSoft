"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImagenAutoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagenAutoService = void 0;
const common_1 = require("@nestjs/common");
const DANZA_IMAGEN = {
    caporales: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Caporales_Or%C3%ADgenes_San_Andres.JPG',
    morenada: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Desfile_de_morenada_02_Carnaval_de_Oruro_2012.JPG',
    tinku: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Tinkus_San_Sim%C3%B3n_Arica.JPG',
    diablada: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Diablada_Oruro_Bolivia_2_febrero_origen.jpg',
    tobas: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Danseur_dans_une_Tobas%2C_danse_traditionnelle_aymara_de_Bolivie.jpg',
    saya: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Saya_Afroboliviana_en_movimiento.jpg',
    kullawada: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Bailarina_de_Kullawada_en_Tiquina2.jpg',
    pujllay: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Interpretando_Musica_de_Pujllay_en_tarabuco.jpg',
    waca_waca: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Waca_waca_en_Ilabaya.jpg',
    llamerada: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Llamerada_A.jpg',
    cueca: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Danza_de_la_Cueca_Boliviana_%2826627079173%29.jpg',
    taquirari: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Bailarines_de_taquirari.jpg',
    auqui_auqui: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Auqui_Auqui.jpg',
};
let ImagenAutoService = ImagenAutoService_1 = class ImagenAutoService {
    logger = new common_1.Logger(ImagenAutoService_1.name);
    norm(s) {
        return s.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .trim();
    }
    async resolverImagen(nombre, danza, imagenProvista) {
        if (imagenProvista)
            return imagenProvista;
        const textos = [this.norm(danza), this.norm(nombre)];
        for (const [mapKey, url] of Object.entries(DANZA_IMAGEN)) {
            const mapNorm = mapKey.replace(/_/g, ' ');
            for (const t of textos) {
                if (t === mapNorm || t.includes(mapNorm) || mapNorm.includes(t))
                    return url;
                const mapWords = mapNorm.split(' ');
                const matches = mapWords.filter(w => w.length > 2 && t.includes(w));
                if (matches.length >= Math.ceil(mapWords.length * 0.6))
                    return url;
            }
        }
        const query = `${danza} Bolivia folklore danza`;
        try {
            const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'FolkloreSoft/1.0' },
                signal: AbortSignal.timeout(4000),
            });
            if (!res.ok)
                return null;
            const data = await res.json();
            const hits = data?.query?.search ?? [];
            for (const hit of hits) {
                const title = hit.title;
                const imgRes = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`, { headers: { 'User-Agent': 'FolkloreSoft/1.0' }, signal: AbortSignal.timeout(4000) });
                if (!imgRes.ok)
                    continue;
                const imgData = await imgRes.json();
                const pages = Object.values(imgData?.query?.pages ?? {});
                const imgUrl = pages[0]?.imageinfo?.[0]?.url;
                if (imgUrl)
                    return imgUrl;
            }
        }
        catch (e) {
            this.logger.warn(`Wikimedia search failed for "${query}": ${e}`);
        }
        return null;
    }
};
exports.ImagenAutoService = ImagenAutoService;
exports.ImagenAutoService = ImagenAutoService = ImagenAutoService_1 = __decorate([
    (0, common_1.Injectable)()
], ImagenAutoService);
//# sourceMappingURL=imagen-auto.service.js.map