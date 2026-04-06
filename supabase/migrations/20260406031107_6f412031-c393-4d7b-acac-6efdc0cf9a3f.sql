
CREATE TYPE public.estado_produccion AS ENUM ('para_hacer', 'hecho', 'retirado');
ALTER TABLE public.ordenes ADD COLUMN estado_produccion public.estado_produccion NOT NULL DEFAULT 'para_hacer';
