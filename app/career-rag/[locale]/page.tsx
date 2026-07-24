import { notFound } from "next/navigation";
import { analyzeCareerMatch } from "@/lib/career/analyze";
import {
  aiProductStrategyFixture,
  embeddedFinanceFixture,
  zhProductFixture,
} from "@/lib/career/fixtures";
import { parseJobDescription } from "@/lib/career/parser";
import CareerIntelligenceApp from "../career-intelligence-app";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default async function CareerRagPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "zh") notFound();

  const fixture = locale === "zh" ? zhProductFixture : embeddedFinanceFixture;
  const parsed = parseJobDescription(fixture);
  const initialAnalysis = await analyzeCareerMatch({
    parsed,
    language: locale,
  });

  return (
    <CareerIntelligenceApp
      locale={locale}
      initialFixture={fixture}
      alternateFixture={aiProductStrategyFixture}
      initialAnalysis={initialAnalysis}
    />
  );
}
