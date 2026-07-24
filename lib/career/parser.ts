import { COMPETENCIES, PRODUCT_TYPES, findTaxonomyMatches } from "./taxonomy.ts";
import type { ParsedJobDescription } from "./types.ts";

const responsibilityVerbs =
  /^(?:[-*•]\s*)?(lead|drive|own|define|develop|build|manage|partner|collaborate|design|deliver|負責|主導|帶領|規劃|定義|設計|推動)/i;
const seniorityPattern =
  /\b(principal|staff|head|director|lead|senior|mid-level|junior|associate)\b|資深|主管|總監|初階/i;
const languagePattern =
  /\b(?:English|Mandarin|Chinese|Japanese|Korean|Cantonese)\b|英文|英語|中文|國語|日文|粵語/gi;
const locationPattern =
  /\b(?:Taipei|Taiwan|Singapore|Hong Kong|remote|hybrid|onsite)\b|台北|台灣|新加坡|香港|遠端|混合辦公/gi;

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function extractSectionLines(text: string, preferred: boolean): string[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  let mode: "required" | "preferred" | "other" = "other";
  const found: string[] = [];

  for (const line of lines) {
    let isHeading = false;
    if (/preferred|nice[- ]to[- ]have|bonus|加分|優先|尤佳/i.test(line)) {
      mode = "preferred";
      isHeading = true;
    } else if (/required|requirements|qualifications|must have|必備|必要|資格/i.test(line)) {
      mode = "required";
      isHeading = true;
    } else if (/responsibilities|what you.ll do|職責|工作內容/i.test(line)) {
      mode = "other";
      isHeading = true;
    }

    if (
      !isHeading &&
      (preferred && mode === "preferred") ||
      (!isHeading && !preferred && mode === "required")
    ) {
      const matches = findTaxonomyMatches(line);
      if (matches.length > 0) {
        found.push(...matches);
      } else if (/^[-*•]/.test(line) && line.length <= 180) {
        found.push(
          ...line
            .replace(/^[-*•]\s*/, "")
            .replace(/[.;]$/, "")
            .split(/,|\band\b|、|與|及/gi)
            .map((item) => item.trim())
            .filter((item) => item.length > 2),
        );
      }
    }
  }

  return unique(found);
}

export function parseJobDescription(input: {
  text: string;
  roleTitle?: string;
  company?: string;
}): ParsedJobDescription {
  const rawText = input.text.trim();
  const allMatches = findTaxonomyMatches(
    [input.roleTitle, input.company, rawText].filter(Boolean).join("\n"),
  );
  const preferredSkills = extractSectionLines(rawText, true);
  const explicitRequired = extractSectionLines(rawText, false);
  const productTypeSet = new Set<string>(PRODUCT_TYPES);
  const competencySet = new Set<string>(COMPETENCIES);
  const productTypes = allMatches.filter((item) => productTypeSet.has(item));
  const competencies = allMatches.filter((item) => competencySet.has(item));
  const requiredSkills = unique(
    (explicitRequired.length > 0 ? explicitRequired : allMatches).filter(
      (item) => !preferredSkills.includes(item),
    ),
  );
  const responsibilities = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => responsibilityVerbs.test(line))
    .map((line) => line.replace(/^[-*•]\s*/, ""));
  const roleAndText = `${input.roleTitle ?? ""}\n${rawText}`;
  const seniority = roleAndText.match(seniorityPattern)?.[0];
  const industries = unique(
    [
      /embedded finance|嵌入式金融/i.test(rawText) ? "Embedded Finance" : "",
      /fintech|financial technology|金融科技/i.test(rawText) ? "FinTech" : "",
      /web3|crypto|blockchain|區塊鏈|加密/i.test(rawText) ? "Web3" : "",
      /artificial intelligence|\bAI\b|人工智慧/i.test(rawText) ? "AI" : "",
      /gaming|game|遊戲/i.test(rawText) ? "Gaming" : "",
    ].filter(Boolean),
  );

  return {
    roleTitle: input.roleTitle?.trim() || undefined,
    company: input.company?.trim() || undefined,
    seniority,
    industries,
    productTypes,
    requiredSkills,
    preferredSkills,
    competencies,
    responsibilities,
    domainTerms: unique(allMatches),
    languageRequirements: unique(rawText.match(languagePattern) ?? []),
    locationRequirements: unique(rawText.match(locationPattern) ?? []),
    rawText,
  };
}
