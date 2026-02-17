# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Added GitHub Actions CI workflow to run `npm run check` on pull requests and `main` pushes.
- Added GitHub Actions publish workflow to release to npm on `v*.*.*` tag pushes with version-match guard.

## 0.1.1 - 2026-02-17

- Clarified npm publishing steps to use `NPM_TOKEN` with scoped package access.
- Documented `E403` resolution path for granular token with bypass 2FA.

## 0.1.0 - 2026-02-16

- Initial release.
- Added `retry` utility with backoff, jitter, timeout, and abort support.
- Added `runPool` utility with concurrency control, per-task retry, timeout, and progress events.
- Added open source governance files and GitHub workflows.
