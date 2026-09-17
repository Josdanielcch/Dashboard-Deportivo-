--
-- PostgreSQL database dump
--

\restrict 3KIwk1X2t9xZOQlbz0tzrxcnRzfmfEg4XQC9Uo5nxC99RzXD4MKSi1xWOQ32wQ0

-- Dumped from database version 18.6 (2078fcb)
-- Dumped by pg_dump version 18.3

-- Started on 2026-09-17 12:01:09

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
-- TOC entry 929 (class 1247 OID 24577)
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
-- TOC entry 932 (class 1247 OID 24586)
-- Name: payment_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.payment_status AS ENUM (
    'Pending',
    'Paid',
    'Partial',
    'Cancelled',
    'No_show',
    'Confirmed',
    'Completed'
);


ALTER TYPE public.payment_status OWNER TO neondb_owner;

--
-- TOC entry 935 (class 1247 OID 24598)
-- Name: payment_status_bi; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.payment_status_bi AS ENUM (
    'Pending',
    'Paid',
    'Refunded'
);


ALTER TYPE public.payment_status_bi OWNER TO neondb_owner;

--
-- TOC entry 938 (class 1247 OID 24606)
-- Name: user_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_status AS ENUM (
    'Activated',
    'Disabled'
);


ALTER TYPE public.user_status OWNER TO neondb_owner;

--
-- TOC entry 269 (class 1255 OID 24611)
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
-- TOC entry 262 (class 1259 OID 98371)
-- Name: accounts_payable; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.accounts_payable (
    id integer NOT NULL,
    supplier_id integer,
    purchase_id integer,
    total_amount numeric(12,2) NOT NULL,
    balance numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'Pendiente'::character varying,
    due_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.accounts_payable OWNER TO neondb_owner;

--
-- TOC entry 261 (class 1259 OID 98370)
-- Name: accounts_payable_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.accounts_payable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_payable_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3815 (class 0 OID 0)
-- Dependencies: 261
-- Name: accounts_payable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.accounts_payable_id_seq OWNED BY public.accounts_payable.id;


--
-- TOC entry 252 (class 1259 OID 73729)
-- Name: accounts_receivable; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.accounts_receivable (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    billing_id integer,
    booking_id integer,
    total_amount numeric(10,2) NOT NULL,
    balance numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'Pendiente'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.accounts_receivable OWNER TO neondb_owner;

--
-- TOC entry 251 (class 1259 OID 73728)
-- Name: accounts_receivable_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.accounts_receivable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_receivable_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3816 (class 0 OID 0)
-- Dependencies: 251
-- Name: accounts_receivable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.accounts_receivable_id_seq OWNED BY public.accounts_receivable.id;


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
-- TOC entry 3817 (class 0 OID 0)
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
    customer_id integer,
    user_id integer,
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
-- TOC entry 3818 (class 0 OID 0)
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
    payment_method character varying(30),
    payment_reference character varying(100),
    total_amount numeric(10,2),
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
-- TOC entry 3819 (class 0 OID 0)
-- Dependencies: 243
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 266 (class 1259 OID 106497)
-- Name: business_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.business_settings (
    id integer NOT NULL,
    business_name character varying(255) NOT NULL,
    legal_id character varying(100),
    address text,
    phone character varying(100),
    email character varying(150),
    invoice_footer_message text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.business_settings OWNER TO neondb_owner;

--
-- TOC entry 265 (class 1259 OID 106496)
-- Name: business_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.business_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_settings_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3820 (class 0 OID 0)
-- Dependencies: 265
-- Name: business_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.business_settings_id_seq OWNED BY public.business_settings.id;


--
-- TOC entry 236 (class 1259 OID 24649)
-- Name: courts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.courts (
    id integer NOT NULL,
    court_name character varying(50) NOT NULL,
    status public.court_status DEFAULT 'Available'::public.court_status,
    hourly_rate numeric(10,2) DEFAULT 0,
    sport_id integer
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
-- TOC entry 3821 (class 0 OID 0)
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
    first_name character varying(100) CONSTRAINT customers_full_name_not_null NOT NULL,
    phone character varying(20),
    email character varying(100),
    tax_id character varying(20),
    outstanding_balance numeric(10,2) DEFAULT 0,
    last_name character varying(100),
    password_hash text,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone,
    membership_level character varying(20) DEFAULT 'standard'::character varying,
    membership_status character varying(20) DEFAULT 'active'::character varying,
    payment_reference character varying(100),
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
-- TOC entry 3822 (class 0 OID 0)
-- Dependencies: 233
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 264 (class 1259 OID 98393)
-- Name: payable_payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payable_payments (
    id integer NOT NULL,
    account_payable_id integer,
    amount numeric(12,2) NOT NULL,
    payment_method_id integer,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    notes text
);


ALTER TABLE public.payable_payments OWNER TO neondb_owner;

--
-- TOC entry 263 (class 1259 OID 98392)
-- Name: payable_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.payable_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payable_payments_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3823 (class 0 OID 0)
-- Dependencies: 263
-- Name: payable_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.payable_payments_id_seq OWNED BY public.payable_payments.id;


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
-- TOC entry 3824 (class 0 OID 0)
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
-- TOC entry 3825 (class 0 OID 0)
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
-- TOC entry 3826 (class 0 OID 0)
-- Dependencies: 239
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 260 (class 1259 OID 98347)
-- Name: purchase_details; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchase_details (
    id integer NOT NULL,
    purchase_id integer,
    product_id integer,
    description character varying(255),
    quantity integer DEFAULT 1 NOT NULL,
    unit_cost numeric(10,2) DEFAULT 0 NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.purchase_details OWNER TO neondb_owner;

--
-- TOC entry 259 (class 1259 OID 98346)
-- Name: purchase_details_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.purchase_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_details_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3827 (class 0 OID 0)
-- Dependencies: 259
-- Name: purchase_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.purchase_details_id_seq OWNED BY public.purchase_details.id;


--
-- TOC entry 258 (class 1259 OID 98318)
-- Name: purchases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    supplier_id integer,
    user_id integer,
    invoice_number character varying(100),
    payment_method_id integer,
    purchase_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'Completed'::character varying,
    notes text
);


ALTER TABLE public.purchases OWNER TO neondb_owner;

--
-- TOC entry 257 (class 1259 OID 98317)
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3828 (class 0 OID 0)
-- Dependencies: 257
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- TOC entry 254 (class 1259 OID 73757)
-- Name: receivable_payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.receivable_payments (
    id integer NOT NULL,
    account_receivable_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method_id integer NOT NULL,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.receivable_payments OWNER TO neondb_owner;

--
-- TOC entry 253 (class 1259 OID 73756)
-- Name: receivable_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.receivable_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receivable_payments_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3829 (class 0 OID 0)
-- Dependencies: 253
-- Name: receivable_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.receivable_payments_id_seq OWNED BY public.receivable_payments.id;


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
-- TOC entry 3830 (class 0 OID 0)
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
-- TOC entry 3831 (class 0 OID 0)
-- Dependencies: 249
-- Name: sale_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sale_details_id_seq OWNED BY public.sale_details.id;


--
-- TOC entry 268 (class 1259 OID 114690)
-- Name: sports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sports (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    image_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sports OWNER TO neondb_owner;

--
-- TOC entry 267 (class 1259 OID 114689)
-- Name: sports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sports_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3832 (class 0 OID 0)
-- Dependencies: 267
-- Name: sports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sports_id_seq OWNED BY public.sports.id;


--
-- TOC entry 256 (class 1259 OID 98305)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    contact_name character varying(150),
    phone character varying(50),
    email character varying(100),
    address text,
    tax_id character varying(50),
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.suppliers OWNER TO neondb_owner;

--
-- TOC entry 255 (class 1259 OID 98304)
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3833 (class 0 OID 0)
-- Dependencies: 255
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- TOC entry 232 (class 1259 OID 24624)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    first_name character varying(100),
    role_id integer,
    status public.user_status DEFAULT 'Activated'::public.user_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email text NOT NULL,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone,
    last_name character varying(100),
    avatar_url character varying(255)
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
-- TOC entry 3834 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3478 (class 2604 OID 98374)
-- Name: accounts_payable id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_payable ALTER COLUMN id SET DEFAULT nextval('public.accounts_payable_id_seq'::regclass);


--
-- TOC entry 3462 (class 2604 OID 73732)
-- Name: accounts_receivable id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_receivable ALTER COLUMN id SET DEFAULT nextval('public.accounts_receivable_id_seq'::regclass);


--
-- TOC entry 3448 (class 2604 OID 24682)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 3454 (class 2604 OID 24702)
-- Name: billings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billings ALTER COLUMN id SET DEFAULT nextval('public.billings_id_seq'::regclass);


--
-- TOC entry 3450 (class 2604 OID 24693)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 3483 (class 2604 OID 106500)
-- Name: business_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_settings ALTER COLUMN id SET DEFAULT nextval('public.business_settings_id_seq'::regclass);


--
-- TOC entry 3442 (class 2604 OID 24652)
-- Name: courts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courts ALTER COLUMN id SET DEFAULT nextval('public.courts_id_seq'::regclass);


--
-- TOC entry 3438 (class 2604 OID 24643)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 3481 (class 2604 OID 98396)
-- Name: payable_payments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payable_payments ALTER COLUMN id SET DEFAULT nextval('public.payable_payments_id_seq'::regclass);


--
-- TOC entry 3445 (class 2604 OID 24662)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 3458 (class 2604 OID 24711)
-- Name: pending_charges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges ALTER COLUMN id SET DEFAULT nextval('public.pending_charges_id_seq'::regclass);


--
-- TOC entry 3446 (class 2604 OID 24671)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3474 (class 2604 OID 98350)
-- Name: purchase_details id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_details ALTER COLUMN id SET DEFAULT nextval('public.purchase_details_id_seq'::regclass);


--
-- TOC entry 3470 (class 2604 OID 98321)
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- TOC entry 3465 (class 2604 OID 73760)
-- Name: receivable_payments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.receivable_payments ALTER COLUMN id SET DEFAULT nextval('public.receivable_payments_id_seq'::regclass);


--
-- TOC entry 3434 (class 2604 OID 24616)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3461 (class 2604 OID 24721)
-- Name: sale_details id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_details ALTER COLUMN id SET DEFAULT nextval('public.sale_details_id_seq'::regclass);


--
-- TOC entry 3485 (class 2604 OID 114693)
-- Name: sports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sports ALTER COLUMN id SET DEFAULT nextval('public.sports_id_seq'::regclass);


--
-- TOC entry 3467 (class 2604 OID 98308)
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- TOC entry 3435 (class 2604 OID 24627)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3763 (class 0 OID 16567)
-- Dependencies: 222
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3768 (class 0 OID 16652)
-- Dependencies: 227
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- TOC entry 3765 (class 0 OID 16603)
-- Dependencies: 224
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- TOC entry 3767 (class 0 OID 16629)
-- Dependencies: 226
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- TOC entry 3766 (class 0 OID 16615)
-- Dependencies: 225
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- TOC entry 3769 (class 0 OID 16678)
-- Dependencies: 228
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost, plugin_configs, webhook_config) FROM stdin;
3ab26e45-9374-4025-88c7-48a0b5cce242	Sports_management	ep-aged-tree-anmhufl8	2026-04-26 14:18:25.18+00	2026-04-26 14:18:25.18+00	[]	[{"id": "google", "isShared": true}]	{"type": "shared"}	{"enabled": true, "disableSignUp": false, "emailVerificationMethod": "otp", "requireEmailVerification": false, "autoSignInAfterVerification": true, "sendVerificationEmailOnSignIn": false, "sendVerificationEmailOnSignUp": false}	t	{"organization": {"config": {"creatorRole": "owner", "membershipLimit": 100, "organizationLimit": 10, "sendInvitationEmail": false}, "enabled": true}}	{"enabled": false, "enabledEvents": [], "timeoutSeconds": 5}
\.


--
-- TOC entry 3762 (class 0 OID 16545)
-- Dependencies: 221
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- TOC entry 3761 (class 0 OID 16527)
-- Dependencies: 220
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- TOC entry 3764 (class 0 OID 16587)
-- Dependencies: 223
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: neon_auth
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3803 (class 0 OID 98371)
-- Dependencies: 262
-- Data for Name: accounts_payable; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.accounts_payable (id, supplier_id, purchase_id, total_amount, balance, status, due_date, created_at) FROM stdin;
3	1	3	22.50	22.50	Pendiente	\N	2026-07-16 19:49:43.081171
1	1	1	35.00	0.00	Pagada	\N	2026-06-22 23:13:53.15917
4	1	4	100.00	0.00	Pagada	\N	2026-07-16 19:50:46.335785
2	1	2	5.00	0.00	Pagada	\N	2026-06-24 01:06:34.973022
5	1	6	16.00	6.00	Parcial	\N	2026-07-17 03:31:54.877975
6	1	7	25.00	25.00	Pendiente	\N	2026-09-16 01:08:05.431441
\.


--
-- TOC entry 3793 (class 0 OID 73729)
-- Dependencies: 252
-- Data for Name: accounts_receivable; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.accounts_receivable (id, customer_id, billing_id, booking_id, total_amount, balance, status, created_at) FROM stdin;
1	11	6	\N	69.60	0.00	Pagado	2026-06-07 15:36:10.02206
4	20	19	69	22.04	0.00	Pagado	2026-07-17 03:29:52.798483
3	11	12	32	23.20	0.00	Pagado	2026-06-24 01:36:53.6676
2	17	8	\N	14.50	0.00	Pagado	2026-06-18 17:23:49.202028
5	15	20	71	34.80	14.80	Parcial	2026-09-01 15:33:32.879749
6	6	21	86	43.50	0.00	Pagado	2026-09-16 01:03:49.767873
\.


--
-- TOC entry 3783 (class 0 OID 24679)
-- Dependencies: 242
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, action_type, table_name, record_id, old_value, new_value, user_id, created_at) FROM stdin;
\.


--
-- TOC entry 3787 (class 0 OID 24699)
-- Dependencies: 246
-- Data for Name: billings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.billings (id, booking_id, payment_method_id, total_amount, payment_date, created_at, updated_at, customer_id, user_id) FROM stdin;
1	1	3	25.00	2026-04-26 14:39:39.183927	2026-04-29 01:53:03.573015	2026-04-29 01:53:03.86922	\N	\N
2	2	1	15.00	2026-04-26 14:39:39.183927	2026-04-29 01:53:03.573015	2026-04-29 01:53:03.86922	\N	\N
3	\N	1	5.80	2026-06-07 15:04:39.003584	2026-06-07 15:04:39.003584	2026-06-07 15:04:39.003584	11	1
4	\N	1	8.70	2026-06-07 15:05:34.839195	2026-06-07 15:05:34.839195	2026-06-07 15:05:34.839195	11	1
5	\N	4	8.70	2026-06-07 15:32:47.894735	2026-06-07 15:32:47.894735	2026-06-07 15:32:47.894735	11	1
6	\N	9	69.60	2026-06-07 15:36:10.02206	2026-06-07 15:36:10.02206	2026-06-07 15:36:10.02206	11	1
7	\N	1	26.10	2026-06-07 15:51:38.093069	2026-06-07 15:51:38.093069	2026-06-07 15:51:38.093069	11	1
8	\N	9	14.50	2026-06-18 17:23:49.202028	2026-06-18 17:23:49.202028	2026-06-18 17:23:49.202028	17	1
9	30	1	23.20	2026-06-22 22:45:37.243799	2026-06-22 22:45:37.243799	2026-06-22 22:45:37.243799	6	1
10	31	1	27.84	2026-06-24 01:26:33.47175	2026-06-24 01:26:33.47175	2026-06-24 01:26:33.47175	11	1
11	35	1	35.96	2026-06-24 01:28:08.50966	2026-06-24 01:28:08.50966	2026-06-24 01:28:08.50966	11	1
12	32	9	23.20	2026-06-24 01:36:53.6676	2026-06-24 01:36:53.6676	2026-06-24 01:36:53.6676	11	1
13	39	1	5.80	2026-06-24 01:37:30.020456	2026-06-24 01:37:30.020456	2026-06-24 01:37:30.020456	2	1
14	\N	1	1.74	2026-06-25 05:29:09.928759	2026-06-25 05:29:09.928759	2026-06-25 05:29:09.928759	2	1
15	65	1	23.20	2026-07-17 01:23:29.983348	2026-07-17 01:23:29.983348	2026-07-17 01:23:29.983348	1	1
16	\N	3	13.92	2026-07-17 01:26:33.710072	2026-07-17 01:26:33.710072	2026-07-17 01:26:33.710072	1	1
17	55	1	29.00	2026-07-17 01:27:54.225436	2026-07-17 01:27:54.225436	2026-07-17 01:27:54.225436	20	1
18	\N	1	14.50	2026-07-17 01:32:43.972503	2026-07-17 01:32:43.972503	2026-07-17 01:32:43.972503	7	1
19	69	9	22.04	2026-07-17 03:29:52.798483	2026-07-17 03:29:52.798483	2026-07-17 03:29:52.798483	20	1
20	71	9	34.80	2026-09-01 15:33:32.879749	2026-09-01 15:33:32.879749	2026-09-01 15:33:32.879749	15	1
21	86	9	43.50	2026-09-16 01:03:49.767873	2026-09-16 01:03:49.767873	2026-09-16 01:03:49.767873	6	1
22	87	1	23.20	2026-09-16 01:24:59.759051	2026-09-16 01:24:59.759051	2026-09-16 01:24:59.759051	6	1
23	88	1	17.40	2026-09-16 01:25:16.220678	2026-09-16 01:25:16.220678	2026-09-16 01:25:16.220678	6	1
24	84	1	17.40	2026-09-16 01:25:29.147417	2026-09-16 01:25:29.147417	2026-09-16 01:25:29.147417	24	1
25	85	1	17.40	2026-09-16 01:25:38.248648	2026-09-16 01:25:38.248648	2026-09-16 01:25:38.248648	24	1
26	\N	1	14.50	2026-09-16 14:36:51.143584	2026-09-16 14:36:51.143584	2026-09-16 14:36:51.143584	21	1
27	\N	1	13.92	2026-09-16 15:39:49.49624	2026-09-16 15:39:49.49624	2026-09-16 15:39:49.49624	23	1
28	\N	1	14.50	2026-09-16 15:49:49.646851	2026-09-16 15:49:49.646851	2026-09-16 15:49:49.646851	18	1
29	\N	1	69.60	2026-09-16 16:03:49.194973	2026-09-16 16:03:49.194973	2026-09-16 16:03:49.194973	24	1
\.


--
-- TOC entry 3785 (class 0 OID 24690)
-- Dependencies: 244
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bookings (id, customer_id, court_id, user_id, booking_date, start_time, end_time, status, created_at, updated_at, payment_method, payment_reference, total_amount) FROM stdin;
79	6	2	\N	2026-09-15	18:00:00	21:00:00	Completed	2026-09-15 17:02:02.647226	2026-09-15 17:02:02.647226	\N	\N	\N
72	6	6	\N	2026-09-15	14:00:00	15:00:00	Completed	2026-09-15 15:29:26.56739	2026-09-15 15:29:26.56739	\N	\N	\N
42	19	3	\N	2026-06-25	20:30:00	22:00:00	Cancelled	2026-06-24 20:32:54.177965	2026-06-24 20:32:54.177965	\N	\N	\N
69	20	11	\N	2026-07-31	08:00:00	09:00:00	Completed	2026-07-17 03:24:34.425573	2026-07-17 03:24:34.425573	\N	\N	\N
41	19	1	\N	2026-06-24	20:30:00	22:00:00	Completed	2026-06-24 20:29:09.792847	2026-06-24 20:29:09.792847	\N	\N	\N
45	19	4	\N	2026-06-25	08:30:00	10:00:00	Completed	2026-06-25 04:38:41.57777	2026-06-25 04:38:41.57777	\N	\N	\N
44	19	4	\N	2026-06-25	14:30:00	16:00:00	Completed	2026-06-24 20:42:27.460106	2026-06-24 20:42:27.460106	\N	\N	\N
43	19	4	\N	2026-06-25	16:00:00	17:30:00	Completed	2026-06-24 20:37:29.844721	2026-06-24 20:37:29.844721	\N	\N	\N
22	6	5	\N	2026-06-18	08:00:00	09:00:00	Cancelled	2026-06-18 14:09:12.563499	2026-06-18 14:09:12.563499	\N	\N	\N
21	11	7	\N	2026-06-11	15:00:00	16:00:00	Cancelled	2026-06-07 16:27:22.614616	2026-06-07 16:27:22.614616	\N	\N	\N
20	8	7	\N	2026-06-11	20:00:00	21:30:00	Cancelled	2026-06-07 16:17:09.883596	2026-06-07 16:17:09.883596	\N	\N	\N
40	19	4	\N	2026-06-24	20:30:00	22:00:00	Completed	2026-06-24 20:19:00.438177	2026-06-24 20:19:00.438177	\N	\N	\N
23	6	5	\N	2026-06-18	11:00:00	12:00:00	Completed	2026-06-18 14:24:53.646582	2026-06-18 14:24:53.646582	\N	\N	\N
36	2	4	\N	2026-06-23	21:00:00	22:00:00	Completed	2026-06-23 23:31:02.888308	2026-06-23 23:31:02.888308	\N	\N	\N
34	11	5	\N	2026-06-23	21:00:00	22:00:00	Completed	2026-06-23 02:40:16.894435	2026-06-23 02:40:16.894435	\N	\N	\N
30	6	7	\N	2026-06-22	19:00:00	20:00:00	Completed	2026-06-22 22:29:19.098453	2026-06-22 22:29:19.098453	\N	\N	\N
28	17	1	\N	2026-06-19	14:30:00	16:00:00	Cancelled	2026-06-18 16:20:55.108116	2026-06-18 16:20:55.108116	\N	\N	\N
27	17	1	\N	2026-06-19	07:00:00	08:30:00	Completed	2026-06-18 16:19:19.354987	2026-06-18 16:19:19.354987	\N	\N	\N
24	6	6	\N	2026-06-18	13:00:00	14:00:00	Completed	2026-06-18 14:39:55.514327	2026-06-18 14:39:55.514327	\N	\N	\N
26	1	1	\N	2026-06-18	14:00:00	15:00:00	Completed	2026-06-18 15:02:35.578107	2026-06-18 15:02:35.578107	\N	\N	\N
29	8	1	\N	2026-06-18	17:00:00	18:00:00	Completed	2026-06-18 16:33:18.665742	2026-06-18 16:33:18.665742	\N	\N	\N
25	1	1	\N	2026-06-18	19:00:00	20:30:00	Completed	2026-06-18 15:02:05.299808	2026-06-18 15:02:05.299808	\N	\N	\N
33	11	4	\N	2026-06-23	20:00:00	21:00:00	Cancelled	2026-06-23 02:39:50.077482	2026-06-23 02:39:50.077482	\N	\N	\N
63	11	11	\N	2026-07-18	14:00:00	15:00:00	Completed	2026-07-17 00:51:23.090009	2026-07-17 00:51:23.090009	\N	\N	\N
61	22	2	\N	2026-07-18	15:00:00	16:00:00	Completed	2026-07-17 00:16:55.270106	2026-07-17 00:16:55.270106	\N	\N	\N
64	11	11	\N	2026-07-18	17:00:00	18:00:00	Completed	2026-07-17 01:02:05.931283	2026-07-17 01:02:05.931283	\N	\N	\N
31	11	6	\N	2026-06-23	17:00:00	18:30:00	Completed	2026-06-23 02:30:29.787904	2026-06-23 02:30:29.787904	\N	\N	\N
35	11	6	\N	2026-06-23	19:00:00	20:00:00	Completed	2026-06-23 04:32:45.025703	2026-06-23 04:32:45.025703	\N	\N	\N
32	11	7	\N	2026-06-23	21:00:00	22:00:00	Completed	2026-06-23 02:36:59.38084	2026-06-23 02:36:59.38084	\N	\N	\N
39	2	4	\N	2026-06-23	20:30:00	21:00:00	Completed	2026-06-24 00:21:44.461001	2026-06-24 00:21:44.461001	\N	\N	\N
66	20	2	\N	2026-07-18	19:30:00	20:30:00	Completed	2026-07-17 03:19:43.096289	2026-07-17 03:19:43.096289	\N	\N	\N
52	20	7	\N	2026-07-17	08:00:00	09:00:00	Completed	2026-07-16 16:20:19.713236	2026-07-16 16:20:19.713236	\N	\N	\N
81	6	6	\N	2026-09-15	16:00:00	17:00:00	Completed	2026-09-15 18:08:49.80456	2026-09-15 18:08:49.80456	\N	\N	\N
58	6	11	\N	2026-07-17	08:00:00	10:00:00	Completed	2026-07-16 18:23:25.233322	2026-07-16 18:23:25.233322	\N	\N	\N
82	6	11	\N	2026-09-15	16:00:00	19:00:00	Completed	2026-09-15 18:48:51.910365	2026-09-15 18:48:51.910365	pago_movil	jhg45628	34.00
56	11	7	\N	2026-07-16	22:00:00	23:30:00	Cancelled	2026-07-16 18:15:23.969347	2026-07-16 18:15:23.969347	\N	\N	\N
83	6	6	\N	2026-09-15	19:00:00	21:00:00	No_show	2026-09-15 21:54:55.090789	2026-09-15 21:54:55.090789	cash	\N	22.00
59	6	11	\N	2026-07-17	10:00:00	11:00:00	Completed	2026-07-16 18:25:49.402431	2026-07-16 18:25:49.402431	\N	\N	\N
53	20	7	\N	2026-07-17	15:00:00	16:00:00	Completed	2026-07-16 17:04:31.626844	2026-07-16 17:04:31.626844	\N	\N	\N
62	11	11	\N	2026-07-17	16:00:00	17:00:00	Completed	2026-07-17 00:47:02.948775	2026-07-17 00:47:02.948775	\N	\N	\N
67	20	1	\N	2026-07-17	21:00:00	22:00:00	Completed	2026-07-17 03:21:37.998615	2026-07-17 03:21:37.998615	\N	\N	\N
50	20	1	\N	2026-07-16	13:00:00	14:00:00	Completed	2026-07-16 10:06:04.774786	2026-07-16 10:06:04.774786	\N	\N	\N
51	20	7	\N	2026-07-16	14:30:00	16:00:00	Completed	2026-07-16 16:18:28.846683	2026-07-16 16:18:28.846683	\N	\N	\N
87	6	7	\N	2026-09-15	23:00:00	24:00:00	Completed	2026-09-16 00:54:11.056083	2026-09-16 00:54:11.056083	cash	\N	15.00
65	1	1	\N	2026-07-17	08:00:00	09:00:00	Completed	2026-07-17 01:13:33.09343	2026-07-17 01:13:33.09343	\N	\N	\N
55	20	3	\N	2026-07-30	08:00:00	09:00:00	Completed	2026-07-16 18:05:15.093265	2026-07-16 18:05:15.093265	\N	\N	\N
49	19	7	\N	2026-07-24	08:00:00	11:00:00	No_show	2026-07-01 00:06:41.449861	2026-07-01 00:06:41.449861	\N	\N	\N
54	20	7	\N	2026-07-16	16:30:00	17:30:00	Completed	2026-07-16 17:21:43.783611	2026-07-16 17:21:43.783611	\N	\N	\N
60	20	1	\N	2026-07-16	21:00:00	22:00:00	Completed	2026-07-16 23:33:51.664204	2026-07-16 23:33:51.664204	\N	\N	\N
57	6	7	\N	2026-07-16	23:30:00	24:00:00	Completed	2026-07-16 18:20:52.650816	2026-07-16 18:20:52.650816	\N	\N	\N
48	19	4	\N	2026-07-01	08:00:00	09:00:00	Completed	2026-07-01 00:03:14.160751	2026-07-01 00:03:14.160751	\N	\N	\N
47	19	1	\N	2026-07-01	14:00:00	16:00:00	Completed	2026-07-01 00:02:23.950183	2026-07-01 00:02:23.950183	\N	\N	\N
46	19	1	\N	2026-07-01	17:00:00	18:00:00	Completed	2026-06-30 22:40:59.861353	2026-06-30 22:40:59.861353	\N	\N	\N
68	20	7	\N	2026-07-18	08:00:00	09:00:00	Completed	2026-07-17 03:24:24.787496	2026-07-17 03:24:24.787496	\N	\N	\N
70	1	6	\N	2026-07-17	13:00:00	14:00:00	Completed	2026-07-17 03:38:49.337636	2026-07-17 03:38:49.337636	\N	\N	\N
77	2	2	\N	2026-09-15	13:00:00	14:00:00	Completed	2026-09-15 16:59:46.769707	2026-09-15 16:59:46.769707	\N	\N	\N
71	15	7	\N	2026-08-27	12:00:00	13:30:00	Completed	2026-08-21 00:16:10.504464	2026-08-21 00:16:10.504464	\N	\N	\N
73	7	1	\N	2026-09-15	13:00:00	16:00:00	Completed	2026-09-15 16:56:20.221098	2026-09-15 16:56:20.221098	\N	\N	\N
78	3	2	\N	2026-09-15	14:00:00	17:00:00	Completed	2026-09-15 17:00:20.798217	2026-09-15 17:00:20.798217	\N	\N	\N
80	6	2	\N	2026-09-15	17:00:00	18:00:00	Completed	2026-09-15 17:03:44.184498	2026-09-15 17:03:44.184498	\N	\N	\N
74	5	1	\N	2026-09-15	16:00:00	19:00:00	Completed	2026-09-15 16:57:16.289474	2026-09-15 16:57:16.289474	\N	\N	\N
76	16	1	\N	2026-09-15	22:00:00	24:00:00	Completed	2026-09-15 16:58:23.249274	2026-09-15 16:58:23.249274	\N	\N	\N
75	8	1	\N	2026-09-15	19:00:00	22:00:00	Completed	2026-09-15 16:57:34.629956	2026-09-15 16:57:34.629956	\N	\N	\N
88	6	11	\N	2026-09-16	16:00:00	17:00:00	Completed	2026-09-16 01:09:28.727948	2026-09-16 01:09:28.727948	cash	\N	11.00
86	6	11	\N	2026-09-15	23:00:00	24:00:00	Completed	2026-09-16 00:51:31.239359	2026-09-16 00:51:31.239359	pago_movil	corelipaga	11.00
84	24	6	\N	2026-09-15	22:00:00	23:00:00	Completed	2026-09-16 00:38:13.777377	2026-09-16 00:38:13.777377	cash	\N	11.00
85	24	6	\N	2026-09-15	23:00:00	24:00:00	Completed	2026-09-16 00:49:24.470054	2026-09-16 00:49:24.470054	\N	\N	\N
\.


--
-- TOC entry 3807 (class 0 OID 106497)
-- Dependencies: 266
-- Data for Name: business_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.business_settings (id, business_name, legal_id, address, phone, email, invoice_footer_message, updated_at) FROM stdin;
1	Punto Penal C.A	J-1234AKSFKASASSIKJASC	Palmira Calle 3 Carrera 2  entra calle 10 23	+58 412 3129424	CourtConnect@gmail.com	¡Gracias por su preferencia! Vuelva pronto.	2026-09-16 01:17:00.385173
\.


--
-- TOC entry 3777 (class 0 OID 24649)
-- Dependencies: 236
-- Data for Name: courts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.courts (id, court_name, status, hourly_rate, sport_id) FROM stdin;
2	Futsal Court 1	Available	15.00	3
5	Padel Court 1	Available	25.00	1
1	Main Soccer Field	Available	20.00	3
11	Jogo bonito	Available	15.00	3
7	Cancha Gramalote	Available	20.00	3
6	Cancha de San pedro	Available	15.00	3
3	Tennis Court A	Available	25.00	2
4	Basketball Court 1	Available	10.00	4
\.


--
-- TOC entry 3775 (class 0 OID 24640)
-- Dependencies: 234
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, first_name, phone, email, tax_id, outstanding_balance, last_name, password_hash, reset_token, reset_token_expires, membership_level, membership_status, payment_reference) FROM stdin;
7	MARLON	3123408488	marlonandrei@gmail.com	29456123	0.00	RANGEL	\N	\N	\N	standard	active	\N
5	ROBERTO	0426-4445566	roberto@email.com	15990468	0.00	MORA	\N	\N	\N	standard	active	\N
4	CARLA	0416-1112233	carla@email.com	5660761	0.00	SANCHEZ	\N	\N	\N	standard	active	\N
3	PEDRO	0412-9876543	pedro@email.com	4210184	0.00	BRICEÑO	\N	\N	\N	standard	active	\N
2	ANA	0424-7654321	ana@email.com	15858097	0.00	COLMENARES	\N	\N	\N	standard	active	\N
15	Juan 	04123658579	Mangasmiadas@gmail.com	27654897	0.00	Zubillaga	\N	\N	\N	standard	active	\N
16	Fabriccio	0415789462	FabriElPro@gmail.com	1253568974	0.00	Paredes	\N	\N	\N	standard	active	\N
1	JUAN	0414-1234567	juan@email.com	27456789	0.00	MENDEZ	\N	\N	\N	standard	active	\N
8	Arturo	04147116859	arturojose@gmail.com	\N	0.00	Carvajal	Arturo123	\N	\N	standard	active	\N
9	Julio	5147955	jcbarragan1994@gmail.com	\N	0.00	barragan	$2a$10$n4bzWAdSpFvKVA9HI.qny.qo5QK4ytFSR.mgxUGy88BIzAxNLq1bO	\N	\N	standard	active	\N
17	Marcelo	+58424703307	marcelo@gmail.com	\N	0.00	Cz	$2a$10$pSMnfx3ArX9Pn.fM58DbvOyv7gkbRdhGAuvmhwEo/M2DOFbeN5NRK	\N	\N	standard	active	\N
18	Arturo	04123129424	josearturo@gmail.com	\N	0.00	Carvajal	\N	\N	\N	standard	active	\N
19	Messi	+584247344904	messironaldo@gmail.com	\N	0.00	Ronaldo	$2a$10$eNG4E1UYDO2yH4miIeD0qeKA2l5JBsUXMej0EANdzndBOjhnVfRHG	\N	\N	standard	active	\N
20	marcelo	+58247344904	edalcocu@gmail.com	\N	0.00	c	$2a$10$aMSnzyOMj0c4wSjTMHcQoOrBaz0qGWakit6vQN1zwtuMkeCWGWDIa	\N	\N	standard	active	\N
21	camilo	0412345698	jasfkankf@ajfnksf.com	\N	0.00	fuentes	$2a$10$IjrpbGuIKaKR00lMOK0MS.Vrld3ryBoeR7tQOwTLVEDRq3ntvJKDC	\N	\N	standard	active	\N
22	anderson	+58247344904	edalcocu@gmail.com	\N	0.00	contrer	\N	\N	\N	standard	active	\N
11	Coreli	04225746730	arimarcoreli14@gmail.com	\N	0.00	roa	$2a$12$z8RIAIAjihz9EQVikMEsTecStUduukvUN.C.njQhSyMFruG/trdGC	\N	\N	standard	active	\N
23	Marian	04225746895	marian1422@gmail.com	\N	0.00	Ostos	$2a$10$uON/Oy/zntIlCUNkpz8g2egZHit1qyhOVKqpVhuAy6sZKi7Zq0iFK	\N	\N	standard	active	\N
6	JOSEDANIEL	0412-3129425	josdanielcch@gmail.com	27462797	0.00	CARVAJAL	Admin123	28f35c3066c2dbe99a66044de8aa3619887995f4e19eb9fd1159e4c3753b16b3	2026-06-22 22:00:27.083	pro	active	\N
24	Sebastian	04227658435	sebastiancarvi@gmail.com	\N	0.00	Carvajal	$2a$10$oIKjjiKjCaQcmXXfUZU6euT8MWzEX/Oupowj7BCLZEpa8gvilKzMW	\N	\N	pro	active	\N
\.


--
-- TOC entry 3805 (class 0 OID 98393)
-- Dependencies: 264
-- Data for Name: payable_payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payable_payments (id, account_payable_id, amount, payment_method_id, payment_date, user_id, notes) FROM stdin;
1	1	20.00	1	2026-06-23 04:08:18.015743	1	
2	1	10.00	1	2026-06-26 16:36:36.296685	1	
3	2	2.00	1	2026-06-26 16:37:11.505371	1	
4	4	10.00	1	2026-07-17 01:29:10.443332	1	
5	1	5.00	1	2026-07-17 01:31:25.606689	1	
6	4	90.00	5	2026-07-17 03:33:22.841468	1	
7	2	2.00	1	2026-09-01 15:09:54.950623	1	
8	2	1.00	1	2026-09-01 15:11:07.119986	1	
9	5	10.00	1	2026-09-01 15:22:59.651585	1	
\.


--
-- TOC entry 3779 (class 0 OID 24659)
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
9	Crédito
\.


--
-- TOC entry 3789 (class 0 OID 24708)
-- Dependencies: 248
-- Data for Name: pending_charges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pending_charges (id, booking_id, customer_id, product_id, quantity, unit_price, total_price, status) FROM stdin;
\.


--
-- TOC entry 3781 (class 0 OID 24668)
-- Dependencies: 240
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, product_name, price, stock) FROM stdin;
6	CocaCola 1L	2.50	25
5	Soccer Socks	8.00	12
7	Pelotas	3.00	0
3	Tennis Balls (3 pack)	12.00	8
8	pelota	14.00	20
1	Mineral Water 500ml	1.50	56
4	Energy Bar	1.00	99
2	Gatorade Blue	2.50	28
10	raquetaas	12.00	0
11	Doritos 	2.50	5
9	raqueta	12.00	9
\.


--
-- TOC entry 3801 (class 0 OID 98347)
-- Dependencies: 260
-- Data for Name: purchase_details; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.purchase_details (id, purchase_id, product_id, description, quantity, unit_cost, subtotal) FROM stdin;
1	1	6	CocaCola 1L	20	1.50	30.00
2	1	4	Energy Bar	10	0.50	5.00
3	2	1	Mineral Water 500ml	5	1.00	5.00
4	3	1	Mineral Water 500ml	15	1.50	22.50
5	4	2	Gatorade Blue	20	5.00	100.00
6	5	3	Tennis Balls (3 pack)	5	4.50	22.50
7	6	\N	agua	1	2.00	2.00
8	6	2	Gatorade Blue	1	14.00	14.00
9	7	11	Doritos 	10	2.50	25.00
\.


--
-- TOC entry 3799 (class 0 OID 98318)
-- Dependencies: 258
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.purchases (id, supplier_id, user_id, invoice_number, payment_method_id, purchase_date, total_amount, status, notes) FROM stdin;
1	1	1	15K18	9	2026-06-22 23:13:53.15917	35.00	Completed	
2	1	1	FM1540	9	2026-06-24 01:06:34.973022	5.00	Completed	\N
3	1	1	15141316	9	2026-07-16 19:49:43.081171	22.50	Completed	\N
4	1	1	141520	9	2026-07-16 19:50:46.335785	100.00	Completed	\N
5	1	1	15141316	1	2026-07-16 19:51:50.798213	22.50	Completed	\N
6	1	1	14	9	2026-07-17 03:31:54.877975	16.00	Completed	\N
7	1	1	678532	9	2026-09-16 01:08:05.431441	25.00	Completed	\N
\.


--
-- TOC entry 3795 (class 0 OID 73757)
-- Dependencies: 254
-- Data for Name: receivable_payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.receivable_payments (id, account_receivable_id, amount, payment_method_id, payment_date) FROM stdin;
1	1	50.00	1	2026-06-07 15:36:41.978442
2	1	19.60	2	2026-06-07 15:52:15.165227
3	2	10.00	1	2026-06-18 17:24:17.684871
4	2	2.50	1	2026-06-23 04:10:53.552825
5	3	10.00	2	2026-06-24 01:39:24.647439
6	4	22.04	2	2026-07-17 03:32:33.406239
7	3	10.00	1	2026-07-17 03:32:50.280377
8	3	3.20	1	2026-09-01 14:58:11.649113
9	2	2.00	1	2026-09-16 01:13:50.09606
10	5	20.00	1	2026-09-16 01:14:07.180013
11	6	43.50	1	2026-09-16 01:14:15.754723
\.


--
-- TOC entry 3771 (class 0 OID 24613)
-- Dependencies: 230
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roles (id, role_name, description) FROM stdin;
1	Administrador	Dueños del negocio (Acceso total)
2	Recepcionista	Trabajador del local (Operaciones)
3	Soporte	Soporte técnico y mantenimiento
10	Cliente	Cliente del sitio web
\.


--
-- TOC entry 3791 (class 0 OID 24718)
-- Dependencies: 250
-- Data for Name: sale_details; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sale_details (id, billing_id, products_id, quantity, price_unit, subtotal) FROM stdin;
1	3	2	2	2.50	5.00
2	4	1	5	1.50	7.50
3	5	2	3	2.50	7.50
4	6	3	5	12.00	60.00
5	7	1	1	1.50	1.50
6	7	3	1	12.00	12.00
7	7	4	1	1.00	1.00
8	7	5	1	8.00	8.00
9	8	2	5	2.50	12.50
10	10	1	1	1.50	1.50
11	11	5	2	8.00	16.00
12	14	1	1	1.50	1.50
13	16	3	1	12.00	12.00
14	18	2	5	2.50	12.50
15	19	2	1	2.50	2.50
16	19	1	1	1.50	1.50
17	21	1	5	1.50	7.50
18	21	2	2	2.50	5.00
19	21	4	10	1.00	10.00
20	26	2	5	2.50	12.50
21	27	10	1	12.00	12.00
22	28	11	5	2.50	12.50
23	29	9	5	12.00	60.00
\.


--
-- TOC entry 3809 (class 0 OID 114690)
-- Dependencies: 268
-- Data for Name: sports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sports (id, name, image_url, created_at) FROM stdin;
1	Pádel	/images/sport-padel.jpg	2026-06-23 21:48:58.728837
2	Tenis	/images/sport-tenis.jpg	2026-06-23 21:48:58.728837
3	Fútbol	/images/sport-futbol.jpg	2026-06-23 21:48:58.728837
4	Básquet	/images/sport-basquet.jpg	2026-06-23 21:48:58.728837
\.


--
-- TOC entry 3797 (class 0 OID 98305)
-- Dependencies: 256
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.suppliers (id, name, contact_name, phone, email, address, tax_id, status, created_at) FROM stdin;
1	EMPRESAS POLAR	Cristian	04123456795	empresaspolar@gmail.com	San cristobal	J001584965	Active	2026-06-22 23:03:41.977883
\.


--
-- TOC entry 3773 (class 0 OID 24624)
-- Dependencies: 232
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password_hash, first_name, role_id, status, created_at, email, reset_token, reset_token_expires, last_name, avatar_url) FROM stdin;
1	Carlos Chacon	Admin123456	Carlos	1	Activated	2026-04-26 14:39:38.109275	chaconvargascarlosmanuel@gmail.com	927ca103ddd38e05836242d435d9ab3fb788649f60238b0f837e00ab43698bc6	2026-09-17 12:48:04.213	Quintana	\N
6	Josedaniel	$2a$12$SgQRC2SgRGVEbeUg7OiUy.dkh/4JOUXpsA2TDT5xsnCzm9waP6Y1.	Josedaniel	1	Activated	2026-05-15 19:13:50.145573	josdanielcch@gmail.com	6d9324a919eccb827640054b793ff8e480d247cc124d73dce2f9db4700826e92	2026-09-17 12:49:08.933	Carvajal	/uploads/avatars/6-1785788494612-826218911.jpg
4	staff_luis	hash_123	Luis	3	Activated	2026-04-26 14:39:38.109275	luis_garcia@test.com	\N	\N	García	\N
5	admin_backup	$2a$12$xhgU42i4plyIZ5ZB8vrpA.LsqukezBWdvipLePbEkNGQHTmP.7EJK	Backup	1	Activated	2026-04-26 14:39:38.109275	backup_admin@test.com	\N	\N	Admin	\N
2	Coreli Roa	hash_123	Coreli	1	Activated	2026-04-26 14:39:38.109275	arimarcoreli@gmail.com	c31cb78ebf47c5e3bda697d82c4ab99fb62383d55b2b56a376fb0aae0a68ff9a	2026-05-17 21:56:26.666	Roa	\N
3	Marlon Rangel	hash_123	Marlon	3	Activated	2026-04-26 14:39:38.109275	rangelmarlon2001@gmail.com	62ddbf72e217fe45ec82255f01533fbeeb67ca7b1229f84b152e2ec4f2285d72	2026-05-17 23:16:53.981	Rangel	\N
0	Anderson Contreras 	admin1234	Anderson	1	Activated	2026-06-18 02:00:00	larteas0@gmail.com	d8f3a2cebd6b95233296d3a12c7904ec17e93e09e69fafe208e80f3be503b76c	2026-06-18 13:18:18.121	Contreras	\N
\.


--
-- TOC entry 3835 (class 0 OID 0)
-- Dependencies: 261
-- Name: accounts_payable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.accounts_payable_id_seq', 6, true);


--
-- TOC entry 3836 (class 0 OID 0)
-- Dependencies: 251
-- Name: accounts_receivable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.accounts_receivable_id_seq', 6, true);


--
-- TOC entry 3837 (class 0 OID 0)
-- Dependencies: 241
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- TOC entry 3838 (class 0 OID 0)
-- Dependencies: 245
-- Name: billings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.billings_id_seq', 29, true);


--
-- TOC entry 3839 (class 0 OID 0)
-- Dependencies: 243
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bookings_id_seq', 88, true);


--
-- TOC entry 3840 (class 0 OID 0)
-- Dependencies: 265
-- Name: business_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.business_settings_id_seq', 1, true);


--
-- TOC entry 3841 (class 0 OID 0)
-- Dependencies: 235
-- Name: courts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.courts_id_seq', 12, true);


--
-- TOC entry 3842 (class 0 OID 0)
-- Dependencies: 233
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customers_id_seq', 24, true);


--
-- TOC entry 3843 (class 0 OID 0)
-- Dependencies: 263
-- Name: payable_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.payable_payments_id_seq', 9, true);


--
-- TOC entry 3844 (class 0 OID 0)
-- Dependencies: 237
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 9, true);


--
-- TOC entry 3845 (class 0 OID 0)
-- Dependencies: 247
-- Name: pending_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pending_charges_id_seq', 1, false);


--
-- TOC entry 3846 (class 0 OID 0)
-- Dependencies: 239
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 11, true);


--
-- TOC entry 3847 (class 0 OID 0)
-- Dependencies: 259
-- Name: purchase_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.purchase_details_id_seq', 9, true);


--
-- TOC entry 3848 (class 0 OID 0)
-- Dependencies: 257
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.purchases_id_seq', 7, true);


--
-- TOC entry 3849 (class 0 OID 0)
-- Dependencies: 253
-- Name: receivable_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.receivable_payments_id_seq', 11, true);


--
-- TOC entry 3850 (class 0 OID 0)
-- Dependencies: 229
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roles_id_seq', 7, true);


--
-- TOC entry 3851 (class 0 OID 0)
-- Dependencies: 249
-- Name: sale_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sale_details_id_seq', 23, true);


--
-- TOC entry 3852 (class 0 OID 0)
-- Dependencies: 267
-- Name: sports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sports_id_seq', 4, true);


--
-- TOC entry 3853 (class 0 OID 0)
-- Dependencies: 255
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, true);


--
-- TOC entry 3854 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 20, true);


--
-- TOC entry 3500 (class 2606 OID 16581)
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- TOC entry 3519 (class 2606 OID 16667)
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- TOC entry 3506 (class 2606 OID 16614)
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- TOC entry 3514 (class 2606 OID 16641)
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- TOC entry 3508 (class 2606 OID 16626)
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- TOC entry 3510 (class 2606 OID 16628)
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- TOC entry 3521 (class 2606 OID 16697)
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- TOC entry 3523 (class 2606 OID 16695)
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- TOC entry 3495 (class 2606 OID 16559)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- TOC entry 3497 (class 2606 OID 16561)
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- TOC entry 3491 (class 2606 OID 16544)
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- TOC entry 3493 (class 2606 OID 16542)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 3504 (class 2606 OID 16602)
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- TOC entry 3570 (class 2606 OID 98381)
-- Name: accounts_payable accounts_payable_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_payable
    ADD CONSTRAINT accounts_payable_pkey PRIMARY KEY (id);


--
-- TOC entry 3560 (class 2606 OID 73740)
-- Name: accounts_receivable accounts_receivable_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_receivable
    ADD CONSTRAINT accounts_receivable_pkey PRIMARY KEY (id);


--
-- TOC entry 3545 (class 2606 OID 24688)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3554 (class 2606 OID 24706)
-- Name: billings billings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_pkey PRIMARY KEY (id);


--
-- TOC entry 3547 (class 2606 OID 24697)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 3574 (class 2606 OID 106507)
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3539 (class 2606 OID 24657)
-- Name: courts courts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT courts_pkey PRIMARY KEY (id);


--
-- TOC entry 3534 (class 2606 OID 24647)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 3536 (class 2606 OID 57345)
-- Name: customers customers_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tax_id_key UNIQUE (tax_id);


--
-- TOC entry 3572 (class 2606 OID 98403)
-- Name: payable_payments payable_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payable_payments
    ADD CONSTRAINT payable_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3541 (class 2606 OID 24666)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3556 (class 2606 OID 24716)
-- Name: pending_charges pending_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges
    ADD CONSTRAINT pending_charges_pkey PRIMARY KEY (id);


--
-- TOC entry 3543 (class 2606 OID 24677)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3568 (class 2606 OID 98359)
-- Name: purchase_details purchase_details_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_details
    ADD CONSTRAINT purchase_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3566 (class 2606 OID 98330)
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- TOC entry 3562 (class 2606 OID 73767)
-- Name: receivable_payments receivable_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.receivable_payments
    ADD CONSTRAINT receivable_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3525 (class 2606 OID 24622)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 24727)
-- Name: sale_details sale_details_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT sale_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3576 (class 2606 OID 114702)
-- Name: sports sports_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_name_key UNIQUE (name);


--
-- TOC entry 3578 (class 2606 OID 114700)
-- Name: sports sports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_pkey PRIMARY KEY (id);


--
-- TOC entry 3564 (class 2606 OID 98316)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 3552 (class 2606 OID 40970)
-- Name: bookings unique_court_time; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT unique_court_time UNIQUE (court_id, booking_date, start_time, end_time);


--
-- TOC entry 3528 (class 2606 OID 49154)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3530 (class 2606 OID 24636)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3532 (class 2606 OID 24638)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3501 (class 1259 OID 16699)
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- TOC entry 3516 (class 1259 OID 16705)
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- TOC entry 3517 (class 1259 OID 16704)
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- TOC entry 3512 (class 1259 OID 16702)
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- TOC entry 3515 (class 1259 OID 16703)
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- TOC entry 3511 (class 1259 OID 16701)
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- TOC entry 3498 (class 1259 OID 16698)
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- TOC entry 3502 (class 1259 OID 16700)
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: neon_auth
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- TOC entry 3548 (class 1259 OID 40964)
-- Name: idx_bookings_court; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_court ON public.bookings USING btree (court_id);


--
-- TOC entry 3549 (class 1259 OID 40963)
-- Name: idx_bookings_customer; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_customer ON public.bookings USING btree (customer_id);


--
-- TOC entry 3550 (class 1259 OID 40965)
-- Name: idx_bookings_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_date ON public.bookings USING btree (booking_date);


--
-- TOC entry 3537 (class 1259 OID 40962)
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- TOC entry 3526 (class 1259 OID 40966)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3580 (class 2606 OID 16582)
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3583 (class 2606 OID 16673)
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3584 (class 2606 OID 16668)
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- TOC entry 3581 (class 2606 OID 16642)
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- TOC entry 3582 (class 2606 OID 16647)
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3579 (class 2606 OID 16562)
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: neon_auth
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- TOC entry 3609 (class 2606 OID 98387)
-- Name: accounts_payable accounts_payable_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_payable
    ADD CONSTRAINT accounts_payable_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id);


--
-- TOC entry 3610 (class 2606 OID 98382)
-- Name: accounts_payable accounts_payable_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_payable
    ADD CONSTRAINT accounts_payable_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3599 (class 2606 OID 73746)
-- Name: accounts_receivable accounts_receivable_billing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_receivable
    ADD CONSTRAINT accounts_receivable_billing_id_fkey FOREIGN KEY (billing_id) REFERENCES public.billings(id);


--
-- TOC entry 3600 (class 2606 OID 73751)
-- Name: accounts_receivable accounts_receivable_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_receivable
    ADD CONSTRAINT accounts_receivable_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3601 (class 2606 OID 73741)
-- Name: accounts_receivable accounts_receivable_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.accounts_receivable
    ADD CONSTRAINT accounts_receivable_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3591 (class 2606 OID 65536)
-- Name: billings billings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3592 (class 2606 OID 65541)
-- Name: billings billings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billings
    ADD CONSTRAINT billings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3586 (class 2606 OID 114703)
-- Name: courts courts_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT courts_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id);


--
-- TOC entry 3587 (class 2606 OID 24778)
-- Name: audit_logs fk_audit_user; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 3597 (class 2606 OID 24768)
-- Name: sale_details fk_billing_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT fk_billing_id FOREIGN KEY (billing_id) REFERENCES public.billings(id) ON DELETE RESTRICT;


--
-- TOC entry 3594 (class 2606 OID 24753)
-- Name: pending_charges fk_booking_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges
    ADD CONSTRAINT fk_booking_id FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3588 (class 2606 OID 24733)
-- Name: bookings fk_court_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_court_id FOREIGN KEY (court_id) REFERENCES public.courts(id) ON DELETE RESTRICT;


--
-- TOC entry 3589 (class 2606 OID 24738)
-- Name: bookings fk_customer_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- TOC entry 3595 (class 2606 OID 24758)
-- Name: pending_charges fk_customer_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges
    ADD CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3593 (class 2606 OID 24748)
-- Name: billings fk_payment_method; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billings
    ADD CONSTRAINT fk_payment_method FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- TOC entry 3596 (class 2606 OID 24763)
-- Name: pending_charges fk_product_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_charges
    ADD CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3598 (class 2606 OID 24773)
-- Name: sale_details fk_products_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT fk_products_id FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 3590 (class 2606 OID 24743)
-- Name: bookings fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 3585 (class 2606 OID 24728)
-- Name: users fk_user_role; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 3611 (class 2606 OID 98404)
-- Name: payable_payments payable_payments_account_payable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payable_payments
    ADD CONSTRAINT payable_payments_account_payable_id_fkey FOREIGN KEY (account_payable_id) REFERENCES public.accounts_payable(id) ON DELETE CASCADE;


--
-- TOC entry 3612 (class 2606 OID 98409)
-- Name: payable_payments payable_payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payable_payments
    ADD CONSTRAINT payable_payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- TOC entry 3613 (class 2606 OID 98414)
-- Name: payable_payments payable_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payable_payments
    ADD CONSTRAINT payable_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3607 (class 2606 OID 98365)
-- Name: purchase_details purchase_details_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_details
    ADD CONSTRAINT purchase_details_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 3608 (class 2606 OID 98360)
-- Name: purchase_details purchase_details_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_details
    ADD CONSTRAINT purchase_details_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE CASCADE;


--
-- TOC entry 3604 (class 2606 OID 98341)
-- Name: purchases purchases_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- TOC entry 3605 (class 2606 OID 98331)
-- Name: purchases purchases_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- TOC entry 3606 (class 2606 OID 98336)
-- Name: purchases purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3602 (class 2606 OID 73768)
-- Name: receivable_payments receivable_payments_account_receivable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.receivable_payments
    ADD CONSTRAINT receivable_payments_account_receivable_id_fkey FOREIGN KEY (account_receivable_id) REFERENCES public.accounts_receivable(id);


--
-- TOC entry 3603 (class 2606 OID 73773)
-- Name: receivable_payments receivable_payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.receivable_payments
    ADD CONSTRAINT receivable_payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);


--
-- TOC entry 2198 (class 826 OID 16394)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2197 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2026-09-17 12:01:20

--
-- PostgreSQL database dump complete
--

\unrestrict 3KIwk1X2t9xZOQlbz0tzrxcnRzfmfEg4XQC9Uo5nxC99RzXD4MKSi1xWOQ32wQ0

