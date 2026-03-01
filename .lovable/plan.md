

# Implement Lead Scoring Logic + FAQ Page

Two tasks from your message: replace the scoring stub with real weighted logic, and add a public FAQ page with homeowner and buyer sections.

---

## 1. Replace Lead Scoring Stub

**File:** `src/services/leadScoringService.ts`

Replace the stub with weighted scoring based on four factors:

**Urgency (0-40 points)**
- emergency: +40, urgent: +25, soon: +10, flexible: +0

**Service Type (0-20 points)**
- Sewer Line / Repiping: +20
- Water Heater / Leak Detection / Emergency Plumbing: +15
- Drain Cleaning / Fixture Installation / General Plumbing: +5
- Other: +0

**Data Completeness (0-20 points)**
- Email provided: +10
- Description 50+ chars: +10, else 20+ chars: +5

**Source Quality (0-10 points)**
- No utm_source (direct/organic): +10
- gclid present (paid search): +5

Max possible score: ~90-100. The function signature stays the same (`scoreLead(lead: LeadInsert): number`), so nothing else changes.

---

## 2. Add Public FAQ Page

**New file:** `src/pages/FAQ.tsx`

A clean, public page using the existing `Header`, `Footer`, and `PageMeta` components plus the existing `Accordion` component from shadcn/ui. Two sections:

- **For Homeowners** -- 10 questions covering how it works, cost, response times, areas served, privacy, emergencies
- **For Plumbers (Buyers)** -- 10 questions covering what a lead is, exclusivity, delivery, refunds, scoring, pausing, expanding

Content is exactly the FAQ text from your message above.

**Route:** Add `/faq` route in `src/App.tsx`.

**Navigation:** Add a "FAQ" link to the public `Header` component in `src/components/public/Header.tsx`.

---

## Technical Summary

| Change | File |
|---|---|
| Replace scoring stub | `src/services/leadScoringService.ts` |
| New FAQ page | `src/pages/FAQ.tsx` (new) |
| Add /faq route | `src/App.tsx` |
| Add FAQ nav link | `src/components/public/Header.tsx` |

No database, schema, or RLS changes needed.

