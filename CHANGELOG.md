# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Added packlist linting to `npm run check` to verify required dist files are included and source/test/script paths are excluded from `npm pack --dry-run` output.
## 0.1.26 - 2026-02-17

- Added `package-lock.json` consistency linting (name/version parity with `package.json`) to `npm run check`.

## 0.1.25 - 2026-02-17

- Added a publish guard to require tag commits be reachable from `origin/main` history.

## 0.1.24 - 2026-02-17

- Extended publish smoke verification to test both CommonJS (`require`) and ESM (`import`) package entry points.

## 0.1.23 - 2026-02-17

- Tightened changelog linting to validate calendar dates and require at least one bullet item per released version section.

## 0.1.22 - 2026-02-17

- Added release-script safety check to fail when files outside `package.json`, `package-lock.json`, and `CHANGELOG.md` change during release prep.
- Fixed release-script status parsing so the first changed file is not truncated on `git status --porcelain` output.

## 0.1.21 - 2026-02-17

- Enforced `workflow_dispatch` publish workflow to dry-run only (fails when `dry_run=false`).

## 0.1.20 - 2026-02-17

- Added workflow job timeouts to fail fast on stuck runs (`CI`: 15m, `Publish`: 20m).

## 0.1.19 - 2026-02-17

- Hardened `scripts/release.mjs --push` to fail early when the target tag already exists on `origin`.

## 0.1.18 - 2026-02-17

- Adjusted publish smoke verification to check the exact package version on npm instead of relying on `latest`.

## 0.1.17 - 2026-02-17

- Added workflow concurrency controls: CI cancels superseded runs and Publish serializes runs per ref.

## 0.1.16 - 2026-02-17

- Hardened `scripts/release.mjs --push` to fail early if the target package version is already published on npm.

## 0.1.15 - 2026-02-17

- Hardened publish artifact upload by using run-based artifact names and failing when tarball is missing.

## 0.1.14 - 2026-02-17

- Attached the built npm tarball to GitHub Release assets in tag publish workflow (idempotent on reruns).

## 0.1.13 - 2026-02-17

- Made tag publish workflow idempotent by skipping `npm publish` when the target version is already on npm.

## 0.1.12 - 2026-02-17

- Enabled npm provenance publishing in tag workflow (`npm publish --provenance`).

## 0.1.11 - 2026-02-17

- Added `scripts/changelog-section.mjs` and switched tag release notes to use `CHANGELOG` section content.

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
