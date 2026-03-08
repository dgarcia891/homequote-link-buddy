

# HomeQuoteLink -- Competitive Review and Recommendations

## What You Have Today

HomeQuoteLink is a **local plumbing lead gen marketplace** for the Santa Clarita Valley. Two audiences: homeowners (submit quote requests) and plumbers/buyers (receive exclusive leads). You have:

- Homepage with service cards and city list
- City-specific landing page with lead capture form (progressive save for partials)
- Plumber application page
- Admin dashboard with lead management, buyer management, routing, settings
- Blog (CMS-backed), FAQ, Thank You page
- Lead scoring, email notifications, tracking params

## How You Compare to Industry Leaders

Sites like **Angi (formerly HomeAdvisor), CraftJack, Thumbtack, and HomeGuru** set the bar for plumbing lead gen. Here is where you stand:

```text
Feature                    You    Angi/Thumbtack    Gap
─────────────────────────  ─────  ────────────────  ─────────────────────
Trust signals / reviews    No     Yes               Big gap
Photo upload in form       No     Yes               Medium gap
Multi-step form wizard     No     Yes               Medium gap
Cost estimator / pricing   No     Yes               Big gap
Live chat / chatbot        No     Yes               Medium gap
SMS notifications          No     Yes               Medium gap
Buyer self-serve portal    No     Yes               Big gap
Google reviews / schema    No     Yes               Medium gap
Mobile speed / LCP         OK     Optimized         Minor
Retargeting / follow-up    No     Yes               Medium gap
```

---

## Recommended Next Steps (Priority Order)

### 1. Add Social Proof and Trust Signals
**Why:** The #1 conversion driver on competitor sites. Your landing page has zero testimonials, review counts, or trust badges.

- Add a "Trusted by X homeowners" counter on the hero
- Add 3-5 testimonial cards (can be static/hardcoded initially) below the form
- Add trust badges: "Licensed & Insured Pros", "No Spam Guarantee", "100% Free"
- Add JSON-LD structured data (LocalBusiness schema) for SEO

### 2. Convert the Lead Form to a Multi-Step Wizard
**Why:** Angi/Thumbtack use multi-step forms because they convert 20-40% better than single long forms. Your current form has 9 fields on one page -- intimidating.

- Step 1: Service type + urgency (low friction start)
- Step 2: City + ZIP
- Step 3: Name, phone, email, description, consent
- Progress bar at top
- Keep the progressive partial save (already built)

### 3. Add a Cost Estimator / Pricing Guide
**Why:** "How much does X cost?" is the top search query for plumbing. This drives organic traffic and builds authority.

- Static page at `/cost-guides` or `/pricing`
- Price ranges by service type (e.g., "Drain Cleaning: $150-$350")
- CTA at bottom of each guide: "Get an exact quote for free"
- Good for SEO long-tail keywords

### 4. Build a Buyer Self-Service Portal
**Why:** Right now buyers have zero visibility. CraftJack/Angi let buyers log in, see their leads, accept/reject, request refunds, and adjust settings. This reduces your admin workload significantly.

- Buyer login (separate from admin)
- View assigned leads with status
- Accept/reject leads
- Request refund on bad leads
- Update coverage areas and daily cap

### 5. Add SMS/Text Notifications for Lead Delivery
**Why:** Email open rates for lead notifications are ~30%. SMS is ~95%. Speed-to-lead is critical -- competitors deliver via SMS.

- Send buyer an SMS when a new lead is matched
- Send homeowner a confirmation text after submission
- Use a backend function with Twilio or similar

### 6. Implement Review/Rating Collection
**Why:** After a job is completed, collecting a review creates a flywheel -- reviews attract more homeowners, more homeowners attract more plumbers.

- Follow-up email to homeowner 3-5 days after lead delivery
- Simple star rating + short review
- Display aggregated ratings on the site

### 7. Add Photo Upload to Lead Form
**Why:** Photos help plumbers estimate jobs more accurately, leading to higher conversion. Thumbtack and Angi both support this.

- Optional photo upload field (1-3 images)
- Store in file storage bucket
- Display in admin lead detail view

### 8. Expand to More Cities / Verticals
**Why:** Your infrastructure (routing, scoring, buyer management) is city-agnostic. Expanding is mostly content + marketing.

- Create templated city landing pages (you already have the `cityData` pattern)
- Consider adjacent verticals: HVAC, electrical, roofing
- Each city page is an SEO asset

---

## Quick Wins (Low Effort, High Impact)

| Quick Win | Effort |
|---|---|
| Add 3 static testimonial cards to landing page | 1 message |
| Add trust badges row below hero | 1 message |
| Add JSON-LD LocalBusiness schema to head | 1 message |
| Add "X homeowners helped" counter | 1 message |
| Add Open Graph image for social sharing | 1 message |

---

## Summary

Your backend (scoring, routing, partial saves, admin dashboard) is ahead of most early-stage lead gen sites. Your biggest gaps are on the **public-facing conversion side**: no social proof, long single-page form, no pricing content, and no buyer portal. Addressing items 1-3 above would bring you much closer to industry standard and likely improve conversion rates significantly.

