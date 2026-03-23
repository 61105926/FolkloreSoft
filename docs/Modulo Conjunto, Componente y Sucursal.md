# Arquitectura del Módulo: Conjuntos, Componentes y Sucursales

Este documento detalla el entendimiento profundo de las reglas de negocio base del SaaS Folklórico, separando la teoría (plantillas) de la práctica (inventario físico), y define cómo esta abstracción se materializará en la Interfaz de Usuario (UI).

---

## 1. Reglas de Negocio del Dominio

El patrón arquitectónico principal radica en la estricta separación entre el diseño conceptual de la indumentaria y los artículos reales que existen en una bodega física.

### A. La Diferencia conceptual: "Plantilla" vs "Cosa Física"

*   **Nivel de Catálogo (La Idea): `Conjunto` / `Componente`**
    Estas son meras descripciones o plantillas maestras. Un `Conjunto` sería, por ejemplo, *"Traje de Caporal Rojo con Dorado"*. Esta entidad solo contiene información abstracta, fotos del diseño, precios base e instrucciones (la "receta") que indica que para armar un traje completo se **requieren** ciertos `Componentes` (ej. 1 Blusa, 1 Pollera, 1 Sombrero, 1 par de Botas). No existen físicamente y no ocupan espacio en el almacén.
*   **Nivel Físico (El Inventario Real): `InstanciaConjunto` / `InstanciaComponente`**
    Esto representa el mundo físico real. Es el *"Traje de Caporal con código de barra #CAP-001"* que está colgado en un perchero específico de la Sucursal de La Paz. Ese traje existe porque fue **ensamblado** uniendo piezas de ropa únicas y rastreables (ej. "La Pollera L con serial #P-001" y el "Sombrero M con serial #S-001", que corresponden a las `InstanciasComponentes`).

### B. El Mecanismo de "Ensamblaje" (El Pool del Almacén)

El ciclo de vida de una prenda individual (`InstanciaComponente`) es el corazón de las operaciones en las sucursales:

1.  **Ingreso al Pool:** Cuando se compran docenas de piezas nuevas frescas desde fábrica (ej. 100 sombreros nuevos), estas no pertenecen a ningún traje aún. Entran a una bodega general conocida internamente como **Pool** (`estado_actual = DISPONIBLE_POOL`, con `instancia_conjunto_id` igual a nulo).
2.  **El Ensamblaje:** Al momento de conformar un traje completo listo para flete (`InstanciaConjunto`), el sistema automatizado (`ConjuntoComponenteService` o flujos basados en eventos CQRS) toma prendas sueltas del Pool y las **engancha lógicamente** al traje, alterando su estado a `ASIGNADO`.
3.  **Gestión de Averías:** Si un "Sombrero #S-001" sufre daños de rasgadura durante un alquiler, al retornar se marca como `DAÑADO`. Automáticamente, el sistema desvincula el sombrero roto, acude al Pool buscando otro sombrero de características idénticas (talla, modelo), y efectúa el reemplazo en la `InstanciaConjunto` para no romper la completitud de la receta original del traje.

### C. La Independencia de las Sucursales

*   Cada **Sucursal** es un universo logístico estanco con su propio inventario. El Traje "Caporal #CAP-001" asignado a la sucursal Norte, no existe para la base de datos de la Sucursal Sur.
*   **Transferencias de Patrimonio (Logística):** Para mover indumentaria entre cajas geográficas, no se destruyen y recrean identidades en bases de datos. En cambio, se selecciona la `InstanciaConjunto` física, se le aplica el estado transitorio `EN_TRANSFERENCIA` (bloqueando su disponibilidad temporalmente) e internamente viaja a destino. Al recepcionarse en el lugar físico destino, su propiedad `sucursal_id` se actualiza y la prenda queda libre en el nuevo nodo logístico (`DISPONIBLE`).

---

## 2. Implementación en Interfaz de Usuario (UI/UX)

La UI respetará una estética "Tradición Profesional", pero se comportará de manera altamente dinámica y de respuesta instantánea para la gestión de todo este inventario.

### A. UI para el Ensamblaje Visual de Trajes (`/inventario/armado`)

El ensamblaje dejará de ser una tabla aburrida y pasará a ser una **Experiencia Interactiva**.

*   **Workspace Dinámico (Drag & Drop usando `@dnd-kit`):**
    *   **Panel Izquierdo (Maniquí / Receta):** Un área visual que muestra las **"Ranuras Requeridas"** para que el traje esté completo. Si la receta de Traje requiere un Sombrero y una Blusa, se verán cajas vacías esperando ser llenadas e indicando visualmente que hay un déficit.
    *   **Panel Derecho (Pool / Bodega):** Un explorador o grilla de inventario suelto y disponible en la Sucursal operante en tiempo real (las InstanciasComponentes libres).
    *   **Acción:** El empleado arrastrará (*Drag*) desde el Pool derecho el "Sombrero M" y lo soltará (*Drop*) en la ranura vacía del Panel Izquierdo. Esta acción gatillará las Server Actions de Next.js. El componente izquierdo se encenderá en color "verde éxito" y desaparecerá del Panel derecho con una actualización instantánea (*Optimistic UI*), reduciendo fricciones cognitivas.

### B. UI para Transferencias entre Sucursales (`/logistica/transferencias`)

Para reflejar el viaje inter-estado logístico, pasaremos de las vistas "tipo lista de Excel" a un diseño de manufactura esbelta industrial.

*   **Tablero Logístico Kanban:** Se habilitará una vista de columnas como Trello o Jira.
    *   `Solicitado` ➜ `En Tránsito (EN_TRANSFERENCIA)` ➜ `Recibido`.
    *   **Acción de Transferir:** Se habilitarán **Tarjetas de Traslado** visuales mostrando íconos representativos de origen y del destino (Ej. La Paz ➜ Cochabamba), así como el traje inmerso en la caja. Arrastrar la tarjeta lateralmente entre columnas despachará eventos CQRS en NestJS, bloqueando e iterando atómicamente el estado sobre todas las prendas hijas dentro de ese traslado.

### C. UI para Catálogo Base (`/catalogo`)

*   **Grid estilo E-commerce Visual:** La visualización del catálogo (de donde derivan las variantes de las instancias) no mostrará datos puros; será una retícula donde la imagen fotográfica o la ilustración de cada diseño tomarán el elemento protagónico central de cada tarjeta. Las variantes de tallas e informaciones secundarias asomarán bajo `hover` u otras intenciones de contacto visual para mantener el Dashboard inmaculadamente limpio.
