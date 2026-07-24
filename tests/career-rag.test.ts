import assert from "node:assert/strict";
import test from "node:test";
import { analyzeCareerMatch, canUseForFactualGeneration } from "../lib/career/analyze.ts";
import { buildCareerChunks } from "../lib/career/chunks.ts";
import {
  aiProductStrategyFixture,
  embeddedFinanceFixture,
  zhProductFixture,
} from "../lib/career/fixtures.ts";
import { careerKnowledgeBase } from "../lib/career/knowledge.ts";
import { parseJobDescription } from "../lib/career/parser.ts";
import { LocalCareerRetriever } from "../lib/career/retriever.ts";
import { findTaxonomyMatches } from "../lib/career/taxonomy.ts";
import { validateCareerKnowledgeBase } from "../lib/career/validate.ts";

test("validates normalized career records and rejects malformed evidence", () => {
  assert.deepEqual(validateCareerKnowledgeBase(careerKnowledgeBase), []);
  const malformed = structuredClone(careerKnowledgeBase);
  malformed.projects[0].sourcePaths = [];
  assert.match(validateCareerKnowledgeBase(malformed).join("\n"), /source path/i);
});

test("allows only confirmed evidence in CV-ready factual generation", () => {
  assert.equal(canUseForFactualGeneration("confirmed"), true);
  assert.equal(canUseForFactualGeneration("inferred"), false);
  assert.equal(canUseForFactualGeneration("draft"), false);
  assert.equal(canUseForFactualGeneration("unverified"), false);
});

test("parses a representative Embedded Finance PM description", () => {
  const parsed = parseJobDescription(embeddedFinanceFixture);
  assert.equal(parsed.seniority?.toLocaleLowerCase(), "senior");
  assert.ok(parsed.productTypes.includes("Embedded Finance"));
  assert.ok(parsed.requiredSkills.includes("Risk Management"));
  assert.ok(parsed.preferredSkills.includes("Wallet"));
  assert.ok(parsed.languageRequirements.includes("English"));
});

test("normalizes taxonomy aliases without collapsing distinct evidence terms", () => {
  const matches = findTaxonomyMatches(
    "KYC integration with Sumsub SDK and identity verification",
  );
  assert.ok(matches.includes("Compliance"));
  assert.ok(matches.includes("Compliance / AML"));
});

test("applies metadata filters before ranking", async () => {
  const retriever = new LocalCareerRetriever();
  const parsed = parseJobDescription(embeddedFinanceFixture);
  const results = await retriever.retrieve(parsed, {
    company: "Xchanger Co., Ltd.",
  });
  assert.ok(results.length > 0);
  assert.ok(results.every((item) => item.chunk.company === "Xchanger Co., Ltd."));
});

test("produces a transparent weighted score with weights totaling 100%", async () => {
  const parsed = parseJobDescription(embeddedFinanceFixture);
  const analysis = await analyzeCareerMatch({ parsed, language: "en" });
  const totalWeight = analysis.scoreBreakdown.reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  assert.equal(Number(totalWeight.toFixed(2)), 1);
  assert.ok(analysis.overallScore >= 0 && analysis.overallScore <= 100);
  assert.equal(analysis.scoreBreakdown[0].key, "requiredSkills");
});

test("keeps local retrieval ordering deterministic", async () => {
  const retriever = new LocalCareerRetriever();
  const parsed = parseJobDescription(aiProductStrategyFixture);
  const first = await retriever.retrieve(parsed);
  const second = await retriever.retrieve(parsed);
  assert.deepEqual(
    first.map((item) => [item.chunk.id, item.score]),
    second.map((item) => [item.chunk.id, item.score]),
  );
});

test("makes missing required evidence explicit", async () => {
  const parsed = parseJobDescription({
    text: `Requirements
- Kubernetes infrastructure ownership
- Medical-device regulatory submissions
- Product strategy`,
    roleTitle: "Medical Platform Product Manager",
  });
  const analysis = await analyzeCareerMatch({ parsed, language: "en" });
  assert.ok(analysis.gaps.length > 0);
  assert.match(analysis.gaps.join("\n"), /No confirmed evidence/i);
});

test("handles Chinese and English job descriptions", async () => {
  const zh = parseJobDescription(zhProductFixture);
  const en = parseJobDescription(embeddedFinanceFixture);
  assert.ok(zh.requiredSkills.includes("Risk Management"));
  assert.ok(en.requiredSkills.includes("Risk Management"));
  const zhAnalysis = await analyzeCareerMatch({ parsed: zh, language: "zh" });
  assert.match(zhAnalysis.concerns[0], /分數|評估/);
});

test("deterministic output never copies unsupported JD metrics", async () => {
  const unsupportedMetric = "987654321%";
  const parsed = parseJobDescription({
    ...embeddedFinanceFixture,
    text: `${embeddedFinanceFixture.text}\nCandidate must increase revenue by ${unsupportedMetric}.`,
  });
  const analysis = await analyzeCareerMatch({ parsed, language: "en" });
  const generated = JSON.stringify({
    recommendations: analysis.recommendations,
    questions: analysis.interviewQuestions,
    stories: analysis.starStories,
  });
  assert.doesNotMatch(generated, /987654321%/);
});

test("validates both representative fixtures and semantic-unit chunks", async () => {
  const chunks = buildCareerChunks();
  assert.ok(chunks.some((chunk) => chunk.id.includes(":responsibility:")));
  assert.ok(chunks.some((chunk) => chunk.parentType === "achievement"));
  for (const fixture of [embeddedFinanceFixture, aiProductStrategyFixture]) {
    const analysis = await analyzeCareerMatch({
      parsed: parseJobDescription(fixture),
      language: "en",
    });
    assert.ok(analysis.evidence.length > 0);
    assert.ok(analysis.evidence.every((item) => item.chunk.sourcePaths.length > 0));
  }
});
