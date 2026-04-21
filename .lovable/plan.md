

## The database is no longer pegged — what you're seeing is a stale chart

I pulled live diagnostics. The previous fixes worked. The Cloud Usage chart you're looking at is showing historical (pre-fix) data, not the current state.

### Live evidence (right now)

| Signal | Reading | Interpretation |
|---|---|---|
| Active queries | **1 active**, 7 idle, 8 idle-in-tx | Database is essentially idle |
| Cron job runs (last hour) | **5 total** (4 publish + 1 nurture) | Throttle is in effect |
| Cron schedule check | `publish-scheduled-posts: */15 * * * *` | Confirmed at the new 15-min cadence |
| pg_net response queue | **0 queued, 30 stored** | No backlog, GC is keeping up |
| Database size | **47 MB total** | Tiny — no storage pressure |
| Largest table | `analytics_events` at 216 KB, 127 rows | No write pressure |
| Analytics events (last 24h) | **0** | GA4 migration is holding — no DB writes from tracking |
| Errors in last hour | 1× `pg_stat_statements does not exist` (from my own diagnostic query), 1× `subscription_id` (Supabase internal scraper) | Nothing application-level |

### Why the Cloud usage view still looks bad

Cloud's **Usage** dashboard aggregates compute over hourly/daily windows. The throttling change went in earlier today, so the rolling chart still includes the high-CPU period from before the fix. It will normalize over the next 6–24 hours as old samples roll off.

There is no current query workload to optimize. The DB is doing essentially nothing right now.

### What would actually move the chart faster

Three small, optional cleanups. None are urgent — the system is healthy:

**1. Disable the unused nurture cron**
`send-nurture-emails-hourly` runs 24×/day. With zero leads in the nurture pipeline, every run is just pg_net + cron-log overhead for nothing. Unschedule it until lead volume justifies it.

**2. Purge historical pg_net + cron clutter (one-time)**
The `cron.job_run_details` table has 13,514 rows of history from the old 5-min schedule. Trimming it to the last 7 days reclaims wasted scan/maintenance time.
```sql
DELETE FROM cron.job_run_details WHERE start_time < now() - interval '7 days';
DELETE FROM net._http_response WHERE created < now() - interval '1 day';
```

**3. Grant `pg_stat_statements` to the read role**
The extension is installed but the postgres read role can't query it. Granting access lets future diagnostics show per-query timing instead of guessing.

### What this plan is NOT

- Not adding indexes — `posts` (1 row), `leads` (6 rows), `verticals` (4 rows) are too small to benefit
- Not upgrading the Cloud instance — there's no actual workload pressure
- Not changing application code — polling intervals are already throttled

### Files / changes

| Change | Type |
|---|---|
| `supabase/migrations/<ts>_db_cleanup.sql` | Unschedule `send-nurture-emails-hourly`, purge old cron history & http responses |
| (Optional) Grant on `pg_stat_statements` | For future visibility |

### Database Impact

✅ **SAFE** — deletes historical cron logs and http response cache only. No application data touched. Nurture cron can be re-enabled with one SQL line if/when leads start flowing.

### Expected outcome

- Cloud usage chart normalizes within 6–24h as the pre-fix samples age out
- Cron/pg_net overhead drops further (~24 fewer runs/day from disabling nurture)
- Future "why is X slow" questions get real per-query data via `pg_stat_statements`

