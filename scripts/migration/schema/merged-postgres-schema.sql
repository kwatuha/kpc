-- Merged PostgreSQL Schema
-- Generated: 2026-02-28T14:41:34.224Z
-- 
-- Remote PostgreSQL tables: 20
-- MySQL tables: 117
-- Conflicts: 0
-- 
-- Strategy:
-- 1. Use remote PostgreSQL schema as base (preserves existing structure)
-- 2. Add MySQL-only tables
-- 3. For conflicts, use remote version (manual review recommended)
--

-- ============================================
-- REMOTE POSTGRESQL SCHEMA (FOUNDATION)
-- ============================================

Unable to find image 'postgres:16-alpine' locally
16-alpine: Pulling from library/postgres
589002ba0eae: Already exists
bf295aa7a64c: Pulling fs layer
6b36925b3510: Pulling fs layer
385079160787: Pulling fs layer
dc66e2c13be5: Pulling fs layer
bfb0a9f61bdf: Pulling fs layer
e0210f91556c: Pulling fs layer
d513847b8a76: Pulling fs layer
fffbff44edaf: Pulling fs layer
d7ea68590de1: Pulling fs layer
4a8dcc9ff6fd: Pulling fs layer
dc66e2c13be5: Waiting
bfb0a9f61bdf: Waiting
e0210f91556c: Waiting
d513847b8a76: Waiting
fffbff44edaf: Waiting
d7ea68590de1: Waiting
4a8dcc9ff6fd: Waiting
bf295aa7a64c: Download complete
385079160787: Verifying Checksum
385079160787: Download complete
6b36925b3510: Download complete
bf295aa7a64c: Pull complete
6b36925b3510: Pull complete
385079160787: Pull complete
dc66e2c13be5: Download complete
dc66e2c13be5: Pull complete
e0210f91556c: Download complete
d513847b8a76: Verifying Checksum
fffbff44edaf: Download complete
d7ea68590de1: Verifying Checksum
d7ea68590de1: Download complete
4a8dcc9ff6fd: Verifying Checksum
4a8dcc9ff6fd: Download complete
bfb0a9f61bdf: Download complete
bfb0a9f61bdf: Pull complete
e0210f91556c: Pull complete
d513847b8a76: Pull complete
fffbff44edaf: Pull complete
d7ea68590de1: Pull complete
4a8dcc9ff6fd: Pull complete
Digest: sha256:b7587f3cb74f4f4b2a4f9d67f052edbf95eb93f4fec7c5ada3792546caaf7383
Status: Downloaded newer image for postgres:16-alpine
--
-- PostgreSQL database dump
--

\restrict bob52FX4J32gY3VkKRQnwbrMXrrbWjp86ZzbOSk3BbIKeBicduvMuoMgLeicNZo

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13

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
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: rag_tsv_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rag_tsv_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.content_tsv := to_tsvector('simple', coalesce(NEW.chunk_text,''));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_sessions (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_sessions_id_seq OWNED BY public.admin_sessions.id;


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: conversation_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_memory (
    session_id text NOT NULL,
    summary text NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: digital_hubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.digital_hubs (
    id integer,
    county character varying(100),
    constituency character varying(100),
    ward character varying(255),
    model character varying(100),
    status text
);


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback (
    feedback_id integer NOT NULL,
    project_id integer NOT NULL,
    subject character varying(500) NOT NULL,
    feedback text NOT NULL,
    project_name character varying(500) NOT NULL,
    attachments jsonb,
    status character varying(50),
    email_sent boolean DEFAULT false,
    email_id character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.feedback_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.feedback_feedback_id_seq OWNED BY public.feedback.feedback_id;


--
-- Name: project_sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_sites (
    site_id bigint NOT NULL,
    project_id integer NOT NULL,
    site_level text DEFAULT 'site'::text NOT NULL,
    region text,
    county text,
    constituency text,
    ward text,
    site_name text,
    status_raw text,
    status_norm text,
    percent_complete numeric,
    contract_sum_kes numeric,
    approved_cost_kes numeric,
    amount_disbursed_kes numeric,
    units numeric,
    stalls numeric,
    bed_capacity numeric,
    acreage numeric,
    connected_by text,
    categorization text,
    reason_for_outage text,
    start_date date,
    end_date date,
    remarks text,
    key_issues text,
    suggested_solutions text,
    extra jsonb,
    loaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: flat_project_sites; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.flat_project_sites AS
 SELECT site_id,
    project_id,
    site_name,
    site_level,
    region,
    county,
    constituency,
    ward,
    status_norm AS status,
    status_raw,
    percent_complete,
    reason_for_outage,
    contract_sum_kes AS contract_sum,
    approved_cost_kes AS approved_cost,
    amount_disbursed_kes AS amount_disbursed,
    units,
    stalls,
    bed_capacity,
    acreage,
    categorization,
    connected_by,
    start_date,
    end_date,
    loaded_at,
    remarks,
    key_issues,
    suggested_solutions,
    (extra ->> 'source_table'::text) AS original_source_table,
    ((extra ->> 'source_row_id'::text))::integer AS original_source_id
   FROM public.project_sites;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    name text NOT NULL,
    description text,
    sector text,
    implementing_agency text,
    location jsonb,
    budget jsonb,
    timeline jsonb,
    progress jsonb,
    public_engagement jsonb,
    data_sources jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    name_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, COALESCE(name, ''::text))) STORED,
    notes jsonb,
    ministry text,
    state_department text
);


--
-- Name: flat_projects; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.flat_projects AS
 SELECT project_id,
    name,
    description,
    sector,
    implementing_agency,
    ministry,
    state_department,
    notes,
    data_sources,
    created_at,
    updated_at,
    (location ->> 'county'::text) AS county,
    (location ->> 'constituency'::text) AS constituency,
    (location ->> 'geocoordinates'::text) AS geocoordinates,
    (budget ->> 'source'::text) AS funding_source,
    ((budget ->> 'allocated_amount_kes'::text))::numeric AS budget_allocated,
    ((budget ->> 'disbursed_amount_kes'::text))::numeric AS budget_disbursed,
    ((timeline ->> 'start_date'::text))::date AS start_date,
    ((timeline ->> 'expected_completion_date'::text))::date AS expected_completion_date,
    ((timeline ->> 'last_updated'::text))::date AS timeline_last_updated,
    (progress ->> 'status'::text) AS project_status,
    ((progress ->> 'percentage_complete'::text))::numeric AS percentage_complete,
    (progress ->> 'latest_update_summary'::text) AS progress_summary,
    ((public_engagement ->> 'feedback_enabled'::text))::boolean AS feedback_enabled,
    (public_engagement ->> 'common_feedback'::text) AS common_feedback,
    ((public_engagement ->> 'complaints_received'::text))::integer AS complaints_count
   FROM public.projects;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: project_counties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_counties (
    id integer NOT NULL,
    project_id integer NOT NULL,
    county character varying(100) NOT NULL,
    approved_cost numeric(18,2),
    amount_disbursed numeric(18,2),
    physical_status_percentage numeric(5,2),
    implementation_status text,
    start_date date,
    end_date date,
    key_issues text,
    suggested_solutions text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: project_counties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_counties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_counties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_counties_id_seq OWNED BY public.project_counties.id;


--
-- Name: project_rag_index; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_rag_index (
    chunk_id uuid NOT NULL,
    project_id integer NOT NULL,
    chunk_text text NOT NULL,
    embedding public.vector(384),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    content_tsv tsvector
);


--
-- Name: project_rag_index0; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_rag_index0 (
    chunk_id text NOT NULL,
    project_id integer NOT NULL,
    source_table text NOT NULL,
    source_pk text NOT NULL,
    chunk_type text NOT NULL,
    chunk_text text NOT NULL,
    embedding public.vector(384),
    content_tsv tsvector,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_rag_index1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_rag_index1 (
    chunk_id uuid NOT NULL,
    project_id integer NOT NULL,
    chunk_text text NOT NULL,
    embedding public.vector(384),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, chunk_text)) STORED,
    county text,
    chunk_hash text
);


--
-- Name: project_rag_index_model; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_rag_index_model (
    id integer NOT NULL,
    content text,
    embedding public.vector(384),
    metadata jsonb,
    project_id integer
);


--
-- Name: project_rag_index_model_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_rag_index_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_rag_index_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_rag_index_model_id_seq OWNED BY public.project_rag_index_model.id;


--
-- Name: project_sites_site_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_sites_site_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_sites_site_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_sites_site_id_seq OWNED BY public.project_sites.site_id;


--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: public_wifi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_wifi (
    id bigint NOT NULL,
    project_id integer,
    region text,
    county text,
    constituency text,
    ward text,
    categorization text,
    site_name text,
    connected_by text,
    status text,
    reason_for_outage text,
    loaded_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: public_wifi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.public_wifi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: public_wifi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.public_wifi_id_seq OWNED BY public.public_wifi.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: staging_accomodation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staging_accomodation (
    id text,
    project_id text,
    county text,
    "Constituency" text,
    "Project Name" text,
    "Area / Location " text,
    "Status" text,
    "Acreage" text,
    "Bed Capacity" text,
    "Contract Sum" text
);


--
-- Name: staging_ahp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staging_ahp (
    id text,
    project_id text,
    county text,
    "Constituency" text,
    "Area / Location " text,
    "Project Name" text,
    "Status" text,
    "Acreage" text,
    "No. of Units" text,
    "Contract Sum" text
);


--
-- Name: staging_digital_hubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staging_digital_hubs (
    "ID" text,
    project_id text,
    "Region" text,
    "County" text,
    "Constituency" text,
    "Ward" text,
    "Site" text,
    "Status" text,
    "Remarks" text
);


--
-- Name: staging_esp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staging_esp (
    id text,
    project_id text,
    county text,
    "Constituency" text,
    "Area / Location " text,
    "Project Name" text,
    "Status" text,
    "Acreage" text,
    "No. of Stalls" text,
    "Contract Sum" text
);


--
-- Name: v_project_sites_llm; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_project_sites_llm AS
 SELECT site_id,
    project_id,
    site_level,
    region,
    county,
    constituency,
    ward,
    site_name,
    status_norm,
    percent_complete,
    contract_sum_kes,
    approved_cost_kes,
    amount_disbursed_kes,
    units,
    stalls,
    bed_capacity,
    acreage,
    connected_by,
    categorization,
    reason_for_outage,
    start_date,
    end_date,
    remarks,
    key_issues,
    suggested_solutions
   FROM public.project_sites;


--
-- Name: v_projects_llm; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_projects_llm AS
 SELECT project_id,
    name,
    description,
    sector,
    implementing_agency,
    location,
    budget,
    timeline,
    progress,
    notes,
    data_sources
   FROM public.projects;


--
-- Name: admin_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions ALTER COLUMN id SET DEFAULT nextval('public.admin_sessions_id_seq'::regclass);


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: feedback feedback_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.feedback_feedback_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: project_counties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_counties ALTER COLUMN id SET DEFAULT nextval('public.project_counties_id_seq'::regclass);


--
-- Name: project_rag_index_model id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_rag_index_model ALTER COLUMN id SET DEFAULT nextval('public.project_rag_index_model_id_seq'::regclass);


--
-- Name: project_sites site_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_sites ALTER COLUMN site_id SET DEFAULT nextval('public.project_sites_site_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: public_wifi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_wifi ALTER COLUMN id SET DEFAULT nextval('public.public_wifi_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- Name: admin_sessions admin_sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: conversation_memory conversation_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_memory
    ADD CONSTRAINT conversation_memory_pkey PRIMARY KEY (session_id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_slug_key UNIQUE (slug);


--
-- Name: project_counties project_counties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_counties
    ADD CONSTRAINT project_counties_pkey PRIMARY KEY (id);


--
-- Name: project_rag_index_model project_rag_index_model_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_rag_index_model
    ADD CONSTRAINT project_rag_index_model_pkey PRIMARY KEY (id);


--
-- Name: project_rag_index1 project_rag_index_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_rag_index1
    ADD CONSTRAINT project_rag_index_pkey PRIMARY KEY (chunk_id);


--
-- Name: project_rag_index project_rag_index_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_rag_index
    ADD CONSTRAINT project_rag_index_pkey1 PRIMARY KEY (chunk_id);


--
-- Name: project_rag_index0 project_rag_index_pkey3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_rag_index0
    ADD CONSTRAINT project_rag_index_pkey3 PRIMARY KEY (chunk_id);


--
-- Name: project_sites project_sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_sites
    ADD CONSTRAINT project_sites_pkey PRIMARY KEY (site_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: public_wifi public_wifi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_wifi
    ADD CONSTRAINT public_wifi_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_slug_key UNIQUE (slug);


--
-- Name: project_counties unique_project_county; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_counties
    ADD CONSTRAINT unique_project_county UNIQUE (project_id, county);


--
-- Name: idx_admin_sessions_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_sessions_expires_at ON public.admin_sessions USING btree (expires_at);


--
-- Name: idx_admin_sessions_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_sessions_token_hash ON public.admin_sessions USING btree (token_hash);


--
-- Name: idx_project_rag_index_county; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_rag_index_county ON public.project_rag_index1 USING btree (county);


--
-- Name: idx_project_rag_index_tsv; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_rag_index_tsv ON public.project_rag_index USING gin (content_tsv);


--
-- Name: idx_projects_name_tsv; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_name_tsv ON public.projects USING gin (name_tsv);


--
-- Name: idx_rag_embedding_hnsw; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rag_embedding_hnsw ON public.project_rag_index0 USING hnsw (embedding public.vector_cosine_ops);


--
-- Name: idx_rag_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rag_project_id ON public.project_rag_index0 USING btree (project_id);


--
-- Name: idx_rag_tsv; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rag_tsv ON public.project_rag_index0 USING gin (content_tsv);


--
-- Name: idx_sites_extra_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sites_extra_gin ON public.project_sites USING gin (extra);


--
-- Name: idx_sites_level_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sites_level_location ON public.project_sites USING btree (site_level, county, constituency, ward);


--
-- Name: idx_sites_percent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sites_percent ON public.project_sites USING btree (percent_complete);


--
-- Name: idx_sites_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sites_project_id ON public.project_sites USING btree (project_id);


--
-- Name: idx_sites_site_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sites_site_name_trgm ON public.project_sites USING gin (site_name public.gin_trgm_ops);


--
-- Name: idx_sites_status_norm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sites_status_norm ON public.project_sites USING btree (status_norm);


--
-- Name: project_rag_project_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_rag_project_id_idx ON public.project_rag_index1 USING btree (project_id);


--
-- Name: project_rag_tsv_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_rag_tsv_idx ON public.project_rag_index1 USING gin (content_tsv);


--
-- Name: project_rag_vec_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX project_rag_vec_idx ON public.project_rag_index1 USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');


--
-- Name: ux_project_sites_natural; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_project_sites_natural ON public.project_sites USING btree (project_id, site_level, county, constituency, ward, site_name);


--
-- Name: ux_public_wifi_natural; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_public_wifi_natural ON public.public_wifi USING btree (county, constituency, site_name);


--
-- Name: ux_rag_project_county_chunkhash; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_rag_project_county_chunkhash ON public.project_rag_index1 USING btree (project_id, county, chunk_hash);


--
-- Name: project_rag_index0 trg_rag_tsv; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_rag_tsv BEFORE INSERT OR UPDATE OF chunk_text ON public.project_rag_index0 FOR EACH ROW EXECUTE FUNCTION public.rag_tsv_update();


--
-- Name: admin_sessions admin_sessions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- Name: admins admins_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: feedback fk_feedback_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT fk_feedback_project FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_counties fk_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_counties
    ADD CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: public_wifi fk_public_wifi_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_wifi
    ADD CONSTRAINT fk_public_wifi_project FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_rag_index fk_rag_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_rag_index
    ADD CONSTRAINT fk_rag_project FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_rag_index1 fk_rag_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_rag_index1
    ADD CONSTRAINT fk_rag_project FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_rag_index0 project_rag_index_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_rag_index0
    ADD CONSTRAINT project_rag_index_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: project_sites project_sites_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_sites
    ADD CONSTRAINT project_sites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict bob52FX4J32gY3VkKRQnwbrMXrrbWjp86ZzbOSk3BbIKeBicduvMuoMgLeicNZo



-- ============================================
-- END REMOTE POSTGRESQL SCHEMA
-- ============================================

-- ============================================
-- MYSQL-ONLY TABLES (TO BE ADDED)
-- ============================================
-- Tables: activities, annual_workplans, approved_public_feedback, assigned_assets, attachments, attachmenttypes, attendance, budget_changes, budget_combinations, budget_items, budgets, categories, category_milestones, chat_message_reactions, chat_messages, chat_room_participants, chat_rooms, citizen_proposals, component_data_access_rules, contractor_users, contractors, counties, county_proposed_project_milestones, county_proposed_projects, dashboard_components, dashboard_permissions, dashboard_tabs, departments, employee_bank_details, employee_benefits, employee_compensation, employee_contracts, employee_dependants, employee_disciplinary, employee_leave_entitlements, employee_loans, employee_memberships, employee_performance, employee_project_assignments, employee_promotions, employee_retirements, employee_terminations, employee_training, feedback_moderation, feedback_moderation_settings, financialyears, inspection_teams, job_groups, leave_applications, leave_types, milestone_activities, milestone_attachments, moderation_queue, monthly_payroll, participants, payment_approval_history, payment_approval_levels, payment_details, payment_request_approvals, payment_request_documents, payment_request_milestones, payment_status_definitions, planningdocuments, privileges, programs, project_announcements, project_assignments, project_climate_risk, project_concept_notes, project_contractor_assignments, project_counties, project_documents, project_esohsg_screening, project_financials, project_fy_breakdown, project_hazard_assessment, project_implementation_plan, project_m_and_e, project_maps, project_milestone_implementations, project_milestones, project_monitoring_records, project_needs_assessment, project_payment_requests, project_photos, project_readiness, project_risks, project_roles, project_staff_assignments, project_stages, project_stakeholders, project_subcounties, project_sustainability, project_wards, project_workflow_steps, project_workflows, projectfeedback, projects, public_feedback, public_holidays, role_dashboard_config, role_dashboard_permissions, role_privileges, roles, sections, staff, strategicplans, studyparticipants, subcounties, subprograms, user_dashboard_preferences, user_data_filters, user_department_assignments, user_project_assignments, user_ward_assignments, users, wards

CREATE TABLE IF NOT EXISTS activities (
  activityId INTEGER NOT NULL,
  workplanId INTEGER DEFAULT NULL,
  projectId INTEGER DEFAULT NULL,
  activityName TEXT,
  activityDescription TEXT,
  responsibleOfficer VARCHAR(255) DEFAULT NULL,
  startDate DATE DEFAULT NULL,
  endDate DATE DEFAULT NULL,
  budgetAllocated NUMERIC(15,2) DEFAULT NULL,
  actualCost NUMERIC(15,2) DEFAULT NULL,
  percentageComplete NUMERIC(5,2) DEFAULT '0.00',
  activityStatus VARCHAR(50) CHECK (value IN ('not_started','in_progress','completed','delayed','cancelled')) DEFAULT 'not_started',
  voided BOOLEAN DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  INDEX idx_workplan (workplanId),
  INDEX idx_project (projectId),
  CONSTRAINT activities_ibfk_1 FOREIGN KEY (workplanId) REFERENCES annual_workplans (workplanId),
  CONSTRAINT activities_ibfk_2 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT fk_activities_projects FOREIGN KEY (projectId) REFERENCES projects (id) )

--
-- Table structure for table annual_workplans
--

DROP TABLE IF EXISTS annual_workplans;

CREATE TABLE IF NOT EXISTS annual_workplans (
  workplanId INTEGER NOT NULL,
  subProgramId INTEGER DEFAULT NULL,
  financialYear VARCHAR(9) DEFAULT NULL,
  workplanName VARCHAR(255) DEFAULT NULL,
  workplanDescription TEXT,
  approvalStatus VARCHAR(50) CHECK (value IN ('draft','submitted','approved','rejected')) DEFAULT 'draft',
  totalBudget NUMERIC(15,2) DEFAULT NULL,
  actualExpenditure NUMERIC(15,2) DEFAULT '0.00',
  performanceScore NUMERIC(5,2) DEFAULT NULL,
  voided BOOLEAN DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  challenges TEXT,
  lessons TEXT,
  recommendations TEXT,
  INDEX idx_subprogram (subProgramId),
  INDEX idx_financial_year (financialYear),
  CONSTRAINT annual_workplans_ibfk_1 FOREIGN KEY (subProgramId) REFERENCES subprograms (subProgramId) )

--
-- Table structure for table approved_public_feedback
--

DROP TABLE IF EXISTS approved_public_feedback;

CREATE TABLE IF NOT EXISTS approved_public_feedback (
  id INTEGER NOT NULL,
  feedback_id INTEGER NOT NULL,
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approval_notes TEXT COLLATE utf8mb4_unicode_ci,
  UNIQUE INDEX feedback_id (feedback_id),
  INDEX approved_by (approved_by),
  CONSTRAINT approved_public_feedback_ibfk_1 FOREIGN KEY (feedback_id) REFERENCES public_feedback (id) ON DELETE CASCADE,
  CONSTRAINT approved_public_feedback_ibfk_2 FOREIGN KEY (approved_by) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assigned_assets (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  assetName VARCHAR(255) NOT NULL,
  serialNumber VARCHAR(255) DEFAULT NULL,
  assignmentDate DATE NOT NULL,
  returnDate DATE DEFAULT NULL,
  condition VARCHAR(255) DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT assigned_assets_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table attachments
--

DROP TABLE IF EXISTS attachments;

CREATE TABLE IF NOT EXISTS attachments (
  attachmentId INTEGER NOT NULL,
  assetId INTEGER DEFAULT NULL,
  typeId INTEGER DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  path TEXT,
  size INTEGER DEFAULT NULL,
  contentBlob VARCHAR(255) DEFAULT NULL,
  description TEXT,
  documentNo VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS attachmenttypes (
  typeId INTEGER NOT NULL,
  attachmentName VARCHAR(255) DEFAULT NULL,
  description TEXT,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  DATE DATE NOT NULL,
  checkInTime TIMESTAMP NOT NULL,
  checkOutTime TIMESTAMP DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT attendance_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table budget_changes
--

DROP TABLE IF EXISTS budget_changes;

CREATE TABLE IF NOT EXISTS budget_changes (
  changeId INTEGER NOT NULL,
  budgetId INTEGER NOT NULL,
  itemId INTEGER DEFAULT NULL,
  changeType VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  changeReason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending Approval',
  oldValue JSONB DEFAULT NULL,
  newValue JSONB DEFAULT NULL,
  requestedBy INTEGER NOT NULL,
  requestedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  reviewedBy INTEGER DEFAULT NULL,
  reviewedAt TIMESTAMP DEFAULT NULL,
  reviewNotes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  userId INTEGER NOT NULL,
  voided BOOLEAN DEFAULT '0',
  voidedBy INTEGER DEFAULT NULL,
  voidedAt TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_budgetId (budgetId),
  INDEX idx_itemId (itemId),
  INDEX idx_status (status),
  INDEX idx_voided (voided),
  INDEX fk_budget_changes_requestedBy (requestedBy),
  INDEX fk_budget_changes_reviewedBy (reviewedBy),
  CONSTRAINT fk_budget_changes_budget FOREIGN KEY (budgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_item FOREIGN KEY (itemId) REFERENCES budget_items (itemId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_requestedBy FOREIGN KEY (requestedBy) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_budget_changes_reviewedBy FOREIGN KEY (reviewedBy) REFERENCES users (userId) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_combinations (
  combinationId INTEGER NOT NULL,
  combinedBudgetId INTEGER NOT NULL,
  containerBudgetId INTEGER NOT NULL,
  displayOrder INTEGER DEFAULT '0',
  userId INTEGER NOT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_combination (combinedBudgetId,containerBudgetId),
  INDEX idx_combinedBudgetId (combinedBudgetId),
  INDEX idx_containerBudgetId (containerBudgetId),
  INDEX fk_combinations_user (userId),
  CONSTRAINT fk_combinations_combined FOREIGN KEY (combinedBudgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_combinations_container FOREIGN KEY (containerBudgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_combinations_user FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_items (
  itemId INTEGER NOT NULL,
  budgetId INTEGER NOT NULL,
  projectId INTEGER DEFAULT NULL,
  remarks TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  addedAfterApproval BOOLEAN DEFAULT '0',
  changeRequestId INTEGER DEFAULT NULL,
  userId INTEGER NOT NULL,
  voided BOOLEAN DEFAULT '0',
  voidedBy INTEGER DEFAULT NULL,
  voidedAt TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_budgetId (budgetId),
  INDEX idx_projectId (projectId),
  INDEX idx_voided (voided),
  INDEX fk_budget_items_user (userId),
  CONSTRAINT fk_budget_items_budget FOREIGN KEY (budgetId) REFERENCES budgets (budgetId) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_budget_items_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budget_items_user FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
  budgetId INTEGER NOT NULL,
  budgetName VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  budgetType VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  isCombined BOOLEAN DEFAULT '0',
  parentBudgetId INTEGER DEFAULT NULL,
  finYearId INTEGER NOT NULL,
  departmentId INTEGER DEFAULT NULL,
  description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  totalAmount NUMERIC(15,2) DEFAULT '0.00',
  status VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  isFrozen BOOLEAN DEFAULT '0',
  requiresApprovalForChanges BOOLEAN DEFAULT '1',
  approvedBy INTEGER DEFAULT NULL,
  approvedAt TIMESTAMP DEFAULT NULL,
  rejectedBy INTEGER DEFAULT NULL,
  rejectedAt TIMESTAMP DEFAULT NULL,
  rejectionReason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  userId INTEGER NOT NULL,
  voided BOOLEAN DEFAULT '0',
  voidedBy INTEGER DEFAULT NULL,
  voidedAt TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_finYearId (finYearId),
  INDEX idx_departmentId (departmentId),
  INDEX idx_status (status),
  INDEX idx_voided (voided),
  INDEX fk_budgets_user (userId),
  INDEX idx_isCombined (isCombined),
  INDEX idx_parentBudgetId (parentBudgetId),
  CONSTRAINT fk_budgets_department FOREIGN KEY (departmentId) REFERENCES departments (departmentId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_finYear FOREIGN KEY (finYearId) REFERENCES financialyears (finYearId) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_parent FOREIGN KEY (parentBudgetId) REFERENCES budgets (budgetId) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_user FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  categoryId INTEGER NOT NULL,
  categoryName VARCHAR(255) DEFAULT NULL,
  description TEXT,
  picture VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS category_milestones (
  milestoneId INTEGER NOT NULL,
  categoryId INTEGER NOT NULL,
  milestoneName VARCHAR(255) NOT NULL,
  description TEXT,
  sequenceOrder INTEGER NOT NULL,
  userId INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT '0',
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX userId (userId),
  INDEX fk_category_milestones_category (categoryId),
  CONSTRAINT category_milestones_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT fk_category_milestones_category FOREIGN KEY (categoryId) REFERENCES categories (categoryId) )

--
-- Table structure for table chat_message_reactions
--

DROP TABLE IF EXISTS chat_message_reactions;

CREATE TABLE IF NOT EXISTS chat_message_reactions (
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reaction_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX fk_chat_reactions_user (user_id),
  CONSTRAINT fk_chat_reactions_message FOREIGN KEY (message_id) REFERENCES chat_messages (message_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_reactions_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  message_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  message_text TEXT,
  message_type VARCHAR(50) CHECK (value IN ('TEXT','file','image','system','announcement')) DEFAULT 'TEXT',
  file_url VARCHAR(500) DEFAULT NULL,
  file_name VARCHAR(255) DEFAULT NULL,
  file_size INTEGER DEFAULT NULL,
  reply_to_message_id INTEGER DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP NULL DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT '0',
  INDEX fk_chat_messages_room (room_id),
  INDEX fk_chat_messages_sender (sender_id),
  INDEX fk_chat_messages_reply (reply_to_message_id),
  INDEX idx_chat_messages_created_at (created_at),
  INDEX idx_chat_messages_room_created (room_id,created_at),
  CONSTRAINT fk_chat_messages_reply FOREIGN KEY (reply_to_message_id) REFERENCES chat_messages (message_id) ON DELETE SET NULL,
  CONSTRAINT fk_chat_messages_room FOREIGN KEY (room_id) REFERENCES chat_rooms (room_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users (userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_room_participants (
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  last_read_at TIMESTAMP NULL DEFAULT NULL,
  is_admin BOOLEAN DEFAULT '0',
  is_muted BOOLEAN DEFAULT '0',
  INDEX fk_chat_participants_user (user_id),
  INDEX idx_chat_participants_user (user_id),
  CONSTRAINT fk_chat_participants_room FOREIGN KEY (room_id) REFERENCES chat_rooms (room_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_participants_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_rooms (
  room_id INTEGER NOT NULL,
  room_name VARCHAR(255) NOT NULL,
  room_type VARCHAR(50) CHECK (value IN ('direct','group','project','department','role')) NOT NULL,
  project_id INTEGER DEFAULT NULL,
  department_id INTEGER DEFAULT NULL,
  created_by INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT '1',
  role_id INTEGER DEFAULT NULL,
  INDEX fk_chat_rooms_project (project_id),
  INDEX fk_chat_rooms_creator (created_by),
  INDEX idx_chat_rooms_type (room_type),
  INDEX idx_chat_rooms_active (is_active),
  INDEX fk_chat_rooms_role (role_id),
  CONSTRAINT fk_chat_rooms_creator FOREIGN KEY (created_by) REFERENCES users (userId) ON DELETE CASCADE,
  CONSTRAINT fk_chat_rooms_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_rooms_role FOREIGN KEY (role_id) REFERENCES roles (roleId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS citizen_proposals (
  id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  estimated_cost NUMERIC(15,2) NOT NULL,
  proposer_name VARCHAR(255) NOT NULL,
  proposer_email VARCHAR(255) NOT NULL,
  proposer_phone VARCHAR(50) NOT NULL,
  proposer_address TEXT,
  justification TEXT NOT NULL,
  expected_benefits TEXT NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  status VARCHAR(50) CHECK (value IN ('Draft','Under Review','Approved','Rejected')) DEFAULT 'Under Review',
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INTEGER DEFAULT NULL,
  reviewed_at TIMESTAMP DEFAULT NULL,
  review_notes TEXT,
  voided BOOLEAN DEFAULT '0',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  approved_for_public BOOLEAN DEFAULT '0',
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  approval_notes TEXT,
  revision_requested BOOLEAN DEFAULT '0',
  revision_notes TEXT,
  revision_requested_by INTEGER DEFAULT NULL,
  revision_requested_at TIMESTAMP DEFAULT NULL,
  revision_submitted_at TIMESTAMP DEFAULT NULL,
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_submission_date (submission_date),
  INDEX idx_reviewed_by (reviewed_by),
  INDEX idx_approved_for_public (approved_for_public),
  INDEX idx_approved_by (approved_by),
  INDEX idx_revision_requested (revision_requested)
);

CREATE TABLE IF NOT EXISTS component_data_access_rules (
  id INTEGER NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) CHECK (value IN ('department','ward','project','budget','status','custom')) NOT NULL,
  rule_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT '1',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX fk_comp_access_component (component_key),
  INDEX idx_rule_type (rule_type),
  CONSTRAINT fk_comp_access_component FOREIGN KEY (component_key) REFERENCES dashboard_components (component_key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contractor_users (
  contractorUserId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  contractorId INTEGER NOT NULL,
  INDEX userId (userId),
  INDEX contractorId (contractorId),
  CONSTRAINT contractor_users_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId),
  CONSTRAINT contractor_users_ibfk_2 FOREIGN KEY (contractorId) REFERENCES contractors (contractorId) )

--
-- Table structure for table contractors
--

DROP TABLE IF EXISTS contractors;

CREATE TABLE IF NOT EXISTS contractors (
  contractorId INTEGER NOT NULL,
  companyName VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  UNIQUE INDEX email (email)
);

CREATE TABLE IF NOT EXISTS counties (
  countyId INTEGER NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  geoSpatial VARCHAR(255) DEFAULT NULL,
  geoCode VARCHAR(255) DEFAULT NULL,
  geoLat NUMERIC(10,7) DEFAULT NULL,
  geoLon NUMERIC(10,7) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  UNIQUE INDEX uq_county_name (name),
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT counties_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT counties_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS county_proposed_project_milestones (
  id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completed BOOLEAN DEFAULT '0',
  completed_date DATE DEFAULT NULL,
  sequence_order INTEGER DEFAULT '0',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX fk_milestone_project (project_id),
  CONSTRAINT fk_milestone_project FOREIGN KEY (project_id) REFERENCES county_proposed_projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS county_proposed_projects (
  id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  estimated_cost NUMERIC(15,2) NOT NULL,
  justification TEXT NOT NULL,
  expected_benefits TEXT NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  status VARCHAR(50) CHECK (value IN ('Planning','Approved','Implementation','Completed','Cancelled')) DEFAULT 'Planning',
  priority VARCHAR(50) CHECK (value IN ('High','Medium','Low')) DEFAULT 'Medium',
  department VARCHAR(255) NOT NULL,
  project_manager VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  progress NUMERIC(5,2) DEFAULT '0.00',
  budget_allocated NUMERIC(15,2) DEFAULT '0.00',
  budget_utilized NUMERIC(15,2) DEFAULT '0.00',
  stakeholders TEXT,
  risks TEXT,
  created_by INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT '0',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  approved_for_public BOOLEAN DEFAULT '0',
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  approval_notes TEXT,
  revision_requested BOOLEAN DEFAULT '0',
  revision_notes TEXT,
  revision_requested_by INTEGER DEFAULT NULL,
  revision_requested_at TIMESTAMP DEFAULT NULL,
  revision_submitted_at TIMESTAMP DEFAULT NULL,
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_created_by (created_by),
  INDEX idx_approved_for_public (approved_for_public),
  INDEX idx_approved_by (approved_by),
  INDEX idx_revision_requested (revision_requested)
);

CREATE TABLE IF NOT EXISTS dashboard_components (
  id INTEGER NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  component_name VARCHAR(200) NOT NULL,
  component_type VARCHAR(50) NOT NULL,
  component_file VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT '1',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX component_key (component_key),
  INDEX idx_dashboard_components_active (is_active)
);

CREATE TABLE IF NOT EXISTS dashboard_permissions (
  id INTEGER NOT NULL,
  permission_key VARCHAR(100) NOT NULL,
  permission_name VARCHAR(200) NOT NULL,
  description TEXT,
  component_key VARCHAR(100) DEFAULT NULL,
  is_active BOOLEAN DEFAULT '1',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX permission_key (permission_key),
  INDEX component_key (component_key),
  CONSTRAINT dashboard_permissions_ibfk_1 FOREIGN KEY (component_key) REFERENCES dashboard_components (component_key) )

--
-- Table structure for table dashboard_tabs
--

DROP TABLE IF EXISTS dashboard_tabs;

CREATE TABLE IF NOT EXISTS dashboard_tabs (
  id INTEGER NOT NULL,
  tab_key VARCHAR(50) NOT NULL,
  tab_name VARCHAR(100) NOT NULL,
  tab_icon VARCHAR(100) DEFAULT NULL,
  tab_order INTEGER DEFAULT '0',
  description TEXT,
  is_active BOOLEAN DEFAULT '1',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX tab_key (tab_key),
  INDEX idx_dashboard_tabs_active (is_active)
);

CREATE TABLE IF NOT EXISTS departments (
  departmentId INTEGER NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  alias TEXT,
  location TEXT,
  address TEXT,
  contactPerson VARCHAR(255) DEFAULT NULL,
  phoneNumber VARCHAR(255) DEFAULT NULL,
  email TEXT,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT departments_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT departments_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS employee_bank_details (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  bankName VARCHAR(255) NOT NULL,
  accountNumber VARCHAR(255) NOT NULL,
  branchName VARCHAR(255) DEFAULT NULL,
  isPrimary SMALLINT DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_bank_details_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_benefits
--

DROP TABLE IF EXISTS employee_benefits;

CREATE TABLE IF NOT EXISTS employee_benefits (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  benefitName VARCHAR(255) NOT NULL,
  enrollmentDate DATE DEFAULT NULL,
  status VARCHAR(50) NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_benefits_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_compensation
--

DROP TABLE IF EXISTS employee_compensation;

CREATE TABLE IF NOT EXISTS employee_compensation (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  baseSalary NUMERIC(10,2) NOT NULL,
  allowances NUMERIC(10,2) DEFAULT NULL,
  bonuses NUMERIC(10,2) DEFAULT NULL,
  bankName VARCHAR(255) DEFAULT NULL,
  accountNumber VARCHAR(255) DEFAULT NULL,
  payFrequency VARCHAR(50) NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_compensation_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_contracts
--

DROP TABLE IF EXISTS employee_contracts;

CREATE TABLE IF NOT EXISTS employee_contracts (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  contractType VARCHAR(50) NOT NULL,
  contractStartDate DATE NOT NULL,
  contractEndDate DATE DEFAULT NULL,
  status VARCHAR(50) NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_contracts_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_dependants
--

DROP TABLE IF EXISTS employee_dependants;

CREATE TABLE IF NOT EXISTS employee_dependants (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  dependantName VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  dateOfBirth DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_dependants_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_disciplinary
--

DROP TABLE IF EXISTS employee_disciplinary;

CREATE TABLE IF NOT EXISTS employee_disciplinary (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  actionType VARCHAR(255) NOT NULL,
  actionDate DATE NOT NULL,
  reason TEXT NOT NULL,
  comments TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_disciplinary_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_leave_entitlements
--

DROP TABLE IF EXISTS employee_leave_entitlements;

CREATE TABLE IF NOT EXISTS employee_leave_entitlements (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  leaveTypeId INTEGER NOT NULL,
  INTEGER INTEGER NOT NULL,
  allocatedDays NUMERIC(5,2) NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT '0',
  UNIQUE INDEX entitlement_unique (staffId,leaveTypeId,INTEGER),
  INDEX leaveTypeId (leaveTypeId),
  CONSTRAINT employee_leave_entitlements_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId),
  CONSTRAINT employee_leave_entitlements_ibfk_2 FOREIGN KEY (leaveTypeId) REFERENCES leave_types (id) )

--
-- Table structure for table employee_loans
--

DROP TABLE IF EXISTS employee_loans;

CREATE TABLE IF NOT EXISTS employee_loans (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  loanAmount NUMERIC(10,2) NOT NULL,
  loanDate DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  repaymentSchedule TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_loans_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_memberships
--

DROP TABLE IF EXISTS employee_memberships;

CREATE TABLE IF NOT EXISTS employee_memberships (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  organizationName VARCHAR(255) NOT NULL,
  membershipNumber VARCHAR(255) DEFAULT NULL,
  startDate DATE DEFAULT NULL,
  endDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_memberships_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_performance
--

DROP TABLE IF EXISTS employee_performance;

CREATE TABLE IF NOT EXISTS employee_performance (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  reviewDate DATE NOT NULL,
  reviewScore INTEGER DEFAULT NULL,
  comments TEXT,
  reviewerId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN NOT NULL DEFAULT '0',
  INDEX staffId_fk (staffId),
  CONSTRAINT performance_staff_fk FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_project_assignments
--

DROP TABLE IF EXISTS employee_project_assignments;

CREATE TABLE IF NOT EXISTS employee_project_assignments (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  projectId VARCHAR(255) NOT NULL,
  milestoneName VARCHAR(255) DEFAULT NULL,
  role VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  dueDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_project_assignments_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_promotions
--

DROP TABLE IF EXISTS employee_promotions;

CREATE TABLE IF NOT EXISTS employee_promotions (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  oldJobGroupId INTEGER DEFAULT NULL,
  newJobGroupId INTEGER DEFAULT NULL,
  promotionDate DATE NOT NULL,
  comments TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  INDEX oldJobGroupId (oldJobGroupId),
  INDEX newJobGroupId (newJobGroupId),
  CONSTRAINT employee_promotions_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId),
  CONSTRAINT employee_promotions_ibfk_2 FOREIGN KEY (oldJobGroupId) REFERENCES job_groups (id),
  CONSTRAINT employee_promotions_ibfk_3 FOREIGN KEY (newJobGroupId) REFERENCES job_groups (id) )

--
-- Table structure for table employee_retirements
--

DROP TABLE IF EXISTS employee_retirements;

CREATE TABLE IF NOT EXISTS employee_retirements (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  retirementDate DATE NOT NULL,
  retirementType VARCHAR(255) NOT NULL,
  comments TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_retirements_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_terminations
--

DROP TABLE IF EXISTS employee_terminations;

CREATE TABLE IF NOT EXISTS employee_terminations (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  exitDate DATE NOT NULL,
  reason TEXT NOT NULL,
  exitInterviewDetails TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_terminations_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table employee_training
--

DROP TABLE IF EXISTS employee_training;

CREATE TABLE IF NOT EXISTS employee_training (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  courseName VARCHAR(255) NOT NULL,
  institution VARCHAR(255) DEFAULT NULL,
  certificationName VARCHAR(255) DEFAULT NULL,
  completionDate DATE DEFAULT NULL,
  expiryDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT employee_training_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table feedback_moderation
--

DROP TABLE IF EXISTS feedback_moderation;

CREATE TABLE IF NOT EXISTS feedback_moderation (
  id INTEGER NOT NULL,
  feedback_id INTEGER NOT NULL,
  feedback_type VARCHAR(50) CHECK (value IN ('public_feedback','project_feedback')) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public_feedback',
  moderation_status VARCHAR(50) CHECK (value IN ('pending','approved','rejected','flagged')) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  moderation_reason VARCHAR(50) CHECK (value IN ('inappropriate_content','spam','off_topic','personal_attack','false_information','duplicate','incomplete','language_violation','other')) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  custom_reason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  moderator_notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  moderated_by INTEGER DEFAULT NULL,
  moderated_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_feedback_moderation (feedback_id,feedback_type),
  INDEX idx_feedback_id (feedback_id),
  INDEX idx_moderation_status (moderation_status),
  INDEX idx_moderated_by (moderated_by),
  INDEX idx_moderated_at (moderated_at),
  INDEX idx_feedback_type (feedback_type),
  CONSTRAINT feedback_moderation_ibfk_1 FOREIGN KEY (moderated_by) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS feedback_moderation_settings (
  id INTEGER NOT NULL,
  setting_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  setting_value TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX setting_name (setting_name)
);

CREATE TABLE IF NOT EXISTS financialyears (
  finYearId INTEGER NOT NULL,
  finYearName VARCHAR(255) DEFAULT NULL,
  startDate TIMESTAMP DEFAULT NULL,
  endDate TIMESTAMP DEFAULT NULL,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT financialyears_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT financialyears_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inspection_teams (
  id INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  role VARCHAR(100) DEFAULT NULL,
  voided SMALLINT NOT NULL DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX requestId (requestId),
  INDEX staffId (staffId),
  INDEX userId (userId),
  CONSTRAINT inspection_teams_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE CASCADE,
  CONSTRAINT inspection_teams_ibfk_2 FOREIGN KEY (staffId) REFERENCES staff (staffId) ON DELETE RESTRICT,
  CONSTRAINT inspection_teams_ibfk_3 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS job_groups (
  id INTEGER NOT NULL,
  groupName VARCHAR(255) NOT NULL,
  salaryScale NUMERIC(10,2) DEFAULT NULL,
  description TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS leave_applications (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  leaveTypeId INTEGER NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  numberOfDays INTEGER DEFAULT NULL,
  reason TEXT,
  handoverStaffId INTEGER DEFAULT NULL,
  handoverComments TEXT,
  status VARCHAR(50) CHECK (value IN ('Pending','Approved','Rejected','Completed')) DEFAULT 'Pending',
  approvedStartDate DATE DEFAULT NULL,
  approvedEndDate DATE DEFAULT NULL,
  actualReturnDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  INDEX handoverStaffId (handoverStaffId),
  INDEX leaveTypeId (leaveTypeId),
  CONSTRAINT leave_applications_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId),
  CONSTRAINT leave_applications_ibfk_2 FOREIGN KEY (handoverStaffId) REFERENCES staff (staffId),
  CONSTRAINT leave_applications_ibfk_3 FOREIGN KEY (leaveTypeId) REFERENCES leave_types (id) )

--
-- Table structure for table leave_types
--

DROP TABLE IF EXISTS leave_types;

CREATE TABLE IF NOT EXISTS leave_types (
  id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  numberOfDays INTEGER DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS milestone_activities (
  id INTEGER NOT NULL,
  milestoneId INTEGER NOT NULL,
  activityId INTEGER NOT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX idx_unique_milestone_activity (milestoneId,activityId),
  INDEX activityId (activityId),
  CONSTRAINT milestone_activities_ibfk_1 FOREIGN KEY (milestoneId) REFERENCES project_milestones (milestoneId),
  CONSTRAINT milestone_activities_ibfk_2 FOREIGN KEY (activityId) REFERENCES activities (activityId) )

--
-- Table structure for table milestone_attachments
--

DROP TABLE IF EXISTS milestone_attachments;

CREATE TABLE IF NOT EXISTS milestone_attachments (
  attachmentId INTEGER NOT NULL,
  milestoneId INTEGER NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  fileType VARCHAR(50) DEFAULT NULL,
  description TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT '0',
  fileSize INTEGER DEFAULT NULL,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX milestoneId (milestoneId),
  INDEX userId (userId),
  CONSTRAINT milestone_attachments_ibfk_1 FOREIGN KEY (milestoneId) REFERENCES project_milestones (milestoneId) ON DELETE CASCADE,
  CONSTRAINT milestone_attachments_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS moderation_queue (
  id INTEGER NOT NULL,
  feedback_id INTEGER NOT NULL,
  feedback_type VARCHAR(50) CHECK (value IN ('public_feedback','project_feedback')) COLLATE utf8mb4_unicode_ci DEFAULT 'public_feedback',
  priority VARCHAR(50) CHECK (value IN ('low','medium','high','urgent')) COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP DEFAULT NULL,
  processed_by INTEGER DEFAULT NULL,
  INDEX idx_feedback_id (feedback_id),
  INDEX idx_feedback_type (feedback_type),
  INDEX idx_priority (priority),
  INDEX idx_queued_at (queued_at)
);

CREATE TABLE IF NOT EXISTS monthly_payroll (
  id INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  payPeriod DATE NOT NULL,
  grossSalary NUMERIC(10,2) NOT NULL,
  netSalary NUMERIC(10,2) NOT NULL,
  allowances NUMERIC(10,2) DEFAULT NULL,
  deductions NUMERIC(10,2) DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX staffId (staffId),
  CONSTRAINT monthly_payroll_ibfk_1 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table participants
--

DROP TABLE IF EXISTS participants;

CREATE TABLE IF NOT EXISTS participants (
  id INTEGER NOT NULL,
  individualId INTEGER DEFAULT NULL,
  householdId INTEGER DEFAULT NULL,
  gender VARCHAR(255) DEFAULT NULL,
  age INTEGER DEFAULT NULL,
  villageLocality INTEGER DEFAULT NULL,
  gpsLongitude NUMERIC(10,7) DEFAULT NULL,
  gpsLatitude NUMERIC(10,7) DEFAULT NULL,
  vectorBorneDiseaseStatus VARCHAR(255) DEFAULT NULL,
  malariaDiagnosis VARCHAR(255) DEFAULT NULL,
  dengueDiagnosis VARCHAR(255) DEFAULT NULL,
  leishmaniasisDiagnosis VARCHAR(255) DEFAULT NULL,
  waterSource VARCHAR(255) DEFAULT NULL,
  housingType VARCHAR(255) DEFAULT NULL,
  mosquitoNetUsage INTEGER DEFAULT NULL,
  educationLevel VARCHAR(255) DEFAULT NULL,
  occupation VARCHAR(255) DEFAULT NULL,
  incomeKshMonth NUMERIC(15,2) DEFAULT NULL,
  accessToHealthcareKm VARCHAR(255) DEFAULT NULL,
  climatePerceptionScore NUMERIC(15,2) DEFAULT NULL,
  createdOn TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS payment_approval_history (
  historyId INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  action VARCHAR(50) CHECK (value IN ('Approve','Reject','Comment','Returned for Correction','Assigned')) NOT NULL,
  actionByUserId INTEGER NOT NULL,
  assignedToUserId INTEGER DEFAULT NULL,
  actionDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  INDEX requestId (requestId),
  INDEX actionByUserId (actionByUserId),
  INDEX assignedToUserId (assignedToUserId),
  CONSTRAINT payment_approval_history_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId),
  CONSTRAINT payment_approval_history_ibfk_2 FOREIGN KEY (actionByUserId) REFERENCES users (userId),
  CONSTRAINT payment_approval_history_ibfk_3 FOREIGN KEY (assignedToUserId) REFERENCES users (userId) )

--
-- Table structure for table payment_approval_levels
--

DROP TABLE IF EXISTS payment_approval_levels;

CREATE TABLE IF NOT EXISTS payment_approval_levels (
  levelId INTEGER NOT NULL,
  levelName VARCHAR(255) NOT NULL,
  roleId INTEGER NOT NULL,
  approvalOrder INTEGER NOT NULL,
  workflowId INTEGER DEFAULT NULL,
  UNIQUE INDEX roleId (roleId,approvalOrder),
  INDEX workflowId (workflowId),
  CONSTRAINT payment_approval_levels_ibfk_1 FOREIGN KEY (roleId) REFERENCES roles (roleId),
  CONSTRAINT payment_approval_levels_ibfk_2 FOREIGN KEY (workflowId) REFERENCES project_workflows (workflowId) )

--
-- Table structure for table payment_details
--

DROP TABLE IF EXISTS payment_details;

CREATE TABLE IF NOT EXISTS payment_details (
  detailId INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  paymentMode VARCHAR(50) CHECK (value IN ('Bank Transfer','Cheque','Mobile Money','Other')) NOT NULL,
  bankName VARCHAR(255) DEFAULT NULL,
  accountNumber VARCHAR(255) DEFAULT NULL,
  transactionId VARCHAR(255) DEFAULT NULL,
  paidByUserId INTEGER NOT NULL,
  paidAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdByUserId INTEGER DEFAULT NULL,
  voided SMALLINT NOT NULL DEFAULT '0',
  voidedByUserId INTEGER DEFAULT NULL,
  UNIQUE INDEX requestId (requestId),
  INDEX paidByUserId (paidByUserId),
  INDEX createdByUserId (createdByUserId),
  INDEX voidedByUserId (voidedByUserId),
  CONSTRAINT payment_details_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId),
  CONSTRAINT payment_details_ibfk_2 FOREIGN KEY (paidByUserId) REFERENCES users (userId),
  CONSTRAINT payment_details_ibfk_3 FOREIGN KEY (createdByUserId) REFERENCES users (userId),
  CONSTRAINT payment_details_ibfk_4 FOREIGN KEY (voidedByUserId) REFERENCES users (userId) )

--
-- Table structure for table payment_request_approvals
--

DROP TABLE IF EXISTS payment_request_approvals;

CREATE TABLE IF NOT EXISTS payment_request_approvals (
  approvalId INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  stage VARCHAR(100) NOT NULL,
  status VARCHAR(50) CHECK (value IN ('pending','approved','rejected')) NOT NULL,
  comments TEXT,
  actionByUserId INTEGER NOT NULL,
  actionDate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT NOT NULL DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT NULL,
  updatedAt TIMESTAMP NULL DEFAULT NULL,
  INDEX requestId (requestId),
  INDEX actionByUserId (actionByUserId),
  CONSTRAINT payment_request_approvals_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE CASCADE,
  CONSTRAINT payment_request_approvals_ibfk_2 FOREIGN KEY (actionByUserId) REFERENCES users (userId) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payment_request_documents (
  id INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  documentType VARCHAR(50) CHECK (value IN ('invoice','photo','inspection_report','payment_certificate','other')) NOT NULL,
  documentPath VARCHAR(255) NOT NULL,
  description TEXT,
  uploadedByUserId INTEGER NOT NULL,
  voided SMALLINT NOT NULL DEFAULT '0',
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX requestId (requestId),
  INDEX uploadedByUserId (uploadedByUserId),
  CONSTRAINT payment_request_documents_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE CASCADE,
  CONSTRAINT payment_request_documents_ibfk_2 FOREIGN KEY (uploadedByUserId) REFERENCES users (userId) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payment_request_milestones (
  id INTEGER NOT NULL,
  requestId INTEGER NOT NULL,
  activityId INTEGER NOT NULL,
  status VARCHAR(50) CHECK (value IN ('accomplished','not_accomplished')) NOT NULL DEFAULT 'accomplished',
  voided SMALLINT NOT NULL DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX requestId (requestId),
  INDEX activityId (activityId),
  INDEX userId (userId),
  CONSTRAINT payment_request_milestones_ibfk_1 FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE CASCADE,
  CONSTRAINT payment_request_milestones_ibfk_2 FOREIGN KEY (activityId) REFERENCES activities (activityId) ON DELETE CASCADE,
  CONSTRAINT payment_request_milestones_ibfk_3 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payment_status_definitions (
  statusId INTEGER NOT NULL,
  statusName VARCHAR(255) NOT NULL,
  description TEXT,
  UNIQUE INDEX statusName (statusName)
);

CREATE TABLE IF NOT EXISTS planningdocuments (
  attachmentId INTEGER NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  fileType VARCHAR(50) DEFAULT NULL,
  fileSize INTEGER DEFAULT NULL,
  description TEXT,
  entityId INTEGER NOT NULL,
  entityType VARCHAR(50) NOT NULL,
  uploadedBy INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT '0',
  INDEX idx_entity_id_type (entityId,entityType)
);

CREATE TABLE IF NOT EXISTS privileges (
  privilegeId INTEGER NOT NULL,
  privilegeName VARCHAR(255) DEFAULT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL,
  UNIQUE INDEX unique_privilege_name (privilegeName)
);

CREATE TABLE IF NOT EXISTS programs (
  programId INTEGER NOT NULL,
  cidpid VARCHAR(255) DEFAULT NULL,
  departmentId INTEGER DEFAULT NULL,
  sectionId INTEGER DEFAULT NULL,
  programme TEXT,
  needsPriorities TEXT,
  strategies VARCHAR(255) DEFAULT NULL,
  remarks TEXT,
  objectives TEXT,
  outcomes TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  description TEXT,
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT programs_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT programs_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS project_announcements (
  id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) CHECK (value IN ('Project Launch','Public Consultation','Progress Update','Completion','Tender Notice','General Announcement','Public Participation','Project Update','Call for Proposals','Service Notice','Emergency')) NOT NULL,
  type VARCHAR(50) CHECK (value IN ('Meeting','Workshop','Public Forum','Launch Event','Progress Report','Tender','General','Event','Update','Opportunity','Notice','Emergency')) NOT NULL,
  DATE DATE NOT NULL,
  TIME TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  organizer VARCHAR(255) NOT NULL,
  status VARCHAR(50) CHECK (value IN ('Upcoming','Active','Completed','Open','Closed','Cancelled')) DEFAULT 'Upcoming',
  priority VARCHAR(50) CHECK (value IN ('High','Medium','Low')) DEFAULT 'Medium',
  image_url VARCHAR(500) DEFAULT NULL,
  attendees INTEGER DEFAULT '0',
  max_attendees INTEGER DEFAULT '0',
  created_by INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT '0',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  approved_for_public BOOLEAN DEFAULT '0',
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  approval_notes TEXT,
  revision_requested BOOLEAN DEFAULT '0',
  revision_notes TEXT,
  revision_requested_by INTEGER DEFAULT NULL,
  revision_requested_at TIMESTAMP DEFAULT NULL,
  revision_submitted_at TIMESTAMP DEFAULT NULL,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_date (DATE),
  INDEX idx_created_by (created_by),
  INDEX idx_approved_for_public (approved_for_public),
  INDEX idx_approved_by (approved_by),
  INDEX idx_revision_requested (revision_requested)
);

CREATE TABLE IF NOT EXISTS project_assignments (
  id INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  staffId INTEGER NOT NULL,
  milestoneName VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT NULL,
  status VARCHAR(50) DEFAULT NULL,
  dueDate DATE DEFAULT NULL,
  completionDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX projectId (projectId),
  INDEX staffId (staffId),
  CONSTRAINT project_assignments_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_assignments_ibfk_2 FOREIGN KEY (staffId) REFERENCES staff (staffId) )

--
-- Table structure for table project_climate_risk
--

DROP TABLE IF EXISTS project_climate_risk;

CREATE TABLE IF NOT EXISTS project_climate_risk (
  climateRiskId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  hazardName VARCHAR(255) NOT NULL,
  hazardExposure VARCHAR(50) DEFAULT NULL,
  vulnerability VARCHAR(50) DEFAULT NULL,
  riskLevel VARCHAR(50) DEFAULT NULL,
  riskReductionStrategies TEXT,
  riskReductionCosts NUMERIC(15,2) DEFAULT NULL,
  resourcesRequired TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId,hazardName),
  CONSTRAINT project_climate_risk_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_concept_notes (
  conceptNoteId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  situationAnalysis TEXT,
  problemStatement TEXT,
  relevanceProjectIdea TEXT,
  scopeOfProject TEXT,
  projectGoal TEXT,
  goalIndicator TEXT,
  goalMeansVerification TEXT,
  goalAssumptions TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId),
  CONSTRAINT project_concept_notes_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_contractor_assignments (
  projectId INTEGER NOT NULL,
  contractorId INTEGER NOT NULL,
  assignmentDate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX contractorId (contractorId),
  CONSTRAINT project_contractor_assignments_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_contractor_assignments_ibfk_2 FOREIGN KEY (contractorId) REFERENCES contractors (contractorId) )

--
-- Table structure for table project_counties
--

DROP TABLE IF EXISTS project_counties;

CREATE TABLE IF NOT EXISTS project_counties (
  projectId INTEGER NOT NULL,
  countyId INTEGER NOT NULL,
  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX fk_project_county_county (countyId),
  CONSTRAINT fk_project_county_county FOREIGN KEY (countyId) REFERENCES counties (countyId) ON DELETE CASCADE,
  CONSTRAINT fk_project_county_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_documents (
  id INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  milestoneId INTEGER DEFAULT NULL,
  requestId INTEGER DEFAULT NULL,
  documentType VARCHAR(50) NOT NULL,
  documentCategory VARCHAR(50) CHECK (value IN ('payment','milestone','general')) NOT NULL,
  documentPath VARCHAR(255) NOT NULL,
  description TEXT,
  userId INTEGER NOT NULL,
  isProjectCover BOOLEAN NOT NULL DEFAULT '0',
  displayOrder INTEGER DEFAULT NULL,
  voided BOOLEAN NOT NULL DEFAULT '0',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) CHECK (value IN ('pending_review','in_progress','completed','approved','rejected')) NOT NULL DEFAULT 'pending_review',
  progressPercentage NUMERIC(5,2) DEFAULT NULL,
  originalFileName VARCHAR(255) DEFAULT NULL,
  INDEX fk_documents_projects_idx (projectId),
  INDEX fk_documents_milestones_idx (milestoneId),
  INDEX fk_documents_requests_idx (requestId),
  INDEX fk_documents_users_idx (userId),
  CONSTRAINT fk_documents_milestones FOREIGN KEY (milestoneId) REFERENCES project_milestones (milestoneId) ON DELETE SET NULL,
  CONSTRAINT fk_documents_projects FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_requests FOREIGN KEY (requestId) REFERENCES project_payment_requests (requestId) ON DELETE SET NULL,
  CONSTRAINT fk_documents_users FOREIGN KEY (userId) REFERENCES users (userId) )

--
-- Table structure for table project_esohsg_screening
--

DROP TABLE IF EXISTS project_esohsg_screening;

CREATE TABLE IF NOT EXISTS project_esohsg_screening (
  screeningId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  emcaTriggers BOOLEAN DEFAULT NULL,
  emcaDescription TEXT,
  worldBankSafeguardApplicable BOOLEAN DEFAULT NULL,
  worldBankStandards TEXT,
  goKPoliciesApplicable BOOLEAN DEFAULT NULL,
  goKPoliciesLaws TEXT,
  environmentalHealthSafetyImpacts JSONB DEFAULT NULL,
  socialImpacts JSONB DEFAULT NULL,
  publicParticipationConsultation JSONB DEFAULT NULL,
  screeningResultOutcome TEXT,
  specialConditions TEXT,
  screeningUndertakenBy VARCHAR(255) DEFAULT NULL,
  screeningDesignation VARCHAR(255) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId),
  CONSTRAINT project_esohsg_screening_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_financials (
  financialsId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  capitalCostConsultancy NUMERIC(15,2) DEFAULT NULL,
  capitalCostLandAcquisition NUMERIC(15,2) DEFAULT NULL,
  capitalCostSitePrep NUMERIC(15,2) DEFAULT NULL,
  capitalCostConstruction NUMERIC(15,2) DEFAULT NULL,
  capitalCostPlantEquipment NUMERIC(15,2) DEFAULT NULL,
  capitalCostFixturesFittings NUMERIC(15,2) DEFAULT NULL,
  capitalCostOther NUMERIC(15,2) DEFAULT NULL,
  recurrentCostLabor NUMERIC(15,2) DEFAULT NULL,
  recurrentCostOperating NUMERIC(15,2) DEFAULT NULL,
  recurrentCostMaintenance NUMERIC(15,2) DEFAULT NULL,
  recurrentCostOther NUMERIC(15,2) DEFAULT NULL,
  proposedSourceFinancing VARCHAR(255) DEFAULT NULL,
  costImplicationsRelatedProjects TEXT,
  landExpropriationRequired BOOLEAN DEFAULT NULL,
  landExpropriationExpenses NUMERIC(15,2) DEFAULT NULL,
  compensationRequired BOOLEAN DEFAULT NULL,
  otherAttendantCosts TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId),
  CONSTRAINT project_financials_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_fy_breakdown (
  fyBreakdownId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  financialYear VARCHAR(20) NOT NULL,
  totalCost NUMERIC(15,2) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId,financialYear),
  CONSTRAINT project_fy_breakdown_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_hazard_assessment (
  hazardId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  hazardName VARCHAR(255) NOT NULL,
  question TEXT,
  answerYesNo BOOLEAN DEFAULT NULL,
  remarks TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId,hazardName),
  CONSTRAINT project_hazard_assessment_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_implementation_plan (
  planId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  description TEXT,
  keyPerformanceIndicators TEXT,
  responsiblePersons TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId),
  CONSTRAINT project_implementation_plan_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_m_and_e (
  mAndEId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  description TEXT,
  mechanismsInPlace TEXT,
  resourcesBudgetary TEXT,
  resourcesHuman TEXT,
  dataGatheringMethod TEXT,
  reportingChannels TEXT,
  lessonsLearnedProcess TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId),
  CONSTRAINT project_m_and_e_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_maps (
  mapId INTEGER NOT NULL,
  projectId INTEGER DEFAULT NULL,
  map TEXT,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS project_milestone_implementations (
  categoryId INTEGER NOT NULL,
  categoryName VARCHAR(255) NOT NULL,
  description TEXT,
  userId INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT '0',
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX categoryName (categoryName),
  INDEX userId (userId),
  CONSTRAINT project_milestone_implementations_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS project_milestones (
  milestoneId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  milestoneName VARCHAR(255) NOT NULL,
  description TEXT,
  dueDate DATE DEFAULT NULL,
  sequenceOrder INTEGER DEFAULT NULL,
  status VARCHAR(255) DEFAULT 'Not Started',
  completed BOOLEAN DEFAULT '0',
  completedDate DATE DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT '0',
  voidedBy INTEGER DEFAULT NULL,
  progress NUMERIC(5,2) DEFAULT '0.00',
  weight NUMERIC(5,2) DEFAULT '1.00',
  INDEX projectId (projectId),
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT project_milestones_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT project_milestones_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT project_milestones_ibfk_3 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT project_milestones_ibfk_4 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT project_milestones_ibfk_5 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS project_monitoring_records (
  recordId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  observationDate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  comment TEXT,
  warningLevel VARCHAR(20) DEFAULT 'None',
  isRoutineObservation BOOLEAN DEFAULT '1',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT '0',
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  recommendations TEXT,
  challenges TEXT,
  INDEX projectId (projectId),
  INDEX userId (userId),
  CONSTRAINT project_monitoring_records_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_monitoring_records_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) )

--
-- Table structure for table project_needs_assessment
--

DROP TABLE IF EXISTS project_needs_assessment;

CREATE TABLE IF NOT EXISTS project_needs_assessment (
  needsAssessmentId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  targetBeneficiaries TEXT,
  estimateEndUsers TEXT,
  physicalDemandCompletion TEXT,
  proposedPhysicalCapacity TEXT,
  mainBenefitsAsset TEXT,
  significantExternalBenefitsNegativeEffects TEXT,
  significantDifferencesBenefitsAlternatives TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId),
  CONSTRAINT project_needs_assessment_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_payment_requests (
  requestId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  contractorId INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  currentApprovalLevelId INTEGER DEFAULT NULL,
  paymentStatusId INTEGER DEFAULT NULL,
  submittedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  approvedByUserId INTEGER DEFAULT NULL,
  approvalDate TIMESTAMP NULL DEFAULT NULL,
  rejectionReason TEXT,
  comments TEXT,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT NULL,
  updatedAt TIMESTAMP NULL DEFAULT NULL,
  INDEX projectId (projectId),
  INDEX contractorId (contractorId),
  INDEX fk_payment_request_approval_level (currentApprovalLevelId),
  INDEX fk_payment_request_status (paymentStatusId),
  CONSTRAINT fk_payment_request_approval_level FOREIGN KEY (currentApprovalLevelId) REFERENCES payment_approval_levels (levelId),
  CONSTRAINT fk_payment_request_status FOREIGN KEY (paymentStatusId) REFERENCES payment_status_definitions (statusId),
  CONSTRAINT project_payment_requests_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_payment_requests_ibfk_2 FOREIGN KEY (contractorId) REFERENCES contractors (contractorId) )

--
-- Table structure for table project_photos
--

DROP TABLE IF EXISTS project_photos;

CREATE TABLE IF NOT EXISTS project_photos (
  photoId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  fileType VARCHAR(50) DEFAULT NULL,
  fileSize INTEGER DEFAULT NULL,
  description TEXT,
  isDefault BOOLEAN DEFAULT '0',
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN DEFAULT '0',
  voidedBy INTEGER DEFAULT NULL,
  INDEX projectId (projectId),
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT project_photos_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id),
  CONSTRAINT project_photos_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId),
  CONSTRAINT project_photos_ibfk_3 FOREIGN KEY (voidedBy) REFERENCES users (userId) )

--
-- Table structure for table project_readiness
--

DROP TABLE IF EXISTS project_readiness;

CREATE TABLE IF NOT EXISTS project_readiness (
  readinessId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  designsPreparedApproved BOOLEAN DEFAULT NULL,
  landAcquiredSiteReady BOOLEAN DEFAULT NULL,
  regulatoryApprovalsObtained BOOLEAN DEFAULT NULL,
  governmentAgenciesInvolved TEXT,
  consultationsUndertaken BOOLEAN DEFAULT NULL,
  canBePhasedScaledDown BOOLEAN DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId),
  CONSTRAINT project_readiness_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_risks (
  riskId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  riskDescription TEXT,
  likelihood VARCHAR(50) DEFAULT NULL,
  impact VARCHAR(50) DEFAULT NULL,
  mitigationStrategy TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX projectId (projectId),
  CONSTRAINT project_risks_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_roles (
  roleId INTEGER NOT NULL,
  roleName VARCHAR(255) DEFAULT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS project_staff_assignments (
  assignmentId INTEGER NOT NULL,
  projectId INTEGER DEFAULT NULL,
  staffId INTEGER DEFAULT NULL,
  roleId INTEGER DEFAULT NULL,
  startDate TIMESTAMP DEFAULT NULL,
  endDate TIMESTAMP DEFAULT NULL,
  isActive BOOLEAN DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  voided SMALLINT DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS project_stages (
  stageId INTEGER NOT NULL,
  stageName VARCHAR(255) NOT NULL,
  description TEXT,
  UNIQUE INDEX stageName (stageName)
);

CREATE TABLE IF NOT EXISTS project_stakeholders (
  stakeholderId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  stakeholderName VARCHAR(255) DEFAULT NULL,
  levelInfluence VARCHAR(50) DEFAULT NULL,
  engagementStrategy TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX projectId (projectId),
  CONSTRAINT project_stakeholders_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_subcounties (
  projectId INTEGER NOT NULL,
  subcountyId INTEGER NOT NULL,
  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX fk_project_subcounty_subcounty (subcountyId),
  CONSTRAINT fk_project_subcounty_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_project_subcounty_subcounty FOREIGN KEY (subcountyId) REFERENCES subcounties (subcountyId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_sustainability (
  sustainabilityId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  description TEXT,
  owningOrganization VARCHAR(255) DEFAULT NULL,
  hasAssetRegister BOOLEAN DEFAULT NULL,
  technicalCapacityAdequacy TEXT,
  managerialCapacityAdequacy TEXT,
  financialCapacityAdequacy TEXT,
  avgAnnualPersonnelCost NUMERIC(15,2) DEFAULT NULL,
  annualOperationMaintenanceCost NUMERIC(15,2) DEFAULT NULL,
  otherOperatingCosts NUMERIC(15,2) DEFAULT NULL,
  revenueSources TEXT,
  operationalCostsCoveredByRevenue BOOLEAN DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX projectId (projectId),
  CONSTRAINT project_sustainability_ibfk_1 FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_wards (
  projectId INTEGER NOT NULL,
  wardId INTEGER NOT NULL,
  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT DEFAULT '0',
  INDEX fk_project_ward_ward (wardId),
  CONSTRAINT fk_project_ward_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_project_ward_ward FOREIGN KEY (wardId) REFERENCES wards (wardId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_workflow_steps (
  stepId INTEGER NOT NULL,
  workflowId INTEGER NOT NULL,
  stageId INTEGER NOT NULL,
  stepOrder INTEGER NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT NOT NULL DEFAULT '0',
  createdByUserId INTEGER DEFAULT NULL,
  voidedByUserId INTEGER DEFAULT NULL,
  INDEX workflowId (workflowId),
  INDEX stageId (stageId),
  INDEX createdByUserId (createdByUserId),
  INDEX voidedByUserId (voidedByUserId),
  CONSTRAINT project_workflow_steps_ibfk_1 FOREIGN KEY (workflowId) REFERENCES project_workflows (workflowId),
  CONSTRAINT project_workflow_steps_ibfk_2 FOREIGN KEY (stageId) REFERENCES project_stages (stageId),
  CONSTRAINT project_workflow_steps_ibfk_3 FOREIGN KEY (createdByUserId) REFERENCES users (userId),
  CONSTRAINT project_workflow_steps_ibfk_4 FOREIGN KEY (voidedByUserId) REFERENCES users (userId) )

--
-- Table structure for table project_workflows
--

DROP TABLE IF EXISTS project_workflows;

CREATE TABLE IF NOT EXISTS project_workflows (
  workflowId INTEGER NOT NULL,
  workflowName VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided SMALLINT NOT NULL DEFAULT '0',
  createdByUserId INTEGER DEFAULT NULL,
  voidedByUserId INTEGER DEFAULT NULL,
  UNIQUE INDEX workflowName (workflowName),
  INDEX createdByUserId (createdByUserId),
  INDEX voidedByUserId (voidedByUserId),
  CONSTRAINT project_workflows_ibfk_1 FOREIGN KEY (createdByUserId) REFERENCES users (userId),
  CONSTRAINT project_workflows_ibfk_2 FOREIGN KEY (voidedByUserId) REFERENCES users (userId) )

--
-- Table structure for table projectfeedback
--

DROP TABLE IF EXISTS projectfeedback;

CREATE TABLE IF NOT EXISTS projectfeedback (
  feedbackId INTEGER NOT NULL,
  projectId INTEGER DEFAULT NULL,
  feedbackMessage TEXT,
  response VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL,
  createdBy VARCHAR(255) DEFAULT NULL,
  updatedBy TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL,
  voidedAt TIMESTAMP DEFAULT NULL,
  voidingReason VARCHAR(255) DEFAULT NULL,
  submittedDate TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER NOT NULL,
  projectName VARCHAR(255) DEFAULT NULL,
  directorate VARCHAR(255) DEFAULT NULL,
  startDate TIMESTAMP DEFAULT NULL,
  endDate TIMESTAMP DEFAULT NULL,
  costOfProject NUMERIC(15,2) DEFAULT NULL,
  paidOut NUMERIC(15,2) DEFAULT NULL,
  objective TEXT,
  expectedOutput TEXT,
  principalInvestigator TEXT,
  expectedOutcome TEXT,
  status VARCHAR(255) DEFAULT NULL,
  statusReason TEXT,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  principalInvestigatorStaffId INTEGER DEFAULT NULL,
  departmentId INTEGER DEFAULT NULL,
  sectionId INTEGER DEFAULT NULL,
  finYearId INTEGER DEFAULT NULL,
  programId INTEGER DEFAULT NULL,
  subProgramId INTEGER DEFAULT NULL,
  categoryId INTEGER DEFAULT NULL,
  projectDescription TEXT,
  userId INTEGER DEFAULT NULL,
  voided BOOLEAN DEFAULT '0',
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  defaultPhotoId INTEGER DEFAULT NULL,
  overallProgress NUMERIC(5,2) DEFAULT '0.00',
  workflowId INTEGER DEFAULT NULL,
  currentStageId INTEGER DEFAULT NULL,
  approved_for_public BOOLEAN DEFAULT '0',
  approved_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  approval_notes TEXT,
  revision_requested BOOLEAN DEFAULT '0',
  revision_notes TEXT,
  revision_requested_by INTEGER DEFAULT NULL,
  revision_requested_at TIMESTAMP DEFAULT NULL,
  revision_submitted_at TIMESTAMP DEFAULT NULL,
  INDEX categoryId (categoryId),
  INDEX userId (userId),
  INDEX fk_default_photo (defaultPhotoId),
  INDEX workflowId (workflowId),
  INDEX currentStageId (currentStageId),
  INDEX fk_projects_approved_by (approved_by),
  INDEX fk_projects_revision_requested_by (revision_requested_by),
  INDEX idx_projects_approved_for_public (approved_for_public),
  INDEX idx_projects_revision_requested (revision_requested),
  CONSTRAINT fk_default_photo FOREIGN KEY (defaultPhotoId) REFERENCES project_photos (photoId),
  CONSTRAINT fk_projects_approved_by FOREIGN KEY (approved_by) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT fk_projects_revision_requested_by FOREIGN KEY (revision_requested_by) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT projects_ibfk_1 FOREIGN KEY (categoryId) REFERENCES project_milestone_implementations (categoryId) ON DELETE SET NULL,
  CONSTRAINT projects_ibfk_2 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT projects_ibfk_3 FOREIGN KEY (workflowId) REFERENCES project_workflows (workflowId),
  CONSTRAINT projects_ibfk_4 FOREIGN KEY (currentStageId) REFERENCES project_stages (stageId) )

--
-- Table structure for table public_feedback
--

DROP TABLE IF EXISTS public_feedback;

CREATE TABLE IF NOT EXISTS public_feedback (
  id INTEGER NOT NULL,
  name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  phone VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  subject VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  project_id INTEGER DEFAULT NULL,
  status VARCHAR(50) CHECK (value IN ('pending','reviewed','responded','archived')) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  admin_response TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  responded_by INTEGER DEFAULT NULL,
  responded_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rating_overall_support SMALLINT DEFAULT NULL,
  rating_quality_of_life_impact SMALLINT DEFAULT NULL,
  rating_community_alignment SMALLINT DEFAULT NULL,
  rating_transparency SMALLINT DEFAULT NULL,
  rating_feasibility_confidence SMALLINT DEFAULT NULL,
  moderation_status VARCHAR(50) CHECK (value IN ('pending','approved','rejected','flagged')) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  moderation_reason VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  custom_reason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  moderator_notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  moderated_by INTEGER DEFAULT NULL,
  moderated_at TIMESTAMP DEFAULT NULL,
  INDEX responded_by (responded_by),
  INDEX idx_status (status),
  INDEX idx_project_id (project_id),
  INDEX idx_created_at (created_at),
  INDEX idx_ratings (rating_overall_support,rating_quality_of_life_impact,rating_community_alignment,rating_transparency,rating_feasibility_confidence),
  CONSTRAINT public_feedback_ibfk_1 FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
  CONSTRAINT public_feedback_ibfk_2 FOREIGN KEY (responded_by) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT public_feedback_chk_1 CHECK ((rating_overall_support between 1 and 5)),
  CONSTRAINT public_feedback_chk_2 CHECK ((rating_quality_of_life_impact between 1 and 5)),
  CONSTRAINT public_feedback_chk_3 CHECK ((rating_community_alignment between 1 and 5)),
  CONSTRAINT public_feedback_chk_4 CHECK ((rating_transparency between 1 and 5)),
  CONSTRAINT public_feedback_chk_5 CHECK ((rating_feasibility_confidence between 1 and 5))
);

CREATE TABLE IF NOT EXISTS public_holidays (
  id INTEGER NOT NULL,
  holidayName VARCHAR(255) NOT NULL,
  holidayDate DATE NOT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voided BOOLEAN NOT NULL DEFAULT '0',
  UNIQUE INDEX holiday_date_unique (holidayDate)
);

CREATE TABLE IF NOT EXISTS role_dashboard_config (
  id INTEGER NOT NULL,
  role_name VARCHAR(50) NOT NULL,
  tab_key VARCHAR(50) NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  component_order INTEGER DEFAULT '0',
  is_required BOOLEAN DEFAULT '0',
  permissions JSONB DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_role_tab_component (role_name,tab_key,component_key),
  INDEX component_key (component_key),
  INDEX idx_role_dashboard_config_role (role_name),
  INDEX idx_role_dashboard_config_tab (tab_key),
  CONSTRAINT role_dashboard_config_ibfk_1 FOREIGN KEY (tab_key) REFERENCES dashboard_tabs (tab_key),
  CONSTRAINT role_dashboard_config_ibfk_2 FOREIGN KEY (component_key) REFERENCES dashboard_components (component_key) )

--
-- Table structure for table role_dashboard_permissions
--

DROP TABLE IF EXISTS role_dashboard_permissions;

CREATE TABLE IF NOT EXISTS role_dashboard_permissions (
  id INTEGER NOT NULL,
  role_name VARCHAR(50) NOT NULL,
  permission_key VARCHAR(100) NOT NULL,
  granted BOOLEAN DEFAULT '1',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_role_permission (role_name,permission_key),
  INDEX permission_key (permission_key),
  INDEX idx_role_dashboard_permissions_role (role_name),
  CONSTRAINT role_dashboard_permissions_ibfk_1 FOREIGN KEY (permission_key) REFERENCES dashboard_permissions (permission_key) )

--
-- Table structure for table role_privileges
--

DROP TABLE IF EXISTS role_privileges;

CREATE TABLE IF NOT EXISTS role_privileges (
  roleId INTEGER NOT NULL,
  privilegeId INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  INDEX fk_role_privilege_privilegeId (privilegeId),
  CONSTRAINT fk_role_privilege_privilegeId FOREIGN KEY (privilegeId) REFERENCES privileges (privilegeId) ON DELETE CASCADE,
  CONSTRAINT fk_role_privilege_roleId FOREIGN KEY (roleId) REFERENCES roles (roleId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles (
  roleId INTEGER NOT NULL,
  roleName VARCHAR(255) DEFAULT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL,
  UNIQUE INDEX unique_role_name (roleName)
);

CREATE TABLE IF NOT EXISTS sections (
  sectionId INTEGER NOT NULL,
  departmentId INTEGER DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  alias TEXT,
  location TEXT,
  address TEXT,
  contactPerson VARCHAR(255) DEFAULT NULL,
  phoneNumber VARCHAR(255) DEFAULT NULL,
  email TEXT,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT sections_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT sections_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS staff (
  staffId INTEGER NOT NULL,
  firstName VARCHAR(255) DEFAULT NULL,
  lastName VARCHAR(255) DEFAULT NULL,
  email TEXT,
  phoneNumber VARCHAR(255) DEFAULT NULL,
  departmentId INTEGER DEFAULT NULL,
  jobGroupId INTEGER DEFAULT NULL,
  gender VARCHAR(10) DEFAULT NULL,
  dateOfBirth DATE DEFAULT NULL,
  placeOfBirth VARCHAR(255) DEFAULT NULL,
  bloodType VARCHAR(10) DEFAULT NULL,
  religion VARCHAR(100) DEFAULT NULL,
  nationalId VARCHAR(50) DEFAULT NULL,
  kraPin VARCHAR(50) DEFAULT NULL,
  employmentStatus VARCHAR(20) DEFAULT 'Active',
  startDate DATE DEFAULT NULL,
  emergencyContactName VARCHAR(255) DEFAULT NULL,
  emergencyContactRelationship VARCHAR(100) DEFAULT NULL,
  emergencyContactPhone VARCHAR(255) DEFAULT NULL,
  nationality VARCHAR(255) DEFAULT NULL,
  maritalStatus VARCHAR(50) DEFAULT NULL,
  employmentType VARCHAR(50) DEFAULT NULL,
  managerId INTEGER DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL,
  role VARCHAR(255) DEFAULT NULL,
  voided SMALLINT DEFAULT '0',
  UNIQUE INDEX nationalId (nationalId),
  UNIQUE INDEX kraPin (kraPin),
  INDEX managerId_fk (managerId),
  INDEX fk_department (departmentId),
  INDEX fk_job_group (jobGroupId),
  CONSTRAINT fk_department FOREIGN KEY (departmentId) REFERENCES departments (departmentId),
  CONSTRAINT fk_job_group FOREIGN KEY (jobGroupId) REFERENCES job_groups (id),
  CONSTRAINT managerId_fk FOREIGN KEY (managerId) REFERENCES staff (staffId) )

--
-- Table structure for table strategicplans
--

DROP TABLE IF EXISTS strategicplans;

CREATE TABLE IF NOT EXISTS strategicplans (
  id INTEGER NOT NULL,
  cidpid VARCHAR(255) DEFAULT NULL,
  cidpName VARCHAR(255) DEFAULT NULL,
  startDate TIMESTAMP DEFAULT NULL,
  endDate TIMESTAMP DEFAULT NULL,
  theme TEXT,
  vision TEXT,
  mission TEXT,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  voidedBy VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS studyparticipants (
  individualId INTEGER NOT NULL,
  householdId VARCHAR(50) DEFAULT NULL,
  gpsLatitudeIndividual NUMERIC(10,7) DEFAULT NULL,
  gpsLongitudeIndividual NUMERIC(10,7) DEFAULT NULL,
  county VARCHAR(100) DEFAULT NULL,
  subCounty VARCHAR(100) DEFAULT NULL,
  gender VARCHAR(255) DEFAULT NULL,
  age INTEGER DEFAULT NULL,
  occupation VARCHAR(255) DEFAULT NULL,
  educationLevel VARCHAR(255) DEFAULT NULL,
  diseaseStatusMalaria VARCHAR(255) DEFAULT NULL,
  diseaseStatusDengue VARCHAR(255) DEFAULT NULL,
  mosquitoNetUse VARCHAR(255) DEFAULT NULL,
  waterStoragePractices VARCHAR(100) DEFAULT NULL,
  climatePerception VARCHAR(100) DEFAULT NULL,
  recentRainfall VARCHAR(255) DEFAULT NULL,
  averageTemperatureC VARCHAR(100) DEFAULT NULL,
  householdSize VARCHAR(100) DEFAULT NULL,
  accessToHealthcare VARCHAR(255) DEFAULT NULL,
  projectId INTEGER DEFAULT NULL,
  voided SMALLINT DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS subcounties (
  subcountyId INTEGER NOT NULL,
  countyId INTEGER DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  postalCode VARCHAR(255) DEFAULT NULL,
  email TEXT,
  phone VARCHAR(255) DEFAULT NULL,
  address TEXT,
  geoSpatial VARCHAR(255) DEFAULT NULL,
  polygon TEXT,
  geoCode VARCHAR(255) DEFAULT NULL,
  geoLat VARCHAR(255) DEFAULT NULL,
  geoLon VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  INDEX fk_subcounty_county (countyId),
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT fk_subcounty_county FOREIGN KEY (countyId) REFERENCES counties (countyId) ON DELETE SET NULL,
  CONSTRAINT subcounties_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT subcounties_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subprograms (
  subProgramId INTEGER NOT NULL,
  programId INTEGER DEFAULT NULL,
  subProgramme TEXT,
  keyOutcome TEXT,
  kpi TEXT,
  baseline VARCHAR(255) DEFAULT NULL,
  yr1Targets VARCHAR(255) DEFAULT NULL,
  yr2Targets VARCHAR(255) DEFAULT NULL,
  yr3Targets VARCHAR(255) DEFAULT NULL,
  yr4Targets VARCHAR(255) DEFAULT NULL,
  yr5Targets VARCHAR(255) DEFAULT NULL,
  yr1Budget NUMERIC(15,2) DEFAULT NULL,
  yr2Budget NUMERIC(15,2) DEFAULT NULL,
  yr3Budget NUMERIC(15,2) DEFAULT NULL,
  yr4Budget NUMERIC(15,2) DEFAULT NULL,
  yr5Budget NUMERIC(15,2) DEFAULT NULL,
  totalBudget NUMERIC(15,2) DEFAULT NULL,
  remarks TEXT,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT subprograms_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT subprograms_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  tab_key VARCHAR(50) NOT NULL,
  component_key VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT '1',
  component_order INTEGER DEFAULT '0',
  custom_settings JSONB DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_user_tab_component (user_id,tab_key,component_key),
  INDEX tab_key (tab_key),
  INDEX component_key (component_key),
  INDEX idx_user_dashboard_preferences_user (user_id),
  CONSTRAINT user_dashboard_preferences_ibfk_1 FOREIGN KEY (tab_key) REFERENCES dashboard_tabs (tab_key),
  CONSTRAINT user_dashboard_preferences_ibfk_2 FOREIGN KEY (component_key) REFERENCES dashboard_components (component_key) )

--
-- Table structure for table user_data_filters
--

DROP TABLE IF EXISTS user_data_filters;

CREATE TABLE IF NOT EXISTS user_data_filters (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  filter_type VARCHAR(50) CHECK (value IN ('budget_range','progress_status','project_type','date_range','custom')) NOT NULL,
  filter_key VARCHAR(100) NOT NULL,
  filter_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT '1',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX fk_user_filter_user (user_id),
  INDEX idx_filter_type (filter_type),
  CONSTRAINT fk_user_filter_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_department_assignments (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  department_id INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT '0',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_user_department (user_id,department_id),
  INDEX fk_user_dept_user (user_id),
  INDEX fk_user_dept_department (department_id),
  CONSTRAINT fk_user_dept_department FOREIGN KEY (department_id) REFERENCES departments (departmentId) ON DELETE CASCADE,
  CONSTRAINT fk_user_dept_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_project_assignments (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  access_level VARCHAR(50) CHECK (value IN ('view','edit','manage','admin')) DEFAULT 'view',
  assigned_by INTEGER DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_user_project (user_id,project_id),
  INDEX fk_user_proj_user (user_id),
  INDEX fk_user_proj_project (project_id),
  INDEX fk_user_proj_assigned_by (assigned_by),
  CONSTRAINT fk_user_proj_assigned_by FOREIGN KEY (assigned_by) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT fk_user_proj_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_proj_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_ward_assignments (
  id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  ward_id INTEGER NOT NULL,
  access_level VARCHAR(50) CHECK (value IN ('read','write','admin')) DEFAULT 'read',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX unique_user_ward (user_id,ward_id),
  INDEX fk_user_ward_user (user_id),
  INDEX fk_user_ward_ward (ward_id),
  CONSTRAINT fk_user_ward_user FOREIGN KEY (user_id) REFERENCES users (userId) ON DELETE CASCADE,
  CONSTRAINT fk_user_ward_ward FOREIGN KEY (ward_id) REFERENCES wards (wardId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  userId INTEGER NOT NULL,
  username VARCHAR(255) DEFAULT NULL,
  passwordHash VARCHAR(255) DEFAULT NULL,
  email TEXT,
  firstName VARCHAR(255) DEFAULT NULL,
  lastName VARCHAR(255) DEFAULT NULL,
  roleId INTEGER DEFAULT NULL,
  isActive BOOLEAN DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT NULL,
  updatedAt TIMESTAMP DEFAULT NULL,
  voided BOOLEAN DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS wards (
  wardId INTEGER NOT NULL,
  subcountyId INTEGER DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  postalCode VARCHAR(255) DEFAULT NULL,
  email TEXT,
  phone VARCHAR(255) DEFAULT NULL,
  address TEXT,
  polygon TEXT,
  geoSpatial VARCHAR(255) DEFAULT NULL,
  geoCode VARCHAR(255) DEFAULT NULL,
  geoLat VARCHAR(255) DEFAULT NULL,
  geoLon VARCHAR(255) DEFAULT NULL,
  voided BOOLEAN DEFAULT NULL,
  userId INTEGER DEFAULT NULL,
  createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  voidedBy INTEGER DEFAULT NULL,
  INDEX fk_ward_subcounty (subcountyId),
  INDEX userId (userId),
  INDEX voidedBy (voidedBy),
  CONSTRAINT fk_ward_subcounty FOREIGN KEY (subcountyId) REFERENCES subcounties (subcountyId) ON DELETE SET NULL,
  CONSTRAINT wards_ibfk_1 FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE SET NULL,
  CONSTRAINT wards_ibfk_2 FOREIGN KEY (voidedBy) REFERENCES users (userId) ON DELETE SET NULL
);

-- ============================================
-- END MYSQL-ONLY TABLES
-- ============================================

-- ============================================
-- SCHEMA SUMMARY
-- ============================================
-- Total tables: 137
-- Remote tables: 20
-- MySQL-only tables: 117
-- Conflicts: 0
-- ============================================
