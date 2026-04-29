# packages/wave-i

Mirror slot for `projectsfowler42-coder/wVRdr_Wave-I_Build/artifacts/wave-i`.

This package owns the Wave-I cockpit/PWA/operator surface:

- War Room / cockpit HUD
- truth badges
- local capture/WAL display
- manual bridge UX
- S22 Ultra PWA target

Phase 1 rule: Wave-I `App.tsx` remains untouched. The Alpha bridge client is opt-in through `VITE_ALPHA_BRIDGE_URL` and must never promote fallback/degraded data to LIVE.

Expected source repo path:

```text
https://github.com/projectsfowler42-coder/wVRdr_Wave-I_Build/tree/main/artifacts/wave-i
```
