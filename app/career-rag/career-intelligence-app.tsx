"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { CareerAnalysis, SupportedLanguage } from "@/lib/career/types";
import styles from "./career-rag.module.css";

interface Fixture {
  roleTitle: string;
  company: string;
  text: string;
}

interface Props {
  locale: SupportedLanguage;
  initialFixture: Fixture;
  alternateFixture: Fixture;
  initialAnalysis: CareerAnalysis;
}

const labels = {
  en: {
    heading: "Match your experience to the role",
    intro: "Evidence-first analysis from your verified career record.",
    inputTitle: "1. Paste the job description",
    role: "Role title",
    company: "Company",
    jd: "Job description",
    analyze: "Analyze role",
    analyzing: "Analyzing evidence…",
    match: "Match",
    matchTitle: "2. Match analysis (grounded in your verified record)",
    scoreNote: "Transparent heuristic — not a hiring prediction.",
    breakdown: "Score breakdown",
    evidence: "3. Matched evidence",
    relevance: "Relevance",
    status: "Status",
    source: "Source",
    confirmed: "Confirmed",
    direct: "Direct",
    transferable: "Transferable",
    gaps: "4. Evidence gaps",
    recommendations: "5. CV recommendations",
    interview: "6. Interview preparation",
    stories: "Grounded STAR evidence",
    diagnostics: "7. Retrieval diagnostics",
    noEvidence: "No matching public evidence was retrieved. Refine the job description.",
    useAiFixture: "Try AI / Product Strategy fixture",
    useFinanceFixture: "Restore primary fixture",
    back: "Back to CV",
    error: "Analysis failed",
  },
  zh: {
    heading: "用已驗證經歷比對目標職位",
    intro: "以你的職涯知識庫為依據，先找證據，再產出建議。",
    inputTitle: "1. 貼上職缺內容",
    role: "職位名稱",
    company: "公司",
    jd: "職缺描述",
    analyze: "分析職缺",
    analyzing: "正在檢索證據…",
    match: "匹配",
    matchTitle: "2. 職位匹配分析（以已驗證資料為依據）",
    scoreNote: "透明啟發式分數，並非錄取機率。",
    breakdown: "分數拆解",
    evidence: "3. 匹配證據",
    relevance: "匹配原因",
    status: "狀態",
    source: "來源",
    confirmed: "已確認",
    direct: "直接經驗",
    transferable: "可轉移經驗",
    gaps: "4. 證據缺口",
    recommendations: "5. 履歷建議",
    interview: "6. 面試準備",
    stories: "有依據的 STAR 案例",
    diagnostics: "7. 檢索診斷",
    noEvidence: "未找到匹配的公開證據，請調整職缺內容。",
    useAiFixture: "改用 AI／產品策略範例",
    useFinanceFixture: "還原主要範例",
    back: "返回履歷",
    error: "分析失敗",
  },
} as const;

const breakdownLabels = {
  en: {
    requiredSkills: "Required skills",
    domainRelevance: "Domain relevance",
    productTypes: "Product types",
    seniorityScope: "Seniority / scope",
    achievementEvidence: "Achievement evidence",
    constraints: "Language / location",
  },
  zh: {
    requiredSkills: "必要技能",
    domainRelevance: "產業領域",
    productTypes: "產品類型",
    seniorityScope: "職級／範疇",
    achievementEvidence: "成就證據",
    constraints: "語言／地點",
  },
} as const;

function sourceLabel(path: string): string {
  return path.replace("public/", "");
}

export default function CareerIntelligenceApp({
  locale,
  initialFixture,
  alternateFixture,
  initialAnalysis,
}: Props) {
  const copy = labels[locale];
  const [form, setForm] = useState(initialFixture);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [usingAlternate, setUsingAlternate] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function setFixture(useAlternate: boolean) {
    setUsingAlternate(useAlternate);
    setForm(useAlternate ? alternateFixture : initialFixture);
    setError("");
  }

  function analyze() {
    setError("");
    startTransition(async () => {
      try {
        const response = await fetch("/api/career/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...form, language: locale }),
        });
        const payload = (await response.json()) as
          | CareerAnalysis
          | { error?: { message?: string } };
        if (!response.ok || !("overallScore" in payload)) {
          throw new Error(
            "error" in payload
              ? payload.error?.message
              : "Unable to analyze the role.",
          );
        }
        setAnalysis(payload);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to analyze the role.",
        );
      }
    });
  }

  return (
    <main className={styles.shell} lang={locale === "zh" ? "zh-Hant" : "en"}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href={`/career-rag/${locale}/`}>
          Career Intelligence
        </Link>
        <nav className={styles.nav} aria-label="Career Intelligence">
          <Link
            className={locale === "zh" ? styles.activeLocale : undefined}
            href="/career-rag/zh/"
            hrefLang="zh-Hant"
          >
            中文
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            className={locale === "en" ? styles.activeLocale : undefined}
            href="/career-rag/en/"
            hrefLang="en"
          >
            EN
          </Link>
          <Link className={styles.cvLink} href={locale === "zh" ? "/zh/" : "/blockchain-cv"}>
            ← {copy.back}
          </Link>
        </nav>
      </header>

      <div className={styles.page}>
        <section className={styles.intro}>
          <h1>{copy.heading}</h1>
          <p>{copy.intro}</p>
        </section>

        <div className={styles.workspace}>
          <section className={styles.inputPanel} aria-labelledby="input-title">
            <h2 id="input-title">{copy.inputTitle}</h2>
            <label>
              <span>{copy.role}</span>
              <input
                value={form.roleTitle}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    roleTitle: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span>{copy.company}</span>
              <input
                value={form.company}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              <span>{copy.jd}</span>
              <textarea
                value={form.text}
                onChange={(event) =>
                  setForm((current) => ({ ...current, text: event.target.value }))
                }
              />
            </label>
            <button
              className={styles.analyzeButton}
              type="button"
              onClick={analyze}
              disabled={isPending}
            >
              <span aria-hidden="true" className={styles.searchIcon} />
              {isPending ? copy.analyzing : copy.analyze}
            </button>
            <button
              type="button"
              className={styles.fixtureButton}
              onClick={() => setFixture(!usingAlternate)}
            >
              {usingAlternate ? copy.useFinanceFixture : copy.useAiFixture}
            </button>
            {error ? (
              <p className={styles.error} role="alert">
                <strong>{copy.error}:</strong> {error}
              </p>
            ) : null}
          </section>

          <section className={styles.results} aria-live="polite" aria-busy={isPending}>
            <div className={styles.scoreHeader}>
              <div>
                <h2>{copy.matchTitle}</h2>
                <p className={styles.score}>
                  <strong>{analysis.overallScore}%</strong>
                  <span>{copy.match}</span>
                </p>
                <p className={styles.scoreNote}>{copy.scoreNote}</p>
              </div>
              <div className={styles.breakdown}>
                <h3>{copy.breakdown}</h3>
                {analysis.scoreBreakdown.map((item) => (
                  <div className={styles.breakdownRow} key={item.key} title={item.explanation}>
                    <span>{breakdownLabels[locale][item.key]}</span>
                    <span className={styles.bar} aria-hidden="true">
                      <span style={{ width: `${item.score}%` }} />
                    </span>
                    <strong>{item.score}</strong>
                  </div>
                ))}
              </div>
            </div>

            <section className={styles.evidenceSection}>
              <h2>{copy.evidence}</h2>
              {analysis.evidence.length === 0 ? (
                <p className={styles.empty}>{copy.noEvidence}</p>
              ) : (
                <div className={styles.evidenceList}>
                  <div className={styles.evidenceHead} aria-hidden="true">
                    <span>Evidence</span>
                    <span>{copy.relevance}</span>
                    <span>{copy.status}</span>
                    <span>{copy.source}</span>
                  </div>
                  {analysis.evidence.slice(0, 6).map((item) => (
                    <article className={styles.evidenceRow} key={item.chunk.id}>
                      <div>
                        <h3>{item.chunk.project ?? item.chunk.company ?? item.chunk.parentId}</h3>
                        <p>{item.chunk.text}</p>
                      </div>
                      <div>
                        <span className={styles.relationship}>
                          {item.relationship === "direct"
                            ? copy.direct
                            : copy.transferable}
                        </span>
                        <p>{item.rationale}</p>
                      </div>
                      <div className={styles.confirmed}>
                        <span aria-hidden="true">✓</span>
                        {item.chunk.evidenceLevel === "confirmed"
                          ? copy.confirmed
                          : item.chunk.evidenceLevel}
                      </div>
                      <div className={styles.sources}>
                        {item.chunk.sourcePaths.map((path) => (
                          <code key={path}>{sourceLabel(path)}</code>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>

        <div className={styles.outputGrid}>
          <section>
            <h2>{copy.gaps}</h2>
            <ul>
              {analysis.gaps.concat(analysis.concerns).map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{copy.recommendations}</h2>
            <ul>
              {analysis.recommendations.map((recommendation) => (
                <li key={recommendation.text}>
                  <span>{recommendation.text}</span>
                  <small>{recommendation.sourcePaths.map(sourceLabel).join(" · ")}</small>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{copy.interview}</h2>
            <ol>
              {analysis.interviewQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
            {analysis.starStories.length > 0 ? (
              <>
                <h3 className={styles.storyTitle}>{copy.stories}</h3>
                {analysis.starStories.map((story) => (
                  <details key={story.id}>
                    <summary>{story.title}</summary>
                    <p>
                      <strong>Situation:</strong> {story.situation}
                    </p>
                    <p>
                      <strong>Action:</strong> {story.action}
                    </p>
                    <p>
                      <strong>Result:</strong> {story.result}
                    </p>
                    <code>{story.sourcePaths.map(sourceLabel).join(" · ")}</code>
                  </details>
                ))}
              </>
            ) : null}
          </section>
        </div>

        <details className={styles.diagnostics}>
          <summary>
            <strong>{copy.diagnostics}</strong>
            <span>
              {analysis.diagnostics.mode} · {analysis.diagnostics.retrievedCount}/
              {analysis.diagnostics.chunkCount} chunks
            </span>
          </summary>
          <div>
            <p>{analysis.diagnostics.note}</p>
            <p>{analysis.diagnostics.appliedFilters.join(" · ")}</p>
            <pre>{JSON.stringify(analysis.diagnostics.weights, null, 2)}</pre>
          </div>
        </details>
      </div>
    </main>
  );
}
