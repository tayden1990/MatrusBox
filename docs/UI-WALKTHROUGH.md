# MatrusBox UI Walkthrough (with screenshot guide)

This guide walks through the main user flows in the web app and suggests where to capture screenshots. It also lists final polish items observed during review.

> Tip: For screenshots, open the app in a desktop browser (recommended width ≥ 1280px). Use the browser's built-in screenshot tool or DevTools device toolbar for consistent sizes.

## Prerequisites
- API running at http://localhost:4000 (Docker or local API)
- Web app running at http://localhost:3000
- Optional: Use demo credentials on Login page or run the included API test to create a fresh account.

## 1) Home page
- URL: `/`
- Content: Landing/entry page with app shell.
- Screenshot: "Home - Hero"

## 2) Authentication

### Login
- URL: `/auth/login`
- Steps:
  1. Click "🚀 Try Demo Account" to auto-fill and submit demo credentials, or enter valid credentials.
  2. On success, tokens are stored and you are redirected to Dashboard.
- Screenshot: "Login - form"
- Edge cases:
  - Wrong credentials → toast error
  - Loading state on submit shows spinner

### Register
- URL: `/auth/register`
- Steps:
  1. Fill Email, Password (≥6 chars), optional First/Last name
  2. Submit; on success, you are auto-logged-in and redirected to Dashboard
- Screenshot: "Register - form"
- Edge cases:
  - Missing/short password → client validation message
  - API error → error banner + toast

### Forgot Password (placeholder)
- URL: `/auth/forgot-password`
- Steps:
  1. Enter email and submit → shows confirmation message
- Screenshot: "Forgot Password - submitted"
- Notes: This is a UI placeholder; backend route not yet implemented.

## 3) Dashboard
- URL: `/dashboard`
- Behavior:
  - Loads analytics via Next.js API proxies (activity + dashboard stats)
  - "Start Study" navigates to the Study page
  - "Logout" clears tokens and returns to home
- Screenshots:
  - "Dashboard - header and stats"
  - "Dashboard - Quick Actions"
- Edge cases:
  - If proxies fail, fallback data is shown and errors are logged

## 4) Study session
- URL: `/study`
- Steps:
  1. Auto-starts a session on mount (demo mode)
  2. Shows a card; click to flip front/back
  3. Use Answer buttons (Correct / Incorrect / Skip) or keyboard shortcuts
     - Space = Flip card
  - 1/2/3 default to Skip/Incorrect/Correct (configurable in the help modal)
  - Optional: A/S/D and Arrow keys (←/↓/→) can mirror 1/2/3 when enabled in settings
  4. When no more cards, click "End Session" to see stats
- Screenshots:
  - "Study - card (front)"
  - "Study - card (back)"
  - "Study - end stats"
  - "Study - Shortcuts help modal"
  - "Study - Settings with A/S/D & Arrows enabled"
- Edge cases:
  - Start/Next/Answer errors → toast error, loading state visible
  - No cards → "No cards to study" message

## 5) Analytics
- URL: `/analytics`
- Tabs: Progress, Activity, Retention, Global Stats
- Behavior:
  - Each tab fetches via proxies; the UI defensively renders empty/zero values if data is missing
- Screenshots:
  - "Analytics - Progress tab"
  - "Analytics - Activity tab"
  - "Analytics - Retention tab"
  - "Analytics - Global Stats tab"
- Edge cases:
  - Proxies fail → yellow warning banner and empty states

## 6) Create Card
- URL: `/cards/create`
- Steps:
  1. Fill Front and Back (required); optional Explanation, Examples, Tags
  2. Use Cancel to return to Dashboard at any time
  3. Submit → success banner and form resets
  3. Optionally use "✨ Generate AI Card" to prefill demo content
- Screenshots:
  - "Create Card - form"
  - "Create Card - success"
- Edge cases:
  - Requires token for `/api/cards` → ensure you’re logged in
  - Validation: front/back required, difficulty 1–5
  - While AI is generating, the Create button is disabled to prevent duplicate submissions

---

## Final polish items

- Dashboard
  - Personalization: Replace static "Welcome back, Alex!" with the logged-in user's name from `localStorage.user`.
  - Data completeness: `sessionsToday` and `dueCards` are placeholders in the normalized payload; update when backend exposes fields.

- Study
  - Visible remaining cards count (if available from backend). ✓ Implemented
  - Confirmation before ending session when cards remain. ✓ Implemented
  - Keyboard support: Space to flip, 1/2/3 for skip/incorrect/correct. ✓ Implemented
  - Shortcuts help modal with configurable numeric mappings (persisted). ✓ Implemented
  - Optional A/S/D and Arrow key mirrors (toggle in settings). ✓ Implemented
  - Best-effort server sync of preferences via `/api/user/preferences` proxy; falls back to local storage. ✓ Implemented

- Auth
  - Forgot password is UI-only; wire to a backend endpoint when available.
  - Consider routing login/register through Next.js proxies for consistent server-side masked logging.

- Cards/Create
  - Cancel button to return to Dashboard. ✓ Implemented
  - Disable Submit while AI generation is in progress. ✓ Implemented

- Accessibility & UX
  - Ensure all interactive elements have descriptive `aria-label`s.
  - Keyboard support for flipping cards (Space) and answering (1/2/3 keys). ✓ Implemented
  - Prefer user’s color scheme automatically; current pages already support dark backgrounds in Study.

- Observability
  - Optionally add lightweight client debug console (toggle via URL) if you want to inspect HTTP and auth state in production-like environments.

---

## Optional: capture screenshots programmatically

You can use your browser for manual screenshots, or set up Playwright for automated capture.

Manual (Edge/Chrome):
1. Open page → Ctrl+Shift+I (DevTools) → Command menu → "Capture full size screenshot"

Automated (Playwright, optional):
1. Install once: `npx playwright install chromium`
2. Create a small script to visit pages and `page.screenshot()`

> Screenshots output to a `screenshots/` folder with page names and timestamps.
