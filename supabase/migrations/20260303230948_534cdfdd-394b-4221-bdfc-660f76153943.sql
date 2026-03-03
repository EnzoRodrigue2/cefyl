
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre_completo TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  carrera TEXT NOT NULL,
  acepto_terminos BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_profiles_dni ON public.profiles(dni);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Becas
CREATE TYPE public.beca_tipo AS ENUM ('sin_beca', '50', '100');
CREATE TYPE public.beca_estado AS ENUM ('pendiente', 'aprobada', 'rechazada', 'revocada');

CREATE TABLE public.becas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo beca_tipo NOT NULL DEFAULT 'sin_beca',
  estado beca_estado NOT NULL DEFAULT 'pendiente',
  fecha_inicio DATE,
  fecha_vencimiento DATE,
  documentacion_url TEXT,
  motivo_revocacion TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.becas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own becas" ON public.becas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can request beca" ON public.becas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all becas" ON public.becas FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_becas_updated_at BEFORE UPDATE ON public.becas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Uso mensual beca 100%
CREATE TABLE public.beca_uso_mensual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  monto_usado NUMERIC(10,2) DEFAULT 0,
  UNIQUE(user_id, mes, anio)
);
ALTER TABLE public.beca_uso_mensual ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own uso" ON public.beca_uso_mensual FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage uso" ON public.beca_uso_mensual FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Ordenes
CREATE TYPE public.orden_estado AS ENUM ('borrador', 'pendiente_pago', 'pagado', 'en_proceso', 'finalizada', 'lista_retirar', 'retirada', 'cancelada');

CREATE TABLE public.ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  cantidad_paginas INTEGER NOT NULL DEFAULT 1,
  doble_faz BOOLEAN DEFAULT false,
  color BOOLEAN DEFAULT false,
  comentarios TEXT,
  cantidad_hojas INTEGER NOT NULL DEFAULT 1,
  precio_base NUMERIC(10,2) NOT NULL DEFAULT 0,
  descuento_beca NUMERIC(10,2) DEFAULT 0,
  monto_final NUMERIC(10,2) NOT NULL DEFAULT 0,
  excedente NUMERIC(10,2) DEFAULT 0,
  estado orden_estado NOT NULL DEFAULT 'borrador',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own ordenes" ON public.ordenes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create ordenes" ON public.ordenes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ordenes" ON public.ordenes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all ordenes" ON public.ordenes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_ordenes_estado ON public.ordenes(estado);
CREATE TRIGGER update_ordenes_updated_at BEFORE UPDATE ON public.ordenes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pagos
CREATE TYPE public.pago_estado AS ENUM ('pendiente', 'aprobado', 'rechazado');

CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID REFERENCES public.ordenes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  estado pago_estado NOT NULL DEFAULT 'pendiente',
  transaccion_id TEXT,
  metodo TEXT DEFAULT 'mercadopago',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own pagos" ON public.pagos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage pagos" ON public.pagos FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON public.pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Franjas horarias y turnos
CREATE TABLE public.franjas_horarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  cupo_maximo INTEGER NOT NULL DEFAULT 5,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.franjas_horarias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read franjas" ON public.franjas_horarias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage franjas" ON public.franjas_horarias FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID REFERENCES public.ordenes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  franja_id UUID REFERENCES public.franjas_horarias(id),
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado TEXT DEFAULT 'reservado',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own turnos" ON public.turnos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create turnos" ON public.turnos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own turnos" ON public.turnos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage turnos" ON public.turnos FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_turnos_updated_at BEFORE UPDATE ON public.turnos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configuraciones
CREATE TABLE public.configuraciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.configuraciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read config" ON public.configuraciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage config" ON public.configuraciones FOR ALL USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.configuraciones (clave, valor, descripcion) VALUES
  ('precio_por_hoja', '50', 'Precio base por hoja en ARS'),
  ('limite_beca_100', '5000', 'Límite mensual para becas 100% en ARS'),
  ('cupo_por_turno', '5', 'Cupo máximo por franja horaria'),
  ('comision_admin', '10', 'Comisión administrativa en porcentaje');

-- Logs
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  accion TEXT NOT NULL,
  detalle JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read logs" ON public.logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert logs" ON public.logs FOR INSERT TO authenticated WITH CHECK (true);

-- Movimientos financieros
CREATE TABLE public.movimientos_financieros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID REFERENCES public.ordenes(id),
  tipo TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.movimientos_financieros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read movimientos" ON public.movimientos_financieros FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Storage for print files
INSERT INTO storage.buckets (id, name, public) VALUES ('print-files', 'print-files', false);
CREATE POLICY "Users can upload print files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'print-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read own print files" ON storage.objects FOR SELECT USING (bucket_id = 'print-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can read all print files" ON storage.objects FOR SELECT USING (bucket_id = 'print-files' AND public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nombre_completo, dni, email, carrera)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre_completo', ''), COALESCE(NEW.raw_user_meta_data->>'dni', ''), NEW.email, COALESCE(NEW.raw_user_meta_data->>'carrera', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
