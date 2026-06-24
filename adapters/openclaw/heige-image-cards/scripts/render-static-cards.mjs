import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const root = path.resolve(__dirname, "..");
const htmlPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "templates", "static-card.html");
const outputDir = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(root, "outputs");

await mkdir(outputDir, { recursive: true });

const playwrightPath = process.env.PLAYWRIGHT_PATH || "playwright";
const { chromium } = require(playwrightPath);

const launchOptions = { headless: true };
if (process.env.CHROME_PATH) {
  launchOptions.executablePath = process.env.CHROME_PATH;
}

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({
  viewport: { width: 1200, height: 1600 },
  deviceScaleFactor: 1,
});

await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
await page.emulateMedia({ reducedMotion: "reduce" });

const cards = await page.locator(".card").evaluateAll((nodes) =>
  nodes.map((node, index) => ({
    id: node.id || `card-${index + 1}`,
    index,
  })),
);

for (const card of cards) {
  const name = String(card.index + 1).padStart(2, "0");
  await page.locator(".card").nth(card.index).screenshot({
    path: path.join(outputDir, `${name}-${card.id}.png`),
    animations: "disabled",
  });
}

await browser.close();
