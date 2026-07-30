import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { lstat, mkdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const root = path.resolve(__dirname, "..");
const realRoot = await realpath(root);
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

async function assertRealPathInsideRoot(targetPath, label) {
  if (allowExternalPaths) {
    return;
  }
  const resolved = await realpath(targetPath);
  const relative = path.relative(realRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must resolve inside project root. Set HEIGE_ALLOW_EXTERNAL_PATHS=1 only for trusted local files.`);
  }
}

async function assertCreatablePathInsideRoot(targetPath, label) {
  if (allowExternalPaths) {
    return;
  }
  let existingAncestor = targetPath;
  while (!existsSync(existingAncestor)) {
    const parent = path.dirname(existingAncestor);
    if (parent === existingAncestor) break;
    existingAncestor = parent;
  }
  await assertRealPathInsideRoot(existingAncestor, label);
}

async function lstatIfPresent(targetPath) {
  try {
    return await lstat(targetPath);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function writePngSafely(outputPath, png) {
  const existing = await lstatIfPresent(outputPath);
  if (existing?.isSymbolicLink()) {
    throw new Error(`Output file must not be a symbolic link: ${outputPath}`);
  }
  if (existing && !existing.isFile()) {
    throw new Error(`Output file path must be a regular file: ${outputPath}`);
  }

  const temporaryPath = path.join(
    path.dirname(outputPath),
    `.${path.basename(outputPath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  try {
    await writeFile(temporaryPath, png, { flag: "wx" });
    await assertRealPathInsideRoot(path.dirname(outputPath), "Output directory");
    const latest = await lstatIfPresent(outputPath);
    if (latest?.isSymbolicLink()) {
      throw new Error(`Output file must not be a symbolic link: ${outputPath}`);
    }
    await rename(temporaryPath, outputPath);
  } finally {
    await rm(temporaryPath, { force: true });
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
await assertRealPathInsideRoot(htmlPath, "HTML input");

const htmlStat = await stat(htmlPath);
if (!htmlStat.isFile()) {
  throw new Error(`HTML input is not a file: ${htmlPath}`);
}
if (![".html", ".htm"].includes(path.extname(htmlPath).toLowerCase())) {
  throw new Error(`HTML input must be .html or .htm: ${htmlPath}`);
}

await assertCreatablePathInsideRoot(outputDir, "Output directory");
await mkdir(outputDir, { recursive: true });
await assertRealPathInsideRoot(outputDir, "Output directory");

const playwrightPath = process.env.PLAYWRIGHT_PATH || "playwright-core";
const { chromium } = require(playwrightPath);

const launchOptions = { headless: true };
const browserCandidates = [
  process.env.CHROME_PATH,
  (() => {
    try { return chromium.executablePath(); } catch { return null; }
  })(),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  path.join(os.homedir(), "AppData/Local/Google/Chrome/Application/chrome.exe"),
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);
const executablePath = browserCandidates.find((candidate) => existsSync(candidate));
if (!executablePath) {
  throw new Error("No Chromium or Chrome executable found. Install Chrome or run `npx playwright-core install chromium`.");
}
launchOptions.executablePath = executablePath;

const browser = await chromium.launch(launchOptions);
try {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 1,
    javaScriptEnabled: false,
  });
  try {
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
      const outputPath = path.join(outputDir, `${name}-${id}.png`);
      const png = await page.locator(".card").nth(card.index).screenshot({
        animations: "disabled",
      });
      await writePngSafely(outputPath, png);
    }
  } finally {
    await context.close();
  }
} finally {
  await browser.close();
}
