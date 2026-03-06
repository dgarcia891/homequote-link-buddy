

## Analysis

From the edge function logs, the error is clear: `NaN: Error: NaN` from denomailer's `assertCode` — this means the SMTP server responded with a non-SMTP protocol. This happens because **port 993 is saved in the database** (IMAP port), not port 465 (SMTP) as shown in your screenshot.

Your correct SMTP settings from the screenshot:
- **Host:** `mail.homequotelink.com`
- **Port:** `465` (SSL/TLS)
- **Username:** `admin@homequotelink.com`

The function also lacks debug logging and a timeout, so when it hangs you get no feedback.

## Plan

### 1. Rewrite the edge function with robustness fixes

**File:** `supabase/functions/notify-admin-email/index.ts`

- **Remove JWT auth requirement** — match `verify_jwt = false` in config.toml. The previous prompt's working version didn't require JWT either. This eliminates the 401 errors when calling from the browser.
- **Add debug logging** — log SMTP config (host, port, username, tls — no password) before connecting so edge function logs show what's actually being used.
- **Add port validation** — reject port 993/995 with a clear error: "Port 993 is IMAP. Use 465 for SSL or 587 for STARTTLS."
- **Add SMTP connection timeout** — wrap the `client.send()` in a `Promise.race` with a 10-second timeout so the function returns a useful error instead of hanging for 150 seconds.
- **Correct TLS logic** — port 465 → `tls: true`, anything else → `tls: false`.

### 2. Add port warning in Settings UI

**File:** `src/pages/admin/Settings.tsx`

- Show an inline warning below the port field when port 993 or 995 is entered: "This is an IMAP port. Use 465 (SSL) or 587 (STARTTLS) for SMTP."
- Block save/test if an invalid port is used.

### 3. Deploy and verify

Deploy the updated edge function and test it with `curl` to confirm it works before the user tries the UI.

| File | Change |
|---|---|
| `supabase/functions/notify-admin-email/index.ts` | Remove JWT auth, add debug logging, port validation, 10s timeout |
| `src/pages/admin/Settings.tsx` | Port warning UI |

