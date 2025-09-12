-- consenti ai ruoli applicativi di creare oggetti nei rispettivi schemi
GRANT CREATE, USAGE ON SCHEMA auth TO auth_user;
GRANT CREATE, USAGE ON SCHEMA users TO users_user;
GRANT CREATE, USAGE ON SCHEMA questions TO questions_user;
GRANT CREATE, USAGE ON SCHEMA votes TO votes_user;
GRANT CREATE, USAGE ON SCHEMA notifications TO notifs_user;

-- (opzionale ma utile) imposta il search_path per ogni ruolo
ALTER ROLE auth_user IN DATABASE likelywho SET search_path = auth, public;
ALTER ROLE users_user IN DATABASE likelywho SET search_path = users, public;
ALTER ROLE questions_user IN DATABASE likelywho SET search_path = questions, public;
ALTER ROLE votes_user IN DATABASE likelywho SET search_path = votes, public;
ALTER ROLE notifs_user IN DATABASE likelywho SET search_path = notifications, public;
