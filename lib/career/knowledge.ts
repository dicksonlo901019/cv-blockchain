import experiencesJson from "../../career-knowledge-base/experiences/experiences.json" with { type: "json" };
import projectsJson from "../../career-knowledge-base/projects/projects.json" with { type: "json" };
import achievementsJson from "../../career-knowledge-base/achievements/achievements.json" with { type: "json" };
import skillsJson from "../../career-knowledge-base/skills/skills.json" with { type: "json" };
import storiesJson from "../../career-knowledge-base/interview-stories/stories.json" with { type: "json" };
import type {
  CareerAchievement,
  CareerExperience,
  CareerProject,
  InterviewStory,
  SkillEvidence,
} from "./types.ts";

export const experiences = experiencesJson as CareerExperience[];
export const projects = projectsJson as CareerProject[];
export const achievements = achievementsJson as CareerAchievement[];
export const skills = skillsJson as SkillEvidence[];
export const stories = storiesJson as InterviewStory[];

export const careerKnowledgeBase = {
  experiences,
  projects,
  achievements,
  skills,
  stories,
};
