
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_emails_normalized ON public.blocked_emails (email_normalized);
CREATE UNIQUE INDEX IF NOT EXISTS idx_blocked_phones_normalized ON public.blocked_phones (phone_normalized);
