

# AI Lead Authenticity Scoring

## Overview
Add an AI-powered authenticity analysis that evaluates incoming leads using Lovable AI (Gemini) to detect spam, fake submissions, and low-quality leads. Each lead gets an **authenticity score (0-100)** and a short AI reasoning summary.

## Database Changes
Add two columns to the `leads` table:
- `ai_authenticity_score` (integer, nullable) — 0-100 score
- `ai_authenticity_reason` (text, nullable) — short AI explanation

## New Edge Function: `analyze-lead`
- Receives a lead ID, fetches lead data from the database
- Sends lead details (name, phone, email, description, city, service type, urgency) to Lovable AI using tool calling to extract structured output
- AI evaluates signals: gibberish name/description, mismatched location data, suspicious patterns, vague descriptions, disposable email domains
- Returns `{ score: number, reason: string }` and updates the lead record
- Uses `LOVABLE_API_KEY` (already configured)

## Auto-Trigger on Lead Submission
- After a lead is successfully submitted in `LeadCaptureForm.tsx`, fire-and-forget call to `analyze-lead` edge function
- Also callable manually from the admin Lead Detail page via a "Re-analyze" button

## Admin UI Updates

**Lead Detail page** — Show authenticity score as a color-coded badge (green 70-100, yellow 40-69, red 0-39) with the AI reasoning text below it.

**Leads list** — Add an authenticity score column so admins can quickly spot suspicious leads.

## Technical Details

- Edge function uses Gemini Flash (`google/gemini-3-flash-preview`) with tool calling to return structured `{ score, reason }`
- The AI prompt instructs the model to evaluate: name plausibility, description quality/relevance, email domain reputation, phone format, geographic consistency, and overall coherence
- Config.toml updated with `[functions.analyze-lead]` and `verify_jwt = false`

