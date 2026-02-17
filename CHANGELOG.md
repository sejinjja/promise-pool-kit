# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

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
