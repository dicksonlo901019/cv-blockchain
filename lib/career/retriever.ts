import { buildCareerChunks } from "./chunks.ts";
import { aliasesFor, findTaxonomyMatches } from "./taxonomy.ts";
import type {
  CareerChunk,
  CareerRetriever,
  ParsedJobDescription,
  RetrievedEvidence,
  RetrievalOptions,
} from "./types.ts";

const wordPattern = /[\p{L}\p{N}][\p{L}\p{N}+\-/.]*/gu;
const stopWords = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "that",
  "this",
  "you",
  "your",
  "our",
  "are",
  "will",
  "role",
  "job",
  "work",
]);

function tokens(text: string): string[] {
  return unique(
    (text.toLocaleLowerCase().match(wordPattern) ?? []).filter(
      (token) => token.length > 1 && !stopWords.has(token),
    ),
  );
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function chunkSearchText(chunk: CareerChunk): string {
  return [
    chunk.text,
    chunk.company,
    chunk.jobTitle,
    chunk.project,
    ...chunk.industries,
    ...chunk.productTypes,
    ...chunk.skills,
    ...chunk.competencies,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

function queryTerms(query: ParsedJobDescription): string[] {
  return unique([
    ...tokens(query.rawText),
    ...query.requiredSkills,
    ...query.preferredSkills,
    ...query.industries,
    ...query.productTypes,
    ...query.competencies,
    ...query.domainTerms,
  ]);
}

function passesFilters(chunk: CareerChunk, options: RetrievalOptions): boolean {
  if (options.company && chunk.company !== options.company) return false;
  if (options.parentTypes && !options.parentTypes.includes(chunk.parentType)) return false;
  if (
    options.evidenceLevels &&
    !options.evidenceLevels.includes(chunk.evidenceLevel)
  ) {
    return false;
  }
  if (
    options.confidentiality &&
    !options.confidentiality.includes(chunk.confidentiality)
  ) {
    return false;
  }
  return true;
}

export class LocalCareerRetriever implements CareerRetriever {
  private readonly chunks: CareerChunk[];

  constructor(chunks = buildCareerChunks()) {
    this.chunks = chunks;
  }

  async retrieve(
    query: ParsedJobDescription,
    options: RetrievalOptions = {},
  ): Promise<RetrievedEvidence[]> {
    const limit = Math.min(Math.max(options.limit ?? 8, 1), 20);
    const terms = queryTerms(query);
    const canonicalQueryTerms = new Set(findTaxonomyMatches(terms.join(" ")));
    const requiredCanonical = new Set(query.requiredSkills);

    const ranked = this.chunks
      .filter((chunk) =>
        passesFilters(chunk, {
          evidenceLevels: ["confirmed", "inferred", "draft"],
          confidentiality: ["public"],
          ...options,
        }),
      )
      .map((chunk) => {
        const searchText = chunkSearchText(chunk);
        const matchedTerms = terms.filter((term) => {
          const lowered = term.toLocaleLowerCase();
          return (
            searchText.includes(lowered) ||
            aliasesFor(term).some((alias) =>
              searchText.includes(alias.toLocaleLowerCase()),
            )
          );
        });
        const chunkTaxonomy = new Set(
          findTaxonomyMatches(searchText).concat(
            chunk.productTypes,
            chunk.competencies,
            chunk.skills,
          ),
        );
        const taxonomyMatches = [...canonicalQueryTerms].filter((term) =>
          chunkTaxonomy.has(term),
        );
        const keywordScore =
          terms.length === 0 ? 0 : Math.min(1, matchedTerms.length / Math.min(10, terms.length));
        const taxonomyScore =
          canonicalQueryTerms.size === 0
            ? 0
            : Math.min(1, taxonomyMatches.length / canonicalQueryTerms.size);
        const metadataHits =
          query.industries.filter((term) => chunk.industries.includes(term)).length +
          query.productTypes.filter((term) => chunk.productTypes.includes(term)).length +
          query.competencies.filter((term) => chunk.competencies.includes(term)).length;
        const metadataTarget =
          query.industries.length + query.productTypes.length + query.competencies.length;
        const metadataScore =
          metadataTarget === 0 ? 0 : Math.min(1, metadataHits / metadataTarget);
        const semanticScore = 0;
        const score =
          keywordScore * 0.45 +
          taxonomyScore * 0.35 +
          metadataScore * 0.2 +
          (chunk.parentType === "achievement" ? 0.03 : 0);
        const requiredMatches = [...requiredCanonical].filter((term) =>
          chunkTaxonomy.has(term),
        );
        const relationship = requiredMatches.length > 0 ? "direct" : "transferable";
        const rationaleParts = [
          matchedTerms.length > 0
            ? `Keyword overlap: ${matchedTerms.slice(0, 4).join(", ")}`
            : "",
          taxonomyMatches.length > 0
            ? `Taxonomy overlap: ${taxonomyMatches.slice(0, 3).join(", ")}`
            : "",
          metadataHits > 0 ? `${metadataHits} metadata match${metadataHits === 1 ? "" : "es"}` : "",
        ].filter(Boolean);

        return {
          chunk,
          score: Number(score.toFixed(4)),
          keywordScore: Number(keywordScore.toFixed(4)),
          taxonomyScore: Number(taxonomyScore.toFixed(4)),
          metadataScore: Number(metadataScore.toFixed(4)),
          semanticScore,
          matchedTerms: unique(matchedTerms.concat(taxonomyMatches)).slice(0, 8),
          rationale:
            rationaleParts.join(" · ") ||
            "Transferable evidence retained after public-evidence filtering.",
          relationship,
        } satisfies RetrievedEvidence;
      })
      .filter((item) => item.score > 0 || query.rawText.length === 0)
      .sort(
        (left, right) =>
          right.score - left.score || left.chunk.id.localeCompare(right.chunk.id),
      );

    const grouped: RetrievedEvidence[] = [];
    const groupCounts = new Map<string, number>();
    for (const item of ranked) {
      const groupKey =
        item.chunk.project ??
        item.chunk.company ??
        `${item.chunk.parentType}:${item.chunk.parentId}`;
      const count = groupCounts.get(groupKey) ?? 0;
      if (count >= 2) continue;
      grouped.push(item);
      groupCounts.set(groupKey, count + 1);
      if (grouped.length === limit) break;
    }

    return grouped;
  }

  getChunkCount(): number {
    return this.chunks.length;
  }
}
