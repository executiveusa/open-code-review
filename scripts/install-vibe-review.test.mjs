import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const installer = path.join(scriptDir, 'install-vibe-review.mjs');
const target = await mkdtemp(path.join(os.tmpdir(), 'vibe-review-installer-'));

try {
  await mkdir(path.join(target, '.git'));
  await mkdir(path.join(target, '.opencodereview'));
  await writeFile(path.join(target, 'AGENTS.md'), '# Existing instructions\n', 'utf8');
  await writeFile(path.join(target, '.opencodereview', 'rule.json'), '{"custom":true}\n', 'utf8');

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = spawnSync(process.execPath, [installer, target], {
      encoding: 'utf8'
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }

  const requiredFiles = [
    '.github/workflows/vibe-code-review.yml',
    '.agents/skills/vibe-project-review/SKILL.md',
    '.codex/skills/vibe-project-review/SKILL.md',
    '.claude/skills/vibe-project-review/SKILL.md',
    '.cursor/skills/vibe-project-review/SKILL.md',
    '.github/skills/code-review/SKILL.md'
  ];

  for (const relativePath of requiredFiles) {
    const contents = await readFile(path.join(target, relativePath), 'utf8');
    assert.ok(contents.length > 0, `${relativePath} should be installed`);
  }

  const agents = await readFile(path.join(target, 'AGENTS.md'), 'utf8');
  assert.equal((agents.match(/VIBE_REVIEW:START/g) ?? []).length, 1);
  assert.equal((agents.match(/VIBE_REVIEW:END/g) ?? []).length, 1);
  assert.match(agents, /# Existing instructions/);
  assert.match(agents, /Invoke the `vibe-project-review` skill/);

  const customRule = await readFile(path.join(target, '.opencodereview', 'rule.json'), 'utf8');
  assert.equal(customRule, '{"custom":true}\n');

  console.log('install-vibe-review test passed');
} finally {
  await rm(target, { recursive: true, force: true });
}
