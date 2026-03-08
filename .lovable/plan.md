

# Filter Fake Emails + Rename "AI Authenticity" to "AI Quality Score"

## Two changes

### 1. Filter fake email domains on lead intake
Add email domain validation in both the client-side form and the `analyze-lead` edge function:

- **`src/components/forms/LeadCaptureForm.tsx`**: Add a Zod `.refine()` on the email field that rejects known fake/disposable domains (example.com, test.com, mailinator.com, guerrillamail.com, tempmail.com, throwaway.email, fakeinbox.com, yopmail.com, sharklasers.com, etc.). Show a clear error: "Please use a real email address."

- **`supabase/functions/analyze-lead/index.ts`**: Add the same domain blocklist check server-side. If the email domain matches, automatically penalize the score heavily (e.g., cap at 15) so it triggers the auto-spam-flag threshold.

### 2. Rename "AI Authenticity" → "AI Quality Score" everywhere

**Files to update:**
- **`src/pages/admin/Dashboard.tsx`**: 
  - Table header: "AI Authenticity" → "AI Quality Score"
  - Score Key legend: "AI Authenticity:" → "AI Quality Score:"
  
- **`src/pages/admin/LeadDetail.tsx`**: 
  - Section heading and any labels referencing "AI Authenticity" → "AI Quality Score"

- **`supabase/functions/analyze-lead/index.ts`**: 
  - Update the review_reason text from "AI score" to "AI Quality Score" for consistency

The database columns (`ai_authenticity_score`, `ai_authenticity_reason`) stay as-is — only the user-facing labels change.

