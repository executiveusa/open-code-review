# Vibe Code Review Standard

## Decision

OpenCodeReview is the default AI code-review engine for completed and production-bound projects owned by `executiveusa`.

It supplements deterministic CI, security scanning, deployment verification, and human approval. It does not replace them.

## Required release sequence

1. Existing project checks pass.
2. OpenCodeReview reviews the pull request.
3. Critical and high findings are fixed or explicitly accepted with evidence.
4. Medium findings are fixed, ticketed, or explicitly accepted.
5. Security, reliability, ownership, rollback, and production evidence are independently checked.
6. A reviewer other than the builder approves release.

## Enforcement phases

### Phase 1 — calibration

- Runs on every non-draft pull request in registered completed projects.
- Posts a sticky summary and incremental line comments.
- Does not block merging by itself.
- Raw review artifacts are retained for audit.
- Style and documentation findings are routed to the summary to reduce noise.

### Phase 2 — required status check

Enable only after at least 20 representative pull requests show acceptable precision and operational stability.

Recommended graduation evidence:

- fewer than 10% materially false positive findings;
- no repeated workflow-authentication failures;
- median review duration within the repository's CI budget;
- no secret exposure in logs or artifacts;
- documented exception and rollback process.

## Standard caller workflow

Each registered project contains only this thin caller:

```yaml
name: Vibe Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write
  issues: write
  models: read

jobs:
  review:
    if: github.event.pull_request.draft == false
    uses: executiveusa/open-code-review/.github/workflows/vibe-review-standard.yml@main
```

The central reusable workflow owns model selection, routing, artifact retention, concurrency, and publication behavior.

## Registration policy

A repository is registered only when it is classified as `SELL` or `USE` and meets at least one condition:

- has a production deployment;
- serves a real client or active internal operation;
- is explicitly entering release or handoff;
- is declared complete and awaiting final verification.

Do not register empty repositories, untouched upstream forks, parked experiments, archived work, design-asset-only repositories, or generated mirrors.

## Required evidence per repository

Record:

- repository name and classification;
- production or operational target;
- default branch;
- deterministic test/build checks;
- deployment target;
- owner and independent approver;
- rollback method;
- OpenCodeReview workflow status;
- branch-protection status.

## Failure behavior

- A failed review workflow is a release signal, not permission to skip review.
- During calibration, a human may proceed only after documenting why the failure is unrelated to code quality and performing an alternate independent review.
- Never expose provider credentials. The standard uses the repository-scoped `GITHUB_TOKEN` with `models: read`.
- Fork-origin pull requests may have reduced token permissions. Treat those as untrusted and do not elevate secrets.

## Rollback

Disable the project caller workflow or pin it to the last known-good central commit. Do not delete review history or evidence artifacts merely to make a release appear clean.
