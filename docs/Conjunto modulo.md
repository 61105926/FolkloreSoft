# Resumen del Módulo Conjuntos Folklóricos

Documento único del módulo **Conjuntos Folklóricos**: qué hace, qué tiene hoy y qué mejoras se pueden aplicar.

---

## 1. ¿Qué es este módulo?

El módulo **Conjuntos Folklóricos** (`/conjuntos`) es el **catálogo base (plantilla)** de trajes. Aquí se definen los diseños de conjuntos: nombre, categoría, precios, qué componentes llevan y qué variaciones (talla, color, etc.) tienen. **No** es el inventario físico de trajes armados; eso está en **Inventario Físico** (`/instancias`) y **Sucursales** (`/sucursales/inventario`).

**Ruta:** `/conjuntos`  
**Componente Livewire:** `App\Http\Livewire\Conjunto\ConjuntoManagement`  
**Vista principal:** `livewire.conjunto.conjunto-management`

---

## 2. Qué hace hoy (resumen funcional)

### 2.1 Listado de conjuntos
- **Grid de tarjetas** (o lista) con todos los conjuntos activos.
- **Filtros:** búsqueda por nombre/código/descripción, categoría, género.
- **Orden:** nombre, código, categoría, precio alquiler/día, fecha de creación.
- **Por conjunto se muestra:** nombre, código, categoría, género, variaciones, total instancias, disponibles/alquilados/reservados/en limpieza, precios venta y alquiler/día, barras de disponibilidad, badges Venta/Alquiler.
- **Estadísticas globales (dashboard):** total conjuntos, total instancias, disponibles, en uso, % disponibles, ROI promedio (placeholder), valor inventario (placeholder).

### 2.2 Crear nuevo conjunto (modal)
- **Pestaña General:** código (auto: `[CAT]-[GÉNERO]-[AÑO]`, ej. TINK-M-2025), nombre, categoría, género, descripción, precio venta base, precio alquiler/día.
- **Pestaña Componentes:** checklist de componentes (del catálogo de Componentes); se exige al menos uno. No se configuran cantidad por pieza ni obligatorio/orden en el formulario.
- **Pestaña Variaciones:** agregar filas talla, color, estilo, precio venta y precio alquiler/día por variación. Código y nombre de variación se generan automáticamente.
- **Pestaña Configuración:** disponible para venta, disponible para alquiler, observaciones.
- Al guardar: se crea el `Conjunto`, se hace `attach` de los componentes seleccionados (solo IDs, sin pivot detallado) y se crean las `VariacionConjunto` con datos ingresados.

### 2.3 Ver detalles de un conjunto (modal)
- **Pestañas:** General, Componentes, Variaciones, Instancias, Análisis.
- **General:** datos básicos, precios, modalidades, descripción, observaciones.
- **Componentes:** lista de componentes con obligatorio/opcional y código (según pivot).
- **Variaciones:** tabla con código, talla, color, estilo, precios, cantidad de instancias por variación, estado activa/inactiva.
- **Instancias:** tabla de instancias físicas (número serie, código interno, variación, estado físico, disponibilidad, ubicación, total usos).
- **Análisis:** ROI, tasa de utilización, métricas y recomendaciones; hoy la mayoría son **placeholders** (valores fijos o no calculados).

### 2.4 Crear instancias masivas (modal)
- Se elige: variación, sucursal, cantidad (1–50), prefijo de serie, lote, estado físico inicial, observaciones.
- **Verificar disponibilidad:** botón que hoy devuelve datos **simulados** (no consulta stock real de componentes en pool).
- **Previsualización:** números de serie y códigos internos que se generarían (la previsualización usa variacion_id en lugar del contador real en algún texto).
- Al confirmar: se crean N registros de `InstanciaConjunto` con estado DISPONIBLE, pero **no** se llama a `ConjuntoComponenteService::armarConjunto()`, por lo que las instancias quedan **sin componentes asignados** (trajes vacíos).

### 2.5 Acciones del menú por conjunto
- **Ver detalles** → modal de detalles.
- **Editar** → mensaje “en desarrollo”.
- **Crear instancias** → modal de instancias masivas.
- **Estadísticas** → “en desarrollo”.
- **Historial** → “en desarrollo”.
- **Eliminar** → “en desarrollo”.
- **Exportar** (header) → “en desarrollo”.

---

## 3. Modelos y relaciones implicadas

- **Conjunto:** categoría, código, nombre, descripción, precios, género, disponible_venta/alquiler, observaciones, activo. Relaciones: `categoriaConjunto`, `variaciones`, `componentes` (pivot `conjunto_componentes`: cantidad_requerida, es_obligatorio, es_intercambiable, orden_ensamblaje).
- **VariacionConjunto:** conjunto_id, codigo_variacion, nombre_variacion, talla, color, estilo, precios por variación, activa. Relación: `instancias` (InstanciaConjunto).
- **InstanciaConjunto:** variación, sucursal, numero_serie, codigo_interno, componentes_requeridos/actuales, estados, etc. Se crean desde este módulo en “Crear instancias”, pero el armado (asignación de componentes) debería hacerse con el servicio.

---

## 4. Mejoras recomendadas

### 4.1 Críticas (afectan correcto funcionamiento)

| Mejora | Situación actual | Acción sugerida |
|--------|------------------|------------------|
| **Armar conjunto al crear instancias** | Al crear instancias masivas solo se crea el registro `InstanciaConjunto`; no se asignan componentes. Las instancias quedan incompletas y no utilizables para alquiler/venta. | Después de crear cada `InstanciaConjunto` en el flujo de “Crear instancias”, llamar a `ConjuntoComponenteService::armarConjunto($instancia)`. Si no hay componentes suficientes en pool, no crear esa instancia o mostrar error claro por componente faltante. |
| **Verificación real de disponibilidad** | `verificarDisponibilidad()` devuelve datos fijos (ej. cantidad_maxima 50, disponible true). | Usar `ConjuntoComponenteService::verificarDisponibilidadComponentes()` (o método equivalente) por sucursal y cruzar con los componentes que requiere el conjunto/variación para mostrar cantidad máxima armable y componentes limitantes. |
| **Pivot de componentes al crear conjunto** | Se hace `attach($this->componentesSeleccionados)` sin datos de pivot. La tabla `conjunto_componentes` admite cantidad_requerida, es_obligatorio, es_intercambiable, orden_ensamblaje. | En el formulario “Nuevo conjunto”, por cada componente seleccionado permitir (opcionalmente) cantidad, obligatorio y orden. Al guardar, usar `attach` con array de IDs y pivot, ej. `[ id => ['cantidad_requerida' => 1, 'es_obligatorio' => true, 'orden_ensamblaje' => $orden ] ]`. Así el armado y la completitud tienen sentido. |

### 4.2 Importantes (UX y consistencia)

| Mejora | Situación actual | Acción sugerida |
|--------|------------------|------------------|
| **Editar conjunto** | Mensaje “en desarrollo”. | Pantalla o modal de edición: modificar nombre, descripción, precios, categoría, género; gestionar componentes (agregar/quitar y pivot); gestionar variaciones (editar/agregar/desactivar). Validar que no se borren variaciones con instancias en uso si el negocio lo prohíbe. |
| **Eliminar / desactivar** | “En desarrollo”. | Al menos **desactivar** (soft): poner `activo = false` y no permitir nuevas instancias ni ventas/alquileres de ese diseño. Eliminación física solo si no hay instancias (o con reglas claras). |
| **Duplicar conjunto** | “En desarrollo”. | Acción “Duplicar”: crear nuevo conjunto copiando nombre (ej. “Copia de …”), categoría, componentes (y pivot), variaciones y precios; no copiar instancias. Útil para temporada nueva. |
| **ROI y valor de inventario** | En estadísticas y en análisis por conjunto son valores fijos (ej. 85.5 %, valor en miles). | Calcular ROI real a partir de ingresos (alquileres/ventas) y costos (componentes o precio_venta_base). Valor de inventario: suma de precios de instancias o de conjuntos × instancias, según lo que definas. |
| **Vista lista** | Existe `vistaActual = 'tarjetas' \| 'lista'` pero en la vista solo se renderiza el grid de tarjetas. | Implementar la vista lista (tabla) cuando `vistaActual === 'lista'` con columnas clave: código, nombre, categoría, variaciones, instancias, disponibles, precios, acciones. |

### 4.3 Deseables (pulido)

| Mejora | Situación actual | Acción sugerida |
|--------|------------------|------------------|
| **Exportar** | “En desarrollo”. | Exportar listado de conjuntos (y opcionalmente variaciones/instancias) a Excel o CSV: código, nombre, categoría, precios, conteos. |
| **Estadísticas por conjunto** | “En desarrollo”. | Desde “Ver detalles” o “Estadísticas”, mostrar gráficos o KPIs reales: usos, ingresos, tasa de utilización por período para ese conjunto. |
| **Historial por conjunto** | “En desarrollo”. | Listar hitos: creación, cambios de precios o componentes, creación de variaciones/instancias, o eventos de alquiler/venta vinculados (si guardas referencia en historial). |
| **Imagen del conjunto** | El modelo tiene `imagen_principal` pero el formulario y las tarjetas no muestran/suben imagen. | Campo opcional de imagen en crear/editar; mostrar thumbnail en tarjetas y en modal de detalles. |
| **Código de variación único** | Al crear variaciones se usa `$conjunto->codigo . '-VAR-' . $contador`. | Asegurar unicidad (ej. por conjunto + contador ya está bien; si hay eliminaciones, mantener secuencia sin colisiones). |
| **Validación VariacionConjunto** | En `guardarConjunto` se hace `VariacionConjunto::create([..., 'usuario_creacion' => auth()->id()])` pero el modelo no tiene `usuario_creacion` en `fillable`. | Quitar `usuario_creacion` del create o agregarlo al `fillable` (y columna en BD si se desea auditoría). |
| **Previsualización de instancias** | En el modal de instancias, la previsualización de código interno usa `$this->instanceForm['variacion_id']` en lugar del número secuencial que realmente se usará (contadorInicial + i). | Usar el mismo algoritmo que en `crearInstanciasMasivas` para mostrar en la tabla de previsualización los números de serie y códigos internos que se crearán. |

---

## 5. Resumen en una frase

**El módulo Conjuntos Folklóricos es el catálogo de diseños de trajes (con categoría, componentes y variaciones); hoy permite crear y listar conjuntos y variaciones, y crear instancias físicas, pero las instancias no se arman con componentes, la verificación de stock es simulada y faltan edición, eliminación/desactivación, duplicado y métricas reales.**

Priorizando: primero **armar conjunto al crear instancias** y **verificación real de disponibilidad**, luego **pivot de componentes** y **edición/desactivación**, y después el resto de mejoras.
