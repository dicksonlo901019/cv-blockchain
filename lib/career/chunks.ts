import { achievements, experiences, projects, skills, stories } from "./knowledge.ts";
import type { CareerChunk } from "./types.ts";

function projectBase(project: (typeof projects)[number]) {
  return {
    parentId: project.id,
    parentType: "project" as const,
    language: "en" as const,
    company: project.company,
    jobTitle: project.role,
    project: project.projectName,
    industries: project.domains,
    productTypes: project.productTypes,
    skills: project.skills,
    competencies: project.competencies,
    evidenceLevel: project.evidenceLevel,
    confidentiality: project.confidentiality,
    sourcePaths: project.sourcePaths,
  };
}

export function buildCareerChunks(): CareerChunk[] {
  const chunks: CareerChunk[] = [];

  for (const experience of experiences) {
    chunks.push({
      id: `${experience.id}:overview`,
      parentId: experience.id,
      parentType: "experience",
      text: `${experience.title} at ${experience.company}. ${experience.summary}`,
      language: "en",
      company: experience.company,
      jobTitle: experience.title,
      industries: experience.industry,
      productTypes: [],
      skills: [],
      competencies: [],
      evidenceLevel: experience.evidenceLevel,
      confidentiality: experience.confidentiality,
      sourcePaths: experience.sourcePaths,
    });
  }

  for (const project of projects) {
    const base = projectBase(project);
    chunks.push({
      ...base,
      id: `${project.id}:overview`,
      text: [
        project.projectName,
        project.problem,
        project.deliverables.length > 0
          ? `Deliverables: ${project.deliverables.join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(". "),
    });
    project.responsibilities.forEach((responsibility, index) => {
      chunks.push({
        ...base,
        id: `${project.id}:responsibility:${index + 1}`,
        text: responsibility,
      });
    });
    project.outcomes.forEach((outcome, index) => {
      chunks.push({
        ...base,
        id: `${project.id}:outcome:${index + 1}`,
        text: outcome,
      });
    });
  }

  for (const achievement of achievements) {
    const project = projects.find((item) => item.id === achievement.projectId);
    chunks.push({
      id: `${achievement.id}:achievement`,
      parentId: achievement.id,
      parentType: "achievement",
      text: achievement.statement,
      language: "en",
      company: achievement.company,
      project: project?.projectName,
      industries: project?.domains ?? [],
      productTypes: project?.productTypes ?? [],
      skills: project?.skills ?? [],
      competencies: project?.competencies ?? [],
      evidenceLevel: achievement.evidenceLevel,
      confidentiality: "public",
      sourcePaths: achievement.sourcePaths,
    });
  }

  for (const skill of skills) {
    for (const [index, item] of skill.evidence.entries()) {
      const project = projects.find((candidate) => candidate.id === item.projectId);
      chunks.push({
        id: `${skill.id}:evidence:${index + 1}`,
        parentId: skill.id,
        parentType: "skill",
        text: `${skill.skill}: ${item.description}`,
        language: "en",
        company: item.company,
        project: project?.projectName,
        industries: project?.domains ?? [],
        productTypes: project?.productTypes ?? [],
        skills: [skill.skill, ...(project?.skills ?? [])],
        competencies: project?.competencies ?? [],
        evidenceLevel: skill.evidenceLevel,
        confidentiality: "public",
        sourcePaths: item.sourcePaths,
      });
    }
  }

  for (const story of stories) {
    const project = projects.find((item) => story.relatedProjectIds.includes(item.id));
    chunks.push({
      id: `${story.id}:story`,
      parentId: story.id,
      parentType: "story",
      text: `${story.title}. Situation: ${story.situation} Task: ${story.task} Action: ${story.action} Result: ${story.result}`,
      language: "en",
      company: project?.company,
      project: project?.projectName,
      industries: project?.domains ?? [],
      productTypes: project?.productTypes ?? [],
      skills: project?.skills ?? [],
      competencies: story.competencies,
      evidenceLevel: story.evidenceLevel,
      confidentiality: "public",
      sourcePaths: story.sourcePaths,
    });
  }

  return chunks;
}
