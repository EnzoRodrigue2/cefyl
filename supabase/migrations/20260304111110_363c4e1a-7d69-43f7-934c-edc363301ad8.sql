
-- Add unique constraints on profiles.dni and profiles.email
ALTER TABLE public.profiles ADD CONSTRAINT profiles_dni_unique UNIQUE (dni);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
