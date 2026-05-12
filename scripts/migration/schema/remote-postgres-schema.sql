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

