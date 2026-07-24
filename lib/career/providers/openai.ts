import type { EmbeddingProvider } from "../types.ts";

interface OpenAIEmbeddingResponse {
  data: Array<{ embedding: number[]; index: number }>;
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    apiKey: string,
    model: string,
  ) {
    if (!apiKey || !model) {
      throw new Error(
        "OPENAI_API_KEY and OPENAI_EMBEDDING_MODEL are required for the OpenAI embedding provider.",
      );
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return this.embed(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await this.embed([text]);
    return embedding;
  }

  private async embed(input: string[]): Promise<number[][]> {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: this.model, input }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI embedding request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as OpenAIEmbeddingResponse;
    return payload.data
      .toSorted((left, right) => left.index - right.index)
      .map((item) => item.embedding);
  }
}
