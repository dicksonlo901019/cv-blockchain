# Codex Task: Reap Plan A — Two Tailored CV Versions

## Objective

Prepare two role-specific CV variants from the current Blockchain CV codebase, keeping the original production CV unchanged.

Target roles:

1. Product Manager, Embedded Finance — APAC
   - https://careers.reap.global/jobs/7923175-product-manager-embedded-finance-apac
2. Technical AI Program Manager, Product Strategy & Operations
   - https://careers.reap.global/jobs/7965354-technical-ai-program-manager-product-strategy-operations-hybrid-remote

Source CV:

- Live site: https://dicksonlo901019.github.io/cv-blockchain/zh/
- Repository: `dicksonlo901019/cv-blockchain`

## Execution Rules

- Do not overwrite or alter the existing production CV pages.
- Create a dedicated branch: `feat/reap-plan-a-cv-variants`.
- Reuse the current design system, layout, typography, responsive behaviour and print styles.
- Keep all existing factual claims accurate. Do not invent card issuing, card scheme, chargeback, KYB, production AI platform or other unverified experience.
- Preserve clickable links in HTML and generated PDFs.
- Maintain Chinese and English output parity where the repository already supports both languages.
- Keep the current visual hierarchy and avoid layout regression in print/PDF.

## Deliverables

Create two isolated CV variants:

### A. Embedded Finance CV

Suggested route/output:

- `/reap-embedded-finance/zh/`
- `/reap-embedded-finance/en/`

Positioning:

- Senior FinTech & Web3 Product Manager
- Financial Infrastructure
- APIs, Ledger & Money Movement

Content priorities:

1. Product leadership and 0-to-1 delivery
2. Triple-Ledger and wallet/account architecture
3. Transaction lifecycle and money movement
4. Fiat/crypto on-ramp and off-ramp
5. API/WebSocket and third-party integration
6. Reconciliation and operational tooling
7. Multi-level approvals and risk controls
8. Compliance-adjacent workflows that are factually supported
9. AI-native product workflow as a supporting differentiator

De-emphasise:

- NFT-specific details
- Grid Bot formulas and ROI/APY details
- Features unrelated to financial infrastructure

Do not claim:

- Direct card issuing ownership
- Visa/Mastercard scheme experience
- Authorization, clearing, settlement ownership
- Chargebacks/disputes ownership
- KYB unless explicitly supported by source content

Recommended summary direction:

> 10 years of product management experience across FinTech, Web3 and complex financial infrastructure. Progressed from Product Manager to Product Lead, led a five-person product and design team, and delivered a 0-to-1 digital asset exchange within four months. Experienced in transaction lifecycle, Triple-Ledger, wallet/account architecture, fiat/crypto money movement, reconciliation, approval workflows, risk controls, API integrations and operational tooling.

### B. Technical AI Program Manager CV

Suggested route/output:

- `/reap-ai-program/zh/`
- `/reap-ai-program/en/`

Positioning:

- Product Strategy & Operations Leader
- Technical Programs
- AI Workflows & FinTech

Content priorities:

1. Product Lead and team leadership
2. Cross-functional programme execution
3. 0-to-1 delivery across multiple workstreams
4. Modular PRD operating mechanism
5. Technical pre-review and API documentation standardisation
6. Product/design/engineering handoff design
7. AI agent workflow across PM, UI/UX, frontend and Figma
8. IR mapping, design-system constraints and reusable AI assets
9. Risk, dependency, blocker and delivery coordination where factually supported
10. FinTech/Web3 domain knowledge as context, not the primary identity

De-emphasise:

- Detailed exchange feature lists
- NFT and trading strategy specifics
- Deep card-product language

Do not claim:

- Formal programme-management responsibilities not supported by the source CV
- Quarterly planning, executive reporting, decision logs or portfolio governance unless they exist in the repository content
- Production-grade AI platform ownership
- RAG, LangChain/LangGraph or AI evaluation systems unless supported by source material

Recommended summary direction:

> 10 years of product and programme delivery experience across FinTech, Web3 and complex technical products. Progressed from Product Manager to Product Lead, led a five-person product and design team, and delivered a 0-to-1 digital asset exchange within four months. Built modular PRD, technical pre-review and AI-agent workflows to improve alignment, handoffs and delivery efficiency across product, design and engineering.

## Content Requirements

For both variants:

- Use the current Blockchain CV as the factual source of truth.
- Keep FameEX/TopOne as the main evidence block.
- Keep Xchanger as the main AI workflow evidence block.
- Preserve the following verified achievements where present:
  - 10 years of product management experience
  - Product Manager to Product Lead progression
  - Led a five-person product and design team
  - Delivered a 0-to-1 exchange in four months
  - Triple-Ledger
  - Wallet/account architecture
  - 1–6 level approval flow
  - 100% requirement componentisation
  - 80% complex-logic alignment
  - AI agent workflow
  - IR mapping and design-system dictionary/constraints
- Rewrite bullets to be concise, impact-oriented and ATS-readable.
- Avoid keyword stuffing.
- Use consistent English terminology across Chinese and English versions.

## Technical Requirements

- Inspect the existing repository structure before implementation.
- Reuse existing components and styles instead of duplicating the full site where practical.
- Add route-level content/config separation for the two variants.
- Ensure all routes build successfully.
- Verify desktop and mobile layouts.
- Verify print styles and A4 PDF rendering.
- Confirm external links remain clickable in exported PDFs.
- Do not introduce new runtime dependencies unless necessary.
- Keep changes scoped to the new variants and shared abstractions required to support them.

## Validation Checklist

- [ ] Original `/zh/` and `/en/` pages remain visually and functionally unchanged
- [ ] Embedded Finance Chinese page created
- [ ] Embedded Finance English page created
- [ ] AI Program Chinese page created
- [ ] AI Program English page created
- [ ] No unsupported card-domain claims
- [ ] No unsupported production-AI claims
- [ ] Links work in browser
- [ ] Links remain clickable in PDF
- [ ] Mobile layout reviewed
- [ ] A4 print/PDF layout reviewed
- [ ] Build passes
- [ ] Lint/tests pass if available

## Final Output

1. Commit all changes to `feat/reap-plan-a-cv-variants`.
2. Open a draft pull request to `main`.
3. In the PR description, include:
   - Summary of content differences between the two variants
   - Routes added
   - Screenshots of desktop and print/PDF views
   - Validation results
   - Any factual gaps that still require user confirmation
4. Do not merge the PR.
