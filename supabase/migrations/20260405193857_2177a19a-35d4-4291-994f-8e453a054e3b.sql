CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nombre_completo, dni, email, carrera, fecha_nacimiento)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', ''),
    COALESCE(NEW.raw_user_meta_data->>'dni', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'carrera', ''),
    CASE WHEN NEW.raw_user_meta_data->>'fecha_nacimiento' IS NOT NULL AND NEW.raw_user_meta_data->>'fecha_nacimiento' != ''
      THEN (NEW.raw_user_meta_data->>'fecha_nacimiento')::date
      ELSE NULL
    END
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$function$;