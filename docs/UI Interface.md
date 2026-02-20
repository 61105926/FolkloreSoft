# Plan de Implementación: UI Folklórica y Dashboard (SaaS Base)

Este plan de implementación detalla la inicialización y el diseño de la interfaz de usuario para el sistema SaaS. El objetivo visual es un diseño **"Premium Folklórico"** que combine la limpieza y eficiencia de un panel de administración moderno con colores, texturas y acentos inspirados en el folklore de Bolivia.

## Proposed Changes

La implementación se dividirá en la configuración del entorno frontend y la creación del sistema de diseño (Design System).

### Fase 1: Entorno Next.js y TailwindCSS
- **Inicializar Frontend:** Se creará (o sobrescribirá) el proyecto en `/frontend` usando Next.js App Router.
- **Configurar Tailwind:** Ajustaremos `tailwind.config.ts` para incluir nuestra paleta "Folklore Premium":
  - `primary`: Carmín Festivo (#991b1b)
  - `secondary`: Dorado Andino (#d4af37)
  - `background`: Crema Cálido (#fafaf9)
  - Variables de gradientes estilo "aguayo" para usar como divisor o acento superior.

### Fase 2: Layout Principal (Panel Central)
- **TopBar (Navegación Superior):** Navbar limpio con el logo, notificaciones y menú de usuario. Llevará una sutil línea multicolor en el borde inferior.
- **Sidebar (Navegación Lateral):** Menú en fondo oscuro elegante (grafito) o claro con efecto "glass", conteniendo iconos redondeados para "Dashboard", "Fletes", "Inventario Ropa", etc.
- **MainContent (Área de Trabajo):** Fondos claros para un alto contraste en la lectura de datos.

### Fase 3: Dashboard (Panel Principal)
El dashboard `app/dashboard/page.tsx` contará con:
1. **Cards de KPI (Métricas Clave):** Tarjetas estilizadas mostrando (ej. "Total Fletes Activos", "Ropa Alquilada").
2. **Gráfico Visual:** Un gráfico atractivo con gradiente mostrando ganancias o proyecciones.
3. **Tabla de Actividad Reciente:** Uso de tablas estilizadas para ver los últimos fletes y alquileres con Badges de colores semánticos (Verde=Completado, Dorado=Pendiente).

## Verification Plan
### Manual Verification
1. Compilaremos la aplicación Next.js (`npm run dev`).
2. Ingresaremos a la ruta base y luego al `/dashboard`.
3. Verificaremos que el sistema de colores, tipografías y sombras se ajusten al requerimiento "Folklórico Premium", asegurándonos de que haya interactividad constante (hover states, animaciones agradables).
