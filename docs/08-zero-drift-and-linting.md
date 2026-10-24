---
title: Zero Drift and Linting
description: Prevent design inconsistency with zero-drift checks. Learn about drift detection algorithms and instructions for AI coding agents.
---

Zero drift ensures that styling remains consistent over time. It prevents developers and AI coding agents from introducing unapproved spacing, arbitrary colors, or excessive border radiuses.

## Key features

* **Drift detection engine** - Audit style definitions for off-system values with `checkDrift()`.
* **Compile-time type guardrails** - Cause build failures when undeclared token strings are used.
* **Agent prompt instructions** - Standardized instructions for AI coding assistants.
* **Deliberate escape hatch** - Mark intentional deviations with `!custom`.

## Checking for design drift

The `@fractaldesign/fsgpui/check` module audits style objects for compliance:

```ts
import { checkDrift } from '@fractaldesign/fsgpui/check';
import { theme } from './theme.js';

const auditResults = checkDrift({
  gap: '13px',            // ❌ Off-system value
  padding: 'md',          // ✅ Valid token (12px)
  borderRadius: 'curved'  // ✅ Valid token (8px)
}, theme);

console.log(auditResults.valid); // false
console.log(auditResults.violations);
// [
//   {
//     property: 'gap',
//     value: '13px',
//     message: 'Value "13px" is not a declared token. Did you mean "sm" (8px) or "md" (12px)?'
//   }
// ]
```

## AI coding agent guardrails

Paste these instructions into your project AGENTS.md or AI system prompt:

```markdown
We are using @fractaldesign/fsgpui for styling.
1. Always use configured token keys (e.g. gap: 'sm', borderRadius: 'modern', backgroundColor: 'bgSurface').
2. If an off-system value is strictly required, append ' !custom' (e.g. '13px !custom').
3. Follow Fractal rules: maximum border-radius is 4px ('modern') or 8px ('curved').
4. Do not introduce borders around adjacent cards or containers.
```

## Why the `!custom` escape hatch matters

Design systems often fail when they are completely inflexible. When developers cannot express an unusual layout, they bypass the system entirely.

FSGPUI solves this with the `!custom` modifier:

* It permits intentional exceptions when truly required.
* It documents the exception explicitly in the source code.
* It enables simple repository-wide searches (`grep -r "!custom" src/`) to measure design debt.

## Related pages

* [Getting started](./01-getting-started.md)
* [Architecture and philosophy](./02-architecture-and-philosophy.md)
* [Token contracts](./03-token-contracts.md)
* [Style definitions](./04-style-definitions.md)
