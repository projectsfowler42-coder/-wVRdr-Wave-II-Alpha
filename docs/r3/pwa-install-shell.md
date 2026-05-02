# R3 Cockpit PWA Install Shell

This document records the Wave-II Alpha cockpit install-shell boundary.

## Added metadata

The cockpit `index.html` declares:

- mobile viewport with `viewport-fit=cover`
- light-only color scheme
- ivory `theme-color`
- app description
- Android install metadata
- Apple install metadata
- manifest link
- app icon link

## Manifest

`apps/cockpit/public/manifest.webmanifest` defines:

- `display: standalone`
- `orientation: landscape-primary`
- ivory background and theme color
- `wVRdr~` short name
- SVG maskable icon

## Boundary

The PWA shell is only a presentation/install layer.

It does not enable:

- broker transport
- credential storage
- OAuth
- order routing
- raw private-row storage
- background sync
- service-worker cache of sensitive data

Service-worker/offline caching is intentionally not added in this patch because Wave-II Alpha should not cache broker-like private data until the local vault policy is fully enforced.