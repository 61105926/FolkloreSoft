# Plan de Implementación Avanzado: SaaS Folklórico (IntiSoft)

En respuesta a la necesidad de sincronizar el desarrollo estrictamente con el sistema base de operaciones (IntiSoft), el frontend de Next.js y las APIs de NestJS mapearán fielmente la arquitectura de navegación oficial descrita en `docs/Mapa de Rutas Sidebar.md`.

El enfoque técnico se basará en **Eventos de Dominio (Event-Driven Architecture)** en Backend y **Experiencia de Usuario Interactiva (Optimistic UI + Drag & Drop)** en Frontend.

## 1. Arquitectura API y Base de Datos (NestJS & Prisma)

### Implementación Orientada a Eventos (CQRS & Events)
La lógica pesada ya no bloqueará el hilo principal. Se usará EventEmitter:
- `ComponenteLiberadoEvent`: El sistema reacciona sumándolo al `Pool` de la sucursal de manera automática.
- `ConjuntoCompletadoEvent`: Cambia el estado del traje armado (`InstanciaConjunto`) a `DISPONIBLE` al recibir el componente restante.
- `TransferenciaIniciadaEvent`: Las prendas involucradas aplican lock de DB y estado `EN_TRANSFERENCIA`.

### Estructura de Controladores (NestJS)
Los Endpoints se mapearán 1:1 con los módulos operativos de IntiSoft:
- `ConjuntosController` y `ComponentesController` para Operaciones de Catálogo.
- `InstanciasController` para flujos de armado/desarmado y estado del inventario físico.
- `SucursalInventarioController` para las rutas de inventario regional y el flujo de transferencias inter-sucursal.
- Controladores transaccionales para `AlquileresController` y `CajaController`.

## 2. Arquitectura de Interfaces Frontend (Next.js App Router)

### Principios UX/UI:
1. **Optimistic UI:** Server Actions en Next.js mutarán la caché nativa en UI antes de que el servidor responda, logrando "zero-lag" percibido (crucial para armado de trajes).
2. **Interactividad Drag & Drop:** Uso de `@dnd-kit/core` para mover física digital (prendas) entre el pool y el traje.

### Construcción de Pantallas Clave (Alineado a IntiSoft):

#### A. Sistema Folklórico: Inventario Físico (`/instancias`)
**El Workspace de Armado de Trajes:**
- Es la estación de trabajo central donde interactúa el Pool de prendas sueltas contra los trajes incompletos.
- **Izquierda (Maniquí/Receta):** Lista visual de Componentes Requeridos para el traje.
- **Derecha (Bodega/Pool):** Lista de `InstanciasComponentes` sueltas.
- **Interacción:** El empleado arrastra una Pollera del Pool Hacia el traje. 

#### B. Sistema Folklórico: Catálogos Base (`/conjuntos` y `/componentes`)
- **Vistas E-Commerce:** Visualización en Grid (Cuadrícula). Las plantillas teóricas de los trajes y las prendas base mostradas de manera inmaculada con fotografías grandes estilo Pinterest.
- *Nota: Aquí se crean "Ideas" de trajes, NO entran al almacén físico.*

#### C. Sucursales Logística (`/sucursales/inventario`)
**Tablero de Transferencias (Kanban Style):**
- **Vista principal:** Inventario total perteneciente a la sucursal operante en lista.
- **Vista interactiva (Transferencias):** Un flujo visual estilo Trello. Tarjetas visuales de envíos organizadas en columnas: `Solicitadas` ➜ `En Tránsito` ➜ `Recibición Confirmada`. Mover una tarjeta dispara mutaciones sobre los trajes.

#### D. Operativas y Finanzas (`/alquiler`, `/venta`, `/caja`)
- Interfaces orientadas a "Data Entry" ultrarrápido con uso intensivo de teclado numérico, atajos y validación estricta Zod en cliente.

#### E. Configuración Maestra (`/configuracion`)
- Un único macro-formulario "Single Page App" dividido en "Tabs" laterales (Empresa, Sucursales físicas conectadas al sistema, Parámetros Administrativos y Usuarios globales). 

## 3. Próximos Pasos (Hoja de Ruta)
1. Extender esquemas de `schema.prisma` agregando toda la lógica de modelos de IntiSoft (`Conjunto`, `Componente`, `InstanciaConjunto`, `Transferencia`).
2. Actualizar la Migración e Inyectar Seeds (Categorías Base).
3. Construir módulos CQRS core en NestJS.
4. Generar la envolvente Next.js (`layout.tsx`) respetando el Sidebar de Navegación Oficial.
