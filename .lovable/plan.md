## RCA: why the Cloud Usage screen shows Database server at 99%

### 1. Observed symptom

Your screenshot shows:

| Usage category | Value |
|---|---:|
| Database server | 99% |
| Compute | 1% |
| Network | 0% |
| Database storage | 0% |
| Storage | 0% |
| Live updates | 0% |

This is from the **Last day** usage window. It does **not** mean there is a live SQL query currently consuming 99% CPU. It means almost all measured Cloud usage in the selected time window was attributed to the database server category.

### 2. Confirmed causes

#### Confirmed cause A: the database is not currently busy

Live database checks showed:

| Signal | Live reading |
|---|---:|
| Active queries | 1 |
| Total connections | 13 |
| Active non-diagnostic queries | 0 |
| Scheduled jobs active | 1 |
| Cron runs last hour | 4, all succeeded |
| Analytics events last 24h | 0 |
| Deadlocks | 0 |
| Temp files | 0 |
| Cache hit ratio | about 99.995% |

So the screenshot is not showing a currently pegged database process. It is showing **database-attributed usage over the last-day billing/usage window**.

#### Confirmed cause B: database usage is being dominated by background database overhead, not frontend traffic

The usage split is the key clue: Database server is 99%, while Compute, Network, Storage, and Live updates are basically zero. That points to database-side activity such as:

- cron metadata and cron job execution tracking
- pg_net HTTP invocation records
- database log churn
- maintenance/autovacuum/statistics work
- repeated failed database metadata operations
- admin polling/count queries when admin pages are open

It does **not** point to heavy file storage, edge compute, realtime, or external network traffic.

#### Confirmed cause C: the previously noisy cron/log tables are still the largest internal database objects

Current internal sizes:

| Object | Size | Notes |
|---|---:|---|
| `net._http_response` | 19 MB | HTTP response history for scheduled function invocations |
| `cron.job_run_details` | 17 MB | cron execution history |
| `public.job_run_logs` | 320 KB | app-level job logs |

These are not huge in absolute terms, but they are the largest database objects in this small project. Since the actual app tables are tiny, database usage attribution is mostly internal job/log overhead.

#### Confirmed cause D: `pg_stat_statements` is not enabled

Attempting to inspect per-query cost failed because `pg_stat_statements` does not exist. That means the backend currently lacks the main database-native way to identify exact expensive SQL statements.

This is not the direct cause of 99%, but it is a major observability gap. Without it, every performance investigation is slower and less precise.

#### Confirmed cause E: recurring Postgres errors still exist

Recent logs include repeated:

```text
column "subscription_id" does not exist
```

This is low-volume right now, but it is a real recurring backend error. It likely comes from a stale realtime/subscription migration or metadata mismatch. It is probably not the main usage driver, but it should be cleaned up because it adds log noise and hides more important errors.

### 3. Other plausible causes checked

| Cause | Status | Reason |
|---|---|---|
| A runaway active SQL query | Ruled out | Only the diagnostic query was active |
| Admin dashboard polling hammering counts | Mostly ruled out currently | Admin count polling was already reduced to 5 minutes; no current active query pressure |
| Analytics tracking volume | Ruled out currently | 0 analytics events in the last 24h |
| Nurture cron still running hourly | Ruled out currently | Only `publish-scheduled-posts` is scheduled |
| Failed cron retry storm | Ruled out currently | 4 cron runs last hour, all succeeded |
| Storage or file traffic | Ruled out by screenshot | Storage and network are 0% |
| Realtime/live updates | Ruled out by screenshot | Live updates are 0% |
| Large table scans from app data | Low probability today | Tables are tiny; scans exist but row counts are small |
| Lovable Cloud usage chart lag/aggregation | Probable | Screenshot is Last day; live DB is idle |

### 4. Causes not yet fully ruled out

These require implementation or deeper inspection:

1. **Exact per-query usage over the last day**
   - Not available until `pg_stat_statements` is enabled.

2. **Exact source of `subscription_id` errors**
   - Need to inspect migrations and current backend metadata state.

3. **Cloud-side billing attribution details**
   - The usage UI may count fixed database instance time, not just query CPU. If so, a quiet database can still show high “database server” share simply because no other services are being used.

4. **Historical samples from before prior fixes**
   - The Last day window can still include older hot periods until they roll off.

### 5. Full remediation plan

#### Phase 1 — Add reliable observability

1. Enable query-level statistics:

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

2. Add an admin-only RPC to read the top query consumers safely from the Settings/System Status UI.

3. Add a small admin “Database Diagnostics” panel showing:
   - active queries
   - scheduled jobs
   - recent job failures
   - top database tables by size
   - top query consumers once stats are available

This prevents future guesswork.

#### Phase 2 — Stop internal log tables from growing again

Add a managed daily cleanup job for internal background-job logs:

- Keep `cron.job_run_details` for 7 days
- Keep `net._http_response` for 1 day
- Keep `public.job_run_logs` for 30 days

Expose this cleanup job in the existing **Settings → Background Jobs** section so you can see whether it is on/off like the other jobs.

#### Phase 3 — Future-proof app query paths

Add safe indexes for the tables that already show repeated scans and will grow over time:

```sql
CREATE INDEX IF NOT EXISTS posts_status_published_at_idx
ON public.posts (status, published_at DESC)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS posts_status_scheduled_at_idx
ON public.posts (status, scheduled_at)
WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS leads_status_created_idx
ON public.leads (status, created_at DESC);

CREATE INDEX IF NOT EXISTS leads_email_normalized_idx
ON public.leads (email_normalized);
```

These are preventative. They will not dramatically change today’s usage because current row counts are small, but they prevent the same issue from returning as the site grows.

#### Phase 4 — Fix the recurring `subscription_id` error

1. Search all migrations for `subscription_id` and realtime subscription references.
2. Compare that against the current schema.
3. Apply the smallest safe fix:
   - remove stale app reference if it exists, or
   - repair the missing metadata column only if it is clearly safe.

This will be treated separately because touching realtime/internal metadata can be risky.

#### Phase 5 — Improve admin visibility and control

Update `BackgroundJobsSettings.tsx` to show:

- Current job state: on/off
- Last run time
- Last result
- Last error message
- Run count in last 24h
- Cleanup job state
- A warning if job logs are growing unusually fast

Also fix the existing Settings page typo where it queries `select_value` instead of `setting_value` before doing the corrected query. It causes an unnecessary failing database request on every Settings load.

### 6. Database impact report

| Change | Impact |
|---|---|
| Enable `pg_stat_statements` | SAFE: additive extension |
| Add admin diagnostics RPC | SAFE: additive function, admin-gated |
| Add cleanup cron | SAFE: deletes only internal logs/HTTP responses by age |
| Add indexes | SAFE: additive indexes |
| Fix Settings typo | SAFE: removes one bad query |
| Investigate `subscription_id` drift | Needs separate review before changing |

### 7. Recommended immediate next steps

1. Ship Phases 1, 2, 3, and 5.
2. Let the Last day chart roll for 12–24 hours.
3. Recheck usage.
4. If it still shows 99%, use the new diagnostics panel and `pg_stat_statements` to identify exact SQL cost.
5. Investigate the `subscription_id` issue separately once the safe observability/cleanup work is in place.

### Final assessment

**Confidence: high** that the database is not currently pegged by active workload.

**Confidence: high** that the 99% screenshot is a usage-attribution/last-day-window issue dominated by database-side background and internal log overhead, not a live runaway app query.

**Confidence: medium** on the `subscription_id` issue being harmless; it is low-volume now, but it should still be repaired because repeated backend errors are never something to ignore.
