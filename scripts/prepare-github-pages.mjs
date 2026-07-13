import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(projectRoot, "public");
const outputDir = path.join(projectRoot, "pages-dist");
const sourceHtmlPath = path.join(publicDir, "blockchain-cv.html");
const pdfName = "dickson-lo-blockchain-cv.pdf";
const zhDir = path.join(publicDir, "zh");
const zhHtmlPath = path.join(zhDir, "index.html");
const zhPdfPath = path.join(zhDir, pdfName);

const sourceHtml = await readFile(sourceHtmlPath, "utf8");
const zhHtml = await readFile(zhHtmlPath, "utf8");

if ([sourceHtml, zhHtml].some((html) => /\b(?:href|src)=["']\//i.test(html))) {
  throw new Error(
    "GitHub Pages 專案網址不能使用網站根目錄資源路徑；請改用 ./ 或完整 HTTPS 網址。",
  );
}

const pdfPath = path.join(publicDir, pdfName);
const pdfStats = await stat(pdfPath);
const zhPdfStats = await stat(zhPdfPath);
if (
  !pdfStats.isFile() ||
  pdfStats.size === 0 ||
  !zhPdfStats.isFile() ||
  zhPdfStats.size === 0
) {
  throw new Error(`找不到可發布的英文或中文 PDF：public/${pdfName}`);
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(publicDir, outputDir, { recursive: true });
await writeFile(path.join(outputDir, "index.html"), sourceHtml);
await writeFile(path.join(outputDir, ".nojekyll"), "");

console.log(`GitHub Pages 靜態網站已準備於 ${outputDir}`);
