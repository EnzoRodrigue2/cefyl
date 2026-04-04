

## Plan: Mejorar gestión de órdenes en el panel de admin

### Cambios en `src/pages/Admin.tsx`

**1. Agregar botón de eliminar orden en la tab "Órdenes"**
- Agregar un botón con ícono de basura (Trash2) junto a cada orden en la lista de órdenes recientes
- Usar AlertDialog para confirmar antes de borrar
- Al confirmar, eliminar registros relacionados (pagos, turnos, movimientos_financieros) y luego la orden
- También eliminar el archivo de storage asociado

**2. Limitar opciones de estado**
- En el Select de estado, en lugar de mostrar todos los estados posibles, mostrar solo "Finalizada" y "Pendiente pago" como opciones de cambio
- Mantener visible el estado actual como badge/texto si no es uno de esos dos

**3. Agregar botón de eliminar y cambio de estado en la tab "Historial"**
- Agregar columna "Acciones" a la tabla del historial
- Incluir botón de eliminar con confirmación
- Incluir selector de estado limitado a "Finalizada" y "Pendiente pago"

### Función nueva: `deleteOrden(id, archivoUrl)`
- Elimina pagos, turnos y movimientos_financieros asociados
- Elimina el archivo de storage
- Elimina la orden
- Recarga datos

No se necesitan cambios en la base de datos ya que las políticas RLS de DELETE para admin ya existen en todas las tablas involucradas.

