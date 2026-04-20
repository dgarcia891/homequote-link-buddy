

## Diagnosis: All Real Causes of Database Load (Evidence-Based)

I pulled live `pg_stat_statements`, `pg_stat_user_tables`, `pg_stat_database`, cron history, and Postgres logs. The **previous plan was wrong** about the cause. Here is the actual breakdown.

### The real top consumers (last ~50 days of stats)

| Rank | % of total exec time | What it is |
|------|----------------------|------------|
| **1** | **58.2%** | `net.http_post(...)` — pg_net firing HTTP calls from cron jobs (13,413 calls) |
| **2** | **6.4%** | `DELETE FROM net.http_request_queue` — pg_net dequeue worker (32,113 calls) |
| **3** | **5.6%** | `DELETE FROM net._http_response WHERE created < ...` — pg_net response GC (32,113 calls) |
| **4** | **5.6%** | `INSERT INTO cron.job_run_details` — cron logging (13,413 calls) |
| **5** | **5.4%** | `SELECT name FROM pg_timezone_names` — Studio/dashboard query (65 calls, 538ms each) |
| **6** | **2.3%** | `INSERT INTO net._http_response` — pg_net response storage |
| 7–9 | ~6% combined | More cron `job_run_details` updates |
| 10 | 1.1% | `pg_backup_start` — managed backups |

**Key insight:** ~80% of all DB CPU time is **pg_cron + pg_net machinery**, not your application queries. The actual app queries (`posts`, `spam_events`, etc.) are at the bottom — `posts` query is 12,384 calls but only ~1,400ms total (mean 0.11ms — already fast).

### The seq_scan numbers were misleading

The previous plan flagged `posts` (12,571 seq scans) and `leads` (9,904 seq scans). Reality:
- `posts` has **1 row** — Postgres correctly chooses seq scan over index. Adding indexes will not help.
- `leads` has **6 rows** — same situation. Total time spent on `leads` queries is negligible.
- These are 50-day cumulative counters, not "per hour."

### The actual reasons load is high

1. **pg_cron firing every 5 min + pg_net overhead (#1 cause, ~80% of CPU)**
   - `publish-scheduled` runs 288×/day to publish blog posts (you have 1 post)
   - Each run: pg_net queues HTTP, dequeues, stores response, GCs old responses, writes 4 cron log rows
   - That's ~10 internal SQL ops per cron tick × 288 ticks = ~2,880 internal ops/day just for one job

2. **Client-side polling (compounding, smaller)**
   - `useAdminCounts.ts` — refetches every 60s while admin dashboard is open
   - `SpamMonitor.tsx` — refetches every 30s (4 separate queries each tick)
   - `SiteAnalytics.tsx` — refetches every 60s
   - Each admin tab open = constant background DB queries

3. **Studio/dashboard noise**
   - `pg_timezone_names` (538ms × 65 calls = 5.4% of CPU) is fired by the Supabase Studio UI when you open table editor / type pickers. Just keeping the dashboard open costs CPU.

4. **Stale auth migration error (cosmetic but recurring)**
   - 7×/hour: `column "subscription_id" does not exist` — failed auth migration that retries

5. **Tiny instance (real constraint)**
   - `shared_buffers = 28672 (224 MB)`, `work_mem = 2184 KB`, `max_connections = 60`
   - This is the smallest Cloud tier. Even modest cron + dashboard activity saturates it.

### What this plan does NOT do

- **No indexes** on `posts`/`leads`/`verticals` — they have 1–6 rows; indexes would be ignored or actively slower
- **No `pg_stat_statements` install** — already installed
- **No VACUUM** — autovacuum is fine; dead tuple counts are tiny

### Fix Plan

**1. Reduce cron frequency (biggest single win — drops the #1 query by ~67%)**

```sql
-- publish-scheduled: 5min → 15min (still publishes posts on time)
SELECT cron.unschedule('publish-scheduled-posts');
SELECT cron.schedule(
  'publish-scheduled-posts', '*/15 * * * *',
  $$ SELECT net.http_post(...same body...) AS request_id; $$
);
```

Expected: ~67% drop in pg_net + cron log churn.

**2. Slow down client polling**

| File | Current | New | Reason |
|------|---------|-----|--------|
| `src/hooks/useAdminCounts.ts` | 60s | 5 min | Sidebar badges don't need to be real-time |
| `src/pages/admin/SpamMonitor.tsx` | 30s | 2 min | Spam events are low-frequency |
| `src/pages/admin/SiteAnalytics.tsx` | 60s | 5 min | Analytics aren't real-time anymore (GA4) |

**3. Fix the noisy auth migration error**

Investigate and remove whatever migration is failing with `column "subscription_id" does not exist` — likely an obsolete Supabase auth schema reference. (Will check `supabase/migrations/` once in implement mode.)

**4. Consider instance upgrade (only if 1–3 don't fix it)**

The Cloud instance is the smallest size (~224 MB shared_buffers). After steps 1–3, if CPU is still high, upgrade via **Cloud → Advanced settings → Upgrade instance**. Don't do this first — the workload is the problem, not the size.

### Files to change

| File | Change |
|------|--------|
| New migration `supabase/migrations/<ts>_throttle_cron.sql` | Reschedule `publish-scheduled-posts` to `*/15` |
| `src/hooks/useAdminCounts.ts` | `refetchInterval: 300_000` |
| `src/pages/admin/SpamMonitor.tsx` | `refetchInterval: 120_000` |
| `src/pages/admin/SiteAnalytics.tsx` | `refetchInterval: 300_000` |
| (Investigate) `supabase/migrations/` | Find/repair the `subscription_id` migration |

### Database Impact

✅ **SAFE** — only reschedules an existing cron job. No schema changes, no data changes, no index rebuilds.

### Expected Result

- pg_net + cron overhead: **~80% CPU → ~30% CPU**
- Idle background load (no admin tabs open) drops dramatically
- If still hot, the data will then point to a real query — and we'll have evidence to act on, not a guess

