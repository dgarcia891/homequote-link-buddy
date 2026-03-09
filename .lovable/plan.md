
# Competitive Edge Features — Implementation Plan

## Overview
Implementing 4 conversion-focused improvements: inline lead form, sticky mobile CTA, service page FAQs with schema, and enhanced trust badges.

---

## 1. Inline Lead Form on Homepage

**File:** `src/pages/Index.tsx`

Add the `LeadCaptureForm` component directly below the hero section with a vertical selector, replacing the current CTA-only approach.

```text
[Hero Section]
    ↓
[NEW: Inline Form Card]
    "Get Your Free Quote"
    - Vertical selector (Plumbing, HVAC, etc.)
    - LeadCaptureForm embedded
```

---

## 2. Sticky Mobile CTA Bar

**New file:** `src/components/public/StickyMobileCTA.tsx`

A fixed bottom bar visible only on mobile (hidden on `md:` and up) that appears after scrolling past the hero. Uses `useEffect` with scroll listener to toggle visibility.

**Add to:** `src/pages/Index.tsx`, `src/components/public/ServiceLanding.tsx`

---

## 3. FAQ Schema on Service Landing Pages

**Edit:** `src/lib/verticalContent.ts`  
Add a `faqs` array (3-5 Q&A pairs) to each vertical config.

**New file:** `src/components/public/FAQSection.tsx`  
Accordion UI using existing Radix Accordion + JSON-LD script injection for rich snippets.

**Edit:** `src/components/public/ServiceLanding.tsx`  
Render `<FAQSection faqs={content.faqs} />` after the services section.

---

## 4. Enhanced Trust Badges

**Edit:** `src/components/public/TrustBadges.tsx`

Update copy to be more credible without fake stats:
- "100% Free Quotes" → keep
- "Local Plumbing Pros" → "Licensed & Insured Pros"
- "No Spam, Ever" → "No Obligation"

Add one more badge: "Fast Response" with Clock icon.

---

## Files Summary

| File | Action |
|---|---|
| `src/pages/Index.tsx` | Add inline form section + StickyMobileCTA |
| `src/components/public/StickyMobileCTA.tsx` | Create |
| `src/components/public/TrustBadges.tsx` | Update badges |
| `src/lib/verticalContent.ts` | Add FAQ data to each vertical |
| `src/components/public/FAQSection.tsx` | Create (accordion + JSON-LD) |
| `src/components/public/ServiceLanding.tsx` | Add FAQSection + StickyMobileCTA |

**Estimated:** 6 file changes
