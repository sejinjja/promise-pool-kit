# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Generalized restricted secret-name linting to track the workflow allowlist automatically.

## 0.1.76 - 2026-02-17

- Restricted explicit publish-secret name usage to the publish workflow file.

## 0.1.75 - 2026-02-17

- Expanded secret-alias linting to block an additional legacy token alias and removed self-file scan exemptions.

## 0.1.74 - 2026-02-17

- Added workflow policy linting to allow only approved publish secret references.

## 0.1.73 - 2026-02-17

- Hardened secret-alias linting to block deprecated publish-secret indirection names.

## 0.1.72 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.71 - 2026-02-17

- Hardened secret-alias linting to detect legacy aliases case-insensitively.

## 0.1.70 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.69 - 2026-02-17

- Refined changelog wording to avoid deployment-method details in public release notes.

## 0.1.68 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.67 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.66 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.65 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.64 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.63 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.62 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.61 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.60 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.59 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.58 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.57 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.56 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.55 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.54 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.53 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.52 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.51 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.50 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.49 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.48 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.47 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.46 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.45 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.44 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.43 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.42 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.41 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.40 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.39 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.38 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.37 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.36 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.35 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.34 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.33 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.32 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.31 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.30 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.29 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.28 - 2026-02-17

- Added exports metadata linting to `npm run check` to verify `main/module/types/exports` consistency and referenced build file existence.

## 0.1.27 - 2026-02-17

- Added packlist linting to `npm run check` to verify required dist files are included and source/test/script paths are excluded from `npm pack --dry-run` output.

## 0.1.26 - 2026-02-17

- Added `package-lock.json` consistency linting (name/version parity with `package.json`) to `npm run check`.

## 0.1.25 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.24 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.23 - 2026-02-17

- Tightened changelog linting to validate calendar dates and require at least one bullet item per released version section.

## 0.1.22 - 2026-02-17

- Added release-script safety check to fail when files outside `package.json`, `package-lock.json`, and `CHANGELOG.md` change during release prep.
- Fixed release-script status parsing so the first changed file is not truncated on `git status --porcelain` output.

## 0.1.21 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.20 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.19 - 2026-02-17

- Hardened `scripts/release.mjs --push` to fail early when the target tag already exists on `origin`.

## 0.1.18 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.17 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.16 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.15 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.14 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.13 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.12 - 2026-02-17

- Internal release-process maintenance update.

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

- Internal release-process maintenance update.

## 0.1.4 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.3 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.2 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.1 - 2026-02-17

- Internal release-process maintenance update.

## 0.1.0 - 2026-02-16

- Initial release.
- Added `retry` utility with backoff, jitter, timeout, and abort support.
- Added `runPool` utility with concurrency control, per-task retry, timeout, and progress events.
- Added open source governance files and GitHub workflows.
