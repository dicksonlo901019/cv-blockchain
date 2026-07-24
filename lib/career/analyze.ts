import { stories } from "./knowledge.ts";
import { LocalCareerRetriever } from "./retriever.ts";
import { canonicalizeTerm, findTaxonomyMatches } from "./taxonomy.ts";
import type {
  CareerAnalysis,
  GroundedRecommendation,
  MatchBreakdownItem,
  ParsedJobDescription,
  RetrievedEvidence,
  SupportedLanguage,
} from "./types.ts";

export const DEFAULT_MATCH_WEIGHTS = {
  requiredSkills: 0.4,
  domainRelevance: 0.2,
  productTypes: 0.15,
  seniorityScope: 0.1,
  achievementEvidence: 0.1,
  constraints: 0.05,
} as const;

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function evidenceTaxonomy(evidence: RetrievedEvidence[]): Set<string> {
  return new Set(
    evidence.flatMap((item) =>
      findTaxonomyMatches(
        [
          item.chunk.text,
          ...item.chunk.skills,
          ...item.chunk.competencies,
          ...item.chunk.productTypes,
          ...item.chunk.industries,
        ].join(" "),
      ).concat(
        item.chunk.skills.map(canonicalizeTerm),
        item.chunk.competencies,
        item.chunk.productTypes,
      ),
    ),
  );
}

function coverage(terms: string[], found: Set<string>): {
  matches: string[];
  gaps: string[];
  score: number;
} {
  const normalized = [...new Set(terms.map(canonicalizeTerm))];
  const matches = normalized.filter((term) => found.has(term));
  const gaps = normalized.filter((term) => !found.has(term));
  return {
    matches,
    gaps,
    score: normalized.length === 0 ? 70 : clamp((matches.length / normalized.length) * 100),
  };
}

function localize(language: SupportedLanguage, en: string, zh: string): string {
  return language === "zh" ? zh : en;
}

function buildBreakdown(
  query: ParsedJobDescription,
  evidence: RetrievedEvidence[],
): {
  items: MatchBreakdownItem[];
  requiredMatches: string[];
  preferredMatches: string[];
  requiredGaps: string[];
} {
  const found = evidenceTaxonomy(evidence);
  const required = coverage(query.requiredSkills, found);
  const preferred = coverage(query.preferredSkills, found);
  const domain = coverage(query.industries, new Set(evidence.flatMap((item) => item.chunk.industries)));
  const product = coverage(
    query.productTypes,
    new Set(evidence.flatMap((item) => item.chunk.productTypes)),
  );
  const scopeSignals = new Set(
    evidence.flatMap((item) => item.chunk.competencies).concat(
      evidence.flatMap((item) => item.chunk.skills.map(canonicalizeTerm)),
    ),
  );
  const scopeScore = query.seniority
    ? scopeSignals.has("Product Leadership") ||
      scopeSignals.has("0-to-1 Product") ||
      scopeSignals.has("Technical Programme Delivery")
      ? 90
      : 45
    : 70;
  const achievementCount = evidence.filter(
    (item) => item.chunk.parentType === "achievement",
  ).length;
  const achievementScore = clamp(45 + Math.min(achievementCount, 3) * 18);
  const hasConstraints =
    query.languageRequirements.length + query.locationRequirements.length > 0;
  const constraintsScore = hasConstraints ? 50 : 70;

  return {
    items: [
      {
        key: "requiredSkills",
        score: required.score,
        weight: DEFAULT_MATCH_WEIGHTS.requiredSkills,
        explanation:
          required.gaps.length === 0
            ? "All detected required terms have supporting evidence."
            : `${required.gaps.length} detected required term${required.gaps.length === 1 ? "" : "s"} lack direct evidence.`,
      },
      {
        key: "domainRelevance",
        score: domain.score,
        weight: DEFAULT_MATCH_WEIGHTS.domainRelevance,
        explanation: `${domain.matches.length} of ${query.industries.length} detected industry signals matched.`,
      },
      {
        key: "productTypes",
        score: product.score,
        weight: DEFAULT_MATCH_WEIGHTS.productTypes,
        explanation: `${product.matches.length} of ${query.productTypes.length} detected product types matched.`,
      },
      {
        key: "seniorityScope",
        score: scopeScore,
        weight: DEFAULT_MATCH_WEIGHTS.seniorityScope,
        explanation: query.seniority
          ? "Compared detected seniority with verified leadership and delivery scope."
          : "No explicit seniority requirement was detected.",
      },
      {
        key: "achievementEvidence",
        score: achievementScore,
        weight: DEFAULT_MATCH_WEIGHTS.achievementEvidence,
        explanation: `${achievementCount} verified achievement chunk${achievementCount === 1 ? "" : "s"} retrieved.`,
      },
      {
        key: "constraints",
        score: constraintsScore,
        weight: DEFAULT_MATCH_WEIGHTS.constraints,
        explanation: hasConstraints
          ? "Language or location constraints require manual confirmation."
          : "No explicit language or location constraint was detected.",
      },
    ],
    requiredMatches: required.matches,
    preferredMatches: preferred.matches,
    requiredGaps: required.gaps,
  };
}

function buildRecommendations(
  evidence: RetrievedEvidence[],
  language: SupportedLanguage,
): GroundedRecommendation[] {
  return evidence
    .filter((item) => item.chunk.evidenceLevel === "confirmed")
    .slice(0, 4)
    .map((item) => ({
      text: localize(
        language,
        `Prioritize “${item.chunk.text}” and cite it as ${item.relationship} evidence for this role.`,
        `優先呈現「${item.chunk.text}」，並標示為此職位的${item.relationship === "direct" ? "直接" : "可轉移"}證據。`,
      ),
      sourcePaths: item.chunk.sourcePaths,
      evidenceLevel: item.chunk.evidenceLevel,
    }));
}

function buildQuestions(
  query: ParsedJobDescription,
  language: SupportedLanguage,
): string[] {
  const terms = [...query.requiredSkills, ...query.competencies].slice(0, 4);
  const questions = terms.map((term) =>
    localize(
      language,
      `Which verified example best demonstrates ${term}, and what trade-offs did you manage?`,
      `哪一個已驗證案例最能證明你具備「${term}」，過程中如何處理取捨？`,
    ),
  );
  questions.push(
    localize(
      language,
      "Which required qualification is not directly evidenced, and how would you address that gap honestly?",
      "哪一項必要條件目前缺乏直接證據？你會如何誠實說明並補足這個落差？",
    ),
  );
  return questions;
}

export async function analyzeCareerMatch(input: {
  parsed: ParsedJobDescription;
  language?: SupportedLanguage;
  retriever?: LocalCareerRetriever;
}): Promise<CareerAnalysis> {
  const language = input.language ?? "en";
  const retriever = input.retriever ?? new LocalCareerRetriever();
  const evidence = await retriever.retrieve(input.parsed, { limit: 10 });
  const breakdown = buildBreakdown(input.parsed, evidence);
  const weightedScore = breakdown.items.reduce(
    (sum, item) => sum + item.score * item.weight,
    0,
  );
  const requiredPenalty = breakdown.requiredGaps.length * 3;
  const overallScore = clamp(weightedScore - requiredPenalty);
  const gaps = breakdown.requiredGaps.map((gap) =>
    localize(
      language,
      `No confirmed evidence was retrieved for required term: ${gap}.`,
      `尚未檢索到必要條件「${gap}」的 confirmed 證據。`,
    ),
  );
  if (gaps.length === 0 && input.parsed.requiredSkills.length === 0) {
    gaps.push(
      localize(
        language,
        "The parser found no explicit required-skills section; review the JD structure manually.",
        "解析器未找到明確的必要技能段落，請人工檢查職缺內容結構。",
      ),
    );
  }
  const relevantStoryIds = new Set(
    evidence
      .filter((item) => item.chunk.parentType === "story")
      .map((item) => item.chunk.parentId),
  );
  const starStories = stories
    .filter((story) => relevantStoryIds.has(story.id))
    .slice(0, 3);

  return {
    parsed: input.parsed,
    overallScore,
    scoreBreakdown: breakdown.items,
    evidence,
    requiredMatches: breakdown.requiredMatches,
    preferredMatches: breakdown.preferredMatches,
    gaps,
    concerns: [
      localize(
        language,
        "The score is a transparent heuristic, not a hiring prediction.",
        "此分數為透明的啟發式評估，不是錄取機率預測。",
      ),
      ...breakdown.requiredGaps.slice(0, 2).map((gap) =>
        localize(
          language,
          `Be prepared to discuss the absence of direct ${gap} evidence.`,
          `請準備說明目前缺乏「${gap}」直接證據的情況。`,
        ),
      ),
    ],
    recommendations: buildRecommendations(evidence, language),
    interviewQuestions: buildQuestions(input.parsed, language),
    starStories,
    diagnostics: {
      mode: "local",
      chunkCount: retriever.getChunkCount(),
      retrievedCount: evidence.length,
      appliedFilters: ["confidentiality=public", "evidenceLevel≠unverified"],
      weights: DEFAULT_MATCH_WEIGHTS,
      note: "Keyword, taxonomy, and metadata scores are fused deterministically. Semantic score is 0 unless a vector provider is configured.",
    },
  };
}

export function canUseForFactualGeneration(evidenceLevel: string): boolean {
  return evidenceLevel === "confirmed";
}
