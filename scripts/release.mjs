#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

function usage() {
  console.log(
    [
      "Usage:",
      "  node scripts/release.mjs [patch|minor|major|<x.y.z>] [--push] [--no-check] [--dry-run]",
      "",
      "Examples:",
      "  node scripts/release.mjs patch",
      "  node scripts/release.mjs patch --dry-run",
      "  node scripts/release.mjs minor --push",
      "  node scripts/release.mjs 1.2.3 --push"
    ].join("\n")
  );
}

function run(cmd, options = {}) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: "pipe",
    ...options
  }).trim();
}

function runInherit(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function ensurePushReady() {
  const branch = run("git branch --show-current");
  if (branch !== "main") {
    throw new Error(`--push is only allowed from main branch. Current branch: ${branch}`);
  }

  runInherit("git fetch origin main --tags");
  const divergence = run("git rev-list --left-right --count origin/main...HEAD");
  const [behindRaw] = divergence.split(/\s+/);
  const behind = Number(behindRaw);
  if (!Number.isFinite(behind)) {
    throw new Error(`Unable to parse branch divergence output: ${divergence}`);
  }
  if (behind > 0) {
    throw new Error("Local main is behind origin/main. Pull/rebase before running --push release.");
  }
}

function ensureVersionNotPublished(packageName, version) {
  const spec = `${packageName}@${version}`;

  let publishedVersion = "";
  try {
    publishedVersion = run(`npm view "${spec}" version`);
  } catch (error) {
    const stdout = String(error?.stdout ?? "");
    const stderr = String(error?.stderr ?? "");
    const output = `${stdout}\n${stderr}`;
    if (/E404|404 Not Found|is not in this registry/i.test(output)) {
      return;
    }
    throw new Error(
      `Failed to verify npm availability for ${spec}. Check npm connectivity/permissions and try again.`
    );
  }

  if (publishedVersion === version) {
    throw new Error(`Version ${spec} is already published on npm. Choose a higher version.`);
  }
  if (publishedVersion.length > 0) {
    throw new Error(`Unexpected npm response while checking ${spec}: ${publishedVersion}`);
  }
}

function ensureRemoteTagNotExists(version) {
  const ref = `refs/tags/v${version}`;
  const remoteTag = run(`git ls-remote --tags origin ${ref}`);
  if (remoteTag) {
    throw new Error(`Remote tag v${version} already exists on origin.`);
  }
}

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid semver version: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

function bumpVersion(current, kind) {
  const parsed = parseSemver(current);
  if (kind === "patch") {
    return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  }
  if (kind === "minor") {
    return `${parsed.major}.${parsed.minor + 1}.0`;
  }
  return `${parsed.major + 1}.0.0`;
}

function prepareChangelogUpdate(nextVersion) {
  const changelogPath = "CHANGELOG.md";
  const changelog = readFileSync(changelogPath, "utf8");
  const eol = changelog.includes("\r\n") ? "\r\n" : "\n";
  const lines = changelog.split(/\r?\n/);

  const unreleasedIndex = lines.findIndex((line) => line.trim() === "## Unreleased");
  if (unreleasedIndex < 0) {
    throw new Error("CHANGELOG.md does not contain '## Unreleased'.");
  }

  let nextHeadingIndex = -1;
  for (let i = unreleasedIndex + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith("## ")) {
      nextHeadingIndex = i;
      break;
    }
  }

  const unreleasedRaw = lines.slice(
    unreleasedIndex + 1,
    nextHeadingIndex < 0 ? lines.length : nextHeadingIndex
  );

  while (unreleasedRaw.length > 0 && unreleasedRaw[0].trim() === "") {
    unreleasedRaw.shift();
  }
  while (unreleasedRaw.length > 0 && unreleasedRaw[unreleasedRaw.length - 1].trim() === "") {
    unreleasedRaw.pop();
  }

  if (unreleasedRaw.length === 0) {
    throw new Error("Unreleased section is empty. Add release notes before running release.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const releaseHeader = `## ${nextVersion} - ${today}`;
  const existingIndex = lines.findIndex((line) => line.trim() === releaseHeader);
  if (existingIndex >= 0) {
    throw new Error(`CHANGELOG.md already has a section for ${nextVersion}.`);
  }

  const rebuilt = [
    ...lines.slice(0, unreleasedIndex + 1),
    "",
    releaseHeader,
    "",
    ...unreleasedRaw,
    "",
    ...(nextHeadingIndex < 0 ? [] : lines.slice(nextHeadingIndex))
  ];

  const bulletCount = unreleasedRaw.filter((line) => line.trim().startsWith("- ")).length;

  return {
    changelogPath,
    eol,
    rebuilt,
    releaseHeader,
    promotedLines: unreleasedRaw.length,
    promotedBullets: bulletCount
  };
}

function writeChangelogUpdate(plan) {
  writeFileSync(
    plan.changelogPath,
    `${plan.rebuilt.join(plan.eol).replace(new RegExp(`${plan.eol}+$`), "")}${plan.eol}`
  );
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    usage();
    return;
  }

  const push = args.includes("--push");
  const noCheck = args.includes("--no-check");
  const dryRun = args.includes("--dry-run");
  const target = args.find((arg) => !arg.startsWith("--")) ?? "patch";

  if (!["patch", "minor", "major"].includes(target) && !/^\d+\.\d+\.\d+$/.test(target)) {
    throw new Error(`Unsupported release target: ${target}`);
  }

  const dirty = run("git status --porcelain");
  if (dirty.length > 0 && !dryRun) {
    throw new Error("Working tree is not clean. Commit or stash changes before release.");
  }
  if (dirty.length > 0 && dryRun) {
    console.warn("Warning: working tree is not clean. Running preview mode only.");
  }

  if (push) {
    ensurePushReady();
  }

  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const currentVersion = pkg.version;
  const nextVersion =
    target === "patch" || target === "minor" || target === "major"
      ? bumpVersion(currentVersion, target)
      : target;

  if (nextVersion === currentVersion) {
    throw new Error(`Version is already ${currentVersion}.`);
  }

  const existingTag = run(`git tag --list v${nextVersion}`);
  if (existingTag) {
    throw new Error(`Tag v${nextVersion} already exists.`);
  }

  if (push && !dryRun) {
    ensureRemoteTagNotExists(nextVersion);
    ensureVersionNotPublished(pkg.name, nextVersion);
  }

  const changelogPlan = prepareChangelogUpdate(nextVersion);

  if (dryRun) {
    if (!noCheck) {
      runInherit("npm run check");
    }

    console.log(`Dry run: v${nextVersion}`);
    console.log(`- Current version: ${currentVersion}`);
    console.log(`- Next version: ${nextVersion}`);
    console.log(`- Changelog heading: ${changelogPlan.releaseHeader}`);
    console.log(
      `- Unreleased entries to promote: ${changelogPlan.promotedBullets || changelogPlan.promotedLines}`
    );
    console.log(`- Check step: ${noCheck ? "skipped" : "executed"}`);
    console.log("- Would update package.json/package-lock.json/CHANGELOG.md");
    console.log(`- Would create commit: chore(release): v${nextVersion}`);
    console.log(`- Would create tag: v${nextVersion}`);
    if (push) {
      console.log("- Would push: origin/main and origin/v<version>");
    }
    return;
  }

  runInherit(`npm version ${nextVersion} --no-git-tag-version`);
  writeChangelogUpdate(changelogPlan);

  if (!noCheck) {
    runInherit("npm run check");
  }

  runInherit("git add package.json package-lock.json CHANGELOG.md");
  runInherit(`git commit -m "chore(release): v${nextVersion}"`);
  runInherit(`git tag -a v${nextVersion} -m "v${nextVersion}"`);

  if (push) {
    runInherit("git push origin main");
    runInherit(`git push origin v${nextVersion}`);
  }

  console.log(`Release prepared: v${nextVersion}`);
  if (!push) {
    console.log("Next:");
    console.log("  git push origin main");
    console.log(`  git push origin v${nextVersion}`);
  }
}

main();
