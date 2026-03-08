

# Admin Pages for Users, Reviews & Buyer Profiles

## What We're Building
Three new admin pages to give full visibility and management over the public-facing user system:

1. **Homeowners** (`/admin/homeowners`) — View all registered homeowner accounts, their linked leads, and review activity
2. **Reviews** (`/admin/reviews`) — Moderate all reviews, view ratings, approve/delete reviews, see buyer responses  
3. **Buyer Profiles** (`/admin/buyer-profiles`) — View/edit public buyer profiles, see AI-enriched data, manage profile status

## Changes

### 1. New page: `src/pages/admin/Homeowners.tsx`
- Table listing all `homeowner_profiles` with columns: Name, Email, Phone, Linked Leads count, Signup Date
- Click a row to see detail: linked leads list, reviews they've posted
- Search by name/email
- No create/edit — these are user-managed accounts

### 2. New page: `src/pages/admin/Reviews.tsx`  
- Table of all `reviews` with columns: Reviewer (from homeowner_profiles or reviewer_user_id), Provider (buyer business_name), Rating (stars), Review text (truncated), Buyer Response (yes/no), Date, Verified badge
- Actions: Delete review, toggle verified status
- Filter by rating, by buyer, by date range

### 3. New page: `src/pages/admin/BuyerProfiles.tsx`
- Table of all `buyer_profiles` joined with `buyers` — columns: Business Name, Description (truncated), Website, License, Years in Business, Has AI Data
- Click to view full detail including AI enrichment data
- Admin can edit any profile fields

### 4. Update `AdminLayout.tsx`
Add three nav items:
- "Homeowners" with `UserCheck` icon → `/admin/homeowners`
- "Reviews" with `Star` icon → `/admin/reviews`  
- "Profiles" with `Building` icon → `/admin/buyer-profiles`

### 5. Update `App.tsx`
Add three protected routes.

### 6. RLS — Already Sufficient
All three tables already have `is_admin()` ALL policies, so admin reads/writes are covered. No migration needed.

## Files to create/modify
| File | Action |
|---|---|
| `src/pages/admin/Homeowners.tsx` | New |
| `src/pages/admin/Reviews.tsx` | New |
| `src/pages/admin/BuyerProfiles.tsx` | New |
| `src/components/admin/AdminLayout.tsx` | Add nav items |
| `src/App.tsx` | Add routes |

