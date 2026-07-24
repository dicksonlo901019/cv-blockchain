import { validateCareerPayload, structuredError } from "@/lib/career/http";
import { parseJobDescription } from "@/lib/career/parser";

export async function POST(request: Request) {
  try {
    const payload = validateCareerPayload(await request.json());
    return Response.json(
      parseJobDescription({
        text: payload.text,
        roleTitle: payload.roleTitle,
        company: payload.company,
      }),
    );
  } catch (error) {
    return structuredError(error);
  }
}
