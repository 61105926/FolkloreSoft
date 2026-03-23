"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const password_hash = await bcryptjs_1.default.hash('password123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@folcklore.com' },
        update: {},
        create: { email: 'admin@folcklore.com', password_hash, rol: 'ADMIN' },
    });
    const lapaz = await prisma.sucursal.upsert({
        where: { id: 1 },
        update: {},
        create: { nombre: 'Sede Central La Paz', ciudad: 'La Paz', direccion: 'Av. 16 de Julio #1234' },
    });
    const cbba = await prisma.sucursal.upsert({
        where: { id: 2 },
        update: {},
        create: { nombre: 'Sucursal Cochabamba', ciudad: 'Cochabamba', direccion: 'Av. Heroínas #567' },
    });
    const blusa = await prisma.componente.upsert({ where: { id: 1 }, update: {}, create: { nombre: 'Blusa Bordada', tipo: 'BLUSA' } });
    const pollera = await prisma.componente.upsert({ where: { id: 2 }, update: {}, create: { nombre: 'Pollera con Vuelo', tipo: 'POLLERA' } });
    const sombrero = await prisma.componente.upsert({ where: { id: 3 }, update: {}, create: { nombre: 'Sombrero de Copa', tipo: 'SOMBRERO' } });
    const botas = await prisma.componente.upsert({ where: { id: 4 }, update: {}, create: { nombre: 'Botas de Cuero', tipo: 'BOTAS' } });
    const mascara = await prisma.componente.upsert({ where: { id: 5 }, update: {}, create: { nombre: 'Máscara Tallada', tipo: 'MASCARA' } });
    const capa = await prisma.componente.upsert({ where: { id: 6 }, update: {}, create: { nombre: 'Capa con Lentejuelas', tipo: 'CAPA' } });
    const chaqueta = await prisma.componente.upsert({ where: { id: 7 }, update: {}, create: { nombre: 'Chaqueta Bordada', tipo: 'CHAQUETA' } });
    const pantalon = await prisma.componente.upsert({ where: { id: 8 }, update: {}, create: { nombre: 'Pantalón con Flecos', tipo: 'PANTALON' } });
    const caporal = await prisma.conjunto.upsert({
        where: { id: 1 },
        update: {},
        create: {
            nombre: 'Traje Caporal Clásico', danza: 'Caporales',
            descripcion: 'Traje completo de Caporal con bordados en dorado. Incluye chaqueta, pantalón y sombrero característico.',
            precio_base: 350,
            componentes: {
                create: [
                    { componenteId: chaqueta.id, cantidad: 1 },
                    { componenteId: pantalon.id, cantidad: 1 },
                    { componenteId: sombrero.id, cantidad: 1 },
                    { componenteId: botas.id, cantidad: 1 },
                ],
            },
        },
    });
    const morenada = await prisma.conjunto.upsert({
        where: { id: 2 },
        update: {},
        create: {
            nombre: 'Traje Moreno Bordado', danza: 'Morenada',
            descripcion: 'Lujoso traje de Morenada con máscara, capa de lentejuelas y pollera bordada a mano.',
            precio_base: 480,
            componentes: {
                create: [
                    { componenteId: mascara.id, cantidad: 1 },
                    { componenteId: capa.id, cantidad: 1 },
                    { componenteId: pollera.id, cantidad: 1 },
                    { componenteId: botas.id, cantidad: 1 },
                ],
            },
        },
    });
    const tinku = await prisma.conjunto.upsert({
        where: { id: 3 },
        update: {},
        create: {
            nombre: 'Indumentaria Tinku Damas', danza: 'Tinku',
            descripcion: 'Traje femenino de Tinku con blusa bordada, pollera amplia y sombrero montera.',
            precio_base: 220,
            componentes: {
                create: [
                    { componenteId: blusa.id, cantidad: 1 },
                    { componenteId: pollera.id, cantidad: 1 },
                    { componenteId: sombrero.id, cantidad: 1 },
                ],
            },
        },
    });
    const capoVar = await prisma.variacionConjunto.upsert({
        where: { codigo_variacion: 'CAP-VAR-DEFAULT' },
        update: {},
        create: { conjuntoId: caporal.id, codigo_variacion: 'CAP-VAR-DEFAULT', nombre_variacion: 'Talla Única' },
    });
    const morVar = await prisma.variacionConjunto.upsert({
        where: { codigo_variacion: 'MOR-VAR-DEFAULT' },
        update: {},
        create: { conjuntoId: morenada.id, codigo_variacion: 'MOR-VAR-DEFAULT', nombre_variacion: 'Talla Única' },
    });
    const tnkVar = await prisma.variacionConjunto.upsert({
        where: { codigo_variacion: 'TNK-VAR-DEFAULT' },
        update: {},
        create: { conjuntoId: tinku.id, codigo_variacion: 'TNK-VAR-DEFAULT', nombre_variacion: 'Talla Única' },
    });
    const inst1 = await prisma.instanciaConjunto.upsert({
        where: { codigo: 'CAP-001' },
        update: {},
        create: { codigo: 'CAP-001', variacionId: capoVar.id, sucursalId: lapaz.id, estado: 'DISPONIBLE' },
    });
    const inst2 = await prisma.instanciaConjunto.upsert({
        where: { codigo: 'CAP-002' },
        update: {},
        create: { codigo: 'CAP-002', variacionId: capoVar.id, sucursalId: lapaz.id, estado: 'ALQUILADO' },
    });
    await prisma.instanciaConjunto.upsert({
        where: { codigo: 'MOR-001' },
        update: {},
        create: { codigo: 'MOR-001', variacionId: morVar.id, sucursalId: lapaz.id, estado: 'DISPONIBLE' },
    });
    await prisma.instanciaConjunto.upsert({
        where: { codigo: 'MOR-002' },
        update: {},
        create: { codigo: 'MOR-002', variacionId: morVar.id, sucursalId: cbba.id, estado: 'EN_TRANSFERENCIA' },
    });
    await prisma.instanciaConjunto.upsert({
        where: { codigo: 'TNK-001' },
        update: {},
        create: { codigo: 'TNK-001', variacionId: tnkVar.id, sucursalId: cbba.id, estado: 'DISPONIBLE' },
    });
    await prisma.instanciaComponente.upsert({
        where: { serial: 'CHAQ-001' },
        update: {},
        create: { serial: 'CHAQ-001', talla: 'L', componenteId: chaqueta.id, sucursalId: lapaz.id, instanciaConjuntoId: inst1.id, estado: 'ASIGNADO' },
    });
    await prisma.instanciaComponente.upsert({
        where: { serial: 'PANT-001' },
        update: {},
        create: { serial: 'PANT-001', talla: 'L', componenteId: pantalon.id, sucursalId: lapaz.id, instanciaConjuntoId: inst1.id, estado: 'ASIGNADO' },
    });
    await prisma.instanciaComponente.upsert({
        where: { serial: 'SOMB-001' },
        update: {},
        create: { serial: 'SOMB-001', talla: 'M', componenteId: sombrero.id, sucursalId: lapaz.id, instanciaConjuntoId: inst1.id, estado: 'ASIGNADO' },
    });
    await prisma.instanciaComponente.upsert({
        where: { serial: 'SOMB-002' },
        update: {},
        create: { serial: 'SOMB-002', talla: 'L', componenteId: sombrero.id, sucursalId: lapaz.id, estado: 'DISPONIBLE_POOL' },
    });
    await prisma.instanciaComponente.upsert({
        where: { serial: 'SOMB-003' },
        update: {},
        create: { serial: 'SOMB-003', talla: 'S', componenteId: sombrero.id, sucursalId: lapaz.id, estado: 'DISPONIBLE_POOL' },
    });
    await prisma.instanciaComponente.upsert({
        where: { serial: 'BOTAS-001' },
        update: {},
        create: { serial: 'BOTAS-001', talla: '40', componenteId: botas.id, sucursalId: lapaz.id, estado: 'DISPONIBLE_POOL' },
    });
    await prisma.instanciaComponente.upsert({
        where: { serial: 'PANT-002' },
        update: {},
        create: { serial: 'PANT-002', talla: 'XL', componenteId: pantalon.id, sucursalId: lapaz.id, estado: 'DANADO', notas: 'Rotura en costura lateral' },
    });
    await prisma.transferencia.upsert({
        where: { id: 1 },
        update: {},
        create: {
            instanciaConjuntoId: inst2.id,
            sucursalOrigenId: lapaz.id,
            sucursalDestinoId: cbba.id,
            estado: 'EN_TRANSITO',
            notas: 'Requerida para Entrada del Gran Poder 2026',
        },
    });
    console.log('✓ Seed completo: sucursales, conjuntos, componentes, instancias, transferencias.');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map