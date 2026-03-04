-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to delete completed orders older than 24 hours and their files
CREATE OR REPLACE FUNCTION public.cleanup_completed_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  -- Delete orders that have been 'retirada' for more than 24 hours
  FOR r IN
    SELECT id, archivo_url, user_id
    FROM public.ordenes
    WHERE estado = 'retirada'
      AND updated_at < now() - interval '24 hours'
  LOOP
    -- Delete related records first
    DELETE FROM public.turnos WHERE orden_id = r.id;
    DELETE FROM public.pagos WHERE orden_id = r.id;
    DELETE FROM public.movimientos_financieros WHERE orden_id = r.id;
    -- Delete storage file
    DELETE FROM storage.objects WHERE bucket_id = 'print-files' AND name = r.archivo_url;
    -- Delete the order
    DELETE FROM public.ordenes WHERE id = r.id;
  END LOOP;
END;
$$;

-- Schedule cleanup every hour
SELECT cron.schedule(
  'cleanup-completed-orders',
  '0 * * * *',
  $$SELECT public.cleanup_completed_orders();$$
);