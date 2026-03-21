# Medic Node Remaining Report (Module 2)

Last updated: 2026-03-21
Scope: `/portal/field-node/*`

## Completed in this module

### Workflow 2.1 Shift and Queue Management
- Duty toggle UI implemented.
- Queue cards implemented for critical, urgent, and routine jobs.
- Dispatch alert screen implemented with accept/pass actions.

### Workflow 2.3 Offline-First Vitals Capture
- Vitals form UI implemented (BP, temperature, SpO2).
- Online/offline status badge implemented.
- Local persisted state via Zustand configured for field-node flow.

### Workflow 2.4 Tele-Triage Connection (UI layer)
- Video-call screen implemented with PiP doctor panel and live vitals overlays.
- Call controls UI implemented.

### Architecture and routing
- Portal route namespace implemented: `/portal/field-node/*`.
- Desktop side drawer and mobile bottom nav patterns implemented.
- Legacy redirects normalized under `/medic/*` to avoid route-group conflicts.

---

## Remaining gaps before Module 2 is truly complete

### Workflow 2.2 Field Execution and Navigation
- `Start Travel` action is not yet wired to deep-link launch:
  - `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`
- `Slide to Arrive` anti-mis-tap interaction not implemented.
- No backend status transition to `ARRIVED` yet.

### Dispatch and queue integration
- Queue data is mock data; no realtime feed from backend.
- Alert timeout and auto-reassignment logic is UI-only.
- Accept/pass actions are not synced to backend dispatch engine.

### Offline sync engine (critical technical gap)
- IndexedDB queue is not implemented yet.
- No replay/flush mechanism when connection restores.
- No conflict resolution policy for stale updates.

### Tele-triage integration
- WebRTC session is UI placeholder only.
- No media permission handling, retry flow, or network quality states.
- No secure room token creation/validation.

### Security and reliability
- No role guard middleware enforcement for medic routes yet.
- No audit/event logs for status transitions.
- No robust failure states (dispatch lock failure, upload retry, call drop recovery).

### QA and production readiness
- No module-specific automated tests yet.
- Accessibility pass pending (keyboard, focus order, aria labels for controls).
- Performance checks pending on low-end mobile devices.

---

## Suggested completion order for Medic hardening

1. Add backend dispatch wiring and status transitions.
2. Implement Google Maps deep-link + Slide to Arrive handshake.
3. Implement IndexedDB offline queue + sync replay.
4. Implement real WebRTC room flow and call-state handling.
5. Add role guards, telemetry, and error-recovery states.
6. Add E2E tests for: alert -> accept -> vitals -> call -> case handoff.
