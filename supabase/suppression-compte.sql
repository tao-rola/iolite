-- iolite : à coller une seule fois dans Supabase > SQL Editor > New query, puis « Run ».
-- Suppression de compte depuis l'application (bouton « Supprimer mon compte » dans Réglages).
-- Efface l'utilisateur connecté ; ses profil, journées et planning partent avec lui (on delete cascade).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'non connecté';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
