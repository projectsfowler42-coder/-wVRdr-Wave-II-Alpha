# R³ Comparative Audit

This audit is intentionally separate from the MDK probe audit.

## Lanes

### 1. Assistant audit

Checks structure, coverage, CI, safety boundaries, and direction of travel.

### 2. MDK probe audit

Checks whether MDK performs Sentinel / Judge / Archivist duties on artifacts and promotion decisions.

### 3. R³ integrity CI

Checks that the required R³ surfaces remain present and cannot be silently removed.

## Difference found

- MDK is stronger at judging outputs and promotion decisions.
- R³ integrity CI is stronger at detecting missing files/tokens.
- Assistant audit is better at seeing the gap between the two: code can exist and MDK can judge, but tests may still not execute as real TypeScript logic under CI.

## Direction

R³ is moving correctly:

1. Doctrine became code.
2. Code gained MDK gate.
3. Gate gained tests.
4. Tests are gaining CI and audit surface.

## Next improvement

The next better tool is an executable TypeScript test runner inside CI. The current comparative audit flags this as the main remaining gap.
