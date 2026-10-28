# Grimório — Ficha de RPG

Ficha de personagem de RPG feita com React, TypeScript, Vite, Tailwind e Supabase.

## Como rodar

1. `npm install`
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
   (Supabase > Project Settings > API; use só a chave **anon/publishable**).
3. No Supabase, abra **SQL Editor**, cole todo o `supabase.sql` e clique em **Run**
   (pode rodar mais de uma vez sem problema).
4. `npm run dev`

No primeiro login o app cria uma ficha em branco automaticamente.

## Publicar

`npm run build` gera a pasta `dist`. No host (Vercel, Netlify...), cadastre as mesmas duas
variáveis do `.env` em *Environment Variables* e faça um novo deploy.

## Estrutura

- `src/pages` — abas (Ficha, Status, Magias, Passivas, Equipamentos, Configurações)
- `src/components` — cards, modais e peças de interface
- `src/context/CharacterContext.tsx` — estado da ficha e gravação no Supabase
- `supabase.sql` — tabelas, segurança (RLS) e bucket de imagens
- `src/store.tsx`, `src/types.ts`, `Aliados`, `Lore`, `EntryPage`, `Elementos`, `SheetIO` — modelo alternativo
  (ficha em JSON, tabela `rpg_fichas`) ainda **não ligado** ao menu em `App.tsx`
