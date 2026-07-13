import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(process.pid) + "-" + String(Date.now()));
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("redirects the public URL directly to the Blockchain CV", async () => {
  const response = await render();
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "http://localhost/blockchain-cv?v=1.1.0");
});

test("ships the Blockchain CV, PDF, and social preview", async () => {
  const cvUrl = new URL("../public/blockchain-cv.html", import.meta.url);
  const cv = await readFile(cvUrl, "utf8");

  assert.match(cv, /Blockchain Product Manager CV/);
  assert.match(cv, /Web3 Product Manager/);
  assert.match(cv, /Download PDF/);
  assert.doesNotMatch(cv, /<a href="https:\/\/[^\"]+">/);
  await Promise.all([
    access(cvUrl),
    access(new URL("../public/dickson-lo-blockchain-cv.pdf", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
