# Plan de Diseño UI y Arquitectura Fronend: SaaS Folklórico

Este documento describe la propuesta visual y técnica para el frontend del sistema (Next.js), enfocándose en integrar una estética que celebre la cultura folklórica boliviana en un entorno profesional y limpio de SaaS modernos.

## 1. Concepto Visual: "Tradición Profesional"
El objetivo es lograr un equilibrio entre un panel de control (dashboard) eficiente y altamente usable, con toques característicos de la ropa y el baile folklórico boliviano.

### Paleta de Colores
- **Fondo General (Backgrounds):** Blanco crema/hueso (#FAFAF9) para la aplicación principal, evitando el blanco clínico puro.
- **Color Principal (Primary):** Rojo Oscuro / Carmín (#8B0000 o #991B1B) - Representa la fuerza y pasión de las danzas como el Tinku o Caporales.
- **Color Secundario (Secondary):** Aguayo/Multicolor (En sutiles gradientes, líneas de acento o bordes de tarjetas).
- **Acentos (Accents):** Dorado Andino (#D4AF37) y Verde Hoja de Coca (#2E8B57) para estados de éxito o botones de llamados a la acción (CTAs).
- **Modo Oscuro (Dark Mode):** Fondo grafito/carbón (#18181B) con acentos dorados y neones sutiles inspirados en trajes de luces (Morenada/Diablada).

### Tipografía
- **Títulos y Encabezados:** *Outfit* o *Lora* (con serifas o curvas elegantes para darle peso y tradición).
- **Cuerpo y Datos (Data):** *Inter* o *Geist Sans* (san-serif, excelente legibilidad para lectura de reportes y fletes).

### Iconografía y Elementos Visuales
- Utilizaremos *Lucide Icons* (provistos por shadcn/ui) pero redondeados.
- **Motivos Andinos:** Patrones de texturas estilo aguayo tenues en el fondo del sidebar, o como franja superior en el navbar.
- **Botones y Tarjetas:** Ligeramente redondeados (`rounded-xl` o `rounded-2xl`), con sombras suaves para dar un efecto de "elevación" (glassmorphism sutil).

## 2. Arquitectura de Componentes UI
Utilizaremos **shadcn/ui** modificado para que empate con esta temática.

### Layout del Dashboard
- **Sidebar (Menú Lateral):**
  - Fondo grafito con texto blanco o hueso crema oscuro.
  - Logo estilizado en la parte superior.
  - Enlaces con efecto *hover* dorado o rojo carmín tenue.
- **TopBar (Barra Superior):**
  - Limpia, contendrá el buscador global, notificaciones, y menú de usuario.
  - Una línea delgada (border-b o hr) con los colores del aguayo.
- **Main Content (Contenido Central):**
  - Tarjetas (Cards) de estadísticas y listas de inventario o fletes, en contenedores blancos con sombras muy difusas.

## 3. Páginas Clave a Diseñar

### A. Página de Login (`app/(auth)/login/page.tsx`)
- Mitad de la pantalla: Formulario limpio y profesional.
- Otra mitad de la pantalla: Imagen de fondo espectacular (generada o provista) de una fraternidad/danzantes en acción, o de prendas texturizadas, con una capa de color (overlay) para integrar el logo.

### B. Dashboard Resumen (`app/dashboard/page.tsx`)
- **KPI Cards:**
  - Total de fletes activos.
  - Prendas alquiladas esta semana.
  - Ganancias estimadas.
- **Gráficos:** Un gráfico de barras usando recharts mostrando tendencias.
- **Tablas Recientes:** Componentes de tabla (Table) renderizados con shadcn/ui mostrando los últimos movimientos, con "Badges" coloridos para los estados (ej. "En Camino" en verde, "Devolución Pendiente" en dorado).

### C. Catálogo de Ropa Folklórica (`app/dashboard/rentals/page.tsx`)
- Vista tipo "Grid" (cuadrícula) estilo e-commerce o Pinterest.
- Cada tarjeta mostrará la foto del traje, Talla, y Fraternidad o Danza a la que pertenece.
- Efectos `hover` que revelan un botón rápido de "Alquilar".

## 4. Implementación Técnica Inicial (Siguientes Pasos)
1.  **Instalar tailwindcss y shadcn/ui** en el directorio `frontend`.
2.  **Configurar `tailwind.config.ts`:**
    - Agregar los colores personalizados (`crimson`, `andeanGold`, `aguayoPattern`).
3.  **Crear el Layout (Sidebar/Navbar).**
4.  **Generar la vista del login y el dashboard base.**
