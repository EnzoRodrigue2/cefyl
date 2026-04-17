-- 1. tipo_material per archivo
DO $$ BEGIN
  CREATE TYPE public.tipo_material AS ENUM ('carreras', 'cbc');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.orden_archivos
  ADD COLUMN IF NOT EXISTS tipo_material public.tipo_material NOT NULL DEFAULT 'carreras';

-- 2. retirada_at + email_retiro_enviado on ordenes
ALTER TABLE public.ordenes
  ADD COLUMN IF NOT EXISTS retirada_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_retiro_enviado boolean NOT NULL DEFAULT false;

-- 3. Trigger to set retirada_at when estado changes to 'retirada'
CREATE OR REPLACE FUNCTION public.set_retirada_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.estado = 'retirada' AND (OLD.estado IS DISTINCT FROM 'retirada') THEN
    NEW.retirada_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_retirada_at ON public.ordenes;
CREATE TRIGGER trg_set_retirada_at
BEFORE UPDATE ON public.ordenes
FOR EACH ROW
EXECUTE FUNCTION public.set_retirada_at();

-- 4. Update cleanup function to use 72h and retirada_at
CREATE OR REPLACE FUNCTION public.cleanup_completed_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT o.id, o.user_id
    FROM public.ordenes o
    WHERE o.estado = 'retirada'
      AND COALESCE(o.retirada_at, o.updated_at) < now() - interval '72 hours'
  LOOP
    -- Delete archivos and their storage
    FOR r IN
      SELECT id, archivo_url FROM public.orden_archivos WHERE orden_id = r.id
    LOOP
      DELETE FROM storage.objects WHERE bucket_id = 'print-files' AND name = r.archivo_url;
    END LOOP;
    DELETE FROM public.orden_archivos WHERE orden_id = r.id;
    DELETE FROM public.turnos WHERE orden_id = r.id;
    DELETE FROM public.pagos WHERE orden_id = r.id;
    DELETE FROM public.movimientos_financieros WHERE orden_id = r.id;
    DELETE FROM storage.objects WHERE bucket_id = 'print-files' AND name = (SELECT archivo_url FROM public.ordenes WHERE id = r.id);
    DELETE FROM public.ordenes WHERE id = r.id;
  END LOOP;
END;
$function$;