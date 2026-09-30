-- Ejecutar una sola vez en Supabase > SQL Editor para actualizar
-- una base existente sin volver a ejecutar el script inicial.

alter table public.novedades
  add column if not exists estado text;

update public.novedades
set estado = 'Pendiente'
where estado is null;

alter table public.novedades
  alter column estado set default 'Pendiente',
  alter column estado set not null;