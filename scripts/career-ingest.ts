import { buildCareerChunks } from "../lib/career/chunks.ts";
import { OpenAIEmbeddingProvider } from "../lib/career/providers/openai.ts";
import { SupabaseVectorStore } from "../lib/career/providers/supabase.ts";

const required = [
  "OPENAI_API_KEY",
  "OPENAI_EMBEDDING_MODEL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Vector ingestion was not started. Missing environment variables: ${missing.join(", ")}.`,
  );
  process.exitCode = 2;
} else {
  const chunks = buildCareerChunks().filter(
    (chunk) =>
      chunk.confidentiality === "public" && chunk.evidenceLevel !== "unverified",
  );
  const embeddings = new OpenAIEmbeddingProvider(
    process.env.OPENAI_API_KEY!,
    process.env.OPENAI_EMBEDDING_MODEL!,
  );
  const store = new SupabaseVectorStore(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const vectors = await embeddings.embedDocuments(chunks.map((chunk) => chunk.text));
  await store.upsert(
    chunks.map((chunk, index) => ({
      id: chunk.id,
      parent_id: chunk.parentId,
      parent_type: chunk.parentType,
      content: chunk.text,
      language: chunk.language,
      metadata: {
        company: chunk.company,
        project: chunk.project,
        industries: chunk.industries,
        productTypes: chunk.productTypes,
        skills: chunk.skills,
        competencies: chunk.competencies,
        sourcePaths: chunk.sourcePaths,
      },
      evidence_level: chunk.evidenceLevel,
      confidentiality: chunk.confidentiality,
      embedding: vectors[index],
    })),
  );
  console.log(`Upserted ${chunks.length} career chunks.`);
}
