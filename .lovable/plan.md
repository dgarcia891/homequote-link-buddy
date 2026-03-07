

# Make Email Templates Prettier with HTML

## Problem
All notification emails are sent as plain text (`content: body`), which renders as a single block of unstyled text — as shown in the screenshot.

## Solution
Convert all email templates (new_lead, buyer_notification, buyer_inquiry, test) from plain text to HTML emails with clean, branded formatting. Use the `html` property in denomailer's `client.send()` instead of `content`.

## Changes

### `supabase/functions/notify-admin-email/index.ts`

1. **Add an HTML email wrapper function** — a reusable function that wraps email body content in a responsive HTML template with:
   - HomeQuoteLink branding (blue header bar with logo text)
   - Clean card-style layout for data fields (label: value rows with subtle borders)
   - Professional typography (font-family, sizing, colors matching the brand: blue primary, orange accents)
   - Mobile-responsive inline styles

2. **Convert each notification type** to produce HTML body instead of plain text:
   - **buyer_inquiry**: Structured card with sections for Business Info, Service Coverage, and Message
   - **new_lead**: Card with customer details, urgency badge (red for emergency), and CRM link button
   - **buyer_notification**: Clean layout with customer info and a prominent "Contact Now" call-to-action
   - **test**: Simple confirmation card

3. **Update `client.send()`** call to use `html: body` instead of `content: body` — denomailer supports the `html` property for HTML emails

### Design Details
- Header: Blue (#2563eb) bar with white "HomeQuoteLink" text
- Body: White card on light gray (#f4f5f7) background
- Data rows: Label in muted gray, value in dark text, separated by light borders
- CTA buttons: Orange (#f97316) with white text, rounded corners
- Footer: Small muted text with timestamp

