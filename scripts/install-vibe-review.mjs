#!/usr/bin/env node

import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const START = '<!-- VIBE_REVIEW:START -->';
const END = '<!-- VIBE_REVIEW:END -->';
const MANAGED_BLOCK = `${START}
## Mandatory completion review

Before claiming that a coding project, feature, migration, pull request, deployment, release, or handoff is done, production-ready, ready to merge, ready to deploy, or ready to ship:

1. Invoke the \`vibe-project-review\` skill.
2. Run the repository's existing format, lint, type-check, test, build, security, migration, and smoke checks that apply.
3. Run OpenCodeReview against the relevant workspace, branch, commit, or full repository.
4. Do not claim completion while a critical finding remains or a high finding lacks an evidence-backed disposition.
5. Record proof, risks, rollback, commercial impact, and the exact human approval still required.

Automated review supplements independent approval; a builder and its agent may not approve their own work.
${END}`;

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copyManaged(source, destination, { overwrite = true } = {}) {
  if (!overwrite && await exists(destination)) {
    return { destination, status: 'preserved' };
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  return { destination, status: 'installed' };
}

async function upsertAgentsBlock(agentsPath) {
  const prior = await exists(agentsPath) ? await readFile(agentsPath, 'utf8') : '';
  const pattern = new RegExp(`${START}[\\s\\S]*?${END}`, 'm');
  const next = pattern.test(prior)
    ? prior.replace(pattern, MANAGED_BLOCK)
    : `${prior.trimEnd()}${prior.trim() ? '\n\n' : ''}${MANAGED_BLOCK}\n`;
  await writeFile(agentsPath, next, 'utf8');
  return { destination: agentsPath, status: pattern.test(prior) ? 'updated' : 'installed' };
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const sourceRoot = path.resolve(scriptDir, '..');
  const targetRoot = path.resolve(process.argv[2] ?? process.cwd());

  if (!await exists(path.join(targetRoot, '.git'))) {
    throw new Error(`Target is not a Git repository: ${targetRoot}`);
  }

  const operations = [];

  operations.push(await copyManaged(
    path.join(sourceRoot, 'templates', 'vibe-code-review.yml'),
    path.join(targetRoot, '.github', 'workflows', 'vibe-code-review.yml')
  ));

  const skillSource = path.join(sourceRoot, 'skills', 'vibe-project-review', 'SKILL.md');
  operations.push(await copyManaged(
    skillSource,
    path.join(targetRoot, '.agents', 'skills', 'vibe-project-review', 'SKILL.md')
  ));
  operations.push(await copyManaged(
    skillSource,
    path.join(targetRoot, '.codex', 'skills', 'vibe-project-review', 'SKILL.md')
  ));
  operations.push(await copyManaged(
    skillSource,
    path.join(targetRoot, '.claude', 'skills', 'vibe-project-review', 'SKILL.md')
  ));
  operations.push(await copyManaged(
    skillSource,
    path.join(targetRoot, '.cursor', 'skills', 'vibe-project-review', 'SKILL.md')
  ));
  operations.push(await copyManaged(
    skillSource,
    path.join(targetRoot, '.github', 'skills', 'code-review', 'SKILL.md')
  ));

  operations.push(await copyManaged(
    path.join(sourceRoot, 'templates', 'vibe-rule.json'),
    path.join(targetRoot, '.opencodereview', 'rule.json'),
    { overwrite: false }
  ));

  operations.push(await upsertAgentsBlock(path.join(targetRoot, 'AGENTS.md')));

  console.log(`Vibe review standard installed in ${targetRoot}`);
  for (const operation of operations) {
    console.log(`- ${operation.status}: ${path.relative(targetRoot, operation.destination)}`);
  }
  console.log('\nNext: inspect the diff, commit it on a branch, open a pull request, and verify the Vibe Code Review workflow.');
}

main().catch((error) => {
  console.error(`install-vibe-review failed: ${error.message}`);
  process.exitCode = 1;
});
