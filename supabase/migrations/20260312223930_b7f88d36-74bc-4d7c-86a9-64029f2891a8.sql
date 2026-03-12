ALTER TABLE public.ordenes ADD COLUMN IF NOT EXISTS anillado boolean DEFAULT false;
ALTER TABLE public.ordenes ADD COLUMN IF NOT EXISTS usar_beca boolean DEFAULT true;