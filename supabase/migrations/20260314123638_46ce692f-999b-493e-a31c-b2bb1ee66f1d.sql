CREATE POLICY "Admins can delete pagos" ON public.pagos FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete movimientos" ON public.movimientos_financieros FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete beca_uso" ON public.beca_uso_mensual FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage user_roles" ON public.user_roles FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete ordenes" ON public.ordenes FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete becas" ON public.becas FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete turnos" ON public.turnos FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));