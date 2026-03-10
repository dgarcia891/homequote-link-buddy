

## Fix: Toast Duration/Stacking + Purge Function

### 1. Toast Configuration
**File:** `src/hooks/use-toast.ts`

- Change `TOAST_REMOVE_DELAY` from `1000000` to `30000` (30 seconds)
- Change `TOAST_LIMIT` from `1` to `5` (allow stacking)

### 2. Purge Function — Redeploy
The `analytics_events.ip_address` column exists in the database. The error is from a stale edge function deployment. Will redeploy `purge-analytics` and verify it works by invoking it with a test call.

No code changes needed to the function itself — just a redeploy and verification.

| Change | File |
|--------|------|
| Toast duration 30s + stacking | `src/hooks/use-toast.ts` |
| Redeploy + test | `supabase/functions/purge-analytics/index.ts` |

