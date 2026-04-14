

## Plan: Hacer el sitio completamente responsive

Hay varios problemas de responsive en las páginas principales. Aquí están los cambios necesarios:

### Problemas identificados

1. **Dashboard (header):** El header usa `flex items-center justify-between` sin wrap, lo que causa overflow en móvil cuando hay botón de admin + nombre + logout.

2. **Admin (header):** Similar al dashboard, título largo "Panel Admin — IMPRESIONES CEFyL" se corta en móvil.

3. **Admin (stats):** Grid de 4 columnas (`sm:grid-cols-4`) funciona pero las cards internas tienen texto largo que puede desbordar.

4. **Admin (tabs):** La `TabsList` con 5 tabs (Órdenes, Historial, Becas, Usuarios, Config) no tiene scroll horizontal en móvil, se desborda.

5. **Admin (órdenes):** Cada orden tiene botones de descarga + selector de estado + eliminar en una fila horizontal que se rompe en móvil.

6. **Admin (historial):** Tabla con 11 columnas — tiene `overflow-x-auto` (bien), pero la tabla es muy ancha.

7. **Admin (becas):** Grid `grid-cols-2 sm:grid-cols-4` para info del usuario — OK pero podría mejorar.

8. **NuevaOrden:** Grid de opciones `grid-cols-2` puede ser muy estrecho en pantallas pequeñas (320px).

9. **NuevaOrden (resumen de precio):** Los `flex justify-between` con texto largo pueden desbordar.

### Cambios a realizar

**`src/pages/Dashboard.tsx`:**
- Header: hacer responsive con wrap, ocultar nombre en móvil o moverlo a segunda línea
- Asegurar padding más pequeño en móvil (`p-4 sm:p-6`)

**`src/pages/Admin.tsx`:**
- Header: truncar título en móvil, usar texto más corto
- TabsList: agregar `overflow-x-auto` y `flex-wrap` o scroll horizontal
- Órdenes: apilar botones de acción verticalmente en móvil
- Historial: ya tiene `overflow-x-auto` (OK)
- Becas: ajustar grid y selector de alumnos
- Stats: reducir a 2 columnas en móvil (`grid-cols-2 sm:grid-cols-4`)

**`src/pages/NuevaOrden.tsx`:**
- Opciones: `grid-cols-1 sm:grid-cols-2` en pantallas muy pequeñas
- Padding responsive (`p-4 sm:p-6`)
- Resumen de precios: permitir wrap en textos largos

**`src/pages/Auth.tsx`:**
- Ya es bastante responsive, solo ajustar padding mínimo

### Resumen técnico
- Todos los cambios son CSS/Tailwind — sin cambios de lógica
- Se usan breakpoints `sm:` (640px) como punto de corte principal
- Se agrega scroll horizontal a tabs del admin
- Se apilan elementos verticalmente en móvil donde sea necesario

