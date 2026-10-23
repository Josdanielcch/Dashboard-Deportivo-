-- ============================================================
-- SCRIPT: Activar Sistema de Auditoría
-- Descripción: Crea/mejora la función de auditoría y vincula
--              triggers a las 12 tablas críticas del sistema.
-- Base de datos: PostgreSQL (Neon.tech)
-- Ejecución: psql "DATABASE_URL" -f activate_audit_triggers.sql
-- ============================================================

-- 1. MEJORAR la función fn_audit_generic()
-- Usa current_setting('app.current_user_id') para rastrear
-- el usuario desde el backend, con fallback a columnas user_id
-- de la tabla, y finalmente NULL.
CREATE OR REPLACE FUNCTION public.fn_audit_generic()
RETURNS trigger AS $$
DECLARE
    v_user_id INT;
BEGIN
    -- Intentar obtener el usuario desde la variable de sesión (establecida por el middleware)
    BEGIN
        v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::int;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    -- Si no hay usuario en sesión, intentar desde la columna user_id de la tabla
    IF v_user_id IS NULL THEN
        BEGIN
            IF (TG_OP = 'DELETE') THEN
                v_user_id := OLD.user_id;
            ELSE
                v_user_id := NEW.user_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_user_id := NULL;
        END;
    END IF;

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
$$ LANGUAGE plpgsql;

-- Asegurar permisos
ALTER FUNCTION public.fn_audit_generic() OWNER TO neondb_owner;

-- 2. CREAR TRIGGERS para las 12 tablas críticas
-- Cada trigger se ejecuta AFTER INSERT OR UPDATE OR DELETE

-- Tabla: users
DROP TRIGGER IF EXISTS trg_audit_users ON public.users;
CREATE TRIGGER trg_audit_users
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: customers
DROP TRIGGER IF EXISTS trg_audit_customers ON public.customers;
CREATE TRIGGER trg_audit_customers
    AFTER INSERT OR UPDATE OR DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: courts
DROP TRIGGER IF EXISTS trg_audit_courts ON public.courts;
CREATE TRIGGER trg_audit_courts
    AFTER INSERT OR UPDATE OR DELETE ON public.courts
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: bookings
DROP TRIGGER IF EXISTS trg_audit_bookings ON public.bookings;
CREATE TRIGGER trg_audit_bookings
    AFTER INSERT OR UPDATE OR DELETE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: billings
DROP TRIGGER IF EXISTS trg_audit_billings ON public.billings;
CREATE TRIGGER trg_audit_billings
    AFTER INSERT OR UPDATE OR DELETE ON public.billings
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: products
DROP TRIGGER IF EXISTS trg_audit_products ON public.products;
CREATE TRIGGER trg_audit_products
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: suppliers
DROP TRIGGER IF EXISTS trg_audit_suppliers ON public.suppliers;
CREATE TRIGGER trg_audit_suppliers
    AFTER INSERT OR UPDATE OR DELETE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: purchases
DROP TRIGGER IF EXISTS trg_audit_purchases ON public.purchases;
CREATE TRIGGER trg_audit_purchases
    AFTER INSERT OR UPDATE OR DELETE ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: purchase_details
DROP TRIGGER IF EXISTS trg_audit_purchase_details ON public.purchase_details;
CREATE TRIGGER trg_audit_purchase_details
    AFTER INSERT OR UPDATE OR DELETE ON public.purchase_details
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: accounts_receivable
DROP TRIGGER IF EXISTS trg_audit_accounts_receivable ON public.accounts_receivable;
CREATE TRIGGER trg_audit_accounts_receivable
    AFTER INSERT OR UPDATE OR DELETE ON public.accounts_receivable
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: accounts_payable
DROP TRIGGER IF EXISTS trg_audit_accounts_payable ON public.accounts_payable;
CREATE TRIGGER trg_audit_accounts_payable
    AFTER INSERT OR UPDATE OR DELETE ON public.accounts_payable
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: pending_charges
DROP TRIGGER IF EXISTS trg_audit_pending_charges ON public.pending_charges;
CREATE TRIGGER trg_audit_pending_charges
    AFTER INSERT OR UPDATE OR DELETE ON public.pending_charges
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: sports
DROP TRIGGER IF EXISTS trg_audit_sports ON public.sports;
CREATE TRIGGER trg_audit_sports
    AFTER INSERT OR UPDATE OR DELETE ON public.sports
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: business_settings
DROP TRIGGER IF EXISTS trg_audit_business_settings ON public.business_settings;
CREATE TRIGGER trg_audit_business_settings
    AFTER INSERT OR UPDATE OR DELETE ON public.business_settings
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- Tabla: roles
DROP TRIGGER IF EXISTS trg_audit_roles ON public.roles;
CREATE TRIGGER trg_audit_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic();

-- ============================================================
-- VERIFICACIÓN: Ejecutar después para confirmar los triggers
-- SELECT tgname, tgrelid::regclass as tabla 
-- FROM pg_trigger 
-- WHERE tgname LIKE 'trg_audit_%' AND NOT tgisinternal
-- ORDER BY tgrelid::regclass::text;
-- ============================================================
