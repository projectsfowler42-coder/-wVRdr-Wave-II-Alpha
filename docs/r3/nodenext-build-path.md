# R3 NodeNext Build Path Gate

Wave-II Alpha compiles R3 TypeScript with:

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext"
}
```

NodeNext requires relative runtime imports and exports to use executable extensions after TypeScript emits JavaScript.

Correct:

```ts
export * from "./truth.js";
import { buildThing } from "./thing.js";
```

Incorrect:

```ts
export * from "./truth";
import { buildThing } from "./thing";
```

## Gate

`pnpm test:r3` now runs:

```text
pnpm check:r3-imports
```

before TypeScript compilation and executable R3 tests.

The gate scans `r3/**/*.ts` and fails if a relative import/export lacks one of these runtime-safe extensions:

- `.js`
- `.json`
- `.mjs`
- `.cjs`

## Purpose

This prevents the R3 audit loop and executable tests from compiling cleanly but failing under Node because emitted imports do not resolve.

## Boundary

This is a build-integrity gate only. It does not change R3 doctrine, broker access, local vault policy, or execution permissions.