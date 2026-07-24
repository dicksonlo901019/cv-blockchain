export type EvidenceLevel = "confirmed" | "inferred" | "draft" | "unverified";
export type ConfidentialityLevel = "public" | "private" | "restricted";
export type SupportedLanguage = "zh" | "en";

export interface CareerExperience {
  id: string;
  company: string;
  title: string;
  industry: string[];
  startDate?: string;
  endDate?: string;
  summary: string;
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
  confidentiality: ConfidentialityLevel;
}

export interface CareerProject {
  id: string;
  projectName: string;
  company: string;
  role: string;
  domains: string[];
  productTypes: string[];
  problem?: string;
  responsibilities: string[];
  deliverables: string[];
  outcomes: string[];
  skills: string[];
  competencies: string[];
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
  confidentiality: ConfidentialityLevel;
}

export interface CareerAchievement {
  id: string;
  statement: string;
  company?: string;
  projectId?: string;
  achievementType: string;
  metrics?: Record<string, string | number>;
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
}

export interface SkillEvidence {
  id: string;
  skill: string;
  category: string;
  proficiency: "Knowledge" | "Applied" | "Led";
  evidence: Array<{
    company?: string;
    projectId?: string;
    description: string;
    sourcePaths: string[];
  }>;
  evidenceLevel: EvidenceLevel;
}

export interface InterviewStory {
  id: string;
  title: string;
  competencies: string[];
  situation: string;
  task: string;
  action: string;
  result: string;
  lessons?: string;
  relatedProjectIds: string[];
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
}

export interface CareerChunk {
  id: string;
  parentId: string;
  parentType: "experience" | "project" | "achievement" | "skill" | "story" | "resume";
  text: string;
  language: SupportedLanguage;
  company?: string;
  jobTitle?: string;
  project?: string;
  industries: string[];
  productTypes: string[];
  skills: string[];
  competencies: string[];
  evidenceLevel: EvidenceLevel;
  confidentiality: ConfidentialityLevel;
  sourcePaths: string[];
}

export interface ParsedJobDescription {
  roleTitle?: string;
  company?: string;
  seniority?: string;
  industries: string[];
  productTypes: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  competencies: string[];
  responsibilities: string[];
  domainTerms: string[];
  languageRequirements: string[];
  locationRequirements: string[];
  rawText: string;
}

export interface RetrievalOptions {
  limit?: number;
  company?: string;
  parentTypes?: CareerChunk["parentType"][];
  evidenceLevels?: EvidenceLevel[];
  confidentiality?: ConfidentialityLevel[];
}

export interface RetrievedEvidence {
  chunk: CareerChunk;
  score: number;
  keywordScore: number;
  taxonomyScore: number;
  metadataScore: number;
  semanticScore: number;
  matchedTerms: string[];
  rationale: string;
  relationship: "direct" | "transferable";
}

export interface MatchBreakdownItem {
  key:
    | "requiredSkills"
    | "domainRelevance"
    | "productTypes"
    | "seniorityScope"
    | "achievementEvidence"
    | "constraints";
  score: number;
  weight: number;
  explanation: string;
}

export interface GroundedRecommendation {
  text: string;
  sourcePaths: string[];
  evidenceLevel: EvidenceLevel;
}

export interface CareerAnalysis {
  parsed: ParsedJobDescription;
  overallScore: number;
  scoreBreakdown: MatchBreakdownItem[];
  evidence: RetrievedEvidence[];
  requiredMatches: string[];
  preferredMatches: string[];
  gaps: string[];
  concerns: string[];
  recommendations: GroundedRecommendation[];
  interviewQuestions: string[];
  starStories: InterviewStory[];
  diagnostics: {
    mode: "local";
    chunkCount: number;
    retrievedCount: number;
    appliedFilters: string[];
    weights: Record<string, number>;
    note: string;
  };
}

export interface EmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

export interface CareerRetriever {
  retrieve(
    query: ParsedJobDescription,
    options?: RetrievalOptions,
  ): Promise<RetrievedEvidence[]>;
}
