--
-- PostgreSQL database dump
--

\restrict 4MhBeVmX8TiKVQHDT9XzegIgtV2zI1KhA0uEasi1l1AziTPGOiXin84uixYh0n7

-- Dumped from database version 18.4 (72c6e7c)
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-06 20:25:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 16526)
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neon_auth
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neon_auth;

--
-- TOC entry 911 (class 1247 OID 24577)
-- Name: court_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.court_status AS ENUM (
    'Available',
    'Occupied',
    'Maintenance',
    'Out_of_service'
);


ALTER TYPE public.court_status OWNER TO neondb_owner;

--
-- TOC entry 914 (class 1247 OID 24586)
-- Name: payment_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.payment_status AS ENUM (
    'Pending',
    'Paid',
    'Partial',
    'Cancelled',
    'No_show'
);


ALTER TYPE public.payment_status OWNER TO neondb_owner;

--
-- TOC entry 917 (class 1247 OID 24598)
-- Name: payment_status_bi; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.payment_status_bi AS ENUM (
    'Pending',
    'Paid',
    'Refunded'
);


ALTER TYPE public.payment_status_bi OWNER TO neondb_owner;

--
-- TOC entry 920 (class 1247 OID 24606)
-- Name: user_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_status AS ENUM (
    'Activated',
    'Disabled'
);


ALTER TYPE public.user_status OWNER TO neondb_owner;

--
-- TOC entry 251 (class 1255 OID 24611)
-- Name: fn_audit_generic(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.fn_audit_generic() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INT;
BEGIN
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            v_user_id := OLD.user_id;
        ELSE
            v_user_id := NEW.user_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (action_type, table_name, record_id, new_value, user_id)
        VALUES ('INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW)::text, v_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (action_type, table_name, record_id, old_value, new_value, user_id)
        VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD)::text, row_to_json(NEW)::text, v_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (action_type, table_name, record_id, old_value, user_id)
        VALUES ('DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::text, v_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.fn_audit_generic() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16567)
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.account OWNER TO neon_auth;

--
-- TOC entry 227 (class 1259 OID 16652)
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


ALTER TABLE neon_auth.invitation OWNER TO neon_auth;

--
-- TOC entry 224 (class 1259 OID 16603)
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


ALTER TABLE neon_auth.jwks OWNER TO neon_auth;

--
-- TOC entry 226 (class 1259 OID 16629)
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE neon_auth.member OWNER TO neon_auth;

--
-- TOC entry 225 (class 1259 OID 16615)
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


ALTER TABLE neon_auth.organization OWNER TO neon_auth;

--
-- TOC entry 228 (class 1259 OID 16678)
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


ALTER TABLE neon_auth.project_config OWNER TO neon_auth;

--
-- TOC entry 221 (class 1259 OID 16545)
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


ALTER TABLE neon_auth.session OWNER TO neon_auth;

--
-- TOC entry 220 (class 1259 OID 16527)
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


ALTER TABLE neon_auth."user" OWNER TO neon_auth;

--
-- TOC entry 223 (class 1259 OID 16587)
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: neon_auth
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE neon_auth.verification OWNER TO neon_auth;

--
-- TOC entry 242 (class 1259 OID 24679)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    action_type character varying(20),
    table_name character varying(50),
    record_id integer,
    old_value text,
    new_value text,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- TOC entry 241 (class 1259 OID 24678)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3686 (class 0 OID 0)
-- Dependencies: 241
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- TOC entry 246 (class 1259 OID 24699)
-- Name: billings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.billings (
    id integer NOT NULL,
    booking_id integer,
    payment_method_id integer,
    total_amount numeric(10,2),
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_positive_amount CHECK ((total_amount > (0)::numeric))
);


ALTER TABLE public.billings OWNER TO neondb_owner;

--
-- TOC entry 245 (class 1259 OID 24698)
-- Name: billings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.billings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.billings_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3687 (class 0 OID 0)
-- Dependencies: 245
-- Name: billings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.billings_id_seq OWNED BY public.billings.id;


--
-- TOC entry 244 (class 1259 OID 24690)
-- Name: bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    customer_id integer,
    court_id integer,
    user_id integer,
    booking_date date,
    start_time time without time zone,
    end_time time without time zone,
    status public.payment_status DEFAULT 'Pending'::public.payment_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_valid_times CHECK ((start_time < end_time))
);


ALTER TABLE public.bookings OWNER TO neondb_owner;

--
-- TOC entry 243 (class 1259 OID 24689)
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3688 (class 0 OID 0)
-- Dependencies: 243
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 236 (class 1259 OID 24649)
-- Name: courts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.courts (
    id integer NOT NULL,
    court_name character varying(50) NOT NULL,
    status public.court_status DEFAULT 'Available'::public.court_status
);


ALTER TABLE public.courts OWNER TO neondb_owner;

--
-- TOC entry 235 (class 1259 OID 24648)
-- Name: courts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.courts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courts_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3689 (class 0 OID 0)
-- Dependencies: 235
-- Name: courts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.courts_id_seq OWNED BY public.courts.id;


--
-- TOC entry 234 (class 1259 OID 24640)
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    phone character varying(20),
    email character varying(100),
    tax_id character varying(20),
    outstanding_balance numeric(10,2) DEFAULT 0,
    CONSTRAINT check_valid_email CHECK (((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text))
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- TOC entry 233 (class 1259 OID 24639)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3690 (class 0 OID 0)
-- Dependencies: 233
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 238 (class 1259 OID 24659)
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    method_name character varying(50) NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO neondb_owner;

--
-- TOC entry 237 (class 1259 OID 24658)
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_methods_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3691 (class 0 OID 0)
-- Dependencies: 237
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- TOC entry 248 (class 1259 OID 24708)
-- Name: pending_charges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pending_charges (
    id integer NOT NULL,
    booking_id integer,
    customer_id integer,
    product_id integer,
    quantity integer DEFAULT 1,
    unit_price numeric(10,2),
    total_price numeric(10,2),
    status public.payment_status_bi DEFAULT 'Pending'::public.payment_status_bi
);


ALTER TABLE public.pending_charges OWNER TO neondb_owner;

--
-- TOC entry 247 (class 1259 OID 24707)
-- Name: pending_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pending_charges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pending_charges_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3692 (class 0 OID 0)
-- Dependencies: 247
-- Name: pending_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pending_charges_id_seq OWNED BY public.pending_charges.id;


--
-- TOC entry 240 (class 1259 OID 24668)
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id integer NOT NULL,
    product_name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    stock integer DEFAULT 0
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- TOC entry 239 (class 1259 OID 24667)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3693 (class 0 OID 0)
-- Dependencies: 239
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 230 (class 1259 OID 24613)
-- Name: roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO neondb_owner;

--
-- TOC entry 229 (class 1259 OID 24612)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3694 (class 0 OID 0)
-- Dependencies: 229
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 250 (class 1259 OID 24718)
-- Name: sale_details; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sale_details (
    id integer NOT NULL,
    billing_id integer,
    products_id integer,
    quantity integer NOT NULL,
    price_unit numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


ALTER TABLE public.sale_details OWNER TO neondb_owner;

--
-- TOC entry 249 (class 1259 OID 24717)
-- Name: sale_details_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sale_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_details_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3695 (class 0 OID 0)
-- Dependencies: 249
-- Name: sale_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sale_details_id_seq OWNED BY public.sale_details.id;


--
-- TOC entry 232 (class 1259 OID 24624)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    full_name character varying(100),
    role_id integer,
    status public.user_status DEFAULT 'Activated'::public.user_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email text NOT NULL,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- TOC entry 231 (class 1259 OID 24623)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3696 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3400 (class 2604 OID 24682)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 3406 (class 2604 OID 24702)
-- Name: billings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billings ALTER COLUMN id SET DEFAULT nextval('public.billings_id_seq'::regclass);


--
-- TOC entry 3402 (class 2604 OID 24693)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 3395 (class 2604 OID 24652)
-- Name: courts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courts ALTER COLUMN id SET DEFAULT nextval('public.courts_id_seq'::regclass);


--
-- TOC entry 3393 (class 2604 OID 24643)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 3397 (class 2604 OID 24662)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 3410 (class 2604 OID 24711)
-- Name: pending_charges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges ALTER COLUMN id SET DEFAULT nextval('public.pending_charges_id_seq'::regclass);


--
-- TOC entry 3398 (class 2604 OID 24671)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3389 (class 2604 OID 24616)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3413 (class 2604 OID 24721)
-- Name: sale_details id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_details ALTER COLUMN id SET DEFAULT nextval('public.sale_details_id_seq'::regclass);


--
-- TOC entry 3390 (class 2604 OID 24627)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3652 (class 0 OID 16567)
-- Dependencies: 222
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3657 (class 0 OID 16652)
-- Dependencies: 227
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- TOC entry 3654 (class 0 OID 16603)
-- Dependencies: 224
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- TOC entry 3656 (class 0 OID 16629)
-- Dependencies: 226
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- TOC entry 3655 (class 0 OID 16615)
-- Dependencies: 225
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- TOC entry 3658 (class 0 OID 16678)
-- Dependencies: 228
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost, plugin_configs, webhook_config) FROM stdin;
3ab26e45-9374-4025-88c7-48a0b5cce242	Sports_management	ep-aged-tree-anmhufl8	2026-04-26 14:18:25.18+00	2026-04-26 14:18:25.18+00	[]	[{"id": "google", "isShared": true}]	{"type": "shared"}	{"enabled": true, "disableSignUp": false, "emailVerificationMethod": "otp", "requireEmailVerification": false, "autoSignInAfterVerification": true, "sendVerificationEmailOnSignIn": false, "sendVerificationEmailOnSignUp": false}	t	{"organization": {"config": {"creatorRole": "owner", "membershipLimit": 100, "organizationLimit": 10, "sendInvitationEmail": false}, "enabled": true}}	{"enabled": false, "enabledEvents": [], "timeoutSeconds": 5}
\.


--
-- TOC entry 3651 (class 0 OID 16545)
-- Dependencies: 221
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- TOC entry 3650 (class 0 OID 16527)
-- Dependencies: 220
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- TOC entry 3653 (class 0 OID 16587)
-- Dependencies: 223
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3672 (class 0 OID 24679)
-- Dependencies: 242
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, action_type, table_name, record_id, old_value, new_value, user_id, created_at) FROM stdin;
\.


--
-- TOC entry 3676 (class 0 OID 24699)
-- Dependencies: 246
-- Data for Name: billings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.billings (id, booking_id, payment_method_id, total_amount, payment_date, created_at, updated_at) FROM stdin;
1	1	3	25.00	2026-04-26 14:39:39.183927	2026-04-29 01:53:03.573015	2026-04-29 01:53:03.86922
2	2	1	15.00	2026-04-26 14:39:39.183927	2026-04-29 01:53:03.573015	2026-04-29 01:53:03.86922
\.


--
-- TOC entry 3674 (class 0 OID 24690)
-- Dependencies: 244
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bookings (id, customer_id, court_id, user_id, booking_date, start_time, end_time, status, created_at, updated_at) FROM stdin;
1	1	1	3	2026-04-26	18:00:00	19:00:00	Paid	2026-04-29 01:51:33.346425	2026-04-29 01:51:33.611128
2	2	3	3	2026-04-26	09:00:00	10:00:00	Pending	2026-04-29 01:51:33.346425	2026-04-29 01:51:33.611128
3	3	2	4	2026-04-27	20:00:00	21:00:00	Paid	2026-04-29 01:51:33.346425	2026-04-29 01:51:33.611128
4	4	5	4	2026-04-27	17:00:00	18:30:00	Cancelled	2026-04-29 01:51:33.346425	2026-04-29 01:51:33.611128
5	5	1	3	2026-04-28	19:00:00	20:00:00	Pending	2026-04-29 01:51:33.346425	2026-04-29 01:51:33.611128
6	8	1	\N	2026-06-06	14:30:00	16:00:00	Pending	2026-06-04 16:36:39.064522	2026-06-04 16:36:39.064522
7	8	3	\N	2026-06-06	14:30:00	16:00:00	Pending	2026-06-04 16:38:10.194761	2026-06-04 16:38:10.194761
8	6	3	\N	2026-06-06	13:00:00	14:30:00	Pending	2026-06-04 16:44:00.801949	2026-06-04 16:44:00.801949
9	9	3	\N	2026-06-07	08:30:00	10:00:00	Pending	2026-06-04 20:38:09.428942	2026-06-04 20:38:09.428942
10	10	2	\N	2026-06-25	16:00:00	17:30:00	Pending	2026-06-05 21:29:12.006561	2026-06-05 21:29:12.006561
11	11	6	\N	2026-06-06	19:00:00	20:30:00	Pending	2026-06-05 21:30:56.064454	2026-06-05 21:30:56.064454
13	13	1	\N	2026-06-11	08:30:00	10:00:00	Pending	2026-06-05 21:38:29.788231	2026-06-05 21:38:29.788231
14	14	1	\N	2026-06-10	08:30:00	10:00:00	Pending	2026-06-05 21:39:47.878569	2026-06-05 21:39:47.878569
15	6	1	\N	2026-06-30	10:00:00	11:30:00	Pending	2026-06-05 21:58:01.245125	2026-06-05 21:58:01.245125
16	1	7	1	2026-06-28	16:00:00	19:00:00	Pending	2026-06-06 23:57:06.64397	2026-06-06 23:57:06.64397
\.


--
-- TOC entry 3666 (class 0 OID 24649)
-- Dependencies: 236
-- Data for Name: courts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.courts (id, court_name, status) FROM stdin;
3	Tennis Court A	Available
5	Padel Court 1	Available
2	Futsal Court 1	Available
1	Main Soccer Field	Available
6	Cancha de San pedro	Available
4	Basketball Court 1	Available
7	Cancha Gramalote	Maintenance
\.


--
-- TOC entry 3664 (class 0 OID 24640)
-- Dependencies: 234
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, full_name, phone, email, tax_id, outstanding_balance) FROM stdin;
7	MARLON RANGEL	3123408488	marlonandrei@gmail.com	29456123	0.00
6	JOSEDANIEL CARVAJAL	0412-3129425	josdanielcch@gmail.com	27462797	0.00
5	ROBERTO MORA	0426-4445566	roberto@email.com	15990468	0.00
4	CARLA SANCHEZ	0416-1112233	carla@email.com	5660761	0.00
3	PEDRO BRICEÑO	0412-9876543	pedro@email.com	4210184	0.00
2	ANA COLMENARES	0424-7654321	ana@email.com	15858097	0.00
1	JUAN MENDEZ	0414-1234567	juan@email.com	27456789	0.00
8	Arturo Carvajal	04147116859	arturojose@gmail.com	\N	0.00
9	Julio barragan	5147955	jcbarragan1994@gmail.com	\N	0.00
10	Jugador Google	+52 55 9999 8888	deporte.google@courtconnect.com	\N	0.00
11	Coreli roa	04225746730	arimarcoreli@gmail.com	\N	0.00
12	Anderson	+584247344904	larteas0@gmail.com	\N	0.00
13	Jugador Google	+52 55 9999 8888	deporte.google@courtconnect.com	\N	0.00
14	Anderson	04247344904	edalcocu@gmail.com	\N	0.00
\.


--
-- TOC entry 3668 (class 0 OID 24659)
-- Dependencies: 238
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payment_methods (id, method_name) FROM stdin;
1	Efectivo
2	Pago Móvil
3	Transferencia
4	Cash
5	Zelle
6	Pago Móvil
7	Debit Card
8	Bank Transfer
\.


--
-- TOC entry 3678 (class 0 OID 24708)
-- Dependencies: 248
-- Data for Name: pending_charges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pending_charges (id, booking_id, customer_id, product_id, quantity, unit_price, total_price, status) FROM stdin;
\.


--
-- TOC entry 3670 (class 0 OID 24668)
-- Dependencies: 240
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, product_name, price, stock) FROM stdin;
1	Mineral Water 500ml	1.50	50
2	Gatorade Blue	2.50	30
3	Tennis Balls (3 pack)	12.00	10
4	Energy Bar	1.00	100
5	Soccer Socks	8.00	15
\.


--
-- TOC entry 3660 (class 0 OID 24613)
-- Dependencies: 230
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roles (id, role_name, description) FROM stdin;
1	Admin	Acceso Total
2	Administrator	Full system access and user management
3	Manager	Court and booking management
4	Staff	Front desk and customer service
5	Support	System maintenance and logs
6	Analyst	View reports and billing data
7	Client	Website
10	Client	Cliente Final del Sitio Web
\.


--
-- TOC entry 3680 (class 0 OID 24718)
-- Dependencies: 250
-- Data for Name: sale_details; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sale_details (id, billing_id, products_id, quantity, price_unit, subtotal) FROM stdin;
\.


--
-- TOC entry 3662 (class 0 OID 24624)
-- Dependencies: 232
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password_hash, full_name, role_id, status, created_at, email, reset_token, reset_token_expires) FROM stdin;
18	jcbarragan1994@gmail.com	$2a$10$n4bzWAdSpFvKVA9HI.qny.qo5QK4ytFSR.mgxUGy88BIzAxNLq1bO	Julio barragan	10	Activated	2026-06-04 20:36:49.450239	jcbarragan1994@gmail.com	9cff63693383d74b545941f929bb8e0fca1e3f71f22e38e2cc3120ec8802c21f	2026-06-04 17:41:02.356
19	edalcocu@gmail.com	$2a$10$mempKOj2BDX9wo78/.Rin.By7SZnYNr0bsouOzYkQNoTL9XcdfGBC	Anderson	10	Activated	2026-06-05 21:39:32.91221	edalcocu@gmail.com	\N	\N
4	staff_luis	hash_123	Luis García	3	Activated	2026-04-26 14:39:38.109275	luis_garcia@test.com	\N	\N
5	admin_backup	$2a$12$xhgU42i4plyIZ5ZB8vrpA.LsqukezBWdvipLePbEkNGQHTmP.7EJK	Backup Admin	1	Activated	2026-04-26 14:39:38.109275	backup_admin@test.com	\N	\N
6	josdanielcch@gmail.com	admin1411	Josedaniel Carvajal	1	Activated	2026-05-15 19:13:50.145573	josdanielcch@gmail.com	31d308f6119894a93e29e0c8e3f1d81dfc888d5f339977def8ec47bb106f1277	2026-06-05 19:16:44.575
2	Coreli Roa	hash_123	Coreli Roa	1	Activated	2026-04-26 14:39:38.109275	arimarcoreli@gmail.com	c31cb78ebf47c5e3bda697d82c4ab99fb62383d55b2b56a376fb0aae0a68ff9a	2026-05-17 21:56:26.666
1	Carlos Chacon	Admin123456	Carlos Quintana	1	Activated	2026-04-26 14:39:38.109275	chaconvargascarlosmanuel@gmail.com	77c1e87c9c078ec3155c4b82d4a9e8a9564b095cc36e4ba54e8d679dd9ae2dba	2026-05-17 22:00:10.803
3	Marlon Rangel	hash_123	Marlon Rangel	3	Activated	2026-04-26 14:39:38.109275	rangelmarlon2001@gmail.com	62ddbf72e217fe45ec82255f01533fbeeb67ca7b1229f84b152e2ec4f2285d72	2026-05-17 23:16:53.981
15	arturojose@gmail.com	Arturo123	Arturo Carvajal	10	Activated	2026-06-04 16:29:41.736852	arturojose@gmail.com	\N	\N
\.


--
-- TOC entry 3697 (class 0 OID 0)
-- Dependencies: 241
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- TOC entry 3698 (class 0 OID 0)
-- Dependencies: 245
-- Name: billings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.billings_id_seq', 2, true);


--
-- TOC entry 3699 (class 0 OID 0)
-- Dependencies: 243
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bookings_id_seq', 16, true);


--
-- TOC entry 3700 (class 0 OID 0)
-- Dependencies: 235
-- Name: courts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.courts_id_seq', 7, true);


--
-- TOC entry 3701 (class 0 OID 0)
-- Dependencies: 233
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customers_id_seq', 14, true);


--
-- TOC entry 3702 (class 0 OID 0)
-- Dependencies: 237
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 8, true);


--
-- TOC entry 3703 (class 0 OID 0)
-- Dependencies: 247
-- Name: pending_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pending_charges_id_seq', 1, false);


--
-- TOC entry 3704 (class 0 OID 0)
-- Dependencies: 239
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 5, true);


--
-- TOC entry 3705 (class 0 OID 0)
-- Dependencies: 229
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roles_id_seq', 7, true);


--
-- TOC entry 3706 (class 0 OID 0)
-- Dependencies: 249
-- Name: sale_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sale_details_id_seq', 1, false);


--
-- TOC entry 3707 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


--
-- TOC entry 3427 (class 2606 OID 16581)
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- TOC entry 3446 (class 2606 OID 16667)
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- TOC entry 3433 (class 2606 OID 16614)
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- TOC entry 3441 (class 2606 OID 16641)
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- TOC entry 3435 (class 2606 OID 16626)
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- TOC entry 3437 (class 2606 OID 16628)
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- TOC entry 3448 (class 2606 OID 16697)
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- TOC entry 3450 (class 2606 OID 16695)
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- TOC entry 3422 (class 2606 OID 16559)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- TOC entry 3424 (class 2606 OID 16561)
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- TOC entry 3418 (class 2606 OID 16544)
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- TOC entry 3420 (class 2606 OID 16542)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 3431 (class 2606 OID 16602)
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- TOC entry 3472 (class 2606 OID 24688)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3481 (class 2606 OID 24706)
-- Name: billings billings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_pkey PRIMARY KEY (id);


--
-- TOC entry 3474 (class 2606 OID 24697)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 3466 (class 2606 OID 24657)
-- Name: courts courts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT courts_pkey PRIMARY KEY (id);


--
-- TOC entry 3461 (class 2606 OID 24647)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 3463 (class 2606 OID 57345)
-- Name: customers customers_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tax_id_key UNIQUE (tax_id);


--
-- TOC entry 3468 (class 2606 OID 24666)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3483 (class 2606 OID 24716)
-- Name: pending_charges pending_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges
    ADD CONSTRAINT pending_charges_pkey PRIMARY KEY (id);


--
-- TOC entry 3470 (class 2606 OID 24677)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3452 (class 2606 OID 24622)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3485 (class 2606 OID 24727)
-- Name: sale_details sale_details_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT sale_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3479 (class 2606 OID 40970)
-- Name: bookings unique_court_time; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT unique_court_time UNIQUE (court_id, booking_date, start_time, end_time);


--
-- TOC entry 3455 (class 2606 OID 49154)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3457 (class 2606 OID 24636)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3459 (class 2606 OID 24638)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3428 (class 1259 OID 16699)
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- TOC entry 3443 (class 1259 OID 16705)
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- TOC entry 3444 (class 1259 OID 16704)
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- TOC entry 3439 (class 1259 OID 16702)
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- TOC entry 3442 (class 1259 OID 16703)
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- TOC entry 3438 (class 1259 OID 16701)
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- TOC entry 3425 (class 1259 OID 16698)
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- TOC entry 3429 (class 1259 OID 16700)
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- TOC entry 3475 (class 1259 OID 40964)
-- Name: idx_bookings_court; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_court ON public.bookings USING btree (court_id);


--
-- TOC entry 3476 (class 1259 OID 40963)
-- Name: idx_bookings_customer; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_customer ON public.bookings USING btree (customer_id);


--
-- TOC entry 3477 (class 1259 OID 40965)
-- Name: idx_bookings_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_date ON public.bookings USING btree (booking_date);


--
-- TOC entry 3464 (class 1259 OID 40962)
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- TOC entry 3453 (class 1259 OID 40966)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3487 (class 2606 OID 16582)
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3490 (class 2606 OID 16673)
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3491 (class 2606 OID 16668)
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- TOC entry 3488 (class 2606 OID 16642)
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- TOC entry 3489 (class 2606 OID 16647)
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3486 (class 2606 OID 16562)
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3493 (class 2606 OID 24778)
-- Name: audit_logs fk_audit_user; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 3501 (class 2606 OID 24768)
-- Name: sale_details fk_billing_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT fk_billing_id FOREIGN KEY (billing_id) REFERENCES public.billings(id) ON DELETE RESTRICT;


--
-- TOC entry 3498 (class 2606 OID 24753)
-- Name: pending_charges fk_booking_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges
    ADD CONSTRAINT fk_booking_id FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3494 (class 2606 OID 24733)
-- Name: bookings fk_court_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_court_id FOREIGN KEY (court_id) REFERENCES public.courts(id) ON DELETE RESTRICT;


--
-- TOC entry 3495 (class 2606 OID 24738)
-- Name: bookings fk_customer_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- TOC entry 3499 (class 2606 OID 24758)
-- Name: pending_charges fk_customer_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges
    ADD CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3497 (class 2606 OID 24748)
-- Name: billings fk_payment_method; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billings
    ADD CONSTRAINT fk_payment_method FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- TOC entry 3500 (class 2606 OID 24763)
-- Name: pending_charges fk_product_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges
    ADD CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3502 (class 2606 OID 24773)
-- Name: sale_details fk_products_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT fk_products_id FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 3496 (class 2606 OID 24743)
-- Name: bookings fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 3492 (class 2606 OID 24728)
-- Name: users fk_user_role; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 2153 (class 826 OID 16394)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2152 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2026-06-06 20:25:15

--
-- PostgreSQL database dump complete
--

\unrestrict 4MhBeVmX8TiKVQHDT9XzegIgtV2zI1KhA0uEasi1l1AziTPGOiXin84uixYh0n7

