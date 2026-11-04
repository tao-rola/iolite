-- iolite : base de données Supabase
-- À coller une seule fois dans Supabase > SQL Editor > New query, puis « Run ».
-- Chaque utilisateur ne peut lire et modifier que ses propres données (Row Level Security).

-- Profil et réglages (un par compte)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text not null default '',
  last_name   text not null default '',
  settings    jsonb not null default '{}'::jsonb,   -- heures, salaire, cotisations, repas, majoration, rappels, congés
  seen        jsonb not null default '{}'::jsonb,   -- alertes déjà lues
  onboarded   boolean not null default false,       -- questionnaire de bienvenue terminé
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Journées pointées (une ligne par jour et par compte)
create table if not exists public.days (
  user_id     uuid not null references auth.users(id) on delete cascade,
  day         date not null,
  data        jsonb not null,                       -- type de journée, services, pauses, repas
  updated_at  timestamptz not null default now(),
  primary key (user_id, day)
);

-- Planning Combo (un par compte)
create table if not exists public.plans (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,   -- créneaux prévus par date
  combo       jsonb not null default '{}'::jsonb,   -- adresse de synchronisation, dernière synchro
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.days     enable row level security;
alter table public.plans    enable row level security;

drop policy if exists "profil : le sien" on public.profiles;
create policy "profil : le sien" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "journées : les siennes" on public.days;
create policy "journées : les siennes" on public.days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "planning : le sien" on public.plans;
create policy "planning : le sien" on public.plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Accès pour les utilisateurs connectés uniquement (les visiteurs non connectés n'ont aucun droit).
-- Nécessaire si « Automatically expose new tables » est décoché.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.days, public.plans to authenticated;
revoke all on public.profiles, public.days, public.plans from anon;

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
