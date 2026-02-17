# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

## 0.1.10 - 2026-02-17

- Added `--dry-run` mode to `scripts/release.mjs` for non-mutating release previews.

## 0.1.9 - 2026-02-17

- Hardened `scripts/release.mjs --push` to fail when local `main` is behind `origin/main`.

## 0.1.8 - 2026-02-17

- Added `scripts/validate-changelog.mjs` and wired it into `npm run check`.

## 0.1.7 - 2026-02-17

- Added a safety guard in `scripts/release.mjs` to allow `--push` only on the `main` branch.

## 0.1.6 - 2026-02-17

- Added `scripts/release.mjs` to automate version bump, changelog promotion, checks, commit, and tag creation.
- Added package scripts for patch/minor/major release preparation.

## 0.1.5 - 2026-02-17

- Added publish workflow check to require a matching version section in `CHANGELOG.md`.
- Added npm tarball artifact upload in publish workflow for release traceability.

## 0.1.4 - 2026-02-17

- Added post-publish npm install/runtime smoke verification in tag publish workflow.

## 0.1.3 - 2026-02-17

- Updated publish workflow to fail fast when `NPM_TOKEN` secret is missing.
- Added automatic GitHub release creation on successful tag-based publish.

## 0.1.2 - 2026-02-17

- Added GitHub Actions CI workflow to run `npm run check` on pull requests and `main` pushes.
- Added GitHub Actions publish workflow to release to npm on `v*.*.*` tag pushes with version-match guard.
- Added `workflow_dispatch` dry-run path for publish workflow to validate packaging without publishing.

## 0.1.1 - 2026-02-17

- Clarified npm publishing steps to use `NPM_TOKEN` with scoped package access.
- Documented `E403` resolution path for granular token with bypass 2FA.

## 0.1.0 - 2026-02-16

- Initial release.
- Added `retry` utility with backoff, jitter, timeout, and abort support.
- Added `runPool` utility with concurrency control, per-task retry, timeout, and progress events.
- Added open source governance files and GitHub workflows.
