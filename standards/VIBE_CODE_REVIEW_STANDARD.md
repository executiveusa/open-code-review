# Vibe Code Review Standard v1

## Purpose

OpenCodeReview is the mandatory automated review layer for repositories classified as finished, production, release-candidate, or actively maintained customer-facing products.

It supplements, but never replaces, human approval, existing tests, security checks, deployment verification, or rollback controls.

## Required execution points

1. Every non-draft pull request targeting the default branch.
2. Every release-candidate pull request before production deployment.
3. A full repository scan before a project is first classified as production-ready.
4. A new full scan after material architecture, authentication, authorization, payments, database, infrastructure, dependency, secret-handling, or external-side-effect changes.
5. Before any coding agent claims a project, feature, migration, pull request, deployment, release, or handoff is done, production-ready, ready to merge, ready to deploy, or ready to ship.

## Three-layer enforcement

### 1. Agent skill

Install `vibe-project-review` into the repository's supported agent skill directories. Its description is the automatic trigger for completion and release language.

The skill must:

- establish mode, outcome, target, constraints, proof, and commercial value;
- run applicable repository-native checks;
- run an OCR workspace, branch, commit, or full scan;
- classify and disposition every supported finding;
- rerun checks and OCR after repairs;
- separate code review from production verification;
- return PASS, PASS WITH DISPOSITIONS, BLOCKED, or NOT RUN;
- identify the independent human approval still required.

### 2. Managed agent instruction

Every governed repository must contain the managed `VIBE_REVIEW` block in `AGENTS.md`. This prevents agents from silently bypassing the skill when semantic skill discovery does not trigger.

### 3. Independent CI review

Every governed repository must contain `.github/workflows/vibe-code-review.yml`, calling the central reusable workflow from `executiveusa/open-code-review`.

Local agent delegation may be used as preflight when no OCR LLM is configured locally, but the GitHub Actions review remains the independent automated review before merge or release.

## Default review policy

- Review mode: incremental pull-request review.
- Review engine: OpenCodeReview.
- Model transport: GitHub Models using the repository-scoped `GITHUB_TOKEN`.
- Default model: `openai/gpt-4.1`.
- Inline findings: critical, high, medium, bugs, security, performance, maintainability, and tests.
- Summary-only findings: low severity, style, and documentation.
- Publication: sticky summary plus non-destructive incremental inline comments.
- Artifacts: raw review results and stderr retained as workflow artifacts.
- Initial enforcement: advisory until precision is validated on representative repositories.

## Merge rules

OpenCodeReview does not approve its own work. A merge requires an independent human or separately governed reviewer.

A pull request must not be treated as production-ready while unresolved critical or high-confidence security, data-loss, authorization, payment, deployment, or rollback findings remain.

Medium and low findings may be accepted only when the pull request records the reason, owner, and follow-up disposition.

A PASS from the agent skill or CI review does not prove that production is healthy. Deployment and target-environment verification remain separate evidence requirements.

## Required evidence

For a reviewed release, preserve:

- successful workflow run URL;
- OpenCodeReview summary;
- native check commands and outcomes;
- reviewed base/head, commit, workspace, or scan scope;
- disposition of critical, high, medium, and low findings;
- existing test and build results;
- production verification evidence when production is claimed;
- rollback method;
- exact human approval still required.

## Installation

From a checked-out `executiveusa/open-code-review` repository, run:

```bash
node scripts/install-vibe-review.mjs /path/to/project
```

The installer:

- adds the caller workflow;
- installs the skill for open-agent, Codex, Claude, Cursor, and GitHub Copilot discovery;
- adds default Vibe review rules without overwriting an existing project rule file;
- creates or updates the managed `AGENTS.md` block;
- is safe to rerun.

Inspect and commit the resulting changes on a branch. Do not install directly into production branches without review.

## Exceptions

Generated code, vendored dependencies, snapshots, lockfiles, migrations, and large media may use repository-specific rules, but exceptions must be explicit and version-controlled.

Repositories that are archived, empty, mirrors, untouched upstream forks, disposable prototypes, or parked experiments are excluded until reclassified.

A prose/media-only change may skip OCR only when it cannot alter runtime, configuration, infrastructure, security, data, or deployment behavior. The skip reason must be recorded.

## Rollout stages

### Stage 1 — Advisory

Run on all finished-project pull requests and agent completion attempts. Measure false positives, workflow reliability, cost, latency, and missed triggers. Do not make the AI review a required status check.

### Stage 2 — Calibrated

Add repository-specific rules and suppressions. Require disposition of critical and high findings in the pull-request record. Verify agent-trigger reliability across Codex, Claude, Cursor, Copilot, Hermes, and other supported harnesses.

### Stage 3 — Enforced

Only after demonstrated precision and trigger reliability, add the workflow as a required branch-protection check. Human approval remains mandatory.