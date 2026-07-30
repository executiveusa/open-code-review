# Vibe Code Review Standard v1

## Purpose

OpenCodeReview is the mandatory automated review layer for repositories classified as finished, production, release-candidate, or actively maintained customer-facing products.

It supplements, but never replaces, human approval, existing tests, security checks, deployment verification, or rollback controls.

## Required execution points

1. Every non-draft pull request targeting the default branch.
2. Every release-candidate pull request before production deployment.
3. A full repository scan before a project is first classified as production-ready.
4. A new full scan after material architecture, authentication, authorization, payments, database, infrastructure, or dependency changes.

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

## Required evidence

For a reviewed release, preserve:

- successful workflow run URL;
- OpenCodeReview summary;
- disposition of critical and high findings;
- existing test and build results;
- production verification evidence;
- rollback method.

## Exceptions

Generated code, vendored dependencies, snapshots, lockfiles, migrations, and large media may use repository-specific rules, but exceptions must be explicit and version-controlled.

Repositories that are archived, empty, mirrors, untouched upstream forks, disposable prototypes, or parked experiments are excluded until reclassified.

## Rollout stages

### Stage 1 — Advisory

Run on all finished-project pull requests. Measure false positives, workflow reliability, cost, and latency. Do not make the AI review a required status check.

### Stage 2 — Calibrated

Add repository-specific rules and suppressions. Require disposition of critical and high findings in the pull-request record.

### Stage 3 — Enforced

Only after demonstrated precision, add the workflow as a required branch-protection check. Human approval remains mandatory.
