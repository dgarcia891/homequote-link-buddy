

# Early Lead Capture with Progressive Save

## Problem
Currently the form only saves data when the user clicks "Get My Free Quote." If they abandon the form after entering contact info, that lead is lost.

## Approach

### 1. Database migration — make most leads columns nullable
The `leads` table currently requires `full_name`, `phone`, `zip_code`, `city`, `service_type`, `urgency`, `description` as NOT NULL. To allow partial saves, we need to make everything except `phone` nullable (since we need at least one contact field to create the record). We'll also add a `status = 'partial'` convention for incomplete leads.

**Columns to make nullable:** `full_name`, `zip_code`, `city`, `service_type`, `urgency`, `description`

**Email becomes required** in the Zod schema (but stays nullable in DB for the partial save moment).

### 2. Make email required in form validation
Change the Zod schema from optional email to `z.string().email("Valid email required")`.
Update the label from "Email" to "Email *".

### 3. Add progressive save logic to `LeadCaptureForm.tsx`
- Track a `partialLeadId` ref so we only create one partial record per session
- Use `form.watch()` to monitor `phone` and `email` fields
- When **both** phone (10+ digits) and email (valid format) are filled, auto-insert a lead with `status: 'partial'` containing whatever data is available at that moment
- Store the returned `id` in the ref
- On final submit: if a partial lead exists, **update** it (fill remaining fields, set `status: 'new'`); otherwise insert as before
- The partial save fires silently — no UI indication to the user

### 4. Update `useLeads.ts`
- Ensure the admin leads list filters can show/hide partial leads (default: hide `status = 'partial'` from the main view, or show them in a separate tab later)

### Files changed
- `supabase/migrations/` — new migration to ALTER columns to nullable
- `src/components/forms/LeadCaptureForm.tsx` — progressive save logic, email required
- `src/hooks/useLeads.ts` — minor: exclude partial leads from default admin query

