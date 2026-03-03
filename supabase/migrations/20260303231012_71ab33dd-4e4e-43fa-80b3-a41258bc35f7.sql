
-- Fix permissive RLS on logs table
DROP POLICY "System can insert logs" ON public.logs;
CREATE POLICY "Authenticated users can insert own logs" ON public.logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
