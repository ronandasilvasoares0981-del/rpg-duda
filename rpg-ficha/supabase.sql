-- =====================================================================
-- RPG da Duda — esquema para Supabase (PostgreSQL)
-- Como usar: Supabase > SQL Editor > New query > cole tudo > Run
-- É seguro rodar mais de uma vez. Não mexe nas tabelas de outros projetos.
-- Cada usuário logado só enxerga e edita a PRÓPRIA ficha (Row Level Security).
-- =====================================================================

-- 1) TABELA: uma linha por usuário; a ficha inteira fica no campo "data" (jsonb).
--    Assim, novos campos no site não exigem alterar o banco.
create table if not exists public.rpg_fichas (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) SEGURANÇA
alter table public.rpg_fichas enable row level security;

drop policy if exists "dono gerencia sua ficha rpg" on public.rpg_fichas;
create policy "dono gerencia sua ficha rpg" on public.rpg_fichas
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.rpg_fichas to authenticated;

-- 3) STORAGE para as fotos (personagem e aliados)
--    Leitura pública pelo link; só o dono grava na pasta com o seu id:
--    caminho do arquivo = <user_id>/<arquivo>.jpg
insert into storage.buckets (id, name, public)
values ('rpg-fotos', 'rpg-fotos', true)
on conflict (id) do nothing;

drop policy if exists "rpg fotos: enviar na propria pasta" on storage.objects;
create policy "rpg fotos: enviar na propria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'rpg-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "rpg fotos: atualizar na propria pasta" on storage.objects;
create policy "rpg fotos: atualizar na propria pasta" on storage.objects
  for update to authenticated
  using (bucket_id = 'rpg-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "rpg fotos: apagar na propria pasta" on storage.objects;
create policy "rpg fotos: apagar na propria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'rpg-fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
