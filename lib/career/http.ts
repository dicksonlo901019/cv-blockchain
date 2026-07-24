export const MAX_JD_CHARACTERS = 50_000;

export interface CareerRequestPayload {
  text?: unknown;
  roleTitle?: unknown;
  company?: unknown;
  language?: unknown;
}

export function validateCareerPayload(payload: CareerRequestPayload): {
  text: string;
  roleTitle?: string;
  company?: string;
  language: "zh" | "en";
} {
  if (typeof payload.text !== "string" || payload.text.trim().length < 40) {
    throw new Error("Job description must be at least 40 characters.");
  }
  if (payload.text.length > MAX_JD_CHARACTERS) {
    throw new Error(`Job description must not exceed ${MAX_JD_CHARACTERS} characters.`);
  }
  if (payload.roleTitle !== undefined && typeof payload.roleTitle !== "string") {
    throw new Error("Role title must be a string.");
  }
  if (payload.company !== undefined && typeof payload.company !== "string") {
    throw new Error("Company must be a string.");
  }
  if (
    payload.language !== undefined &&
    payload.language !== "zh" &&
    payload.language !== "en"
  ) {
    throw new Error("Language must be zh or en.");
  }

  return {
    text: payload.text.trim(),
    roleTitle: payload.roleTitle?.trim() || undefined,
    company: payload.company?.trim() || undefined,
    language: payload.language === "zh" ? "zh" : "en",
  };
}

export function structuredError(error: unknown): Response {
  const message =
    error instanceof Error ? error.message : "Unable to process the career request.";
  return Response.json(
    { error: { code: "INVALID_CAREER_REQUEST", message } },
    { status: 400 },
  );
}
