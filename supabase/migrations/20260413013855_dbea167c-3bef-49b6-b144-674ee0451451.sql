-- Create table for multiple files per order
CREATE TABLE public.orden_archivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID NOT NULL REFERENCES public.ordenes(id) ON DELETE CASCADE,
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  cantidad_paginas INTEGER NOT NULL DEFAULT 1,
  cantidad_hojas INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orden_archivos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own orden archivos"
ON public.orden_archivos FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.ordenes WHERE ordenes.id = orden_archivos.orden_id AND ordenes.user_id = auth.uid())
);

CREATE POLICY "Users can insert own orden archivos"
ON public.orden_archivos FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.ordenes WHERE ordenes.id = orden_archivos.orden_id AND ordenes.user_id = auth.uid())
);

CREATE POLICY "Admins can manage orden archivos"
ON public.orden_archivos FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for ordenes so students see status changes
ALTER PUBLICATION supabase_realtime ADD TABLE ordenes;