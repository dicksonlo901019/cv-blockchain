import { careerKnowledgeBase } from "../lib/career/knowledge.ts";
import { validateCareerKnowledgeBase } from "../lib/career/validate.ts";

const errors = validateCareerKnowledgeBase(careerKnowledgeBase);
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Career data is valid: ${careerKnowledgeBase.experiences.length} experiences, ${careerKnowledgeBase.projects.length} projects, ${careerKnowledgeBase.achievements.length} achievements, ${careerKnowledgeBase.skills.length} skills, ${careerKnowledgeBase.stories.length} stories.`,
  );
}
