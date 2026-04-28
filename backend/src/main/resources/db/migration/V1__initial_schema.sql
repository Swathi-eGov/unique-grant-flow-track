-- ============================================================
-- V1__initial_schema.sql
-- Grant Flow Tracker — initial production schema
-- UUID PKs, created_at/updated_at, soft-delete on root tables
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() on PG < 13
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------
-- Reusable trigger function for updated_at
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- grants
-- ============================================================
CREATE TABLE grants (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                    VARCHAR(500)   NOT NULL,
    funder                   VARCHAR(255),
    grant_number             VARCHAR(100),
    description              TEXT,
    total_amount             NUMERIC(15, 2),
    start_date               DATE,
    end_date                 DATE,
    status                   VARCHAR(50)    NOT NULL DEFAULT 'active',
    reporting_cycle          VARCHAR(50),
    pdf_url                  TEXT,
    contacts                 JSONB,
    notification_days_before INTEGER        NOT NULL DEFAULT 7,
    archived                 BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    deleted_at               TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_grants_grant_number
    ON grants (grant_number)
    WHERE grant_number IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_grants_status     ON grants (status);
CREATE INDEX idx_grants_archived   ON grants (archived);
CREATE INDEX idx_grants_end_date   ON grants (end_date);
CREATE INDEX idx_grants_deleted_at ON grants (deleted_at);

CREATE TRIGGER trg_grants_updated_at
    BEFORE UPDATE ON grants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- grant_tranches
-- ============================================================
CREATE TABLE grant_tranches (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id             UUID        NOT NULL REFERENCES grants (id) ON DELETE CASCADE,
    tranche_name         VARCHAR(255) NOT NULL,
    amount               NUMERIC(15, 2),
    invoice_trigger_date DATE,
    due_date             DATE,
    invoice_date         DATE,
    received_date        DATE,
    status               VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes                TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grant_tranches_grant_id ON grant_tranches (grant_id);
CREATE INDEX idx_grant_tranches_status   ON grant_tranches (status);
CREATE INDEX idx_grant_tranches_due_date ON grant_tranches (due_date);

CREATE TRIGGER trg_grant_tranches_updated_at
    BEFORE UPDATE ON grant_tranches
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- grant_deliverables
-- ============================================================
CREATE TABLE grant_deliverables (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id   UUID         NOT NULL REFERENCES grants (id) ON DELETE CASCADE,
    name       VARCHAR(500) NOT NULL,
    phase      VARCHAR(255),
    due_date   DATE,
    status     VARCHAR(50)  NOT NULL DEFAULT 'pending',
    notes      TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grant_deliverables_grant_id ON grant_deliverables (grant_id);
CREATE INDEX idx_grant_deliverables_status   ON grant_deliverables (status);
CREATE INDEX idx_grant_deliverables_due_date ON grant_deliverables (due_date);

CREATE TRIGGER trg_grant_deliverables_updated_at
    BEFORE UPDATE ON grant_deliverables
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- grant_reporting_obligations
-- ============================================================
CREATE TABLE grant_reporting_obligations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id         UUID         NOT NULL REFERENCES grants (id) ON DELETE CASCADE,
    obligation_name  VARCHAR(500) NOT NULL,
    obligation_type  VARCHAR(100),
    due_date         DATE         NOT NULL,
    submitted_date   DATE,
    status           VARCHAR(50)  NOT NULL DEFAULT 'Pending',
    notes            TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grant_reporting_grant_id ON grant_reporting_obligations (grant_id);
CREATE INDEX idx_grant_reporting_status   ON grant_reporting_obligations (status);
CREATE INDEX idx_grant_reporting_due_date ON grant_reporting_obligations (due_date);

CREATE TRIGGER trg_grant_reporting_updated_at
    BEFORE UPDATE ON grant_reporting_obligations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- milestones
-- ============================================================
CREATE TABLE milestones (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id   UUID         NOT NULL REFERENCES grants (id) ON DELETE CASCADE,
    title      VARCHAR(500) NOT NULL,
    amount     NUMERIC(15, 2),
    due_date   DATE         NOT NULL,
    paid_date  DATE,
    status     VARCHAR(50)  NOT NULL DEFAULT 'pending',
    notes      TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_grant_id ON milestones (grant_id);
CREATE INDEX idx_milestones_status   ON milestones (status);
CREATE INDEX idx_milestones_due_date ON milestones (due_date);

CREATE TRIGGER trg_milestones_updated_at
    BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- mous
-- ============================================================
CREATE TABLE mous (
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                        VARCHAR(500) NOT NULL,
    partner_name                 VARCHAR(255) NOT NULL,
    mou_number                   VARCHAR(100),
    partner_type                 VARCHAR(50),
    partner_address              TEXT,
    partner_contact_name         VARCHAR(255),
    partner_contact_email        VARCHAR(255),
    partner_signatory_name       VARCHAR(255),
    partner_signatory_designation VARCHAR(255),
    our_contact_name             VARCHAR(255),
    our_contact_email            VARCHAR(255),
    our_signatory_name           VARCHAR(255),
    our_signatory_designation    VARCHAR(255),
    signed_date                  DATE,
    effective_date               DATE,
    end_date                     DATE,
    initial_term_years           NUMERIC(5, 2),
    review_cycle                 VARCHAR(50),
    status                       VARCHAR(50)  NOT NULL DEFAULT 'active',
    purpose                      TEXT,
    scope_of_collaboration       TEXT,
    governing_law                VARCHAR(255),
    pdf_url                      TEXT,
    notes                        TEXT,
    archived                     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at                   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at                   TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_mous_mou_number
    ON mous (mou_number)
    WHERE mou_number IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_mous_status     ON mous (status);
CREATE INDEX idx_mous_archived   ON mous (archived);
CREATE INDEX idx_mous_end_date   ON mous (end_date);
CREATE INDEX idx_mous_deleted_at ON mous (deleted_at);

CREATE TRIGGER trg_mous_updated_at
    BEFORE UPDATE ON mous
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- mou_commitments
-- ============================================================
CREATE TABLE mou_commitments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mou_id     UUID         NOT NULL REFERENCES mous (id) ON DELETE CASCADE,
    name       VARCHAR(500) NOT NULL,
    due_date   DATE,
    status     VARCHAR(50)  NOT NULL DEFAULT 'pending',
    notes      TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mou_commitments_mou_id   ON mou_commitments (mou_id);
CREATE INDEX idx_mou_commitments_status   ON mou_commitments (status);
CREATE INDEX idx_mou_commitments_due_date ON mou_commitments (due_date);

CREATE TRIGGER trg_mou_commitments_updated_at
    BEFORE UPDATE ON mou_commitments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- msas
-- ============================================================
CREATE TABLE msas (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                VARCHAR(500) NOT NULL,
    vendor_name          VARCHAR(255) NOT NULL,
    msa_number           VARCHAR(100),
    vendor_address       TEXT,
    vendor_contact_name  VARCHAR(255),
    vendor_contact_email VARCHAR(255),
    our_contact_name     VARCHAR(255),
    our_contact_email    VARCHAR(255),
    effective_date       DATE,
    end_date             DATE,
    initial_term_years   NUMERIC(5, 2),
    status               VARCHAR(50)  NOT NULL DEFAULT 'active',
    governing_law        VARCHAR(255),
    auto_renew           BOOLEAN      NOT NULL DEFAULT FALSE,
    notice_period        VARCHAR(100),
    liability_cap        VARCHAR(255),
    ip_ownership         TEXT,
    description          TEXT,
    key_terms            TEXT,
    pdf_url              TEXT,
    notes                TEXT,
    archived             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at           TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_msas_msa_number
    ON msas (msa_number)
    WHERE msa_number IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_msas_status     ON msas (status);
CREATE INDEX idx_msas_archived   ON msas (archived);
CREATE INDEX idx_msas_end_date   ON msas (end_date);
CREATE INDEX idx_msas_deleted_at ON msas (deleted_at);

CREATE TRIGGER trg_msas_updated_at
    BEFORE UPDATE ON msas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- msa_key_clauses
-- ============================================================
CREATE TABLE msa_key_clauses (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    msa_id           UUID         NOT NULL REFERENCES msas (id) ON DELETE CASCADE,
    clause_name      VARCHAR(500) NOT NULL,
    clause_reference VARCHAR(100),
    summary          TEXT,
    notes            TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_msa_key_clauses_msa_id ON msa_key_clauses (msa_id);

CREATE TRIGGER trg_msa_key_clauses_updated_at
    BEFORE UPDATE ON msa_key_clauses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- sows
-- ============================================================
CREATE TABLE sows (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(500) NOT NULL,
    vendor_name   VARCHAR(255) NOT NULL,
    sow_number    VARCHAR(100),
    grant_id      UUID REFERENCES grants (id),
    msa_id        UUID REFERENCES msas (id),
    vendor_email  VARCHAR(255),
    description   TEXT,
    start_date    DATE,
    end_date      DATE,
    status        VARCHAR(50)  NOT NULL DEFAULT 'active',
    monthly_rate  NUMERIC(15, 2),
    total_value   NUMERIC(15, 2),
    payment_day   INTEGER,
    advance_amount NUMERIC(15, 2),
    pdf_url       TEXT,
    notes         TEXT,
    archived      BOOLEAN      NOT NULL DEFAULT FALSE,
    personnel     JSONB,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_sows_sow_number
    ON sows (sow_number)
    WHERE sow_number IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_sows_grant_id   ON sows (grant_id);
CREATE INDEX idx_sows_msa_id     ON sows (msa_id);
CREATE INDEX idx_sows_status     ON sows (status);
CREATE INDEX idx_sows_archived   ON sows (archived);
CREATE INDEX idx_sows_deleted_at ON sows (deleted_at);

CREATE TRIGGER trg_sows_updated_at
    BEFORE UPDATE ON sows
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- sow_deliverables
-- ============================================================
CREATE TABLE sow_deliverables (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sow_id     UUID         NOT NULL REFERENCES sows (id) ON DELETE CASCADE,
    name       VARCHAR(500) NOT NULL,
    due_date   DATE,
    status     VARCHAR(50)  NOT NULL DEFAULT 'pending',
    notes      TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sow_deliverables_sow_id   ON sow_deliverables (sow_id);
CREATE INDEX idx_sow_deliverables_status   ON sow_deliverables (status);
CREATE INDEX idx_sow_deliverables_due_date ON sow_deliverables (due_date);

CREATE TRIGGER trg_sow_deliverables_updated_at
    BEFORE UPDATE ON sow_deliverables
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- sow_invoices
-- ============================================================
CREATE TABLE sow_invoices (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sow_id         UUID        NOT NULL REFERENCES sows (id) ON DELETE CASCADE,
    invoice_number VARCHAR(100),
    period         VARCHAR(100),
    amount         NUMERIC(15, 2),
    invoice_date   DATE,
    due_date       DATE,
    paid_date      DATE,
    status         VARCHAR(50) NOT NULL DEFAULT 'draft',
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sow_invoices_sow_id   ON sow_invoices (sow_id);
CREATE INDEX idx_sow_invoices_status   ON sow_invoices (status);
CREATE INDEX idx_sow_invoices_due_date ON sow_invoices (due_date);

CREATE TRIGGER trg_sow_invoices_updated_at
    BEFORE UPDATE ON sow_invoices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- app_settings  (singleton row)
-- ============================================================
CREATE TABLE app_settings (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notifications_enabled BOOLEAN     NOT NULL DEFAULT FALSE,
    days_before           INTEGER     NOT NULL DEFAULT 7,
    alert_emails          JSONB       NOT NULL DEFAULT '[]'::JSONB,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
