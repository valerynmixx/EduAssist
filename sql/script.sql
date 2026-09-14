-- ============================================================
-- ARCHIVO: script.sql
-- PARA QUE SIRVE:
--   Este es el UNICO script SQL del proyecto. Crea toda la base
--   de datos de la aplicacion "EduAssist" dentro de Supabase,
--   incluyendo lo que antes estaba repartido en dos archivos de
--   migracion separados (migracion_usuarios.sql y
--   migracion_acudiente_estudiante.sql), ya unidos aqui.
--
--   Se debe copiar y pegar UNA SOLA VEZ dentro del
--   "SQL Editor" de Supabase (Panel izquierdo > SQL Editor > New query)
--   y darle click en "RUN".
--
--   Crea 5 tablas:
--     1. grados          -> Lista de grados escolares (Preescolar, Primero, etc.)
--     2. estudiantes      -> Datos de cada estudiante
--     3. tipos_novedad    -> Tipos de novedades (Permiso, Incapacidad, Cita Medica)
--     4. novedades        -> Registro de novedades de cada estudiante
--     5. usuarios         -> Cuentas para iniciar sesion (admin, profesor, acudiente)
-- ============================================================


-- ------------------------------------------------------------
-- TABLA: grados
-- Guarda el listado de grados de la institucion educativa.
-- Cada grado tiene un id (numero automatico) y un nombre.
-- ------------------------------------------------------------
create table grados (
  id serial primary key,        -- numero unico que se genera solo (1, 2, 3, ...)
  nombre text not null           -- nombre del grado, por ejemplo "Primero"
);


-- ------------------------------------------------------------
-- TABLA: estudiantes
-- Guarda la informacion personal de cada estudiante.
-- La columna grado_id conecta a cada estudiante con un grado
-- de la tabla "grados" (por eso se llama "llave foranea").
-- ------------------------------------------------------------
create table estudiantes (
  id serial primary key,                     -- numero unico del estudiante
  documento text not null unique,             -- numero de documento (no se puede repetir)
  nombres text not null,                      -- nombres del estudiante
  apellidos text not null,                    -- apellidos del estudiante
  fecha_nacimiento date,                      -- fecha de nacimiento
  genero text,                                -- genero del estudiante
  telefono text,                              -- telefono del estudiante
  direccion text,                             -- direccion de residencia
  acudiente text,                             -- nombre del acudiente responsable
  telefono_acudiente text,                    -- telefono del acudiente
  grado_id integer references grados(id),     -- conecta con la tabla "grados"
  estado text default 'Activo'                -- estado del estudiante: Activo o Inactivo
);


-- ------------------------------------------------------------
-- TABLA: tipos_novedad
-- Guarda los tipos de novedades que se pueden registrar.
-- Ejemplo: Permiso, Incapacidad, Cita Medica.
-- ------------------------------------------------------------
create table tipos_novedad (
  id serial primary key,        -- numero unico del tipo de novedad
  nombre text not null           -- nombre del tipo, por ejemplo "Permiso"
);


-- ------------------------------------------------------------
-- TABLA: novedades
-- Guarda cada novedad (permiso, incapacidad o cita medica)
-- que le ocurre a un estudiante.
-- estudiante_id conecta con la tabla "estudiantes".
-- tipo_id conecta con la tabla "tipos_novedad".
-- ------------------------------------------------------------
create table novedades (
  id serial primary key,                             -- numero unico de la novedad
  estudiante_id integer references estudiantes(id),   -- a que estudiante pertenece
  tipo_id integer references tipos_novedad(id),       -- que tipo de novedad es
  fecha_inicio date not null,                         -- fecha en que empieza la novedad
  fecha_fin date,                                     -- fecha en que termina la novedad
  descripcion text,                                   -- descripcion de la novedad
  fecha_registro timestamp default now()              -- fecha en que se registro en el sistema
);


-- ------------------------------------------------------------
-- TABLA: usuarios
-- Guarda las cuentas que pueden iniciar sesion. El rol define
-- que puede hacer cada quien dentro de la aplicacion:
--   - admin:      puede crear cuentas de profesor y acudiente.
--   - profesor:   solo puede registrar novedades tipo "Permiso".
--   - acudiente:  solo puede registrar "Incapacidad" y "Cita Medica".
-- ------------------------------------------------------------
create table usuarios (
  id serial primary key,
  nombre text not null,                 -- nombre para mostrar en pantalla
  usuario text not null unique,          -- con que texto inicia sesion (no se repite)
  clave text not null,                   -- contraseña (en texto plano, ver nota abajo)
  rol text not null check (rol in ('admin', 'profesor', 'acudiente'))
);

-- Conecta cada estudiante con la cuenta de acudiente (usuario
-- con rol "acudiente") que puede ver y registrar sus novedades.
-- Se agrega con "alter table" (y no directo en la tabla
-- estudiantes de arriba) porque la tabla usuarios se acaba de
-- crear apenas ahora.
alter table estudiantes
  add column usuario_acudiente_id integer references usuarios(id);


-- ============================================================
-- DATOS INICIALES
-- Estas instrucciones "insert into" llenan las tablas con
-- informacion basica para que la aplicacion funcione desde
-- el primer momento.
-- ============================================================

-- Insertamos todos los grados de la institucion, del Preescolar
-- al Undecimo, en orden.
insert into grados (nombre) values
  ('Preescolar'),
  ('Primero'),
  ('Segundo'),
  ('Tercero'),
  ('Cuarto'),
  ('Quinto'),
  ('Sexto'),
  ('Septimo'),
  ('Octavo'),
  ('Noveno'),
  ('Decimo'),
  ('Undecimo');

-- Insertamos los 3 tipos de novedad que la aplicacion necesita.
insert into tipos_novedad (nombre) values
  ('Permiso'),
  ('Incapacidad'),
  ('Cita Medica');

-- Cuentas de arranque para poder iniciar sesion desde el primer
-- momento. IMPORTANTE: son contraseñas de ejemplo (login solo de
-- interfaz, ver js/auth.js) - cambialas por unas propias despues.
insert into usuarios (nombre, usuario, clave, rol) values
  ('Administrador', 'admin', 'admin123', 'admin'),
  ('Profesor', 'profesor', 'profesor123', 'profesor'),
  ('Acudiente', 'acudiente', 'acudiente123', 'acudiente');


-- ============================================================
-- PERMISOS DE ACCESO (ROW LEVEL SECURITY)
-- Como esta aplicacion NO usa autenticacion de usuarios,
-- necesitamos permitir que cualquiera pueda leer y escribir
-- en las tablas usando la llave publica (anon key).
--
-- IMPORTANTE: esto es valido solo para un proyecto educativo.
-- En una aplicacion real de produccion se deberian restringir
-- estos permisos con autenticacion.
-- ============================================================

-- Activamos la seguridad por fila en cada tabla.
alter table grados enable row level security;
alter table estudiantes enable row level security;
alter table tipos_novedad enable row level security;
alter table novedades enable row level security;
alter table usuarios enable row level security;

-- Creamos una regla que permite hacer de todo (leer, insertar,
-- actualizar y borrar) a cualquiera que use la llave publica.
create policy "Acceso publico grados" on grados
  for all using (true) with check (true);

create policy "Acceso publico estudiantes" on estudiantes
  for all using (true) with check (true);

create policy "Acceso publico tipos_novedad" on tipos_novedad
  for all using (true) with check (true);

create policy "Acceso publico usuarios" on usuarios
  for all using (true) with check (true);

create policy "Acceso publico novedades" on novedades
  for all using (true) with check (true);
