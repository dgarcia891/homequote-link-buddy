

# Performance Maintenance Plan — Code Splitting & Quick Wins

## 1. Code-Split All Routes in `src/App.tsx`

Convert all 41 page imports to `React.lazy()` with a shared `Suspense` fallback. Group them logically:

- **Public pages** (Index, ThankYou, FAQ, Blog, etc.)
- **Service pages** (HVAC, Electrical, Landscaping)
- **Admin pages** (Dashboard, LeadDetail, Buyers, etc.)
- **Auth pages** (Login, ProviderLogin, ResetPassword)

Add a simple loading spinner component inline as the `Suspense` fallback.

## 2. QueryClient Defaults in `src/App.tsx`

Add sensible defaults to reduce redundant fetches:
```text
staleTime: 5 minutes
gcTime: 10 minutes
retry: 1
```

## 3. Enhance 404 Page (`src/pages/NotFound.tsx`)

- Add `Header`, `Footer`, `PageMeta` with `noIndex`
- Downgrade `console.error` to `console.warn`

## 4. Sitemap Gap Fix (`supabase/functions/sitemap/index.ts`)

- Add `/blog/tag/*` and `/blog/category/*` dynamic URLs from the `blog_posts` table

## Files Changed

| File | Change |
|---|---|
| `src/App.tsx` | Lazy imports, Suspense wrapper, QueryClient defaults |
| `src/pages/NotFound.tsx` | Add Header/Footer/PageMeta/noIndex |
| `supabase/functions/sitemap/index.ts` | Add blog tag/category URLs |

