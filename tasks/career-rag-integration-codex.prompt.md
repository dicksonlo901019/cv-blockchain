Implement the task in `tasks/career-rag-integration-codex.md`.

Before changing code:

1. Inspect the repository structure, framework, current CV routes, build/deployment configuration and existing content sources.
2. Create and switch to branch `feat/career-rag-integration`.
3. Keep the existing production `/zh/` and `/en/` CV pages unchanged.
4. Treat the repository as the factual source of truth. Do not invent metrics, responsibilities or domain experience.

Prioritize a working repository-grounded MVP: structured career data, deterministic local retrieval, transparent scoring, evidence cards, grounded CV/interview recommendations, tests and documentation. Keep OpenAI embeddings and Supabase/pgvector optional behind provider interfaces if external services are not configured.

Validate desktop/mobile output, lint/tests/build, then open a Draft PR to `main`. Do not merge.