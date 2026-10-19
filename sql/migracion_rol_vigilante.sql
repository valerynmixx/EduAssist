-- ============================================================
-- MIGRACION: agregar rol vigilante a la tabla usuarios
-- ============================================================

-- 1) Actualiza la restriccion de roles para permitir 'vigilante'.
ALTER TABLE usuarios
  DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('admin', 'profesor', 'acudiente', 'vigilante'));

-- 2) Crea el usuario de ejemplo si no existe.
INSERT INTO usuarios (nombre, usuario, clave, rol)
VALUES ('Vigilante', 'vigilante', 'vigilante123', 'vigilante')
ON CONFLICT (usuario) DO NOTHING;
