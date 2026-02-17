# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Added `NPM_TOKEN` validation to reject `.npmrc` auth-config strings (for example `_authToken=` or `registry.npmjs.org/...`) and require raw token value.

## 0.1.52 - 2026-02-17

- Fixed main-history verification fetch to use explicit `github.token` auth header, preventing anonymous `git fetch` failures in publish runs.

## 0.1.51 - 2026-02-17

- Expanded `NPM_TOKEN` placeholder checks to fail fast on common null/boolean sentinel values (`null`, `undefined`, `none`, `false`, `true`).

## 0.1.50 - 2026-02-17

- Added fast-fail detection for obvious non-npm token prefixes in `NPM_TOKEN` (for example `ghp_`, `github_pat_`, `glpat-`).

## 0.1.49 - 2026-02-17

- Extended `NPM_TOKEN` placeholder detection to catch environment-reference literals like `$NPM_TOKEN` and `%NPM_TOKEN%`.

## 0.1.48 - 2026-02-17

- Hardened `NPM_TOKEN` placeholder checks with case-insensitive matching and unresolved template-expression detection.

## 0.1.47 - 2026-02-17

- Added `NPM_TOKEN` validation for masked/redacted placeholder values (for example `***`, `redacted`).

## 0.1.46 - 2026-02-17

- Added `NPM_TOKEN` placeholder-value guard to fail fast when common dummy strings are configured.

## 0.1.45 - 2026-02-17

- Added `NPM_TOKEN` guard to fail when the secret appears to include surrounding quote characters.

## 0.1.44 - 2026-02-17

- Added fail-fast handling for npm CIDR/IP-restriction auth errors (`EAUTHIP`, IP/CIDR denial messages) in auth and publish checks.

## 0.1.43 - 2026-02-17

- Treated npm `E403/forbidden` responses as immediate fatal errors in the token-auth verification step.

## 0.1.42 - 2026-02-17

- Added fail-fast handling for npm invalid-token errors (`EINVALIDNPMTOKEN`/`invalid token`) in auth and publish steps.

## 0.1.41 - 2026-02-17

- Expanded npm auth/publish fatal error detection to fail fast on OTP/2FA-related npm responses.

## 0.1.40 - 2026-02-17

- Centralized publish workflow npm registry configuration via job-level `NPM_REGISTRY_URL` environment variable.

## 0.1.39 - 2026-02-17

- Pinned npm registry URL explicitly for publish-state checks, publish, and smoke-install steps in the publish workflow.

## 0.1.38 - 2026-02-17

- Added short post-failure npm visibility polling in publish step to reduce false failures from registry propagation delays.

## 0.1.37 - 2026-02-17

- Reordered npm publish failure handling to check whether the target version is already visible before treating forbidden/auth errors as fatal.

## 0.1.36 - 2026-02-17

- Tightened `NPM_TOKEN` validation to fail when whitespace/newline characters are present before npm auth/publish.

## 0.1.35 - 2026-02-17

- Added retry-aware npm publish step that distinguishes auth failures, retries transient errors, and treats already-visible target versions as success.

## 0.1.34 - 2026-02-17

- Updated npm token auth check to fail immediately on explicit auth errors and retry only transient failures.

## 0.1.33 - 2026-02-17

- Hardened npm publish-state detection with retry and explicit handling for `404` vs transient registry errors.

## 0.1.32 - 2026-02-17

- Added retry logic to npm token auth check in publish workflow (`npm whoami` up to 3 attempts).

## 0.1.31 - 2026-02-17

- Scoped npm token checks to run only when publish is required, so reruns for already-published versions do not fail on token auth.

## 0.1.30 - 2026-02-17

- Added publish workflow auth check to fail fast when `NPM_TOKEN` cannot authenticate (`npm whoami`).

## 0.1.29 - 2026-02-17

- Removed publishing-method documentation from `README.md` and simplified manual-run wording in publish workflow.

## 0.1.28 - 2026-02-17

- Added exports metadata linting to `npm run check` to verify `main/module/types/exports` consistency and referenced build file existence.

## 0.1.27 - 2026-02-17

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
