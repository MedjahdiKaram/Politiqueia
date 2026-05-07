-- ============================================================
-- PATCH : ajouter email dans la table profiles
-- ============================================================

-- 1. Ajouter la colonne email à profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Mettre à jour les utilisateurs existants
--    (récupère l'email depuis auth.users)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- 3. Mettre à jour le trigger pour inclure l'email lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, fonction, telephone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom',       ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom',    ''),
    NEW.raw_user_meta_data->>'fonction',
    NEW.raw_user_meta_data->>'telephone',
    NEW.email,
    'client'   -- toujours client à l'inscription
  );
  RETURN NEW;
END;
$$;
