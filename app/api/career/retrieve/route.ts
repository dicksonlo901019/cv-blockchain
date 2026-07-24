import { validateCareerPayload, structuredError } from "@/lib/career/http";
import { parseJobDescription } from "@/lib/career/parser";
import { LocalCareerRetriever } from "@/lib/career/retriever";

export async function POST(request: Request) {
  try {
    const payload = validateCareerPayload(await request.json());
    const parsed = parseJobDescription(payload);
    const retriever = new LocalCareerRetriever();
    const evidence = await retriever.retrieve(parsed, { limit: 10 });
    return Response.json({ parsed, evidence });
  } catch (error) {
    return structuredError(error);
  }
}
