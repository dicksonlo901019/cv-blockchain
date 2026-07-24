import type { CareerChunk } from "../types.ts";

export interface VectorUpsertRecord {
  id: string;
  parent_id: string;
  parent_type: CareerChunk["parentType"];
  content: string;
  language: CareerChunk["language"];
  metadata: Record<string, unknown>;
  evidence_level: CareerChunk["evidenceLevel"];
  confidentiality: CareerChunk["confidentiality"];
  embedding: number[];
}

export class SupabaseVectorStore {
  private readonly url: string;
  private readonly serviceRoleKey: string;

  constructor(
    url: string,
    serviceRoleKey: string,
  ) {
    if (!url || !serviceRoleKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for vector ingestion.",
      );
    }
    this.url = url;
    this.serviceRoleKey = serviceRoleKey;
  }

  async upsert(records: VectorUpsertRecord[]): Promise<void> {
    const response = await fetch(`${this.url}/rest/v1/career_chunks?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(records),
    });

    if (!response.ok) {
      throw new Error(`Supabase upsert failed with status ${response.status}.`);
    }
  }
}
