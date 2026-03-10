

## Problem Diagnosis

The purge function executed successfully but **deleted 0 records** because it only matches by `visitor_id`. Your current browser's visitor_id is `8b712d6a-...`, but the records with your IP `45.48.115.3` were recorded under different visitor_ids (`0eaa30b2-...` and `9a7403a9-...`) -- these are from previous sessions where localStorage was reset. So purge ran, found nothing matching, and reported "0 events deleted" -- which the toast displayed as a success.

The tracking exclusion is also **client-side only** (`localStorage` flag). If localStorage gets cleared or you use a different browser, tracking resumes because the `track-event` edge function has no server-side exclusion check.

## What to Fix

### 1. Purge by IP address, not just visitor_id
- The `purge-analytics` edge function will detect the caller's IP from request headers (same `getClientIp` logic as `track-event`)
- Delete all records matching that IP **OR** the provided visitor_id
- Return the actual count with a breakdown

### 2. Server-side tracking exclusion by IP
- When "Exclude this browser" is toggled ON in Settings, store the caller's IP in an `excluded_ips` admin setting (via a new edge function call or by having track-event detect it)
- The `track-event` edge function will check `excluded_ips` list before inserting -- if the request IP matches, skip the insert
- This makes exclusion work regardless of localStorage state

### 3. Honest toast messages
- If purge deletes 0 records, say "No matching records found" instead of "Records purged"
- Show exact count: "Deleted 21 analytics events (by IP and visitor ID)"
- If purge errors, show the actual error

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/purge-analytics/index.ts` | Delete by IP (from request headers) AND visitor_id; return breakdown |
| `supabase/functions/track-event/index.ts` | Check `excluded_ips` admin setting; skip insert if IP matches |
| `src/pages/admin/Settings.tsx` | On exclusion toggle, also store IP via a helper edge function; fix toast to show truthful messages |

### Purge function logic (pseudocode)
```text
ip = getClientIp(req)
visitor_id = body.visitor_id

delete from analytics_events 
  where ip_address = ip OR visitor_id = visitor_id

return { count, ip, visitor_id }
```

### Track-event exclusion logic (added before insert)
```text
ip = getClientIp(req)
excluded_ips = fetch from admin_settings('excluded_ips')
if ip in excluded_ips → return { skipped: 'ip_excluded' }
```

### Settings toggle logic
When toggled ON: call `purge-analytics` with a `register_ip: true` flag so it stores the IP in `excluded_ips`. This way the server knows the IP without the client ever seeing it.

