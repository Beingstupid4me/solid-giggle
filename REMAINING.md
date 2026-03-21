# Sano Pulse - Section 1 Status Report

Last updated: 2026-03-21
Scope: Phase 3 roadmap Section 1 standing (Global Modules + Modules 1 to 4)

## 1) Executive Standing

### Implemented (MVP UI and routing)
- Module 1: Patient and Family portal routes and screens are implemented.
- Module 2: Field Node routes and screens are implemented.
- Module 3: Doctor routes and screens are implemented.
- Module 4: Admin routes and screens are implemented, including a control bridge for ops-level workflows.
- Unified portal login exists as a full-screen modal entry at `/portal` with role-based redirect map.
- Role-gated layouts are implemented for patient, field-node, doctor, and admin.
- Portal-wide UI normalization pass has been applied (downsized oversized typography and improved cross-module layout consistency).
- Next.js dev workflow is aligned to webpack mode (`next dev --webpack`) to avoid Next 16 Turbopack mismatch with current PWA plugin usage.
- Targeted lint fixes were applied for portal login overlay effect dependencies, booking submit callback dependencies, and geolocation watcher const usage.

### Partially implemented
- Global modules are incomplete against the roadmap.
- Most persona modules are UI-complete but backend/realtime/compliance hardening is still pending.
- Portal light/dark mode toggle UX is wired, but effective visual switching is currently not working reliably across portal surfaces (deferred for later fix).

### Not implemented in Section 1 scope
- CareHub Manager module (Module 5) remains outside current completion and is still pending.

---

## 2) Global Modules Status (Roadmap Section 0)

### 2.1 PWA shell (`next-pwa`)

#### Done
- `next-pwa` is configured in `next.config.ts`.
- `public/manifest.json` includes `id`, `start_url`, and `scope` targeting `/portal` as the app entry branch.
- Installed app entry is `/portal`, while non-portal website routes continue to work as regular web pages.
- Non-intrusive install prompt UI is implemented and shown for logged-in users across portal pages.

#### Remaining
- Offline fallback page and route-level caching strategy are not implemented.
- Install prompt UX can be refined further (placement variants and role-specific styling), but core flow is functional.

### 2.2 Authentication engine (Supabase OTP + role middleware)

#### Done
- Unified portal login modal is implemented at `/portal`.
- MVP role-based redirect logic exists in client code.
- Client-side role gate component enforces route access after hydration.
- Legacy `/portal/login` path behavior has been removed in favor of single-entry modal login flow.

#### Remaining
- Phone OTP via Supabase is not implemented in portal auth.
- Current auth is static credential map in Zustand (MVP only).
- No server middleware (`src/middleware.ts`) for authoritative role-based route enforcement.
- No profile table role fetch and middleware redirect pipeline yet.

### 2.3 Persistent state (global session)

#### Done
- Persisted auth store exists for portal session.
- Hydration-safe role guard exists to reduce flash/bypass behavior on refresh.
- Prior portal/login cascading navigation loop has been resolved by simplifying to a single `/portal` auth entry.

#### Remaining
- Session source-of-truth is not server-backed Supabase session yet.
- No full SSR auth strategy for protected routing.

---

## 3) Module-by-Module Standing (Section 1)

## Module 1: Patient and Family Persona

### Done
- Portal patient route set exists:
  - `/portal/patient`
  - `/portal/patient/profile`
  - `/portal/patient/booking`
  - `/portal/patient/tracking`
  - `/portal/patient/vault`
  - `/portal/patient/vault/[recordId]`
- Mobile + desktop patient scaffolding and navigation are implemented.
- Booking, tracking, profile/family, and vault UI flows are implemented.
- Logout is implemented and role-gated access is enforced.

### Remaining
- Persist profile/family and booking data to backend (current flow is largely MVP/local behavior).
- Real map integration and realtime medic movement for tracking.
- Payment authorization integration (Razorpay/UPI mandate).
- Prescription PDF generation/download implementation.

## Module 2: Field Node Persona

### Done
- Field node route set exists:
  - `/portal/field-node`
  - `/portal/field-node/alert`
  - `/portal/field-node/vitals`
  - `/portal/field-node/video-call`
- Duty/queue, alert, vitals, and tele-triage UI layers are implemented.
- Desktop/mobile shell and logout are implemented.
- Role-gated access is enforced.

### Remaining
- Deep-link travel and slide-to-arrive handshake.
- Backend status transitions and dispatch engine sync.
- IndexedDB offline queue and replay logic.
- Real WebRTC implementation (current video is UI-level placeholder).

## Module 3: Doctor Persona

### Done
- Doctor route set exists:
  - `/portal/doctor/queue`
  - `/portal/doctor`
  - `/portal/doctor/case-close`
- Triage queue, cockpit, and case closure UI are implemented.
- Desktop-first doctor shell with mobile adaptation is implemented.
- Role-gated access and logout are implemented.

### Remaining
- Realtime queue ingestion and live vitals subscriptions.
- Consult locking and strict state machine enforcement.
- WebRTC signaling/media stack.
- Transactional closure commit (SOAP + risk + sign-off + billing callback).

## Module 4: Central Admin Persona

### Done
- Admin route set exists:
  - `/portal/admin` (heatmap view)
  - `/portal/admin/control` (ops-parity control bridge)
  - `/portal/admin/operations`
  - `/portal/admin/roster`
  - `/portal/admin/analytics`
- Desktop-first admin shell with mobile bottom navigation is implemented.
- Force-assign modal and operations table UI are implemented.
- Roster and analytics UI are implemented.
- Realtime/dispatch/field-force/admin-invite capabilities are integrated via control bridge route.
- Role-gated access and logout are implemented.
- Admin control page redundant inner heading wrapper has been removed; content now starts directly in the admin content region with no extra outer encapsulation card.

### Remaining
- Central admin route still depends on MVP patterns for some logic.
- Hardening needed for full production-grade audit, access control, and monitoring semantics.
- Portal-wide light/dark mode behavior needs dedicated bug-fix pass (tracked but intentionally deferred for now).

---

## 4) Section 1 Left to Finish (Actionable)

1. Complete Global Modules first:
  - Expand offline support with explicit offline fallback routes/pages.
   - Replace static portal auth with Supabase OTP/session.
   - Add server middleware role enforcement.
2. Backend and realtime hardening for Modules 1 to 4:
   - Patient tracking/payment/vault persistence.
   - Field dispatch/offline sync/WebRTC.
   - Doctor realtime vitals/consult lifecycle/closure transaction.
   - Admin production-grade dispatch and audit security hardening.
3. Quality gates across Section 1:
   - module E2E tests
   - accessibility pass
   - lint and CI stabilization
  - remaining repo-wide lint backlog cleanup (including generated SW lint noise and older page/component warnings/errors)
4. Deferred UI bug to resolve in a separate pass:
  - fix portal light/dark mode so toggles reliably and visibly change theme for every role and page

---

## 5) Current Position Summary

- Section 1 UI and route coverage is substantially built through Module 4.
- Section 1 is not production-complete because backend/realtime hardening and full production auth enforcement are still open.
- Module 5 (CareHub Manager) is still pending and should start after Section 1 hardening priorities are closed.
