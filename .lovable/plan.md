

## ADA/WCAG 2.1 AA Compliance Fixes

### 1. Skip-to-content link (App.tsx + Index.tsx pattern)
- Add a visually-hidden "Skip to main content" link as the first focusable element inside `<BrowserRouter>` in `App.tsx`
- Add `id="main-content"` to `<main>` elements across pages (Index, Blog, FAQ, etc.) — or wrap route content in a `<main>` in App.tsx

### 2. Header — aria-labels on icon-only nav links + decorative icon hiding
- Each nav `<Link>` has `<span className="hidden sm:inline">` text that disappears on mobile, leaving icon-only buttons without accessible names
- Add `aria-label` to each Link (e.g., `aria-label="Providers"`)
- Add `aria-hidden="true"` to all decorative `<Icon>` components in the header (Wrench logo icon, nav icons next to visible text)
- Wrap nav links in a `<nav aria-label="Main navigation">`

### 3. Footer — nav landmarks + decorative icons
- Wrap each link list section in `<nav aria-label="Services">`, `<nav aria-label="Resources">`, etc.
- Add `aria-hidden="true"` to the decorative Wrench icon

### 4. LeadCaptureForm — focus management on step change
- After `setStep()` in `handleNext` and `handleBack`, use `useRef` + `useEffect` to focus the first input of the new step (or a heading/container with `tabIndex={-1}`)
- Add `aria-label` to the Progress bar describing current step (e.g., `aria-label="Step 2 of 3: Location"`)
- Add `aria-live="polite"` region to announce step changes to screen readers
- Add `aria-hidden="true"` to decorative ArrowLeft/ArrowRight/Loader2 icons

### 5. Toaster — live regions
- The shadcn `<ToastViewport>` already uses `role="region"` but lacks `aria-live`. Add `aria-live="polite"` and `aria-atomic="true"` to the toast viewport or wrap toasts in a live region
- Check `src/components/ui/toast.tsx` for the viewport component

### Files to modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Add skip-to-content link, wrap routes in `<main id="main-content">` |
| `src/components/public/Header.tsx` | Wrap in `<nav>`, add aria-labels, aria-hidden on icons |
| `src/components/public/Footer.tsx` | Wrap link lists in `<nav>` elements, aria-hidden on icon |
| `src/components/forms/LeadCaptureForm.tsx` | Focus management on step change, aria-label on progress, aria-live region, aria-hidden on icons |
| `src/components/ui/toast.tsx` | Add aria-live to ToastViewport |
| `src/pages/Index.tsx` | Remove redundant `<main>` wrapper if moved to App.tsx (or add `id="main-content"`) |

