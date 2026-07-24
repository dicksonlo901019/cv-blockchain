import type {
  CareerAchievement,
  CareerExperience,
  CareerProject,
  InterviewStory,
  SkillEvidence,
} from "./types.ts";

interface KnowledgeBase {
  experiences: CareerExperience[];
  projects: CareerProject[];
  achievements: CareerAchievement[];
  skills: SkillEvidence[];
  stories: InterviewStory[];
}

const evidenceLevels = new Set(["confirmed", "inferred", "draft", "unverified"]);
const confidentialityLevels = new Set(["public", "private", "restricted"]);

function hasSources(record: { sourcePaths?: unknown }): boolean {
  return (
    Array.isArray(record.sourcePaths) &&
    record.sourcePaths.length > 0 &&
    record.sourcePaths.every(
      (path) => typeof path === "string" && path.trim().length > 0,
    )
  );
}

function checkCommon(
  record: { id?: unknown; evidenceLevel?: unknown; sourcePaths?: unknown },
  label: string,
  errors: string[],
): void {
  if (typeof record.id !== "string" || record.id.length === 0) {
    errors.push(`${label} is missing a valid id.`);
  }
  if (
    typeof record.evidenceLevel !== "string" ||
    !evidenceLevels.has(record.evidenceLevel)
  ) {
    errors.push(`${label} has an unsupported evidenceLevel.`);
  }
  if (!hasSources(record)) {
    errors.push(`${label} must have at least one source path.`);
  }
}

export function validateCareerKnowledgeBase(
  knowledgeBase: KnowledgeBase,
): string[] {
  const errors: string[] = [];

  for (const experience of knowledgeBase.experiences) {
    checkCommon(experience, `Experience ${String(experience.id)}`, errors);
    if (!experience.company || !experience.title || !experience.summary) {
      errors.push(`Experience ${experience.id} is missing required content.`);
    }
    if (!confidentialityLevels.has(experience.confidentiality)) {
      errors.push(`Experience ${experience.id} has invalid confidentiality.`);
    }
  }

  for (const project of knowledgeBase.projects) {
    checkCommon(project, `Project ${String(project.id)}`, errors);
    if (
      !project.projectName ||
      !project.company ||
      !Array.isArray(project.responsibilities)
    ) {
      errors.push(`Project ${project.id} is missing required content.`);
    }
    if (!confidentialityLevels.has(project.confidentiality)) {
      errors.push(`Project ${project.id} has invalid confidentiality.`);
    }
  }

  for (const achievement of knowledgeBase.achievements) {
    checkCommon(achievement, `Achievement ${String(achievement.id)}`, errors);
    if (!achievement.statement || !achievement.achievementType) {
      errors.push(`Achievement ${achievement.id} is missing required content.`);
    }
  }

  for (const skill of knowledgeBase.skills) {
    checkCommon(
      {
        ...skill,
        sourcePaths: skill.evidence.flatMap((item) => item.sourcePaths),
      },
      `Skill ${String(skill.id)}`,
      errors,
    );
    if (
      !skill.skill ||
      !["Knowledge", "Applied", "Led"].includes(skill.proficiency) ||
      skill.evidence.length === 0
    ) {
      errors.push(`Skill ${skill.id} is malformed.`);
    }
  }

  for (const story of knowledgeBase.stories) {
    checkCommon(story, `Story ${String(story.id)}`, errors);
    if (
      !story.title ||
      !story.situation ||
      !story.task ||
      !story.action ||
      !story.result
    ) {
      errors.push(`Story ${story.id} is missing a STAR field.`);
    }
  }

  return errors;
}
