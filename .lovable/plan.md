## Problem

The `orden_archivos` table has 1028+ rows. The admin panel fetches all of them with `supabase.from('orden_archivos').select('*')` which hits Supabase's default 1000-row limit. Recent orders' files get cut off, so clicking "Archivo" downloads nothing.

## Fix

In `src/pages/Admin.tsx`, change the `orden_archivos` fetch to only load files for the orders that were actually fetched (max 200 orders). This is both more efficient and avoids the 1000-row limit.

### Steps

1. **Two-step fetch in `loadAll()`**: First fetch ordenes (already limited to 200), then fetch `orden_archivos` filtered by those order IDs using `.in('orden_id', orderIds)`.

2. Since `.in()` has a practical limit of ~300 items and we fetch max 200 orders, this stays well within bounds.

This ensures every visible order in the admin panel has its files available for download.