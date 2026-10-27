# Grimório RPG

Site de ficha de RPG em React + Vite + Tailwind, com Supabase (login, banco e fotos) e pronto para a Vercel.

Abas: **Ficha** (foto, informações, atributos e status), **Equipamentos**, **Magias**, **Passivas**, **Aliados** (fotos e anotações) e **Lore** (história e registros).

## 1. Supabase

1. No painel do projeto, abra **SQL Editor > New query**, cole o conteúdo de `supabase.sql` e clique em **Run**.
   Isso cria a tabela `rpg_fichas` (uma ficha por usuário) e o bucket `rpg-fotos` para as fotos.
2. Em **Authentication > Providers**, deixe **Email** ligado. Para entrar sem confirmar e-mail, desligue **Confirm email**.
3. Em **Project Settings > API**, copie a **Project URL** e a chave **anon public**.

## 2. Rodar no computador

```bash
cp .env.example .env     # preencha as duas variáveis com os dados do passo 1.3
npm install
npm run dev
```

Abra o endereço mostrado, clique em **Criar conta** e depois em **Entrar**.

## 3. Publicar na Vercel

1. Suba a pasta para um repositório no GitHub (o `.env` não vai junto, ele está no `.gitignore`).
2. Na Vercel: **Add New > Project**, escolha o repositório. O framework **Vite** é detectado sozinho.
3. Em **Environment Variables**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os mesmos valores do `.env`.
4. Clique em **Deploy**.
5. No Supabase, em **Authentication > URL Configuration**, coloque o endereço da Vercel em **Site URL**.

## Segurança

A chave `anon public` pode ficar no site: quem protege os dados é o Row Level Security do `supabase.sql`.
Cada conta só lê e altera a própria ficha. Depois de criar a sua conta, se quiser impedir novos cadastros,
desligue **Allow new users to sign up** em **Authentication > Sign In / Providers**.

## Como mexer no código

- Atributos e barras de status: lista `ATTRS` e `VITALS` em `src/types.ts`.
- Nova aba: crie a página em `src/pages` e adicione uma linha em `TABS` no `src/App.tsx`.
- Visual dos cards e botões: `src/components/ui.tsx`.
