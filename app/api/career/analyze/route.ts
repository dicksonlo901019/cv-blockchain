import { analyzeCareerMatch } from "@/lib/career/analyze";
import { validateCareerPayload, structuredError } from "@/lib/career/http";
import { parseJobDescription } from "@/lib/career/parser";

export async function POST(request: Request) {
  try {
    const payload = validateCareerPayload(await request.json());
    const parsed = parseJobDescription(payload);
    const analysis = await analyzeCareerMatch({
      parsed,
      language: payload.language,
    });
    return Response.json(analysis);
  } catch (error) {
    return structuredError(error);
  }
}
