-- iolite : conversations avec l'assistant (page Alertes)
-- À coller une seule fois dans Supabase > SQL Editor > New query, puis « Run ».

create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('user','assistant')),
  content     text not null check (char_length(content) <= 8000),
  created_at  timestamptz not null default now()
);
create index if not exists messages_user_time on public.messages (user_id, created_at);

alter table public.messages enable row level security;

-- chacun ne voit et n'ajoute que ses propres messages ; pas de modification ni de suppression
-- (la limite de messages par jour ne peut donc pas être contournée)
drop policy if exists "messages: lire les siens" on public.messages;
create policy "messages: lire les siens" on public.messages for select to authenticated using (user_id = auth.uid());
drop policy if exists "messages: ajouter les siens" on public.messages;
create policy "messages: ajouter les siens" on public.messages for insert to authenticated with check (user_id = auth.uid());

grant select, insert on public.messages to authenticated;
