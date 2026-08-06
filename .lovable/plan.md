# Eliminar usuarios con beca (excepto administradores)

## Qué se agrega

Un botón nuevo en la sección de Mantenimiento del panel admin: **"Eliminar usuarios con beca"**.

Al usarlo:

1. Pide confirmación explícita (diálogo, con el conteo de cuentas afectadas).
2. Elimina por completo las cuentas de todos los usuarios que tengan una beca asignada y **no** tengan rol de administrador.
3. Muestra el resultado ("X usuarios eliminados") y refresca las listas del panel.

Hoy hay 35 cuentas que cumplen esa condición (37 con beca, 3 admins entre ellas).

## Qué se borra por cada usuario

- Pedidos y sus archivos (incluidos los archivos guardados en almacenamiento)
- Becas y uso mensual de carillas
- Turnos, pagos y movimientos asociados
- Perfil, rol y la cuenta de acceso

La acción no se puede deshacer.

## Detalle técnico

- Nueva acción `delete_with_beca` en la función `bulk-create-users` (ya verifica rol admin del que la invoca).
  - Selecciona `user_id` distintos de `becas`, excluye los que tengan `role = 'admin'` en `user_roles`.
  - Por cada usuario: borra archivos de storage del bucket `print-files` referenciados en `orden_archivos` y en `ordenes`, luego borra filas en `orden_archivos`, `movimientos_financieros`, `pagos`, `turnos`, `ordenes`, `beca_uso_mensual`, `becas`, `profiles`, `user_roles`, y por último `auth.admin.deleteUser`.
  - Devuelve `{ deleted, errors }`.
- `src/pages/Admin.tsx`: nuevo handler `handleDeleteBecados` con `AlertDialog` de confirmación, estado de carga propio, y `loadAll()` al terminar. Se coloca junto al botón de eliminación masiva existente, con estilo destructivo.
