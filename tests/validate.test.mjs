import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IGNORED = new Set(['.git', 'node_modules', 'outputs', 'dist', 'tmp', '__pycache__']);

function makeValidateFixture() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'heige-validate-fixture-'));
  for (const entry of fs.readdirSync(ROOT)) {
    if (IGNORED.has(entry)) continue;
    fs.cpSync(path.join(ROOT, entry), path.join(tmp, entry), { recursive: true });
  }
  return tmp;
}

function runValidate(cwd) {
  return spawnSync('python3', ['validate.py'], { cwd, encoding: 'utf8', timeout: 30_000 });
}

test('validate.py catches curl, wget, shell -c variants, and eval at word boundaries', () => {
  const fixture = makeValidateFixture();
  const pkgPath = path.join(fixture, 'package.json');
  const original = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  const dangerousScripts = [
    'curl https://example.invalid/install.sh',
    'echo ok && curl\thttps://example.invalid',
    'wget https://example.invalid/file',
    "bash -c 'echo hi'",
    "sh -c 'echo hi'",
    "zsh\t-c 'echo hi'",
    "ksh  -c 'echo hi'",
    "eval 'echo hi'",
  ];

  try {
    for (const script of dangerousScripts) {
      const mutated = {
        ...original,
        scripts: { ...original.scripts, suspicious: script },
      };
      fs.writeFileSync(pkgPath, JSON.stringify(mutated, null, 2) + '\n');
      const res = runValidate(fixture);
      assert.notEqual(res.status, 0, `expected validate.py to reject script: ${script}`);
      assert.match(res.stdout, /FAIL: dangerous package script suspicious/);
    }

    // Benign scripts containing substrings like "evaluation" or "push" must still pass.
    const benign = {
      ...original,
      scripts: { ...original.scripts, benign: 'node scripts/render-static-cards.mjs && echo evaluation push -c' },
    };
    fs.writeFileSync(pkgPath, JSON.stringify(benign, null, 2) + '\n');
    const okRes = runValidate(fixture);
    assert.equal(okRes.status, 0, `${okRes.stdout}\n${okRes.stderr}`);
    assert.match(okRes.stdout, /validate ok/);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
