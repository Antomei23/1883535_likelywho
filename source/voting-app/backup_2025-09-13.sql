--
-- PostgreSQL database dump
--

\restrict UezbUQSvFWuRhm8oTE9t3x6SseE0sQQkAGovR8QhfFYDsfHm0Kuyt6AuFnbEJUd

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: root
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO root;

--
-- Name: notifications; Type: SCHEMA; Schema: -; Owner: root
--

CREATE SCHEMA notifications;


ALTER SCHEMA notifications OWNER TO root;

--
-- Name: questions; Type: SCHEMA; Schema: -; Owner: root
--

CREATE SCHEMA questions;


ALTER SCHEMA questions OWNER TO root;

--
-- Name: users; Type: SCHEMA; Schema: -; Owner: root
--

CREATE SCHEMA users;


ALTER SCHEMA users OWNER TO root;

--
-- Name: votes; Type: SCHEMA; Schema: -; Owner: root
--

CREATE SCHEMA votes;


ALTER SCHEMA votes OWNER TO root;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: auth; Owner: auth_user
--

CREATE TABLE auth."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    provider text NOT NULL,
    "providerUserId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE auth."Account" OWNER TO auth_user;

--
-- Name: Password; Type: TABLE; Schema: auth; Owner: auth_user
--

CREATE TABLE auth."Password" (
    "userId" text NOT NULL,
    hash text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE auth."Password" OWNER TO auth_user;

--
-- Name: Session; Type: TABLE; Schema: auth; Owner: auth_user
--

CREATE TABLE auth."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "jwtId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE auth."Session" OWNER TO auth_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: auth; Owner: auth_user
--

CREATE TABLE auth._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE auth._prisma_migrations OWNER TO auth_user;

--
-- Name: Notification; Type: TABLE; Schema: notifications; Owner: notifs_user
--

CREATE TABLE notifications."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    payload jsonb,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "groupId" text,
    "questionId" text
);


ALTER TABLE notifications."Notification" OWNER TO notifs_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: notifications; Owner: notifs_user
--

CREATE TABLE notifications._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE notifications._prisma_migrations OWNER TO notifs_user;

--
-- Name: Question; Type: TABLE; Schema: questions; Owner: questions_user
--

CREATE TABLE questions."Question" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    closed boolean DEFAULT false NOT NULL
);


ALTER TABLE questions."Question" OWNER TO questions_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: questions; Owner: questions_user
--

CREATE TABLE questions._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE questions._prisma_migrations OWNER TO questions_user;

--
-- Name: Group; Type: TABLE; Schema: users; Owner: users_user
--

CREATE TABLE users."Group" (
    id text NOT NULL,
    name text NOT NULL,
    "leaderId" text NOT NULL
);


ALTER TABLE users."Group" OWNER TO users_user;

--
-- Name: Invite; Type: TABLE; Schema: users; Owner: users_user
--

CREATE TABLE users."Invite" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    code text NOT NULL,
    email text,
    "createdByUserId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedByUserId" text,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE users."Invite" OWNER TO users_user;

--
-- Name: Membership; Type: TABLE; Schema: users; Owner: users_user
--

CREATE TABLE users."Membership" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "groupId" text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL
);


ALTER TABLE users."Membership" OWNER TO users_user;

--
-- Name: QuestionRef; Type: TABLE; Schema: users; Owner: users_user
--

CREATE TABLE users."QuestionRef" (
    id text NOT NULL,
    "groupId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE users."QuestionRef" OWNER TO users_user;

--
-- Name: User; Type: TABLE; Schema: users; Owner: users_user
--

CREATE TABLE users."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    "avatarUrl" text,
    score integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE users."User" OWNER TO users_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: users; Owner: users_user
--

CREATE TABLE users._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE users._prisma_migrations OWNER TO users_user;

--
-- Name: Vote; Type: TABLE; Schema: votes; Owner: votes_user
--

CREATE TABLE votes."Vote" (
    id text NOT NULL,
    "questionId" text NOT NULL,
    "voterId" text NOT NULL,
    "votedUserId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE votes."Vote" OWNER TO votes_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: votes; Owner: votes_user
--

CREATE TABLE votes._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE votes._prisma_migrations OWNER TO votes_user;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: auth; Owner: auth_user
--

COPY auth."Account" (id, "userId", provider, "providerUserId", "accessToken", "refreshToken", "createdAt") FROM stdin;
\.


--
-- Data for Name: Password; Type: TABLE DATA; Schema: auth; Owner: auth_user
--

COPY auth."Password" ("userId", hash, "updatedAt") FROM stdin;
da6e72d6-baa3-43e5-a7f1-1d096c69f117	$2b$10$XR/5leFDjYNZ.sR8r8pX6uDXeMySr1mYY0YJKQuNQc87JLQk1yh82	2025-09-13 08:03:16.083
fb32cb9e-b7df-4168-bf55-12fa7f18e93a	$2b$10$6mTNgBJjWaYELyMjA1v2F.5pSJtLk3KJfNdTDoYmw8iQS1Sr5wvoG	2025-09-13 13:01:10.098
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: auth; Owner: auth_user
--

COPY auth."Session" (id, "userId", "jwtId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: auth; Owner: auth_user
--

COPY auth._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1871778c-deba-400c-bb6a-fa25ab44451f	4223582799594c3b775924892ea5b346e00871051b78f2b9dd9217be6d3312df	2025-09-13 07:46:59.071791+00	20250911194728_init	\N	\N	2025-09-13 07:46:59.061903+00	1
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: notifications; Owner: notifs_user
--

COPY notifications."Notification" (id, "userId", type, payload, read, "createdAt", "groupId", "questionId") FROM stdin;
3dc663fe-441b-45d9-a949-32a26715887c	usr_bob	NEW_QUESTION	{"groupId": "grp_demo", "groupName": "Calcetto del Giovedì"}	f	2025-09-13 07:48:34.009	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: notifications; Owner: notifs_user
--

COPY notifications._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a20a8763-4440-49c3-a54b-bdb82e51c14e	103559631ecef37e4c26c54ed6b5a8f7a1f19fb08fe385be76faf8142fba9bd0	2025-09-13 07:47:01.016213+00	20250911204504_init	\N	\N	2025-09-13 07:47:01.011263+00	1
1df64df6-0c0e-4f84-b075-508820aadc91	75e902fa4184e3ca74f55b7f63623c6d112455749c73b4e19f16fea335c77b0f	2025-09-13 07:47:01.019455+00	20250912155335_update_notifications	\N	\N	2025-09-13 07:47:01.017012+00	1
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: questions; Owner: questions_user
--

COPY questions."Question" (id, "groupId", text, "createdAt", "expiresAt", closed) FROM stdin;
3516522d-df6f-4d37-a940-83cf2b08b6c1	grp_demo	Domanda demo?	2025-09-13 10:02:22.335	2030-01-01 00:00:00	f
31c06c2d-7fde-4b96-bad3-23727f4887f5	undefined	chi finirà prima il libro?	2025-09-13 12:56:53.797	2025-09-14 12:56:53.763	f
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: questions; Owner: questions_user
--

COPY questions._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f63ad383-9620-4ba0-b51b-7ebc9662b84e	21ef7d4a41322c739d3fd88a21d2977d8a62e72bfc2e9e85129969535164973d	2025-09-13 07:47:00.297482+00	20250911204023_init	\N	\N	2025-09-13 07:47:00.292312+00	1
\.


--
-- Data for Name: Group; Type: TABLE DATA; Schema: users; Owner: users_user
--

COPY users."Group" (id, name, "leaderId") FROM stdin;
cmfhzbtl9000113gcmu8x9cc0	gruppo1	da6e72d6-baa3-43e5-a7f1-1d096c69f117
\.


--
-- Data for Name: Invite; Type: TABLE DATA; Schema: users; Owner: users_user
--

COPY users."Invite" (id, "groupId", code, email, "createdByUserId", "expiresAt", "usedByUserId", "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Membership; Type: TABLE DATA; Schema: users; Owner: users_user
--

COPY users."Membership" (id, "userId", "groupId", role) FROM stdin;
ae170135-5f34-481e-8d81-93d11e6b8106	da6e72d6-baa3-43e5-a7f1-1d096c69f117	cmfhzbtl9000113gcmu8x9cc0	leader
\.


--
-- Data for Name: QuestionRef; Type: TABLE DATA; Schema: users; Owner: users_user
--

COPY users."QuestionRef" (id, "groupId", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: users; Owner: users_user
--

COPY users."User" (id, email, name, "avatarUrl", score, "createdAt", "updatedAt") FROM stdin;
da6e72d6-baa3-43e5-a7f1-1d096c69f117	michi@gmail.com	michi	\N	0	2025-09-13 08:03:16.004	2025-09-13 08:03:16.004
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: users; Owner: users_user
--

COPY users._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5a9fbe20-8916-4706-8a36-be3207c7ae84	543539985d3163f1ea6eb7539ff4316521eff3cae9cf9c680b473f2556586351	2025-09-13 07:46:59.703943+00	20250911204018_init	\N	\N	2025-09-13 07:46:59.693078+00	1
92fa1f1c-df21-4be2-ba4f-f851e51446ef	b56dfbf9fb95853a88c587eea66d1fc1b12ee3a449bc2b611b4800b70c7c165d	2025-09-13 09:28:39.687667+00	20250913092839_add_invite_table	\N	\N	2025-09-13 09:28:39.682229+00	1
\.


--
-- Data for Name: Vote; Type: TABLE DATA; Schema: votes; Owner: votes_user
--

COPY votes."Vote" (id, "questionId", "voterId", "votedUserId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: votes; Owner: votes_user
--

COPY votes._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f546ee20-b06a-4f89-816d-19aa6ffdaa79	afa73c17151b4a94578cb29821e0bdc9312da610af6d08d400052b1607002f27	2025-09-13 07:47:01.626909+00	20250911204857_init	\N	\N	2025-09-13 07:47:01.620847+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: auth; Owner: auth_user
--

ALTER TABLE ONLY auth."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Password Password_pkey; Type: CONSTRAINT; Schema: auth; Owner: auth_user
--

ALTER TABLE ONLY auth."Password"
    ADD CONSTRAINT "Password_pkey" PRIMARY KEY ("userId");


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: auth; Owner: auth_user
--

ALTER TABLE ONLY auth."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: auth_user
--

ALTER TABLE ONLY auth._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: notifications; Owner: notifs_user
--

ALTER TABLE ONLY notifications."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: notifications; Owner: notifs_user
--

ALTER TABLE ONLY notifications._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: questions; Owner: questions_user
--

ALTER TABLE ONLY questions."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: questions; Owner: questions_user
--

ALTER TABLE ONLY questions._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Group Group_pkey; Type: CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."Group"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY (id);


--
-- Name: Invite Invite_pkey; Type: CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."Invite"
    ADD CONSTRAINT "Invite_pkey" PRIMARY KEY (id);


--
-- Name: Membership Membership_pkey; Type: CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."Membership"
    ADD CONSTRAINT "Membership_pkey" PRIMARY KEY (id);


--
-- Name: QuestionRef QuestionRef_pkey; Type: CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."QuestionRef"
    ADD CONSTRAINT "QuestionRef_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Vote Vote_pkey; Type: CONSTRAINT; Schema: votes; Owner: votes_user
--

ALTER TABLE ONLY votes."Vote"
    ADD CONSTRAINT "Vote_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: votes; Owner: votes_user
--

ALTER TABLE ONLY votes._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerUserId_key; Type: INDEX; Schema: auth; Owner: auth_user
--

CREATE UNIQUE INDEX "Account_provider_providerUserId_key" ON auth."Account" USING btree (provider, "providerUserId");


--
-- Name: Session_jwtId_key; Type: INDEX; Schema: auth; Owner: auth_user
--

CREATE UNIQUE INDEX "Session_jwtId_key" ON auth."Session" USING btree ("jwtId");


--
-- Name: Notification_groupId_idx; Type: INDEX; Schema: notifications; Owner: notifs_user
--

CREATE INDEX "Notification_groupId_idx" ON notifications."Notification" USING btree ("groupId");


--
-- Name: Notification_questionId_idx; Type: INDEX; Schema: notifications; Owner: notifs_user
--

CREATE INDEX "Notification_questionId_idx" ON notifications."Notification" USING btree ("questionId");


--
-- Name: Notification_userId_read_idx; Type: INDEX; Schema: notifications; Owner: notifs_user
--

CREATE INDEX "Notification_userId_read_idx" ON notifications."Notification" USING btree ("userId", read);


--
-- Name: Question_expiresAt_idx; Type: INDEX; Schema: questions; Owner: questions_user
--

CREATE INDEX "Question_expiresAt_idx" ON questions."Question" USING btree ("expiresAt");


--
-- Name: Question_groupId_idx; Type: INDEX; Schema: questions; Owner: questions_user
--

CREATE INDEX "Question_groupId_idx" ON questions."Question" USING btree ("groupId");


--
-- Name: Invite_code_idx; Type: INDEX; Schema: users; Owner: users_user
--

CREATE INDEX "Invite_code_idx" ON users."Invite" USING btree (code);


--
-- Name: Invite_code_key; Type: INDEX; Schema: users; Owner: users_user
--

CREATE UNIQUE INDEX "Invite_code_key" ON users."Invite" USING btree (code);


--
-- Name: Invite_groupId_idx; Type: INDEX; Schema: users; Owner: users_user
--

CREATE INDEX "Invite_groupId_idx" ON users."Invite" USING btree ("groupId");


--
-- Name: Membership_groupId_idx; Type: INDEX; Schema: users; Owner: users_user
--

CREATE INDEX "Membership_groupId_idx" ON users."Membership" USING btree ("groupId");


--
-- Name: Membership_userId_groupId_key; Type: INDEX; Schema: users; Owner: users_user
--

CREATE UNIQUE INDEX "Membership_userId_groupId_key" ON users."Membership" USING btree ("userId", "groupId");


--
-- Name: QuestionRef_groupId_idx; Type: INDEX; Schema: users; Owner: users_user
--

CREATE INDEX "QuestionRef_groupId_idx" ON users."QuestionRef" USING btree ("groupId");


--
-- Name: User_email_key; Type: INDEX; Schema: users; Owner: users_user
--

CREATE UNIQUE INDEX "User_email_key" ON users."User" USING btree (email);


--
-- Name: Vote_questionId_idx; Type: INDEX; Schema: votes; Owner: votes_user
--

CREATE INDEX "Vote_questionId_idx" ON votes."Vote" USING btree ("questionId");


--
-- Name: Vote_questionId_voterId_key; Type: INDEX; Schema: votes; Owner: votes_user
--

CREATE UNIQUE INDEX "Vote_questionId_voterId_key" ON votes."Vote" USING btree ("questionId", "voterId");


--
-- Name: Vote_votedUserId_idx; Type: INDEX; Schema: votes; Owner: votes_user
--

CREATE INDEX "Vote_votedUserId_idx" ON votes."Vote" USING btree ("votedUserId");


--
-- Name: Group Group_leaderId_fkey; Type: FK CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."Group"
    ADD CONSTRAINT "Group_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES users."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invite Invite_groupId_fkey; Type: FK CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."Invite"
    ADD CONSTRAINT "Invite_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES users."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Membership Membership_groupId_fkey; Type: FK CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."Membership"
    ADD CONSTRAINT "Membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES users."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Membership Membership_userId_fkey; Type: FK CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."Membership"
    ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES users."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QuestionRef QuestionRef_groupId_fkey; Type: FK CONSTRAINT; Schema: users; Owner: users_user
--

ALTER TABLE ONLY users."QuestionRef"
    ADD CONSTRAINT "QuestionRef_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES users."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: root
--

GRANT ALL ON SCHEMA auth TO auth_user;


--
-- Name: SCHEMA notifications; Type: ACL; Schema: -; Owner: root
--

GRANT ALL ON SCHEMA notifications TO notifs_user;


--
-- Name: SCHEMA questions; Type: ACL; Schema: -; Owner: root
--

GRANT ALL ON SCHEMA questions TO questions_user;


--
-- Name: SCHEMA users; Type: ACL; Schema: -; Owner: root
--

GRANT ALL ON SCHEMA users TO users_user;


--
-- Name: SCHEMA votes; Type: ACL; Schema: -; Owner: root
--

GRANT ALL ON SCHEMA votes TO votes_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA auth GRANT SELECT,USAGE ON SEQUENCES TO auth_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA auth GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO auth_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: notifications; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA notifications GRANT SELECT,USAGE ON SEQUENCES TO notifs_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: notifications; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA notifications GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO notifs_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: questions; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA questions GRANT SELECT,USAGE ON SEQUENCES TO questions_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: questions; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA questions GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO questions_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: users; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA users GRANT SELECT,USAGE ON SEQUENCES TO users_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: users; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA users GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO users_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: votes; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA votes GRANT SELECT,USAGE ON SEQUENCES TO votes_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: votes; Owner: root
--

ALTER DEFAULT PRIVILEGES FOR ROLE root IN SCHEMA votes GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO votes_user;


--
-- PostgreSQL database dump complete
--

\unrestrict UezbUQSvFWuRhm8oTE9t3x6SseE0sQQkAGovR8QhfFYDsfHm0Kuyt6AuFnbEJUd

