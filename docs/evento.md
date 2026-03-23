# Diseño del módulo Eventos Folklóricos

Referencia del diseño visual y estructura de la vista **Eventos Folklóricos** (`/eventos-folkloricos`).  
Vista: `resources/views/livewire/evento-folklorico/evento-folklorico.blade.php`.  
Layout: `layouts.theme.modern-app` (incluye los estilos `.modern-card` y `.text-gradient`).

---

## 1. Estructura general

```
┌─────────────────────────────────────────────────────────────┐
│  [Título con gradiente]              [Botón Nuevo Evento]   │
├─────────────────────────────────────────────────────────────┤
│  Alertas (success / error)                                  │
├─────────────────────────────────────────────────────────────┤
│  ESTADÍSTICAS: 6 tarjetas en fila (Total, Activos, ...)     │
├─────────────────────────────────────────────────────────────┤
│  FILTROS: búsqueda + selects (Estado, Tipo, Sucursal) +     │
│           botón Alertas                                      │
├─────────────────────────────────────────────────────────────┤
│  TABLA: Evento | Fecha/Hora | Tipo | Participantes |        │
│         Estado | Ingresos | Acciones                        │
│  Paginación                                                 │
└─────────────────────────────────────────────────────────────┘
+ Modales: Nuevo evento, Ver evento, Participante, Vestimenta, Finalizar
```

---

## 2. Clases y estilos usados

### Título
- **Clase:** `text-gradient fw-bold`
- **Contenido:** icono `fa-mask` + "Eventos Folklóricos"
- **Botón:** `btn btn-primary` — "Nuevo Evento"

### Tarjetas de estadísticas (6)
- **Contenedor:** `row row-cols-1 row-cols-md-6 g-4 mb-4`
- **Cada ítem:** `col` > `modern-card` > `card-body d-flex justify-content-between align-items-center`
- **Contenido:** etiqueta `text-muted mb-1`, número `fs-2 fw-bold mb-0`, icono Font Awesome `fa-2x` con color (text-primary, text-success, text-warning, text-info, text-danger, text-secondary)

| Ítem         | Etiqueta       | Icono           |
|-------------|----------------|-----------------|
| 1           | Total Eventos  | fa-calendar     |
| 2           | Activos        | fa-play-circle  |
| 3           | Próximos      | fa-clock        |
| 4           | Participantes  | fa-users        |
| 5           | Eventos Hoy    | fa-calendar-day |
| 6           | Ingresos       | fa-dollar-sign  |

### Bloque de filtros
- **Contenedor:** `modern-card mb-4` > `card-body`
- **Fila:** `row` con:
  - Búsqueda: `col-md-3` > `input-group` (input-group-text con fa-search + `form-control`)
  - Estado: `col-md-2` > `form-select` (TODOS, PLANIFICADO, CONFIRMADO, etc.)
  - Tipo: `col-md-2` > `form-select` (FESTIVAL, CONCURSO, etc.)
  - Sucursal: `col-md-3` > `form-select` (opciones dinámicas)
  - Botón: `col-md-2` > `btn btn-outline-secondary w-100` — "Alertas"

### Tabla de eventos
- **Contenedor:** `modern-card` > `card-body`
- **Tabla:** `table-responsive` > `table table-hover`
- **Cabecera:** `thead class="table-light"` — Evento, Fecha/Hora, Tipo, Participantes, Estado, Ingresos, Acciones
- **Celdas:** badges con `bg-warning`, `bg-info`, `bg-primary`, `bg-success`, `bg-danger`, `bg-secondary` según estado
- **Paginación:** `d-flex justify-content-center` > `$eventos->links()`

### Modales
- **Contenedor:** `modal fade show d-block` con `background-color: rgba(0,0,0,0.5)`
- **Cabeceras por modal:**
  - Nuevo evento: `modal-header bg-primary text-white`, `btn-close-white`
  - Ver evento: `modal-header bg-info text-white`
  - Participante: `modal-header bg-success text-white`
  - Vestimenta: `modal-header bg-warning text-dark`
  - Finalizar: `modal-header bg-danger text-white`
- **Cuerpo:** `modal-body` con `card`, `card-header`, `card-body` donde aplica.

---

## 3. CSS necesario (definido en `modern-app.blade.php`)

Si usas esta vista con el layout `modern-app`, estos estilos ya están cargados. Si quieres reutilizar el diseño en otro layout, incluye:

```css
/* Tarjetas modernas */
.modern-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.modern-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    transform: translateY(-1px);
}

/* Título con gradiente */
.text-gradient {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

---

## 4. Dependencias

- **Bootstrap 5:** grid, cards, table, form-control, form-select, btn, alert, modal, badge, progress.
- **Font Awesome:** iconos (fa-mask, fa-plus, fa-calendar, fa-search, etc.).
- **Livewire:** `wire:click`, `wire:model`, `wire:model.debounce.300ms`.
- **Layout:** `@extends('layouts.theme.modern-app')` para tener `.modern-card` y `.text-gradient`.

---

## 5. Resumen

| Bloque        | Clase principal | Contenido clave                          |
|---------------|-----------------|------------------------------------------|
| Título        | `text-gradient` | Título + botón Nuevo Evento              |
| Estadísticas  | `modern-card`   | 6 tarjetas con número + icono           |
| Filtros       | `modern-card`   | Input búsqueda + 3 selects + Alertas    |
| Lista         | `modern-card`   | Tabla hover + badges estado + acciones   |
| Modales       | Bootstrap modal | Cabecera coloreada según tipo de modal   |

Con esto puedes replicar el mismo diseño en otra vista o tenerlo como referencia para cambios.
