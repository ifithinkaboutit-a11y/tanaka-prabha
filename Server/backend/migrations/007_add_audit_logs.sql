-- Migration: Add audit_logs table for tracking scheme views and SOS triggers
-- Created: 2026-04-22

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'scheme_view', 'sos_trigger', 'sos_call', 'sos_email'
    entity_id TEXT,        -- scheme id, event id, etc.
    metadata JSONB DEFAULT '{}', -- additional context (e.g., language, source, reason)
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Index for fast lookups by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);
-- Index for fast lookups by entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs (entity_id);
-- Index for date-range queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
