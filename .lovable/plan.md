

## Plan: Mejoras en flujo de pago y panel admin

### Resumen

Se implementarán 4 cambios: (1) el webhook de MercadoPago ya existe y funciona, solo hay que asegurar que el admin solo vea órdenes pagadas; (2) agregar campo `estado_produccion` para seguimiento interno; (3) búsqueda por DNI con descuento manual de carillas.

---

### 1. Filtrar órdenes no pagadas del panel admin

**Archivo: `src/pages/Admin.tsx`**
- En la tab "Órdenes", filtrar para mostrar solo órdenes con `estado` distinto de `borrador`, `pendiente_pago` y `cancelada` (es decir, solo `pagado`, `en_proceso`, `finalizada`, `lista_retirar`, `retirada`).
- En la tab "Historial", aplicar el mismo filtro base (mostrar solo órdenes que fueron pagadas en algún momento).
- Actualizar las stats para contar solo órdenes pagadas.

### 2. Agregar campo `estado_produccion` a la tabla `ordenes`

**Migración SQL:**
- Crear un nuevo enum `estado_produccion` con valores: `para_hacer`, `hecho`, `retirado`.
- Agregar columna `estado_produccion` a `ordenes` con default `para_hacer`.

```sql
CREATE TYPE public.estado_produccion AS ENUM ('para_hacer', 'hecho', 'retirado');
ALTER TABLE public.ordenes ADD COLUMN estado_produccion estado_produccion NOT NULL DEFAULT 'para_hacer';
```

**Archivo: `src/pages/Admin.tsx`**
- Reemplazar el Select de estado actual por un Select de `estado_produccion` con las 3 opciones: "Para hacer", "Hecho", "Retirado".
- Crear función `updateEstadoProduccion(id, valor)` que actualice este campo.
- Mostrar el estado de producción como badge/columna tanto en Órdenes como en Historial.
- Remover el selector de estado de pago (ya no tiene sentido cambiarlo manualmente).

### 3. Búsqueda por DNI con descuento manual de carillas

**Archivo: `src/pages/Admin.tsx`**
- Agregar una sección/card en la tab "Becas" (o nueva tab) con:
  - Input de búsqueda por DNI (validación numérica).
  - Al buscar, mostrar nombre, carrera, beca activa, carillas disponibles.
  - Input para cantidad de carillas a descontar.
  - Botón "Descontar" con validaciones: usuario existente, saldo suficiente, no negativo.
- Nota: ya existe un sistema de descuento manual por selector de alumno. Se mejorará agregando la búsqueda por DNI como método alternativo y más rápido.

### 4. Trigger faltante (fix pendiente)

**Migración SQL:**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Esto es necesario para que el registro de nuevos usuarios funcione correctamente.

---

### Archivos a modificar
- `src/pages/Admin.tsx` — filtros, nuevo selector de producción, búsqueda por DNI
- 1 migración SQL — nuevo enum, nueva columna, trigger faltante

### No se necesitan cambios en
- `supabase/functions/mp-webhook/index.ts` — ya actualiza estado a `pagado` cuando MP confirma
- `supabase/functions/create-mp-preference/index.ts` — ya crea órdenes en `pendiente_pago`

