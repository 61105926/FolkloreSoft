# Estructura de Navegación y Ubicación de Módulos (Sidebar)

Para mantener el sistema organizado y evitar que la operativa diaria se mezcle con la configuración administrativa, el Menú Lateral (Sidebar) de la aplicación se dividirá en las siguientes secciones lógicas. Esto responde a la pregunta de **¿dónde está cada cosa?**

---

## 1. Módulos Operativos (El Día a Día)

Estas son las herramientas que el personal de la sucursal usará constantemente.

### A. Principal
*   **Dashboard (Resumen):** Gráficos, KPI y resumen de la sucursal actual.
*   **Fletes/Alquileres:** Gestión de clientes, contratos y devoluciones en curso.

### B. Inventario Folklórico
Aquí es donde viven físicamente tus conjuntos y prendas de la sucursal operante:
*   **Catálogo Físico (Bodega de Trajes):** Aquí están tus verdaderos *Conjuntos Folklóricos* (`InstanciaConjunto`). Verás una cuadrícula (Grid) visual con fotos de los trajes que están listos para alquilar o que ya están armados en tu almacén.
*   **Armado de Trajes:** El espacio de trabajo "Drag & Drop" donde ensamblas prendas sueltas para crear un nuevo traje funcional.
*   **Bodega de Prendas (Pool):** Donde listamos polleras, botas o sombreros sueltos que no están puestos en ningún traje.

### C. Logística
*   **Transferencias:** El tablero interactivo (Kanban) donde apruebas, envías o recibes trajes de otras ciudades/sucursales.

---

## 2. Configuración del Sistema (La Administración)

Esta sección usualmente está reservada para Administradores o Dueños de la Franquicia, y no interfiere con el día a día.

### A. Empresa & Parámetros Generales
*   **Ubicación (`/dashboard/configuracion/empresa`)**
*   **¿Qué hay aquí?**
    *   Información global de la compañía (Nombre Legal, NIT, Razón Social, Logo institucional).
    *   **Parámetros Fiscales/Negocio:** Impuestos, porcentaje de multas por mora, moneda base, número máximo de días de flete estándar, tiempos de limpieza esperados.

### B. Gestión de Sucursales
*   **Ubicación (`/dashboard/configuracion/sucursales`)**
*   **¿Qué hay aquí?**
    *   El listado de todos tus locales físicos (Ej. La Paz, Cochabamba, Santa Cruz).
    *   El formulario para **Crear Nueva Sucursal** (Dirección, Teléfono, Administrador a cargo).
    *   Desactivación temporal de una sucursal si entra en reparaciones.

### C. Catálogos Base (Plantillas)
*   **Ubicación (`/dashboard/configuracion/catalogos`)**
*   **¿Qué hay aquí?**
    *   Aquí creas las "Ideas" o "Diseños" maestros. Aquí diseñas el nuevo *"Traje de Moreno Plata 2026"* y declaras qué piezas necesita para armarse, y cuál será su precio sugerido de alquiler. Esto NO afecta el inventario físico hasta que una Sucursal decide ensamblar uno.

### D. Usuarios y Roles
*   Creación de cuentas para empleados y asignación de a qué Sucursal específica pertenecen para limitar su vista de inventario.
