/* ABACUZ × PROXYZ — partner walkthrough.
 *
 * Route: /pipeline/abacuz — partner-gated via <PartnerGate partner="abacuz">.
 *
 * Zone structure (Phase 1 refactor — 2026-06-01):
 *   collaborate — the full bilingual R&D walkthrough (original content)
 *   deck        — product deck placeholder (Phase 2)
 *   preview     — website preview placeholder (Phase 2)
 *
 * Zone is controlled via ?zone= in the URL (useZone hook).
 * Default / absent / invalid → 'collaborate'.
 *
 * Brand surface is ABACUZ (Ledger Navy / Abacus Gold / Ivory), NOT PROXYZ pink.
 * PROXYZ chrome (Nav, Footer) frames the shell.
 */

import type { ReactNode } from 'react';
import Nav from '../components/Nav';
import PartnerGate from '../components/PartnerGate';
import Footer from '../sections/Footer';
import { AbacuzShell } from '../abacuz/AbacuzShell';

/* The PartnerGate wrapper picks up the abacuz slug and enforces the 4-digit
 * code (PARTNERS_AUTH_CODE_ABACUZ env var on Vercel). Dev environment auto-
 * unlocks per PartnerGate.tsx. */
export default function Abacuz(): ReactNode {
  return (
    <PartnerGate partner="abacuz">
      <Nav />
      <AbacuzShell />
      <Footer />
    </PartnerGate>
  );
}
