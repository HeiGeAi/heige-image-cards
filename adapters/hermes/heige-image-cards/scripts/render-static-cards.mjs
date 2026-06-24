import { createRequire } from "node:module";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const root = path.resolve(__dirname, "..");
const allowExternalPaths = process.env.HEIGE_ALLOW_EXTERNAL_PATHS === "1";

function resolveProjectPath(input, fallback) {
  const raw = input || fallback;
  return path.resolve(path.isAbsolute(raw) ? raw : path.join(root, raw));
}

function assertInsideRoot(targetPath, label) {
  if (allowExternalPaths) {
    return;
  }
  const relative = path.relative(root, targetPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside project root. Set HEIGE_ALLOW_EXTERNAL_PATHS=1 only for trusted local files.`);
  }
}

function sanitizeFilePart(value, fallback) {
  const cleaned = String(value || "")
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return cleaned || fallback;
}

const htmlPath = process.argv[2]
  ? resolveProjectPath(process.argv[2], "")
  : path.join(root, "templates", "static-card.html");
const outputDir = process.argv[3]
  ? resolveProjectPath(process.argv[3], "")
  : path.join(root, "outputs");

assertInsideRoot(htmlPath, "HTML input");
assertInsideRoot(outputDir, "Output directory");

const htmlStat = await stat(htmlPath);
if (!htmlStat.isFile()) {
  throw new Error(`HTML input is not a file: ${htmlPath}`);
}
if (![".html", ".htm"].includes(path.extname(htmlPath).toLowerCase())) {
  throw new Error(`HTML input must be .html or .htm: ${htmlPath}`);
}

await mkdir(outputDir, { recursive: true });

const playwrightPath = process.env.PLAYWRIGHT_PATH || "playwright";
const { chromium } = require(playwrightPath);

const launchOptions = { headless: true };
if (process.env.CHROME_PATH) {
  launchOptions.executablePath = process.env.CHROME_PATH;
}

const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({
  viewport: { width: 1200, height: 1600 },
  deviceScaleFactor: 1,
  javaScriptEnabled: false,
});
const page = await context.newPage();

await page.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.protocol === "http:" || url.protocol === "https:") {
    await route.abort("blockedbyclient");
    return;
  }
  await route.continue();
});

await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
await page.emulateMedia({ reducedMotion: "reduce" });

const cards = await page.locator(".card").evaluateAll((nodes) =>
  nodes.map((node, index) => ({
    id: node.id || `card-${index + 1}`,
    index,
  })),
);

if (cards.length === 0) {
  throw new Error("No .card nodes found in HTML input.");
}

for (const card of cards) {
  const name = String(card.index + 1).padStart(2, "0");
  const id = sanitizeFilePart(card.id, `card-${card.index + 1}`);
  await page.locator(".card").nth(card.index).screenshot({
    path: path.join(outputDir, `${name}-${id}.png`),
    animations: "disabled",
  });
}

await context.close();
await browser.close();
