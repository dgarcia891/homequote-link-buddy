

# Add Email Change to Admin Settings

## Overview
Add an "Account" section to the Settings page where you can update your email address. This uses the built-in `supabase.auth.updateUser({ email })` method, which automatically sends a confirmation email to the new address. The email change only takes effect after the user confirms via the link sent to the new address.

## Changes

### 1. Update Settings page (`src/pages/admin/Settings.tsx`)
- Add an "Account" card above the existing "Email Notifications" card
- Show the current email (from `useAuth()`)
- Add a "New Email" input field and a "Change Email" button
- On submit, call `supabase.auth.updateUser({ email: newEmail })` which triggers a confirmation email to the new address automatically
- Show success/error toasts with clear messaging ("Check your new inbox to confirm")

### 2. No database or edge function changes needed
The auth system handles the confirmation email natively — no custom SMTP logic required for this. The confirmation email is sent by the auth provider built into the backend.

| File | Change |
|---|---|
| `src/pages/admin/Settings.tsx` | Add Account section with email change form |

