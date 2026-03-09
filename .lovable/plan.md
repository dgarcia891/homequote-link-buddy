

# Add IP Tracking to Site Analytics

## Current State
- `analytics_events` — inserted client-side, no IP access
- `post_metrics` — uses edge function, captures hashed IP

## Solution
Route analytics events through a new edge function that captures and hashes the IP before inserting.

## Implementation

### 1. Database Change
Add `ip_hash` column to `analytics_events` table.

### 2. New Edge Function: `track-event`
- Receives event payload from client
- Extracts IP from `x-forwarded-for` header
- Hashes IP (SHA-256 like `track-view`)
- Inserts into `analytics_events` with `ip_hash`

### 3. Update `analyticsService.ts`
Change from direct Supabase insert to calling the new edge function:
```typescript
await supabase.functions.invoke('track-event', {
  body: { event_type, event_name, page_path, ... }
});
```

### 4. Analytics Dashboard
Add ability to view/filter by IP hash in detail views (useful for identifying repeat visitors or filtering out specific IPs).

## Files

| Action | File |
|--------|------|
| Create | `supabase/functions/track-event/index.ts` |
| Modify | `src/services/analyticsService.ts` — call edge function instead of direct insert |
| Modify | Database — add `ip_hash` column to `analytics_events` |
| Modify | `supabase/config.toml` — add function config |

