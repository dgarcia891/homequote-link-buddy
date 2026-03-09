

# Replace IP Hash with Raw IP Address

## What changes

### 1. Database migration
- Rename column `ip_hash` → `ip_address` (text) on `analytics_events` table.

### 2. Edge function (`track-event/index.ts`)
- Remove the SHA-256 hashing logic.
- Store the raw IP string directly as `ip_address`.

### 3. Admin UI (`AnalyticsDetail.tsx`)
- Replace all references to `ip_hash` with `ip_address` and label it "IP Address".

## Files
| File | Change |
|------|--------|
| Database migration | Rename `ip_hash` → `ip_address` |
| `supabase/functions/track-event/index.ts` | Store raw IP instead of hash |
| `src/pages/admin/AnalyticsDetail.tsx` | Rename column key/label from `ip_hash`/`IP Hash` → `ip_address`/`IP Address` |

