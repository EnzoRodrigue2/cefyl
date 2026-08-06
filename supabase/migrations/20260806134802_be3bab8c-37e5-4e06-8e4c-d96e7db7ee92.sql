-- Revoke direct API execution of SECURITY DEFINER / trigger functions from app roles.
-- These are only meant to run as triggers or from backend (service_role) code.
REVOKE ALL ON FUNCTION public.cleanup_completed_orders() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.set_retirada_at() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;

GRANT EXECUTE ON FUNCTION public.cleanup_completed_orders() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.set_retirada_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

-- has_role() is referenced by RLS policies, which are evaluated with the caller's
-- privileges, so signed-in users must retain EXECUTE. Anonymous access is not needed
-- for any policy path that returns data, but policies are defined for role "public",
-- so keep anon able to evaluate them without a hard permission error.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;