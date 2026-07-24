# Career Intelligence RAG MVP

## Delivered architecture

The MVP is a repository-grounded retrieval workflow:

```text
JD payload validation
→ deterministic JD parsing
→ public/evidence-level metadata filters
→ keyword and taxonomy retrieval
→ weighted score fusion and deterministic reranking
→ grouped evidence
→ grounded CV and interview templates
```

The public routes are `/career-rag/en/` and `/career-rag/zh/`. The existing
static CV sources in `public/blockchain-cv.html` and `public/zh/index.html` are
not used as mutable application pages and remain unchanged.

This version is a local repository-grounded retrieval MVP. It is not described
as a production-ready RAG platform: persistence, hosted vector search, model
evaluation, authentication, rate-limit enforcement, operational observability,
and private-data controls still require deployment-specific work.

## Knowledge base and evidence policy

Normalized source records live under `career-knowledge-base/` and are generated
only from statements already present in the English and Traditional Chinese CV.
Each record includes source paths and an evidence level.

- `confirmed`: may be used for CV-ready factual wording.
- `inferred`: may appear only as labelled interpretation.
- `draft`: may be shown for human review, never as fact.
- `unverified`: must never become a factual recommendation.

Only `public` chunks are available to the local UI. Do not add email, telephone,
address, compensation preferences, uploaded job descriptions, or private
profile preferences to public seed data.

To add a company, project, achievement, skill, or story:

1. Add the record to its matching JSON file.
2. Cite at least one repository source path.
3. Choose an evidence and confidentiality level.
4. Run `npm run career:validate`.
5. Run `npm run career:build-index` and inspect `work/career-chunks.json`.
6. Add or update retrieval tests when taxonomy or ranking behaviour changes.

## Local deterministic mode

No credentials are required. The parser recognizes common JD headings, bullets,
English and Traditional Chinese aliases, product types, competencies, language
requirements, and location requirements. Retrieval combines:

- 45% token/keyword overlap
- 35% centralized taxonomy overlap
- 20% metadata overlap
- a small stable achievement tie-break

The visible job-match score is separate:

- required skills: 40%
- industry/domain: 20%
- product type: 15%
- seniority/scope: 10%
- achievement evidence: 10%
- language/location constraints: 5%

Missing required qualifications are penalized and displayed. Scores are
heuristics and must not be interpreted as hiring probabilities.

## Optional OpenAI and Supabase path

Copy `.env.example` to a local ignored env file and configure the server-side
values. `SUPABASE_SERVICE_ROLE_KEY` must never use a `NEXT_PUBLIC_` prefix.

```sh
npm run career:ingest
```

The command builds semantic chunks, requests OpenAI embeddings server-side, and
upserts them through the Supabase REST API. It exits safely before any network
request if a required variable is absent. The local app does not require this
command or any external service to build.

Apply and adapt `docs/supabase-career-rag.sql` first. The vector dimension is a
required deployment choice because it must match the configured embedding
model. Replace `VECTOR_DIMENSION` during migration preparation; do not guess.

For a hosted vector retrieval provider, implement the `CareerRetriever`
interface, return the same `RetrievedEvidence` shape, and fuse vector similarity
with the existing keyword, taxonomy, and metadata scores. Keep API calls and
service-role credentials server-side.

## API and operational notes

The MVP provides:

- `POST /api/career/parse-jd`
- `POST /api/career/retrieve`
- `POST /api/career/analyze`

Payloads require at least 40 JD characters and are capped at 50,000 characters.
Errors are structured. The handlers do not log raw job descriptions. Pasted job
descriptions are transient and are not persisted.

Production deployment should add authenticated user boundaries if private
records are introduced, enforce rate limits at the edge, redact request
telemetry, define retention/deletion behaviour, and monitor retrieval quality
without logging raw private content.

Deletion and re-indexing are currently file-driven: remove or correct the source
record, validate, rebuild chunks, and rerun vector ingestion. A production store
should also delete stale vector rows by source record/version.

## Known limitations and factual gaps

- The local parser is rules-based; unusual JD formatting can require manual review.
- The seed knowledge base contains only facts already visible in this repository.
- There is no hosted persistence, user account, saved JD, or generation history.
- Semantic retrieval is an optional adapter path and is not active by default.
- The deterministic templates do not call an LLM.
- Language support localizes the workflow and recognizes Chinese aliases; most
  normalized evidence text remains English because the canonical seed is
  intentionally not machine-translated into new factual claims.
- Compliance experience is limited to what the current CV explicitly supports;
  Sumsub integration is not seeded because the repository does not verify it.
- Employer-confidential or restricted material is intentionally absent.
