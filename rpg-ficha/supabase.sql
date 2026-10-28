-- =====================================================================
-- Grimório RPG — esquema para Supabase (PostgreSQL)
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


-- =====================================================================
-- MODO MESTRE — rode este bloco também (é seguro rodar mais de uma vez)
-- O mestre vê e edita TODAS as fichas; cada player continua vendo só a própria.
-- =====================================================================

-- 4) Lista de mestres. Só dá para inserir aqui pelo SQL Editor (o site não consegue se promover a mestre).
create table if not exists public.rpg_mestres (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.rpg_mestres enable row level security;

drop policy if exists "mestre ve a propria marca" on public.rpg_mestres;
create policy "mestre ve a propria marca" on public.rpg_mestres
  for select to authenticated
  using (user_id = (select auth.uid()));

grant select on public.rpg_mestres to authenticated;

-- Função usada pelas políticas (security definer evita loop de segurança na própria tabela)
create or replace function public.rpg_is_mestre()
returns boolean
language sql stable security definer
set search_path = public
as $$ select exists (select 1 from public.rpg_mestres where user_id = auth.uid()) $$;

revoke all on function public.rpg_is_mestre() from public;
grant execute on function public.rpg_is_mestre() to authenticated;

-- 5) (sem uso) O site não guarda nem mostra e-mails nas fichas.
--    Se você já rodou uma versão anterior que criou a coluna "email", pode remover os e-mails guardados com:
-- alter table public.rpg_fichas drop column if exists email;

-- 6) O mestre lê e edita qualquer ficha (somam-se à política "dono gerencia sua ficha rpg")
drop policy if exists "mestre le todas as fichas" on public.rpg_fichas;
create policy "mestre le todas as fichas" on public.rpg_fichas
  for select to authenticated
  using ((select public.rpg_is_mestre()));

drop policy if exists "mestre edita todas as fichas" on public.rpg_fichas;
create policy "mestre edita todas as fichas" on public.rpg_fichas
  for update to authenticated
  using ((select public.rpg_is_mestre()))
  with check ((select public.rpg_is_mestre()));

-- 7) Tornar alguém mestre (a conta precisa já ter sido criada no site; para mais mestres, some o e-mail na lista):
insert into public.rpg_mestres (user_id)
select id from auth.users where email in ('ronandasilva0983@gmail.com', 'duda2007udi@gmail.com')
on conflict do nothing;
