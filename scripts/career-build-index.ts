import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildCareerChunks } from "../lib/career/chunks.ts";

const chunks = buildCareerChunks();
const outputPath = path.resolve("work/career-chunks.json");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(chunks, null, 2)}\n`, "utf8");
console.log(`Built ${chunks.length} semantic chunks at ${outputPath}.`);
