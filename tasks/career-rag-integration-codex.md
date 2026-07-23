# Codex Task: Career Knowledge Base RAG Integration

## Objective

Extend the current `dicksonlo901019/cv-blockchain` repository into a repository-grounded Career Intelligence System with an initial RAG workflow.

The primary user flow is:

> Paste a job description or job URL content → retrieve the most relevant verified career evidence → generate a grounded job-match analysis, CV recommendations and interview preparation.

This task must preserve the existing production CV and must not present the system as a fully mature or production-grade RAG platform unless the implementation genuinely supports that claim.

## Execution Rules

- Before changing code, inspect the repository structure, framework, content model, routes, build scripts and deployment configuration.
- Create and switch to branch: `feat/career-rag-integration`.
- Do not overwrite or visually regress the existing `/zh/` and `/en/` production CV pages.
- Reuse the current design system, components, typography, responsive behaviour and print styles where applicable.
- Use only verified career facts already present in the repository as initial seed data.
- Do not invent metrics, responsibilities, team sizes, revenue impact, card-domain experience, production AI ownership or technical architecture claims.
- Clearly distinguish verified evidence, inferred content, drafts and unverified claims.
- Keep secrets out of the repository. Provide `.env.example` only; never commit API keys.
- Prefer incremental architecture that can run locally without requiring all external services to be configured.
- Open a Draft PR to `main` when complete. Do not merge.

## Product Scope

Build an MVP with four layers:

1. Structured career knowledge base
2. Retrieval and ranking layer
3. Job-description analysis workflow
4. Career application UI

The implementation should make retrieval evidence visible to the user instead of returning unsupported generated prose.

## Primary MVP Use Case

### Job Match Analyzer

Input:

- Pasted job description text
- Optional role title and company name
- Optional job URL stored as metadata only; do not depend on runtime scraping for MVP
- Output language: Chinese or English

Output:

- Overall match score
- Required qualifications match
- Preferred qualifications match
- Most relevant career evidence
- Strongest transferable experience
- Evidence gaps
- Potential interview concerns
- CV summary recommendations
- Recommended experience/bullet ordering
- Likely interview questions
- Suggested grounded STAR stories
- Source references for every major recommendation

## Information Architecture

Create a structured data model that separates companies, projects, achievements, skill evidence and interview stories.

Suggested structure, adapted to the repository architecture after inspection:

```text
career-knowledge-base/
├── profile/
│   ├── career-profile.json
│   ├── career-goals.json
│   └── job-preferences.example.json
├── experiences/
├── projects/
├── achievements/
├── skills/
├── interview-stories/
├── resumes/
├── job-descriptions/
└── schemas/
```

Do not store unnecessary sensitive personal information in the vector index or public repository.

## Core Data Models

### Career Experience

Required fields:

```ts
interface CareerExperience {
  id: string;
  company: string;
  title: string;
  industry: string[];
  startDate?: string;
  endDate?: string;
  summary: string;
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
  confidentiality: ConfidentialityLevel;
}
```

### Project

```ts
interface CareerProject {
  id: string;
  projectName: string;
  company: string;
  role: string;
  domains: string[];
  productTypes: string[];
  problem?: string;
  responsibilities: string[];
  deliverables: string[];
  outcomes: string[];
  skills: string[];
  competencies: string[];
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
  confidentiality: ConfidentialityLevel;
}
```

### Achievement

```ts
interface CareerAchievement {
  id: string;
  statement: string;
  company?: string;
  projectId?: string;
  achievementType: string;
  metrics?: Record<string, string | number>;
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
}
```

### Skill Evidence

```ts
interface SkillEvidence {
  id: string;
  skill: string;
  category: string;
  proficiency: "Knowledge" | "Applied" | "Led";
  evidence: Array<{
    company?: string;
    projectId?: string;
    description: string;
    sourcePaths: string[];
  }>;
  evidenceLevel: EvidenceLevel;
}
```

### Interview Story

```ts
interface InterviewStory {
  id: string;
  title: string;
  competencies: string[];
  situation: string;
  task: string;
  action: string;
  result: string;
  lessons?: string;
  relatedProjectIds: string[];
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
}
```

### Evidence Levels

```ts
type EvidenceLevel = "confirmed" | "inferred" | "draft" | "unverified";
type ConfidentialityLevel = "public" | "private" | "restricted";
```

Generation rules:

- CV-ready factual claims must use `confirmed` evidence.
- `inferred` evidence may be used only when explicitly labelled as interpretation.
- `draft` content may be shown for review but not treated as fact.
- `unverified` content must never be converted into a factual achievement.

## Initial Seed Content

Extract and normalize verified content already present in the repository. At minimum, inspect whether the source supports evidence related to:

- Xchanger
  - NFT marketplace
  - WalletConnect
  - NFT metadata
  - marketplace listing and royalty flows
  - AI-assisted product/design workflow, only where explicitly documented
- FameEX / TopOne
  - futures products
  - futures grid
  - C2C/P2P
  - referral programme
  - risk controls
  - wallet/account flows
  - KYC and Sumsub integration
  - ledger, approval or operational workflows only where explicitly documented
- Product leadership and delivery achievements already stated in the current CV
- Existing software PM, blockchain PM, FinTech and AI workflow positioning

Do not copy unsupported facts from this task file into the knowledge base. The repository remains the source of truth.

## Taxonomy

Create centralized, reusable taxonomies instead of free-form labels scattered across files.

### Product Types

Initial values may include:

```text
Crypto Exchange
NFT Marketplace
DEX
Wallet
Payments
Embedded Finance
B2B Platform
AI Agent
Compliance / AML
Trading
C2C / P2P
Referral System
```

### Competencies

Initial values may include:

```text
Product Strategy
Product Discovery
Roadmap
PRD
Stakeholder Management
Cross-functional Collaboration
Risk Management
Compliance
API Integration
Data Analysis
UX
Go-to-market
0-to-1 Product
Platform Product
B2B Product
Technical Programme Delivery
```

Normalize aliases during ingestion, for example `KYC Integration`, `Identity Verification` and `Sumsub SDK` should remain distinct evidence terms but may map to a shared compliance category.

## Chunking Strategy

Do not split content only by a fixed character count.

Use semantic units:

- One achievement per chunk
- One skill-evidence record per chunk
- One interview story per chunk
- One project overview per chunk
- Separate project chunks for problem, responsibilities, risk/logic and outcomes where content is substantial

Every chunk must retain:

```ts
interface CareerChunk {
  id: string;
  parentId: string;
  parentType: "experience" | "project" | "achievement" | "skill" | "story" | "resume";
  text: string;
  language: "zh" | "en";
  company?: string;
  jobTitle?: string;
  project?: string;
  industries: string[];
  productTypes: string[];
  skills: string[];
  competencies: string[];
  evidenceLevel: EvidenceLevel;
  confidentiality: ConfidentialityLevel;
  sourcePaths: string[];
}
```

## Retrieval Architecture

Implement a provider-based retrieval interface so the MVP is not tightly coupled to one database.

Required retrieval stages:

```text
JD parsing
→ metadata filters
→ keyword retrieval
→ semantic retrieval when configured
→ score fusion
→ reranking
→ evidence grouping
→ grounded generation
```

### Local Fallback

The repository must support a deterministic local fallback that works without an API key:

- token/keyword matching
- taxonomy alias matching
- metadata filtering
- weighted scoring

This enables build and test validation in CI.

### Vector Provider

Preferred production-ready direction:

- PostgreSQL + pgvector, compatible with Supabase
- OpenAI embeddings through a server-side adapter

However:

- Do not require a live Supabase or OpenAI connection for the static site to build.
- Add interfaces/adapters and setup documentation.
- Provide an optional ingestion/indexing script.
- Keep all API calls server-side.

Suggested interfaces:

```ts
interface EmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

interface CareerRetriever {
  retrieve(query: ParsedJobDescription, options?: RetrievalOptions): Promise<RetrievedEvidence[]>;
}
```

## JD Parser

Create a structured parser that extracts:

```ts
interface ParsedJobDescription {
  roleTitle?: string;
  company?: string;
  seniority?: string;
  industries: string[];
  productTypes: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  competencies: string[];
  responsibilities: string[];
  domainTerms: string[];
  languageRequirements: string[];
  locationRequirements: string[];
}
```

The local fallback may use deterministic headings, bullet and keyword parsing. An optional LLM parser may be added behind a provider interface.

## Matching Model

Implement a transparent weighted match score. Suggested defaults:

```text
Required skills: 40%
Industry/domain relevance: 20%
Product-type relevance: 15%
Seniority/scope: 10%
Achievement evidence: 10%
Language/location constraints: 5%
```

Requirements:

- Display the score breakdown.
- Do not imply scientific precision.
- Explain why evidence matched.
- Penalize missing required qualifications.
- Do not reward keyword repetition without evidence.
- Allow weights to be changed through configuration.

## Grounded Generation Rules

Every generated section must receive retrieved evidence records rather than the entire raw repository.

The generation prompt or template must enforce:

1. Use only supplied evidence.
2. Never invent metrics or scope.
3. Mark gaps explicitly.
4. Distinguish direct experience from transferable experience.
5. Attach source references to major claims.
6. Prefer concise, ATS-readable wording.
7. Produce Chinese or English output consistently.

When no LLM provider is configured, provide deterministic templates using retrieved evidence so the workflow remains demonstrable.

## UI Requirements

Add an isolated route for the Career Intelligence MVP. Choose the route after inspecting the existing router; suggested routes:

- `/career-rag/zh/`
- `/career-rag/en/`

The page should include:

1. JD input panel
2. Optional role/company fields
3. Language selector
4. Analyze action
5. Match score and score breakdown
6. Matched evidence cards
7. Gaps and concerns
8. CV recommendations
9. Interview questions and STAR evidence
10. Retrieval diagnostics in a collapsible developer/debug section

Evidence cards must show:

- company/project
- evidence text
- skills/competencies
- evidence level
- source path or source label
- match rationale

The existing CV routes must remain unchanged.

## API / Server Requirements

Adapt to the repository framework.

Preferred endpoints or server actions:

```text
POST /api/career/parse-jd
POST /api/career/retrieve
POST /api/career/analyze
POST /api/career/ingest   # protected/local/admin only if implemented
```

Requirements:

- Validate request payloads.
- Add sensible input-size limits.
- Do not expose environment secrets to the browser.
- Return structured errors.
- Avoid logging private CV or JD content in production by default.
- Include basic rate-limit integration points or documentation.

If the repository is currently static-only, implement the local deterministic demo in the frontend/build output and document the server deployment path separately rather than breaking the current deployment.

## Optional Supabase Schema

Provide migration or SQL documentation for:

```text
career_documents
career_chunks
career_projects
career_skills
career_skill_evidence
career_interview_stories
job_descriptions
job_match_runs
resume_versions
generation_history
```

Minimum vector-related fields:

```sql
id
parent_id
parent_type
content
language
metadata jsonb
evidence_level
confidentiality
embedding vector(...)
created_at
updated_at
```

Include recommended indexes for metadata filters and vector similarity. Do not hard-code an embedding dimension without matching the configured embedding model; document how to set it.

## Scripts and Tooling

Add scripts appropriate to the framework for:

- validating career data against schemas
- building semantic chunks
- running local retrieval tests
- optionally generating embeddings and upserting them
- optionally importing existing CV content into normalized seed data

Suggested commands, adapted to the repository package manager:

```text
career:validate
career:build-index
career:test-retrieval
career:ingest
```

The embedding ingestion command must fail safely when required environment variables are missing.

## Tests

Add automated tests for at least:

- schema validation
- evidence-level generation restrictions
- JD parsing of a representative PM job description
- taxonomy alias matching
- metadata filtering
- weighted match scoring
- deterministic retrieval ordering
- missing evidence handling
- Chinese and English content handling
- prevention of unsupported metrics in deterministic output

Add one representative fixture for an Embedded Finance PM role and one for a Technical AI/Product Strategy role.

## Documentation

Create documentation covering:

- architecture overview
- local deterministic mode
- optional OpenAI embedding setup
- optional Supabase/pgvector setup
- environment variables
- ingestion workflow
- how to add a new company/project/achievement/story
- evidence-level rules
- privacy and confidentiality considerations
- known MVP limitations

Add `.env.example` with placeholder names only, such as:

```text
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CAREER_RAG_PROVIDER=local
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to client code.

## Privacy and Security

- Default public seed data to `public` only.
- Keep private profile preferences out of the public repository.
- Do not embed email, phone, address, compensation expectations or other unnecessary personal data.
- Treat uploaded/pasted job descriptions as transient unless the user explicitly saves them.
- Document deletion and re-indexing behaviour.
- Prevent restricted chunks from appearing in public/static output.

## Acceptance Criteria

### Repository Safety

- [ ] Work is isolated on `feat/career-rag-integration`
- [ ] Existing `/zh/` and `/en/` CV pages remain visually and functionally unchanged
- [ ] No secrets or sensitive private profile data are committed
- [ ] Existing deployment still builds

### Knowledge Base

- [ ] Structured schemas exist for experiences, projects, achievements, skills and interview stories
- [ ] Initial verified repository content is normalized into seed records
- [ ] Every record has source paths and evidence level
- [ ] Validation script detects malformed or unsupported records

### Retrieval

- [ ] Semantic-unit chunk generation exists
- [ ] Deterministic local retrieval works without external services
- [ ] Metadata filtering, keyword matching and score fusion are implemented
- [ ] Optional vector-provider interfaces and setup path exist
- [ ] Retrieved evidence contains match rationale and sources

### Job Analysis

- [ ] JD parser produces a structured representation
- [ ] Match score has a visible breakdown
- [ ] Required-skill gaps are explicit
- [ ] Direct and transferable experience are distinguished
- [ ] CV and interview outputs use retrieved evidence only

### UI

- [ ] Isolated Chinese MVP route exists
- [ ] Isolated English MVP route exists, or architecture supports parity with documented remaining work
- [ ] Evidence cards show source and evidence status
- [ ] Mobile and desktop layouts are reviewed
- [ ] Loading, empty and error states are implemented

### Validation

- [ ] Unit tests pass
- [ ] Lint passes if configured
- [ ] Production build passes
- [ ] Representative Embedded Finance fixture is validated
- [ ] Representative AI/Product Strategy fixture is validated
- [ ] No unsupported factual claims are generated in test snapshots/fixtures

## Implementation Priorities

When repository constraints require scope reduction, prioritize in this order:

1. Structured schemas and verified seed data
2. Deterministic local JD parsing and retrieval
3. Transparent score breakdown and evidence cards
4. Grounded CV/interview recommendations
5. Tests and documentation
6. Optional OpenAI embeddings and Supabase adapter

Do not sacrifice factual grounding or production CV stability to complete optional vector infrastructure.

## Final Output

1. Commit all changes to `feat/career-rag-integration`.
2. Open a Draft PR to `main`.
3. Do not merge the PR.
4. In the PR description include:
   - architecture summary
   - files/routes added
   - normalized seed-data summary
   - retrieval and scoring design
   - screenshots for desktop and mobile
   - test/lint/build results
   - external services that remain optional or unconfigured
   - known limitations
   - factual gaps requiring user confirmation
5. Clearly state whether the delivered version is:
   - local repository-grounded retrieval MVP, or
   - vector-backed RAG implementation with configured persistence

Do not describe it as production-ready unless all relevant persistence, security, observability, evaluation and deployment requirements have actually been completed.
