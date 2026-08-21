-- Выполни этот файл в Supabase SQL Editor.
-- Он даёт публичному фронтенду право читать:
--   authors  -> всех авторов;
--   books    -> каталог книг;
--   chapters -> только опубликованные главы.
--
-- RLS остаётся включённым.

alter table public.authors enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;

drop policy if exists "Public can read authors" on public.authors;
create policy "Public can read authors"
on public.authors
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read book metadata" on public.books;
create policy "Public can read book metadata"
on public.books
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read published chapters" on public.chapters;
create policy "Public can read published chapters"
on public.chapters
for select
to anon, authenticated
using (is_published = true);

grant select on table public.authors to anon, authenticated;
grant select on table public.books to anon, authenticated;
grant select on table public.chapters to anon, authenticated;
