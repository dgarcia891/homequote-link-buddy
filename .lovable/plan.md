

## Analysis

The "Send Test Email" button spins indefinitely because:

1. **Edge function auth failure**: The function uses `authClient.auth.getClaims(token)` which may not be available in supabase-js v2.98.0. This causes a silent crash with no response returned to the client.
2. **No timeout**: The `handleTest` function awaits indefinitely with no timeout, so if the edge function hangs or crashes, the spinner never stops.
3. **No visible error feedback**: Errors from the edge function invocation are caught but only shown as a brief toast. No persistent log/response panel exists.

## Plan

### 1. Fix the edge function authentication
Replace `getClaims(token)` with `getUser()` which is the reliable method in supabase-js v2.x. This will properly validate the JWT and return the authenticated user. Redeploy the function.

### 2. Add timeout to the test email call
Wrap the `supabase.functions.invoke` call in a `Promise.race` with a 15-second timeout so the button never spins forever.

### 3. Add a response log panel to the Settings UI
Below the Save/Test buttons, add a collapsible "Response Log" section that displays:
- Timestamp of the request
- Status (success/error)
- Full error message or success confirmation
- Each test attempt appends to the log so the user can see history

This replaces ephemeral toasts with a persistent, scrollable log area.

### 4. Improve error extraction from edge function responses
The current error handling tries to read `error.context` but this pattern is fragile. Instead, use the raw `fetch` response approach or handle the `FunctionsHttpError` type properly to always extract the response body.

### Files changed
- `supabase/functions/notify-admin-email/index.ts` — replace `getClaims` with `getUser`
- `src/pages/admin/Settings.tsx` — add timeout, response log panel, better error handling

