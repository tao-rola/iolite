-- iolite : numéro de téléphone et connexion par téléphone
-- À coller une seule fois dans Supabase > SQL Editor > New query, puis « Run ».

-- 1. Le numéro de chaque compte (format international, ex. +33612345678), unique
alter table public.profiles add column if not exists phone text;
create unique index if not exists profiles_phone_unique on public.profiles (phone) where phone is not null;

-- 2. Connexion par téléphone : renvoie l'e-mail du compte SEULEMENT si le mot de passe est le bon.
--    Sans le bon mot de passe, la fonction ne renvoie rien : impossible de retrouver l'e-mail de quelqu'un.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.login_email(p_phone text, p_pass text)
returns text
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_email text;
  v_hash  text;
begin
  select u.email, u.encrypted_password into v_email, v_hash
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.phone = p_phone
  limit 1;
  if v_hash is null or extensions.crypt(p_pass, v_hash) <> v_hash then
    return null;
  end if;
  return v_email;
end;
$$;

revoke all on function public.login_email(text, text) from public;
grant execute on function public.login_email(text, text) to anon, authenticated;
