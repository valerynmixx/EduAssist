-- Ejecutar una sola vez en Supabase > SQL Editor.
-- El bucket es publico porque EduAssist no usa Auth de Supabase.
-- No guardar datos sensibles en los archivos adjuntos.

alter table public.novedades
  add column if not exists archivo_path text,
  add column if not exists archivo_nombre text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('novedad-archivos', 'novedad-archivos', true, 10485760)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "EduAssist cargar archivos de novedades" on storage.objects;
create policy "EduAssist cargar archivos de novedades"
  on storage.objects for insert to anon
  with check (bucket_id = 'novedad-archivos');

drop policy if exists "EduAssist eliminar archivos de novedades" on storage.objects;
create policy "EduAssist eliminar archivos de novedades"
  on storage.objects for delete to anon
  using (bucket_id = 'novedad-archivos');