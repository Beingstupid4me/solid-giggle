# Doctor Node Remaining Report (Module 3)

Last updated: 2026-03-21
Scope: `/portal/doctor/*`

## Completed in this module

### Workflow 3.1 Triage waiting room (UI baseline)
- Queue board implemented with status lanes:
  - Pending verification
  - Medic arrived (ready)
  - In consultation
  - Case review
- Case selection action implemented in local store.
- Start/open consultation flow wired to cockpit route.

### Workflow 3.2 Split-screen cockpit (UI baseline)
- Video hemisphere scaffold implemented (doctor-side controls and field feed panel).
- Live vitals cards panel implemented.
- SOAP authoring panel implemented with Subjective, Objective, Assessment, Plan inputs.
- End consult action routed into case closure screen.

### Workflow 3.3 Case closure and risk tagging (UI baseline)
- Risk classification card selector implemented.
- Prescription preview section implemented.
- Attestation and signature placeholders implemented.

### Architecture and access
- Portal namespace active at `/portal/doctor/*`.
- Desktop-first shell and mobile bottom-nav adaptation implemented.
- Role guard now enforced for doctor routes using shared portal role gate.

---

## Remaining gaps before Module 3 is truly complete

### Realtime and workflow integrity
- Queue is currently mock/persisted data; no realtime case ingestion from backend.
- No strict server-side state machine to prevent invalid transitions.
- No consult lock to prevent two doctors opening the same case simultaneously.
- No timer synchronization with billing engine.

### Tele-triage and media stack
- WebRTC is UI-only; no room negotiation, ICE/STUN/TURN, or token handshake.
- No call quality telemetry (packet loss, reconnect state, bandwidth drop behavior).
- No media permission fallback UX and no camera/mic failure recovery paths.

### Live vitals integration
- Vitals panel is static data; not subscribed to Supabase Realtime yet.
- No stale-data indicator or source-of-truth timestamping per metric.
- No high-risk threshold alerting (for example, SpO2 drop alerts) in cockpit.

### Clinical closure enforcement
- Risk tag and digital sign-off are visually present but not hard-blocked by backend rules.
- Finalize action does not yet commit SOAP, prescription, and closure payload transactionally.
- No auto-generation/storage for signed prescription artifact (PDF or immutable record).

### Security, compliance, and auditability
- Missing encounter-level audit log events:
  - consultation start
  - vitals viewed
  - SOAP modified
  - case finalized
- No PHI redaction policy in UI logs/debug output.
- No backend role-claim validation before write actions.

### QA and production readiness
- No doctor module integration tests for full consultation lifecycle.
- No e2e for triage -> cockpit -> case close -> finalized billing handoff.
- Accessibility pass pending for dense desktop layout and keyboard navigation.
- Performance validation pending for tablet viewport and constrained network conditions.

---

## Suggested completion order for Doctor hardening

1. Wire realtime queue/vitals subscriptions and server-backed consultation locking.
2. Integrate WebRTC signaling, tokenized room joins, and reconnect states.
3. Implement strict closure transaction:
   - validate mandatory risk tag and signature
   - persist SOAP + prescription + closure atomically
4. Wire billing finalization callback after successful case closure commit.
5. Add audit logs and role-claim validation for every mutating action.
6. Add module-level e2e and accessibility/performance test gates.
