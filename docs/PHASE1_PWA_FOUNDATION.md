# Phase 1 — installable PWA foundation

Target: Android Chrome, iPhone Safari, desktop Chrome/Edge. Existing features stay intact.

## Baseline findings (2026-10-17)
- Existing app uses plain HTML/JS with Supabase authentication, tables, and Edge Functions.
- Existing manifest has a GitHub Pages-specific absolute scope and ID.
- Existing service worker hard-coded the Pages path and precached ?v=20260910-4 while HTML imports ?v=20260910-5.
- `usage-cost.js` was not in the old worker precache.
- Anonymous signup and browser localStorage tokens are unsuitable for paid subscriptions without security redesign.
- Supabase production project `pbanjavtyzcqllpcgizh` is inactive; no database or production deployment changes made.

## Changes in this branch
- Service worker determines its scope from `self.registration.scope`, not a hardcoded GitHub Pages path.
- Align app-shell requests to the actual HTML asset version and include `usage-cost.js`.
- Cache only same-origin known static assets and navigation fallback, never API responses or authorization requests.
- Preserve the current manifest identity for existing installed users; migration to another domain needs a deliberate install/migration plan.

## Smoke-test checklist before merge
1. Serve the branch from an HTTPS staging URL; open DevTools > Application > Service Workers.
2. Check that worker activates and Cache Storage contains the v5 cache.
3. Switch Offline; reload the root app path. UI shell should load; login and live translations must be clearly understood as requiring network.
4. Switch Online; reload; verify all scripts load with no 404 or stale errors.
5. Install via Android Chrome; launch from Home screen.
6. On iPhone Safari, Share > Add to Home Screen; launch it.
7. Desktop Chrome/Edge: use install prompt; verify standalone mode.
8. Supabase must be restored or a separate staging backend connected before testing real authentication, room joining, chat, and translation.

## Phase 1 next tasks for Codex
- Add a staging build config and separate Supabase project keys without changing production.
- Add a visible offline/connection-error banner and an actionable recovery screen.
- Introduce platform-specific 5-language install instructions.
- Audit keyboard, viewport resizing, safe-area, and accessibility.
- Add automated installability and smoke checks (Playwright) in CI.
- Audit Auth/RLS/Edge Function authorization prior to paid-user launch.
- Never place service-role keys or external AI API secrets into the browser.

Do not merge or deploy without functional tests on target devices.
