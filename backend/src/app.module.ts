import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SucursalesModule } from './sucursales/sucursales.module.js';
import { CatalogoModule } from './catalogo/catalogo.module.js';
import { InventarioModule } from './inventario/inventario.module.js';
import { TransferenciasModule } from './transferencias/transferencias.module.js';
import { EventosModule } from './eventos/eventos.module.js';
import { ContratosModule } from './contratos/contratos.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { CajaModule } from './caja/caja.module.js';
import { BotModule } from './bot/bot.module.js';
import { VentasModule } from './ventas/ventas.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    SucursalesModule,
    CatalogoModule,
    InventarioModule,
    TransferenciasModule,
    EventosModule,
    ContratosModule,
    ClientesModule,
    CajaModule,
    BotModule,
    VentasModule,
  ],
})
export class AppModule {}
