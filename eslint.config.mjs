// ============================================================================
// Clawbot Mission Control — ESLint 9 flat config
// Migrated from .eslintrc.json as part of the Next 14 → 16 upgrade
// (eslint-config-next v16 is flat-config native; `next lint` was removed).
// ============================================================================

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

export default [
  // Global ignores — build output and dependencies.
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
];
