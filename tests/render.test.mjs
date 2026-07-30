import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('default render command creates a nonempty PNG without undocumented environment variables', () => {
  const relativeOutput = path.join('outputs', `render-test-${process.pid}`);
  const outputDir = path.join(ROOT, relativeOutput);

  try {
    const result = spawnSync(
      process.execPath,
      ['scripts/render-static-cards.mjs', 'templates/static-card.html', relativeOutput],
      { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
    );

    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const pngs = fs.readdirSync(outputDir).filter((name) => name.endsWith('.png'));
    assert.equal(pngs.length, 1);
    assert.ok(fs.statSync(path.join(outputDir, pngs[0])).size > 0);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test('default security boundary rejects an input symlink that resolves outside the project', () => {
  const externalDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heige-card-input-'));
  const externalHtml = path.join(externalDir, 'cards.html');
  const linkDir = path.join(ROOT, 'outputs');
  const linkPath = path.join(linkDir, `external-input-${process.pid}.html`);
  const outputDir = path.join(linkDir, `external-input-output-${process.pid}`);

  fs.mkdirSync(linkDir, { recursive: true });
  fs.writeFileSync(externalHtml, '<!doctype html><div class="card">external</div>');
  fs.symlinkSync(externalHtml, linkPath);

  try {
    const result = spawnSync(
      process.execPath,
      ['scripts/render-static-cards.mjs', path.relative(ROOT, linkPath), path.relative(ROOT, outputDir)],
      { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /HTML input must resolve inside project root/);
    assert.equal(fs.existsSync(outputDir), false);
  } finally {
    fs.rmSync(linkPath, { force: true });
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.rmSync(externalDir, { recursive: true, force: true });
  }
});

test('default security boundary rejects an output symlink that resolves outside the project', () => {
  const externalDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heige-card-output-'));
  const linkDir = path.join(ROOT, 'outputs');
  const linkPath = path.join(linkDir, `external-output-${process.pid}`);

  fs.mkdirSync(linkDir, { recursive: true });
  fs.symlinkSync(externalDir, linkPath);

  try {
    const result = spawnSync(
      process.execPath,
      ['scripts/render-static-cards.mjs', 'templates/static-card.html', path.relative(ROOT, linkPath)],
      { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Output directory must resolve inside project root/);
    assert.equal(fs.readdirSync(externalDir).some((name) => name.endsWith('.png')), false);
  } finally {
    fs.rmSync(linkPath, { force: true });
    fs.rmSync(externalDir, { recursive: true, force: true });
  }
});

test('output validation does not create directories through an external symlink', () => {
  const externalDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heige-card-output-parent-'));
  const linkDir = path.join(ROOT, 'outputs');
  const linkPath = path.join(linkDir, `external-parent-${process.pid}`);
  const externalChild = path.join(externalDir, 'new-output');

  fs.mkdirSync(linkDir, { recursive: true });
  fs.symlinkSync(externalDir, linkPath);

  try {
    const result = spawnSync(
      process.execPath,
      ['scripts/render-static-cards.mjs', 'templates/static-card.html', path.join(path.relative(ROOT, linkPath), 'new-output')],
      { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
    );

    assert.notEqual(result.status, 0);
    assert.equal(fs.existsSync(externalChild), false);
  } finally {
    fs.rmSync(linkPath, { force: true });
    fs.rmSync(externalDir, { recursive: true, force: true });
  }
});

test('renderer refuses a final PNG symlink instead of overwriting its external target', () => {
  const externalDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heige-card-final-output-'));
  const externalFile = path.join(externalDir, 'outside.png');
  const relativeOutput = path.join('outputs', `final-link-${process.pid}`);
  const outputDir = path.join(ROOT, relativeOutput);
  const outputFile = path.join(outputDir, '01-card-1.png');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(externalFile, 'do-not-overwrite');
  fs.symlinkSync(externalFile, outputFile);

  try {
    const result = spawnSync(
      process.execPath,
      ['scripts/render-static-cards.mjs', 'templates/static-card.html', relativeOutput],
      { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Output file must not be a symbolic link/);
    assert.equal(fs.readFileSync(externalFile, 'utf8'), 'do-not-overwrite');
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.rmSync(externalDir, { recursive: true, force: true });
  }
});

test('installation docs install complete Codex and Hermes runtime adapters', () => {
  const install = fs.readFileSync(path.join(ROOT, 'INSTALL.md'), 'utf8');
  assert.match(install, /cp -R adapters\/codex\/heige-image-cards/);
  assert.match(install, /cp -R adapters\/hermes\/heige-image-cards/);
  assert.match(install, /npx playwright-core install chromium/);

  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const setup = readme.match(/### １．获取仓库([\s\S]*?)### ２．/);
  const codex = readme.match(/### ３．安装到 Codex([\s\S]*?)### ４．/);
  const hermes = readme.match(/### ４．安装到 Hermes([\s\S]*?)### ５．/);
  const browser = readme.match(/### ５．安装 Chromium 运行时([\s\S]*?)### ６．/);
  assert.ok(setup, 'README must establish a shared repository root before platform-specific steps');
  assert.ok(codex, 'README must contain a complete Codex installation section');
  assert.ok(hermes, 'README must contain a complete Hermes installation section');
  assert.ok(browser, 'README must contain a Playwright browser installation section');
  assert.match(setup[1], /git clone https:\/\/github\.com\/HeiGeAi\/heige-image-cards\.git\s+cd heige-image-cards/);
  assert.match(codex[1], /cp -R adapters\/codex\/heige-image-cards ~\/\.codex\/skills\//);
  assert.match(codex[1], /\(cd ~\/\.codex\/skills\/heige-image-cards && npm ci --ignore-scripts\)/);
  assert.match(hermes[1], /cp -R adapters\/hermes\/heige-image-cards \.\.\/heige-image-cards-hermes/);
  assert.match(hermes[1], /\(cd \.\.\/heige-image-cards-hermes && npm ci --ignore-scripts\)/);
  assert.match(browser[1], /npx playwright-core install chromium/);
});

test('generated Claude adapter carries locked dependencies and renders after npm ci', () => {
  const adapterRoot = path.join(ROOT, 'adapters', 'claude-code', 'heige-image-cards');
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'heige-card-adapter-'));

  try {
    fs.cpSync(adapterRoot, fixtureRoot, { recursive: true });
    assert.equal(fs.existsSync(path.join(fixtureRoot, 'package.json')), true);
    assert.equal(fs.existsSync(path.join(fixtureRoot, 'package-lock.json')), true);

    const install = spawnSync('npm', ['ci', '--ignore-scripts'], {
      cwd: fixtureRoot,
      encoding: 'utf8',
      timeout: 30_000,
    });
    assert.equal(install.status, 0, `${install.stdout}\n${install.stderr}`);

    const render = spawnSync(
      process.execPath,
      ['scripts/render-static-cards.mjs', 'templates/static-card.html', 'outputs'],
      { cwd: fixtureRoot, encoding: 'utf8', timeout: 30_000 },
    );
    assert.equal(render.status, 0, `${render.stdout}\n${render.stderr}`);

    const pngs = fs.readdirSync(path.join(fixtureRoot, 'outputs')).filter((name) => name.endsWith('.png'));
    assert.equal(pngs.length, 1);
    assert.ok(fs.statSync(path.join(fixtureRoot, 'outputs', pngs[0])).size > 0);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('root and generated runtime packages share version and Node support', () => {
  const expectedVersion = '1.0.2';
  const rootPackage = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(rootPackage.version, expectedVersion);
  assert.equal(rootPackage.engines?.node, '>=18');

  for (const runtime of ['claude-code', 'codex', 'hermes', 'openclaw']) {
    const packagePath = path.join(ROOT, 'adapters', runtime, 'heige-image-cards', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    assert.equal(packageJson.version, expectedVersion, `${runtime} version`);
    assert.equal(packageJson.engines?.node, '>=18', `${runtime} Node engine`);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'source', 'manifest.json'), 'utf8'));
  assert.equal(manifest.version, expectedVersion);
  assert.match(fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf8'), /version: 1\.0\.2\b/);
});
