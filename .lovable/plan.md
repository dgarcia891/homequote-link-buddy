

# Public Reviews + Buyer Portal + Homeowner Auth

This is a significant feature set with three major components. Here's the plan.

---

## 1. Database Schema (migration)

### `reviews` table
Public-facing reviews tied to leads and buyers.
```sql
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  buyer_id uuid REFERENCES buyers(id),
  reviewer_user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  buyer_response text,
  buyer_responded_at timestamptz,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```
RLS: authenticated users can INSERT their own, anyone can SELECT, buyers can UPDATE their response (via edge function).

### `buyer_profiles` table
Public-facing buyer/provider profiles.
```sql
CREATE TABLE public.buyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES buyers(id) ON DELETE CASCADE UNIQUE,
  user_id uuid NOT NULL, -- auth user linked to this buyer
  company_description text,
  logo_url text,
  website text,
  years_in_business integer,
  license_number text,
  ai_enriched_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```
RLS: public can SELECT, owner can UPDATE.

### `homeowner_profiles` table
Minimal profile for homeowner auth (linked to leads).
```sql
CREATE TABLE public.homeowner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  phone text,
  linked_lead_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

---

## 2. Auth Flows

### Homeowner Auth
- New `/login` public page with email/password signup and login
- On signup, create `homeowner_profiles` entry
- After login, homeowners can view their leads, post reviews for the buyer they were matched with
- Link their account to existing leads by matching email

### Buyer Auth
- New `/provider/login` page for buyers to sign up / log in
- On signup, link to existing `buyers` record by matching email
- Creates `buyer_profiles` entry for public profile data

---

## 3. Frontend Pages

### `/providers` — Provider Directory (public)
List of active buyers with their profiles, average rating, review count. Searchable by service type and city.

### `/providers/:id` — Provider Detail (public)
Company info, reviews, average rating. Buyers see "Respond" button on their own reviews.

### `/account` — Homeowner Dashboard (auth required)
View past leads, leave reviews for matched providers.

### `/provider/dashboard` — Buyer Portal (auth required)
View their profile, edit company info, see reviews, respond to reviews.

### `/provider/login` and `/login` — Auth pages

---

## 4. AI Company Auto-Fill

An edge function `ai-company-lookup` that takes a company name + city and uses Lovable AI to return structured company data (description, years in business, services offered, license info). Called from the buyer profile setup form to pre-fill fields. Uses `google/gemini-3-flash-preview` with tool calling for structured output.

---

## 5. Review System Rules
- Only homeowners with a completed lead (status = "sent" or "closed") for a specific buyer can review that buyer
- One review per lead
- Buyers can respond to reviews (one response per review)
- Reviews are publicly visible on provider profiles

---

## Files to Create/Modify

| File | Action |
|---|---|
| Migration (tables + RLS) | New |
| `src/pages/Login.tsx` | New — homeowner auth |
| `src/pages/Account.tsx` | New — homeowner dashboard |
| `src/pages/ProviderLogin.tsx` | New — buyer auth |
| `src/pages/ProviderDashboard.tsx` | New — buyer portal |
| `src/pages/Providers.tsx` | New — public directory |
| `src/pages/ProviderDetail.tsx` | New — public profile + reviews |
| `supabase/functions/ai-company-lookup/index.ts` | New — AI enrichment |
| `src/App.tsx` | Add routes |
| `src/components/public/Header.tsx` | Add "Providers" + login links |
| `src/hooks/useHomeownerAuth.ts` | New — homeowner session logic |
| `src/hooks/useBuyerAuth.ts` | New — buyer session logic |
| `src/components/reviews/ReviewCard.tsx` | New — reusable review display |
| `src/components/reviews/ReviewForm.tsx` | New — review submission form |
| `src/components/reviews/StarRating.tsx` | New — star rating input |

No changes to existing admin auth — admin remains separate via `admin_users` table.

