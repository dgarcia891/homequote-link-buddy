

# Add Score Key Legend to Leads Dashboard

## What's changing
Add a small, always-visible legend below the page title explaining both score columns:

- **Lead Score**: The weighted quality score (based on urgency, service type, data completeness, source)
- **AI Authenticity**: The AI-generated score indicating how likely a lead is real vs spam/fake

The legend will show color-coded dots matching the existing badge colors so admins can quickly reference what the colors mean.

## Implementation

**File: `src/pages/admin/Dashboard.tsx`**

Add a compact legend/key section below the header (between the title row and the Tabs). It will display:

```
Score Key:
  AI Authenticity:  🟢 70-100 Likely Real  ·  🟡 40-69 Uncertain  ·  🔴 0-39 Likely Spam (auto-flagged < 30)
  Lead Score: Higher = better quality (max ~90-100)
```

Using small colored badge-style dots and muted text, consistent with existing UI patterns. Also rename the column header from "AI Auth" to "AI Authenticity" for clarity.

