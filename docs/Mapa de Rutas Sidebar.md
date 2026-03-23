# Mapa de Rutas y Menú Lateral (Sidebar) - IntiSoft

Este documento define la estructura oficial de navegación, módulos y rutas del sistema híbrido IntiSoft, respetando fielmente la distribución provista de operaciones cotidianas versus configuraciones del sistema.

---

## 1. Módulos Operativos (El día a día)

### A. Principal
| Ítem | Ruta | ¿Qué hay aquí? |
|-----|------|-----------------|
| **Dashboard** | `/dashboard` | Resumen, gráficos y KPIs de la sucursal actual en la que opera el usuario logueado. |

### B. Sistema Folklórico (Inventario)
Aquí viven las definiciones y las existencias físicas de la sucursal operante.

| Ítem | Ruta | ¿Qué hay aquí? |
|-----|------|-----------------|
| **Conjuntos Folklóricos** | `/conjuntos` | **Catálogo Base (Plantillas)**: Diseños de trajes, componentes que requieren, precios sugeridos. No es inventario físico. |
| **Componentes** | `/componentes` | **Catálogo Base de Prendas**: Definición de polleras, botas, sombreros, etc. (talla, color, tipo). |
| **Inventario Físico** | `/instancias` | **Bodega de Trajes Armados**: Instancias reales (`InstanciaConjunto`). Trajes listos para alquilar o con estados (disponible, incompleto). Aquí se incluye el armado/desarmado y el Pool de Componentes (piezas sueltas). |
| **Sucursales** | `/sucursales/inventario` | **Inventario por Sucursal**: Visor de stock por local. Incluye la pestaña logística de **Transferencias** (enviar, recibir, confirmar recepción entre locales). |

### C. Operaciones
| Ítem | Ruta | ¿Qué hay aquí? |
|-----|------|-----------------|
| **Ventas** | `/venta` | Punto de Venta (POS) para compra definitiva de conjuntos. Impresión de factura en `/venta/imprimir/{id}`. |
| **Alquileres** | `/alquiler` | Gestión de **Fletes**: Contratos, registro de clientes, fechas y calendario de devoluciones de las instancias de conjunto alquiladas. |

### D. Finanzas
| Ítem | Ruta | ¿Qué hay aquí? |
|-----|------|-----------------|
| **Caja** | `/caja` | Gestión de flujo: Apertura, cierre de turnos, movimientos de ingreso/egreso y arqueo final. |
| **Garantías** | `/garantias` | Administración de depósitos de seguridad/garantías vinculadas a un contrato de alquiler o flete en curso. |
| **Reportes Financieros**| *(En construcción)* | Previsión para futuras integraciones de contabilidad y métricas de ganancia. |

### E. Gestión (Eventos y Personas)
| Ítem | Ruta | ¿Qué hay aquí? |
|-----|------|-----------------|
| **Clientes** | `/cliente` | Base de datos unificada de clientes para venta rápida y contratos de alquiler. |
| **Eventos Folklóricos** | `/eventos-folkloricos`| Catálogo de celebraciones, entradas de Gran Poder, Urkupiña, etc. |
| **Entradas Folklóricas**| `/entrada-folklorica` | Bloque específico para la inscripción de participantes a eventos, y devoluciones masivas. |
| **Usuarios** | `/usuario` | (Nivel operativo) Manejo de empleados y sus roles dentro de los confines de los permisos otorgados (`user.view`). |

---

## 2. Configuración del Sistema (Administración)

Todo lo concerniente a reglas de negocio transversales y datos de la franquicia reside en una única gran vista.

| Ítem | Ruta | ¿Qué hay aquí? |
|-----|------|-----------------|
| **Configuración**| `/configuracion` | Página unificada (Single Page Configuration) compuesta por bloques: Empresa, Sucursales, Usuarios Admin y Sistema Base. |

**Componentes dentro de `/configuracion`:**
- **Empresa y parámetros:** Datos fiscales (NIT, Razón Social, Logo) y reglas de negocio aplicables a todos los locales.
- **Gestión de Sucursales:** El ABM (Alta, Baja, Modificación) físico de locales. Direcciones, teléfonos y asignación del administrador encargado.
- **Usuarios (Administración profunda):** Revocaciones globales, creación de Súper Administradores.
- **Sistema:** Ajustes técnicos, huso horario, monedas de curso legal.

---

## 3. Mapa Visual del Sidebar

```text
Dashboard                      (/dashboard)
Sistema Folklórico
  ├─ Conjuntos Folklóricos     (/conjuntos)
  ├─ Componentes               (/componentes)
  ├─ Inventario Físico         (/instancias)
  └─ Sucursales                (/sucursales/inventario)
Operaciones
  ├─ Ventas                    (/venta)
  └─ Alquileres                (/alquiler)
Finanzas
  ├─ Caja                      (/caja)
  ├─ Garantías                 (/garantias)
  └─ Reportes financieros      (#)
Gestión
  ├─ Clientes                  (/cliente)
  ├─ Eventos Folklóricos       (/eventos-folkloricos)
  ├─ Entradas Folklóricas      (/entrada-folklorica)
  └─ Usuarios                  (/usuario)
Sistema
  └─ Configuración             (/configuracion)
```
