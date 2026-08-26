-- =====================================================================
-- Protecao das tabelas: apenas usuarios autenticados acessam os dados.
-- Rode este script no Supabase: SQL Editor > New query > Run.
-- =====================================================================

-- 1. Ativa Row Level Security nas 4 tabelas.
--    A partir daqui, sem politica que libere, ninguem acessa nada.
alter table public.income              enable row level security;
alter table public.fixed_expenses      enable row level security;
alter table public.variable_expenses   enable row level security;
alter table public.card_transactions   enable row level security;

-- 2. Remove politicas antigas com o mesmo nome (torna o script re-executavel).
drop policy if exists "acesso_autenticado" on public.income;
drop policy if exists "acesso_autenticado" on public.fixed_expenses;
drop policy if exists "acesso_autenticado" on public.variable_expenses;
drop policy if exists "acesso_autenticado" on public.card_transactions;

-- 3. Libera leitura e escrita apenas para quem esta logado (role "authenticated").
--    Visitantes anonimos ficam de fora, mesmo tendo a chave anon do bundle.
create policy "acesso_autenticado" on public.income
  for all to authenticated using (true) with check (true);

create policy "acesso_autenticado" on public.fixed_expenses
  for all to authenticated using (true) with check (true);

create policy "acesso_autenticado" on public.variable_expenses
  for all to authenticated using (true) with check (true);

create policy "acesso_autenticado" on public.card_transactions
  for all to authenticated using (true) with check (true);
