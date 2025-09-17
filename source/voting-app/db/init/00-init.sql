-- crea schemi per microservizi
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS questions;
CREATE SCHEMA IF NOT EXISTS votes;
CREATE SCHEMA IF NOT EXISTS notifications;

-- ruoli applicativi (password lette via env? qui le mettiamo in chiaro per dev)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'auth_user') THEN
    CREATE ROLE auth_user LOGIN PASSWORD 'auth_dev_pwd';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'users_user') THEN
    CREATE ROLE users_user LOGIN PASSWORD 'users_dev_pwd';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'questions_user') THEN
    CREATE ROLE questions_user LOGIN PASSWORD 'questions_dev_pwd';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'votes_user') THEN
    CREATE ROLE votes_user LOGIN PASSWORD 'votes_dev_pwd';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'notifs_user') THEN
    CREATE ROLE notifs_user LOGIN PASSWORD 'notifs_dev_pwd';
  END IF;
END$$;

-- permessi schema-level
GRANT USAGE ON SCHEMA auth TO auth_user;
GRANT USAGE ON SCHEMA users TO users_user;
GRANT USAGE ON SCHEMA questions TO questions_user;
GRANT USAGE ON SCHEMA votes TO votes_user;
GRANT USAGE ON SCHEMA notifications TO notifs_user;

-- default privileges (per future tabelle/sequence)
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO auth_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA users GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO users_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA questions GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO questions_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA votes GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO votes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA notifications GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO notifs_user;

-- grants su sequence
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT USAGE, SELECT ON SEQUENCES TO auth_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA users GRANT USAGE, SELECT ON SEQUENCES TO users_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA questions GRANT USAGE, SELECT ON SEQUENCES TO questions_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA votes GRANT USAGE, SELECT ON SEQUENCES TO votes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA notifications GRANT USAGE, SELECT ON SEQUENCES TO notifs_user;
